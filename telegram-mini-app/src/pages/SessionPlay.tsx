import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CameraPresenceOverlay } from "../components/biofeedback/CameraPresenceOverlay";
import { SESSION_BY_SLUG, scriptToText } from "../data/sessions";
import {
  savePostSessionCheckIn,
  savePreSessionCheckIn,
  saveStandaloneScan,
  type AudioBreathSnapshot,
  type BreathCoachMetrics,
  type BiometricScanRecord,
  type FrontWellnessSnapshot,
  type MeditationBiofeedbackSessionRecord,
} from "../lib/biofeedback";
import { startBreathAudioCapture, type BreathAudioCapture, type BreathAudioSummary } from "../lib/audioBreathTracker";
import { probeDualCameraSupport, type DualCameraProbe } from "../lib/cameraCapabilities";
import { runPulseScan, type PulseScanState } from "../lib/cameraPulseScan";
import { runFrontBreathScan, type FrontBreathScanResult, type FrontFrameSignal } from "../lib/frontBreathScan";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { canUserAccessSession } from "../lib/sessionAccess";
import { buildSmartRecommendation, type SmartRecommendation } from "../lib/smartRecommendations";
import { hapticLight, useTelegram } from "../telegram/useTelegram";

type PlayerState = "idle" | "playing" | "paused" | "ended";
type SourceMode = "audio" | "voice" | "visual";
type SmartStage = "idle" | "probing" | "dual" | "front" | "rear" | "post" | "ready" | "error";

const SPEED_OPTIONS = [0.9, 1, 1.15] as const;

function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const min = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const sec = (safe % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function mapPulseFailureKey(result: { rawStatus: string; failureReason?: string }): string {
  if (result.rawStatus === "permission_denied") return "bioScanPermission";
  if (result.rawStatus === "unsupported") return "bioScanUnsupported";
  if (result.failureReason === "insufficient_light") return "bioScanLight";
  if (result.failureReason === "high_motion") return "bioScanMotion";
  if (result.failureReason === "finger_not_detected") return "bioScanNoFinger";
  return "bioScanQualityLow";
}

function mapPulseStateKey(state: PulseScanState | "idle" | "success"): string {
  if (state === "searching") return "bioScanStatusSearching";
  if (state === "signal_found") return "bioScanStatusFound";
  if (state === "measuring") return "bioScanStatusMeasuring";
  if (state === "success") return "bioScanStatusSuccess";
  return "bioScanInstruction";
}

function mapFrontFailureKey(result: FrontBreathScanResult): string {
  if (result.rawStatus === "permission_denied") return "bioFrontPermission";
  if (result.rawStatus === "unsupported") return "bioFrontUnsupported";
  if (result.failureReason === "insufficient_light") return "bioFrontLight";
  if (result.failureReason === "high_motion" || result.failureReason === "face_unstable") return "bioFrontMotionIssue";
  return "bioFrontSignalLow";
}

function mapFrontStateKey(state: "idle" | "initializing" | "tracking" | "analyzing" | "done"): string {
  if (state === "initializing") return "bioFrontStateInitializing";
  if (state === "tracking") return "bioFrontStateTracking";
  if (state === "analyzing") return "bioFrontStateAnalyzing";
  if (state === "done") return "bioFrontStateDone";
  return "bioFrontStateIdle";
}

function mapProbeReasonKey(reason: DualCameraProbe["reason"]): string {
  if (reason === "ok") return "bioDualAvailable";
  if (reason === "permission_denied") return "bioDualPermission";
  if (reason === "rear_unavailable" || reason === "front_unavailable") return "bioDualDeviceMissing";
  if (reason === "concurrency_blocked") return "bioDualFallback";
  if (reason === "unsupported") return "bioDualUnsupported";
  return "bioDualFallback";
}

function mapRecommendationReasonKey(reason: SmartRecommendation["rationaleKey"]): string {
  if (reason === "high_load") return "bioRecReasonHighLoad";
  if (reason === "sleep") return "bioRecReasonSleep";
  if (reason === "evening_slow") return "bioRecReasonEvening";
  if (reason === "morning_focus") return "bioRecReasonMorning";
  return "bioRecReasonBalanced";
}

function mapFrontToneKey(state: FrontBreathScanResult["stateLabel"]): string {
  if (state === "calm") return "bioFrontToneCalm";
  if (state === "activated") return "bioFrontToneActivated";
  if (state === "tense") return "bioFrontToneTense";
  return "bioFrontToneNeutral";
}

function mapFrontTrackingKey(mode: "mesh" | "fallback"): string {
  return mode === "mesh" ? "bioFrontTrackingMesh" : "bioFrontTrackingFallback";
}

function mapMicGuidanceKey(guidance: BreathAudioSummary["guidance"]): string {
  if (guidance === "excellent") return "bioMicExcellent";
  if (guidance === "good") return "bioMicGood";
  if (guidance === "improving") return "bioMicImproving";
  if (guidance === "irregular") return "bioMicIrregular";
  return "bioMicInsufficient";
}

function breathPhaseAt(second: number): { id: "inhale" | "pause" | "exhale"; progress: number } {
  const cycle = 11;
  const tick = second % cycle;
  if (tick < 4) return { id: "inhale", progress: (tick + 1) / 4 };
  if (tick < 5) return { id: "pause", progress: 1 };
  return { id: "exhale", progress: (tick - 5 + 1) / 6 };
}

function summaryKey(summaryCode: MeditationBiofeedbackSessionRecord["summaryCode"] | undefined): string {
  if (summaryCode === "strong") return "bioEffectSummaryStrong";
  if (summaryCode === "moderate") return "bioEffectSummaryModerate";
  if (summaryCode === "mixed") return "bioEffectSummaryMixed";
  return "bioEffectIncomplete";
}

function toFrontSnapshot(result: FrontBreathScanResult | null): FrontWellnessSnapshot | null {
  if (!result) return null;
  return {
    breathingRate: result.breathingRate,
    regularity: result.regularity,
    stateLabel: result.stateLabel,
    confidence: result.confidence,
    signalQuality: result.signalQuality,
  };
}

function toAudioSnapshot(summary: BreathAudioSummary | null): AudioBreathSnapshot | null {
  if (!summary) return null;
  return {
    breathRate: summary.breathRate,
    rhythmStability: summary.rhythmStability,
    confidence: summary.confidence,
    guidance: summary.guidance,
  };
}

export function SessionPlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useI18n();
  const { state, completeSession, selfCareToday, rememberSession } = useProgress();
  const { app } = useTelegram();
  const nav = useNavigate();

  const L = lang === "ru" ? "ru" : "en";
  const locale = lang === "ru" ? "ru-RU" : "en-US";

  const session = slug ? SESSION_BY_SLUG[slug] : undefined;
  const canAccess = session ? canUserAccessSession(session, state) : false;

  const [speed, setSpeed] = useState<number>(1);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [done, setDone] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [durationSec, setDurationSec] = useState(session ? Math.max(session.audio.durationSec, session.durationMin * 60) : 0);
  const [sourceMode, setSourceMode] = useState<SourceMode>(session?.audio.src ? "audio" : "visual");

  const [smartStage, setSmartStage] = useState<SmartStage>("idle");
  const [smartErrorKey, setSmartErrorKey] = useState<string | null>(null);
  const [dualProbe, setDualProbe] = useState<DualCameraProbe | null>(null);
  const [recommendation, setRecommendation] = useState<SmartRecommendation | null>(null);

  const [scanProgress, setScanProgress] = useState(0);
  const [scanVisualState, setScanVisualState] = useState<PulseScanState | "idle" | "success">("idle");
  const [scanErrorKey, setScanErrorKey] = useState<string | null>(null);
  const [lastScanDeviceLabel, setLastScanDeviceLabel] = useState<string | null>(null);
  const [lastScanTorchFallback, setLastScanTorchFallback] = useState(false);
  const [preScanRecord, setPreScanRecord] = useState<BiometricScanRecord | null>(null);
  const [postScanRecord, setPostScanRecord] = useState<BiometricScanRecord | null>(null);
  const [bioSessionRecord, setBioSessionRecord] = useState<MeditationBiofeedbackSessionRecord | null>(null);

  const [frontPre, setFrontPre] = useState<FrontBreathScanResult | null>(null);
  const [frontPost, setFrontPost] = useState<FrontBreathScanResult | null>(null);
  const [frontProgress, setFrontProgress] = useState(0);
  const [frontScanState, setFrontScanState] = useState<"idle" | "initializing" | "tracking" | "analyzing" | "done">("idle");
  const [frontErrorKey, setFrontErrorKey] = useState<string | null>(null);
  const [frontLiveSignalQuality, setFrontLiveSignalQuality] = useState<number | null>(null);
  const [frontLiveConfidence, setFrontLiveConfidence] = useState<number | null>(null);
  const [frontLiveMotion, setFrontLiveMotion] = useState<number | null>(null);
  const [frontTrackingMode, setFrontTrackingMode] = useState<"mesh" | "fallback">("fallback");

  const [breathCoachOn, setBreathCoachOn] = useState(false);
  const [breathSeconds, setBreathSeconds] = useState(0);
  const [breathActiveSeconds, setBreathActiveSeconds] = useState(0);
  const [breathMetrics, setBreathMetrics] = useState<BreathCoachMetrics | null>(null);
  const [cameraAssistOn, setCameraAssistOn] = useState(false);
  const [cameraAssistStillness, setCameraAssistStillness] = useState<number | null>(null);

  const [micStatus, setMicStatus] = useState<"idle" | "recording" | "analyzing" | "ready" | "blocked" | "unsupported">("idle");
  const [micSummary, setMicSummary] = useState<BreathAudioSummary | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const frontPreviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const frontPreviewOverlayRef = useRef<HTMLCanvasElement | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsTickRef = useRef<number | null>(null);
  const ttsStartedRef = useRef<number | null>(null);
  const doneOnceRef = useRef<string | null>(null);
  const micCaptureRef = useRef<BreathAudioCapture | null>(null);

  const smartAbortRef = useRef<AbortController | null>(null);
  const breathTickRef = useRef<number | null>(null);
  const visualTickRef = useRef<number | null>(null);
  const stillnessAggregateRef = useRef<{ sum: number; count: number }>({ sum: 0, count: 0 });
  const phaseHapticRef = useRef<"inhale" | "pause" | "exhale" | null>(null);

  const fullText = session ? scriptToText(session.script, L) : "";
  const textWords = useMemo(() => fullText.split(/\s+/).filter(Boolean).length, [fullText]);

  const estimatedVoiceDuration = useMemo(() => {
    if (!session) return 0;
    if (session.audio.durationSec > 0) return session.audio.durationSec;
    return Math.max(180, Math.round(textWords / 2.2));
  }, [session, textWords]);

  const baseDuration = useMemo(() => {
    if (!session) return 0;
    if (durationSec > 0) return durationSec;
    return Math.max(session.durationMin * 60, 180);
  }, [session, durationSec]);

  const resolvedDuration = sourceMode === "voice" ? estimatedVoiceDuration : baseDuration;
  const progressPct = resolvedDuration > 0 ? Math.min(100, (elapsedSec / resolvedDuration) * 100) : 0;
  const smartRunning = smartStage === "probing" || smartStage === "dual" || smartStage === "front" || smartStage === "rear" || smartStage === "post";

  const clearTtsTick = useCallback(() => {
    if (!ttsTickRef.current) return;
    window.clearInterval(ttsTickRef.current);
    ttsTickRef.current = null;
  }, []);

  const clearVisualTick = useCallback(() => {
    if (!visualTickRef.current) return;
    window.clearInterval(visualTickRef.current);
    visualTickRef.current = null;
  }, []);

  const stopMicCapture = useCallback(async () => {
    const capture = micCaptureRef.current;
    if (!capture) return null;

    micCaptureRef.current = null;
    setMicStatus("analyzing");

    const summary = await capture.stop();
    setMicSummary(summary);
    if (summary.rawStatus === "permission_denied") setMicStatus("blocked");
    else if (summary.rawStatus === "unsupported") setMicStatus("unsupported");
    else setMicStatus("ready");

    return summary;
  }, []);

  const ensureMicCapture = useCallback(async () => {
    if (micCaptureRef.current || micStatus === "blocked" || micStatus === "unsupported") return;
    const capture = await startBreathAudioCapture();
    micCaptureRef.current = capture;
    if (capture.status === "permission_denied") {
      setMicStatus("blocked");
      micCaptureRef.current = null;
      return;
    }
    if (capture.status === "unsupported") {
      setMicStatus("unsupported");
      micCaptureRef.current = null;
      return;
    }
    setMicStatus("recording");
  }, [micStatus]);

  const stopAllPlayback = useCallback(() => {
    clearTtsTick();
    clearVisualTick();
    ttsStartedRef.current = null;

    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }

    window.speechSynthesis.cancel();
    utterRef.current = null;
  }, [clearTtsTick, clearVisualTick]);

  const stopBreathCoach = useCallback(async () => {
    if (!breathCoachOn) return;
    if (breathTickRef.current) {
      window.clearInterval(breathTickRef.current);
      breathTickRef.current = null;
    }

    const adherenceScore =
      breathSeconds > 5 ? Number(Math.max(0, Math.min(1, breathActiveSeconds / breathSeconds)).toFixed(2)) : null;
    const stillnessScore =
      stillnessAggregateRef.current.count > 0
        ? Number((stillnessAggregateRef.current.sum / stillnessAggregateRef.current.count).toFixed(2))
        : cameraAssistStillness;

    setBreathMetrics({
      adherenceScore,
      stillnessScore: stillnessScore ?? null,
    });
    setBreathCoachOn(false);
  }, [breathCoachOn, breathSeconds, breathActiveSeconds, cameraAssistStillness]);

  const markSessionDone = useCallback(async () => {
    if (!session) return;
    if (doneOnceRef.current === session.slug) return;
    doneOnceRef.current = session.slug;

    await stopBreathCoach();
    await stopMicCapture();

    setDone(true);
    setPlayerState("ended");
    setElapsedSec(resolvedDuration);

    completeSession(session.slug);
    selfCareToday();

    try {
      app.HapticFeedback.notificationOccurred("success");
    } catch {
      /* ignore */
    }
  }, [session, stopBreathCoach, stopMicCapture, resolvedDuration, completeSession, selfCareToday, app]);

  const startVoiceTick = useCallback(
    (fromSec: number) => {
      clearTtsTick();
      ttsStartedRef.current = Date.now() - fromSec * 1000;

      ttsTickRef.current = window.setInterval(() => {
        if (ttsStartedRef.current === null) return;
        const nextElapsed = Math.floor((Date.now() - ttsStartedRef.current) / 1000);
        setElapsedSec(Math.min(nextElapsed, resolvedDuration));
      }, 350);
    },
    [clearTtsTick, resolvedDuration]
  );

  const startVisualPlayback = useCallback(
    (fromStart: boolean) => {
      if (!session) return;
      doneOnceRef.current = null;

      clearVisualTick();
      setDone(false);
      setPlayerState("playing");
      if (fromStart) setElapsedSec(0);

      visualTickRef.current = window.setInterval(() => {
        setElapsedSec((prev) => {
          const next = prev + 1;
          if (next >= resolvedDuration) {
            clearVisualTick();
            void markSessionDone();
            return resolvedDuration;
          }
          return next;
        });
      }, 1000);

      hapticLight(app);
    },
    [app, clearVisualTick, markSessionDone, resolvedDuration, session]
  );

  const startVoiceFromStart = useCallback(() => {
    if (!session || !canAccess) return;

    window.speechSynthesis.cancel();
    clearTtsTick();

    const utter = new SpeechSynthesisUtterance(fullText);
    utter.lang = locale;
    utter.rate = speed;
    utter.onend = () => {
      clearTtsTick();
      void markSessionDone();
    };
    utter.onerror = () => {
      clearTtsTick();
      setPlayerState("idle");
    };

    utterRef.current = utter;
    setSourceMode("voice");
    setDone(false);
    setElapsedSec(0);
    setPlayerState("playing");
    startVoiceTick(0);

    window.speechSynthesis.speak(utter);
    hapticLight(app);
  }, [session, canAccess, clearTtsTick, fullText, locale, speed, startVoiceTick, markSessionDone, app]);

  const playAudio = useCallback(
    async (fromStart: boolean) => {
      const audioEl = audioRef.current;
      if (!session?.audio.src || !audioEl) return false;

      if (fromStart) audioEl.currentTime = 0;
      audioEl.playbackRate = speed;

      try {
        await audioEl.play();
        setSourceMode("audio");
        setPlayerState("playing");
        setDone(false);
        hapticLight(app);
        return true;
      } catch {
        return false;
      }
    },
    [session?.audio.src, speed, app]
  );

  const runFrontMeasurement = useCallback(
    async (abortSignal: AbortSignal, deviceId: string | null, durationMs: number) => {
      setFrontProgress(0);
      setFrontScanState("initializing");
      setFrontLiveSignalQuality(null);
      setFrontLiveConfidence(null);
      setFrontLiveMotion(null);
      const result = await runFrontBreathScan({
        signal: abortSignal,
        durationMs,
        deviceId,
        onProgress: setFrontProgress,
        onState: setFrontScanState,
        previewVideo: frontPreviewVideoRef.current,
        previewOverlay: frontPreviewOverlayRef.current,
        onFrame: (frame: FrontFrameSignal) => {
          setFrontLiveSignalQuality(frame.signalQuality);
          setFrontLiveConfidence(frame.confidence);
          setFrontLiveMotion(frame.motion);
          setFrontTrackingMode(frame.trackingMode);
        },
      });
      setFrontScanState("done");
      setFrontTrackingMode(result.trackingMode);
      return result;
    },
    []
  );

  const runPulseMeasurement = useCallback(
    async (_phase: "pre" | "post", abortSignal: AbortSignal, deviceId: string | null, durationMs: number) => {
      setScanProgress(0);
      setScanVisualState("searching");
      const result = await runPulseScan({
        signal: abortSignal,
        durationMs,
        deviceId,
        onProgress: setScanProgress,
        onStateChange: setScanVisualState,
      });
      setScanVisualState(result.rawStatus === "ok" ? "success" : "idle");
      setLastScanDeviceLabel(result.device?.cameraLabel ?? null);
      setLastScanTorchFallback(Boolean(result.device?.torchAvailable && !result.device?.torchEnabled));
      return result;
    },
    []
  );

  const runSmartCheck = useCallback(
    async (phase: "pre" | "post") => {
      if (!session || smartRunning) return;
      setSmartErrorKey(null);
      setScanErrorKey(null);
      setFrontErrorKey(null);
      setFrontScanState("idle");
      setScanVisualState("idle");
      setFrontProgress(0);
      setScanProgress(0);
      setFrontLiveSignalQuality(null);
      setFrontLiveConfidence(null);
      setFrontLiveMotion(null);

      const abort = new AbortController();
      smartAbortRef.current = abort;

      try {
        setSmartStage("probing");
        const probe = await probeDualCameraSupport();
        setDualProbe(probe);

        let frontResult: FrontBreathScanResult;
        let pulseResult: Awaited<ReturnType<typeof runPulseMeasurement>>;

        if (probe.supported) {
          setSmartStage(phase === "pre" ? "dual" : "post");
          [frontResult, pulseResult] = await Promise.all([
            runFrontMeasurement(abort.signal, probe.front.id, 20_000),
            runPulseMeasurement(phase, abort.signal, probe.rear.id, 35_000),
          ]);
        } else {
          setSmartStage("front");
          frontResult = await runFrontMeasurement(abort.signal, probe.front.id, 16_000);
          setSmartStage(phase === "pre" ? "rear" : "post");
          pulseResult = await runPulseMeasurement(phase, abort.signal, probe.rear.id, 35_000);
        }

        if (frontResult.rawStatus !== "ok" || frontResult.breathingRate == null) {
          setFrontErrorKey(mapFrontFailureKey(frontResult));
        }
        if (pulseResult.rawStatus !== "ok" || pulseResult.pulse == null) {
          setScanErrorKey(mapPulseFailureKey(pulseResult));
        }

        if (phase === "pre") {
          const rec = buildSmartRecommendation(
            {
              pulse: pulseResult.pulse,
              calmScore: null,
              breathingRate: frontResult.breathingRate,
              breathingRegularity: frontResult.regularity,
              frontState: frontResult.stateLabel,
              hourOfDay: new Date().getHours(),
              completedCount: state.completedSlugs.length,
              premium: state.premium,
            },
            session
          );

          setFrontPre(frontResult);
          setRecommendation(rec);

          const saved = savePreSessionCheckIn({
            meditationSlug: session.slug,
            scan: pulseResult,
            frontSnapshot: toFrontSnapshot(frontResult),
            recommendation: {
              mode: rec.mode,
              sessionSlug: rec.sessionSlug,
            },
          });

          setPreScanRecord(saved.scanRecord);
          setBioSessionRecord(saved.sessionRecord);
          setPostScanRecord(null);
          setFrontPost(null);
          setDone(false);
        } else {
          setFrontPost(frontResult);

          if (bioSessionRecord?.id) {
            const saved = savePostSessionCheckIn({
              bioSessionId: bioSessionRecord.id,
              scan: pulseResult,
              breathMetrics,
              frontSnapshot: toFrontSnapshot(frontResult),
              audioSnapshot: toAudioSnapshot(micSummary),
            });
            setPostScanRecord(saved.scanRecord);
            setBioSessionRecord(saved.sessionRecord ?? bioSessionRecord);
          } else {
            const standalone = saveStandaloneScan({
              phase: "post",
              meditationSlug: session.slug,
              scan: pulseResult,
            });
            setPostScanRecord(standalone);
          }
        }

        setSmartStage("ready");
      } catch {
        setSmartErrorKey("bioSmartFailed");
        setSmartStage("error");
      } finally {
        smartAbortRef.current = null;
      }
    },
    [session, smartRunning, state.completedSlugs.length, state.premium, runFrontMeasurement, runPulseMeasurement, bioSessionRecord, breathMetrics, micSummary]
  );

  const cancelSmartCheck = useCallback(() => {
    smartAbortRef.current?.abort();
    setSmartStage("idle");
    setFrontScanState("idle");
    setScanVisualState("idle");
  }, []);

  const handlePlay = useCallback(async () => {
    if (!session || !canAccess) return;
    if (!preScanRecord) {
      setSmartErrorKey("bioSmartNeedPre");
      return;
    }

    await ensureMicCapture();

    if (sourceMode === "visual") {
      startVisualPlayback(playerState === "ended");
      return;
    }

    doneOnceRef.current = null;

    if (playerState === "paused") {
      if (sourceMode === "audio") {
        await playAudio(false);
        return;
      }

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setPlayerState("playing");
        startVoiceTick(elapsedSec);
        return;
      }

      startVoiceFromStart();
      return;
    }

    if (session.audio.src) {
      const ok = await playAudio(playerState === "ended");
      if (ok) return;
      if (!session.audio.fallbackVoice) return;
    }

    startVoiceFromStart();
  }, [session, canAccess, preScanRecord, ensureMicCapture, sourceMode, startVisualPlayback, playerState, playAudio, startVoiceTick, elapsedSec, startVoiceFromStart]);

  const handlePause = useCallback(() => {
    if (playerState !== "playing") return;

    if (sourceMode === "visual") {
      clearVisualTick();
      setPlayerState("paused");
      return;
    }

    if (sourceMode === "audio") {
      audioRef.current?.pause();
      setPlayerState("paused");
      return;
    }

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      clearTtsTick();
      setPlayerState("paused");
    }
  }, [playerState, sourceMode, clearVisualTick, clearTtsTick]);

  const handleStop = useCallback(() => {
    stopAllPlayback();
    void stopMicCapture();
    doneOnceRef.current = null;
    setDone(false);
    setElapsedSec(0);
    setPlayerState("idle");
  }, [stopAllPlayback, stopMicCapture]);

  const handleRestart = useCallback(async () => {
    handleStop();

    if (!session || !canAccess) return;
    await ensureMicCapture();

    if (sourceMode === "visual") {
      startVisualPlayback(true);
      return;
    }

    if (session.audio.src) {
      const ok = await playAudio(true);
      if (ok) return;
      if (!session.audio.fallbackVoice) return;
    }

    startVoiceFromStart();
  }, [handleStop, session, canAccess, ensureMicCapture, sourceMode, startVisualPlayback, playAudio, startVoiceFromStart]);

  useEffect(() => {
    if (!breathCoachOn) {
      if (breathTickRef.current) {
        window.clearInterval(breathTickRef.current);
        breathTickRef.current = null;
      }
      return;
    }

    breathTickRef.current = window.setInterval(() => {
      setBreathSeconds((prev) => prev + 1);
      if (playerState === "playing") {
        setBreathActiveSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (breathTickRef.current) {
        window.clearInterval(breathTickRef.current);
        breathTickRef.current = null;
      }
    };
  }, [breathCoachOn, playerState]);

  const breathPhase = breathPhaseAt(breathSeconds);
  useEffect(() => {
    if (!breathCoachOn) {
      phaseHapticRef.current = null;
      return;
    }

    if (phaseHapticRef.current !== breathPhase.id && breathPhase.id === "inhale") {
      hapticLight(app);
    }
    phaseHapticRef.current = breathPhase.id;
  }, [app, breathCoachOn, breathPhase.id]);

  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) return;
    const bb = app.BackButton;
    bb.show();
    const cb = () => nav(-1);
    bb.onClick(cb);
    return () => {
      bb.offClick(cb);
      bb.hide();
    };
  }, [app, nav, slug]);

  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) return;
    if (!canAccess) return;

    const mb = app.MainButton;
    const onClick = () => {
      void runSmartCheck("pre");
    };

    if (!preScanRecord && !smartRunning) {
      mb.setText(t("bioSmartStart"));
      mb.enable();
      mb.show();
      mb.onClick(onClick);
    } else if (smartRunning) {
      mb.setText(t("bioSmartRunning"));
      mb.showProgress(true);
      mb.disable();
      mb.show();
      mb.onClick(onClick);
    } else {
      mb.hideProgress();
      mb.hide();
      mb.offClick(onClick);
    }

    return () => {
      mb.hideProgress();
      mb.offClick(onClick);
      mb.hide();
    };
  }, [app, canAccess, preScanRecord, smartRunning, runSmartCheck, t]);

  useEffect(() => {
    return () => {
      stopAllPlayback();
      void stopMicCapture();
      smartAbortRef.current?.abort();
      if (breathTickRef.current) window.clearInterval(breathTickRef.current);
    };
  }, [stopAllPlayback, stopMicCapture]);

  useEffect(() => {
    if (!session) return;

    stopAllPlayback();
    doneOnceRef.current = null;
    smartAbortRef.current?.abort();
    micCaptureRef.current = null;

    setSpeed(1);
    setPlayerState("idle");
    setDone(false);
    setElapsedSec(0);
    setDurationSec(Math.max(session.audio.durationSec, session.durationMin * 60));
    setSourceMode(session.audio.src ? "audio" : "visual");

    setSmartStage("idle");
    setSmartErrorKey(null);
    setDualProbe(null);
    setRecommendation(null);

    setScanProgress(0);
    setScanVisualState("idle");
    setScanErrorKey(null);
    setLastScanDeviceLabel(null);
    setLastScanTorchFallback(false);
    setPreScanRecord(null);
    setPostScanRecord(null);
    setBioSessionRecord(null);

    setFrontPre(null);
    setFrontPost(null);
    setFrontProgress(0);
    setFrontScanState("idle");
    setFrontErrorKey(null);
    setFrontLiveSignalQuality(null);
    setFrontLiveConfidence(null);
    setFrontLiveMotion(null);
    setFrontTrackingMode("fallback");

    setBreathCoachOn(false);
    setBreathSeconds(0);
    setBreathActiveSeconds(0);
    setBreathMetrics(null);
    setCameraAssistOn(false);
    setCameraAssistStillness(null);
    stillnessAggregateRef.current = { sum: 0, count: 0 };

    setMicStatus("idle");
    setMicSummary(null);

    if (canAccess) rememberSession(session.slug);
  }, [session, canAccess, rememberSession, stopAllPlayback]);

  if (!session) {
    return (
      <div className="tm-page session-stage">
        <Link to="/paths" className="session-back">
          {"<"} {t("back")}
        </Link>
        <section className="tm-card">
          <h2 className="tm-h2">{t("sessionNotFound")}</h2>
          <p className="tm-subtle">{t("sessionNotFoundSub")}</p>
          <Link to="/paths" className="tm-btn tm-btn-secondary tm-btn-block">
            {t("navPaths")}
          </Link>
        </section>
      </div>
    );
  }

  if (session.sensual && state.sensualMode === "hidden") {
    return (
      <div className="tm-page session-stage">
        <Link to="/paths" className="session-back">
          {"<"} {t("back")}
        </Link>
        <section className="tm-card">
          <h2 className="tm-h2">{t("sensualGateTitle")}</h2>
          <p className="tm-subtle">{t("sensualNote")}</p>
          <Link to="/profile" className="tm-btn tm-btn-primary tm-btn-block">
            {t("profileTitle")}
          </Link>
        </section>
      </div>
    );
  }

  if (!session.freeTier && !state.premium) {
    return (
      <div className="tm-page session-stage">
        <Link to="/paths" className="session-back">
          {"<"} {t("back")}
        </Link>

        <section className="session-intro">
          <p className="tm-kicker">{t("premiumGateEyebrow")}</p>
          <h1 className="tm-h1">{session.title[L]}</h1>
          <p className="tm-lead">{session.short[L]}</p>
        </section>

        <section className="tm-card session-gate">
          <h2 className="tm-h2">{t("premiumGateTitle")}</h2>
          <p className="tm-subtle">{t("premiumGateLead")}</p>

          <ul className="home-premium-list">
            <li>{t("premiumGateBullet1")}</li>
            <li>{t("premiumGateBullet2")}</li>
            <li>{t("premiumGateBullet3")}</li>
            <li>{t("premiumGateBullet4")}</li>
          </ul>

          <p className="tm-subtle">{t("premiumGatePrivacy")}</p>

          <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={() => nav("/premium")}>
            {t("premiumGateCta")}
          </button>

          <div className="home-grid-2">
            <button type="button" className="tm-btn tm-btn-ghost tm-btn-block" onClick={() => nav("/profile")}>
              {t("premiumGateProfile")}
            </button>
            <button type="button" className="tm-btn tm-btn-secondary tm-btn-block" onClick={() => nav(-1)}>
              {t("premiumGateLater")}
            </button>
          </div>
        </section>
      </div>
    );
  }

  const preReliable = Boolean(preScanRecord && preScanRecord.rawStatus === "ok" && preScanRecord.pulse != null);
  const postReliable = Boolean(postScanRecord && postScanRecord.rawStatus === "ok" && postScanRecord.pulse != null);
  const scanStatusKey = mapPulseStateKey(scanVisualState);
  const frontStatusKey = mapFrontStateKey(frontScanState);
  const frontQualityText = frontLiveSignalQuality != null ? `${Math.round(frontLiveSignalQuality * 100)}%` : "--";
  const frontConfidenceText = frontLiveConfidence != null ? `${Math.round(frontLiveConfidence * 100)}%` : "--";
  const frontMotionText = frontLiveMotion != null ? `${Math.round(frontLiveMotion * 100)}%` : "--";
  const breathPhaseLabel =
    breathPhase.id === "inhale" ? t("bioBreathInhale") : breathPhase.id === "pause" ? t("bioBreathPause") : t("bioBreathExhale");
  const breathPhaseScale = breathPhase.id === "inhale" ? 1.15 : breathPhase.id === "pause" ? 1.06 : 0.92;
  const recommendedSession = recommendation?.sessionSlug ? SESSION_BY_SLUG[recommendation.sessionSlug] : null;

  return (
    <div className="tm-page session-stage">
      <Link to="/paths" className="session-back">
        {"<"} {t("back")}
      </Link>

      <section className="tm-card tm-card--quiet bio-card">
        <div className="bio-head">
          <p className="tm-kicker tm-kicker--muted">{t("bioSmartTitle")}</p>
          <h2 className="tm-h2">{t("bioSmartLead")}</h2>
          <p className="tm-subtle">{t("bioWellnessDisclaimer")}</p>
          <p className="tm-subtle">{t(mapProbeReasonKey(dualProbe?.reason ?? "concurrency_blocked"))}</p>
        </div>

        <div className="bio-smart-grid">
          <article className="bio-smart-item">
            <p className="tm-kicker tm-kicker--muted">{t("bioFrontTitle")}</p>
            <p className="tm-subtle">{t(frontStatusKey)}</p>
            <div className="bio-front-pip">
              <div className="bio-front-pip-stage">
                <video ref={frontPreviewVideoRef} className="bio-front-pip-video" playsInline muted />
                <canvas ref={frontPreviewOverlayRef} className="bio-front-pip-overlay" />
                {!smartRunning ? <p className="bio-front-pip-hint">{t("bioFrontPreviewHint")}</p> : null}
              </div>
              <div className="bio-front-pip-meta">
                <span>
                  {t("bioMetricQuality")}: <strong>{frontQualityText}</strong>
                </span>
                <span>
                  {t("bioFrontConfidence")}: <strong>{frontConfidenceText}</strong>
                </span>
                <span>
                  {t("bioFrontMotion")}: <strong>{frontMotionText}</strong>
                </span>
                <span>
                  {t("bioFrontTracking")}: <strong>{t(mapFrontTrackingKey(frontTrackingMode))}</strong>
                </span>
              </div>
            </div>
            <div className="wave-meter" aria-hidden>
              <span style={{ width: `${Math.round(frontProgress * 100)}%` }} />
            </div>
            {frontPre ? (
              <p className="tm-subtle">
                {t("bioFrontMetric")}: {frontPre.breathingRate ?? "-"} bpm · {t(mapFrontToneKey(frontPre.stateLabel))}
              </p>
            ) : null}
            {frontErrorKey ? <p className="bio-error">{t(frontErrorKey)}</p> : null}
          </article>

          <article className="bio-smart-item">
            <p className="tm-kicker tm-kicker--muted">{t("bioRearTitle")}</p>
            <p className="tm-subtle">{t(scanStatusKey)}</p>
            <div className="wave-meter" aria-hidden>
              <span style={{ width: `${Math.round(scanProgress * 100)}%` }} />
            </div>
            <div className="bio-rear-target-row">
              <span className={`bio-rear-lens-target ${scanVisualState === "measuring" ? "is-live" : ""}`} />
              <p className="tm-subtle">{t("bioPulseGuideTarget")}</p>
            </div>
            <p className="tm-subtle">{t("bioPulseGuideRear")}</p>
            <p className="tm-subtle">
              {t("bioRearSelected").replace("{camera}", lastScanDeviceLabel ?? dualProbe?.rear.label ?? t("bioRearUnknown"))}
            </p>
            <p className="tm-subtle">{t("bioPulseGuideCover")}</p>
            <div className="bio-pulse-visual" aria-hidden>
              <div className="bio-phone-mock">
                <span className="bio-phone-lens" />
                <span className="bio-phone-flash" />
                <span className={`bio-phone-finger ${scanVisualState === "measuring" ? "on" : ""}`} />
              </div>
              <div className="bio-ring-wrap">
                <div className="bio-ring" style={{ ["--ring-progress" as string]: `${Math.round(scanProgress * 100)}%` }}>
                  <span>{Math.round(scanProgress * 100)}%</span>
                </div>
                <p className="tm-subtle">{t("bioPulseGuideStill")}</p>
              </div>
            </div>
            {lastScanTorchFallback ? <p className="tm-subtle">{t("bioScanTorchFallback")}</p> : null}
            {scanErrorKey ? <p className="bio-error">{t(scanErrorKey)}</p> : null}
          </article>
        </div>

        <div className="bio-actions">
          <button
            type="button"
            className="tm-btn tm-btn-primary"
            onClick={() => void runSmartCheck("pre")}
            disabled={smartRunning}
          >
            {smartRunning ? t("bioSmartRunning") : preScanRecord ? t("bioSmartRepeat") : t("bioSmartStart")}
          </button>
          <button type="button" className="tm-btn tm-btn-ghost" onClick={() => nav("/biofeedback")}>
            {t("bioHistoryOpen")}
          </button>
          {smartRunning ? (
            <button type="button" className="tm-btn tm-btn-secondary" onClick={cancelSmartCheck}>
              {t("bioScanCancel")}
            </button>
          ) : null}
        </div>

        {smartErrorKey ? <p className="bio-error">{t(smartErrorKey)}</p> : null}

        {preScanRecord && frontPre ? (
          <div className="bio-result">
            <p className="tm-kicker tm-kicker--muted">{t("bioPreResultTitle")}</p>
            <div className="bio-result-grid">
              <article className="bio-metric-pill">
                <span>{t("bioMetricPulse")}</span>
                <strong>{preScanRecord.pulse ?? "-"}</strong>
              </article>
              <article className="bio-metric-pill">
                <span>{t("bioMetricCalm")}</span>
                <strong>{preScanRecord.calmScore ?? "-"}</strong>
              </article>
              <article className="bio-metric-pill">
                <span>{t("bioFrontMetric")}</span>
                <strong>{frontPre.breathingRate ?? "-"} bpm</strong>
              </article>
              <article className="bio-metric-pill">
                <span>{t("bioFrontState")}</span>
                <strong>{t(mapFrontToneKey(frontPre.stateLabel))}</strong>
              </article>
            </div>

            {recommendation ? (
              <div className="bio-rec-card">
                <p className="tm-subtle">{t(mapRecommendationReasonKey(recommendation.rationaleKey))}</p>
                <p className="tm-subtle">
                  {t("bioRecPattern")}: {recommendation.targetBreathPattern} · {t("bioRecDuration")}: {recommendation.targetDurationMin} {t("sessionMin")}
                </p>
                {recommendedSession && recommendedSession.slug !== session.slug ? (
                  <button type="button" className="tm-btn tm-btn-secondary" onClick={() => nav(`/session/${recommendedSession.slug}`)}>
                    {t("bioRecSwitch").replace("{title}", recommendedSession.title[L])}
                  </button>
                ) : (
                  <p className="tm-subtle">{t("bioRecCurrentFits")}</p>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="session-intro">
        <p className="tm-kicker">{t("sessionAbout")}</p>
        <h1 className="tm-h1">{session.title[L]}</h1>
        <p className="tm-lead">{session.short[L]}</p>
      </section>

      <section className={`session-control ${session.gradient}`}>
        <audio
          ref={audioRef}
          hidden
          src={session.audio.src ?? undefined}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = Math.round(e.currentTarget.duration || 0);
            if (d > 0) setDurationSec(d);
          }}
          onTimeUpdate={(e) => {
            if (sourceMode === "audio") setElapsedSec(Math.floor(e.currentTarget.currentTime));
          }}
          onEnded={() => {
            void markSessionDone();
          }}
          onError={() => {
            if (!session.audio.fallbackVoice) return;
            setSourceMode("voice");
            setPlayerState("idle");
          }}
        />

        <div className="session-control-meta">
          <span>{t(`pillarTag_${session.pillarId}`)}</span>
          <span>•</span>
          <span>
            {session.durationMin} {t("sessionMin")}
          </span>
          <span>•</span>
          <span>{session.freeTier ? t("free") : t("sessionPremium")}</span>
        </div>

        {!session.audio.src ? (
          <div className="bio-test-card">
            <div className="bio-test-head">
              <p className="tm-kicker tm-kicker--muted">{t("bioBreathTestTitle")}</p>
              <p className="tm-subtle">{t("bioBreathTestLead")}</p>
            </div>
            <div className="player-speed-group">
              <button
                type="button"
                className={`player-speed-chip ${sourceMode === "visual" ? "on" : ""}`}
                onClick={() => setSourceMode("visual")}
              >
                {t("bioBreathVisualMode")}
              </button>
              <button
                type="button"
                className={`player-speed-chip ${sourceMode === "voice" ? "on" : ""}`}
                onClick={() => setSourceMode("voice")}
              >
                {t("bioBreathVoiceMode")}
              </button>
            </div>
          </div>
        ) : (
          <div className="player-source-row">
            <span className="tm-pill">{sourceMode === "audio" ? t("playerSourceAudio") : t("playerSourceVoice")}</span>
            <span className="tm-subtle">{session.audio.src ? t("playerAudioReady") : t("playerAudioPending")}</span>
          </div>
        )}

        <div className="player-progress-wrap">
          <div className="wave-meter" aria-hidden>
            <span style={{ width: `${progressPct}%` }} />
          </div>
          <div className="player-progress-meta">
            <span>{formatClock(elapsedSec)}</span>
            <span>{formatClock(resolvedDuration)}</span>
          </div>
        </div>

        {sourceMode !== "visual" ? (
          <div className="player-speed-block">
            <span className="player-speed-label">{t("playerSpeed")}</span>
            <div className="player-speed-group">
              {SPEED_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`player-speed-chip ${speed === option ? "on" : ""}`}
                  onClick={() => {
                    setSpeed(option);
                    if (audioRef.current) audioRef.current.playbackRate = option;
                  }}
                >
                  {option.toFixed(2).replace(".00", ".0")}x
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="player-controls-grid">
          <button
            type="button"
            className="tm-btn tm-btn-primary tm-btn-block"
            onClick={() => void handlePlay()}
            disabled={playerState === "playing" || !preScanRecord}
          >
            {playerState === "paused" ? t("playerResume") : t("playerPlay")}
          </button>

          <button
            type="button"
            className="tm-btn tm-btn-secondary tm-btn-block"
            onClick={handlePause}
            disabled={playerState !== "playing"}
          >
            {t("playerPause")}
          </button>

          <button
            type="button"
            className="tm-btn tm-btn-ghost tm-btn-block"
            onClick={handleStop}
            disabled={playerState === "idle" && elapsedSec === 0}
          >
            {t("playerStop")}
          </button>

          <button type="button" className="tm-btn tm-btn-ghost tm-btn-block" onClick={() => void handleRestart()}>
            {t("playerRestart")}
          </button>
        </div>

        <div className="bio-mic-row">
          <p className="tm-subtle">{t("bioMicTitle")}</p>
          <span className={`bio-mic-badge ${micStatus}`}>{t(`bioMicStatus_${micStatus}`)}</span>
        </div>

        <div className="bio-breath">
          <div className="bio-breath-head">
            <p className="tm-kicker tm-kicker--muted">{t("bioBreathTitle")}</p>
            <p className="tm-subtle">{t("bioBreathSub")}</p>
          </div>

          <div className="bio-breath-actions">
            <button
              type="button"
              className="tm-btn tm-btn-secondary"
              onClick={async () => {
                if (breathCoachOn) {
                  await stopBreathCoach();
                  return;
                }

                setBreathCoachOn(true);
                setBreathSeconds(0);
                setBreathActiveSeconds(0);
                setBreathMetrics(null);
                setCameraAssistStillness(null);
                stillnessAggregateRef.current = { sum: 0, count: 0 };
              }}
            >
              {breathCoachOn ? t("bioBreathStop") : t("bioBreathStart")}
            </button>

            <button
              type="button"
              className="tm-btn tm-btn-ghost"
              onClick={() => {
                setCameraAssistOn((prev) => !prev);
              }}
            >
              {cameraAssistOn ? t("bioBreathCameraOn") : t("bioBreathCameraOff")}
            </button>
          </div>

          {breathCoachOn ? (
            <div className="bio-breath-live">
              <div className="bio-orb" style={{ transform: `scale(${breathPhaseScale})` }}>
                <span>{breathPhaseLabel}</span>
              </div>
              <p className="tm-subtle">{Math.round(breathPhase.progress * 100)}%</p>
            </div>
          ) : null}

          {cameraAssistOn ? (
            <CameraPresenceOverlay
              active={breathCoachOn}
              title={t("bioBreathCameraTitle")}
              subtitle={t("bioBreathCameraSub")}
              cameraOnLabel={t("bioBreathCameraOn")}
              cameraOffLabel={t("bioBreathCameraOff")}
              stateLoading={t("bioBreathCameraLoading")}
              stateBlocked={t("bioBreathCameraBlocked")}
              stateUnavailable={t("bioBreathCameraUnsupported")}
              stateOff={t("bioBreathCameraIdle")}
              stillnessLabel={t("bioBreathStillnessLabel")}
              onStillnessSample={(value) => {
                setCameraAssistStillness(value);
                if (!breathCoachOn) return;
                stillnessAggregateRef.current.sum += value;
                stillnessAggregateRef.current.count += 1;
              }}
            />
          ) : null}

          {breathMetrics ? (
            <div className="bio-result-grid">
              <article className="bio-metric-pill">
                <span>{t("bioBreathAdherence")}</span>
                <strong>{breathMetrics.adherenceScore != null ? `${Math.round(breathMetrics.adherenceScore * 100)}%` : "-"}</strong>
              </article>
              <article className="bio-metric-pill">
                <span>{t("bioBreathStillness")}</span>
                <strong>{breathMetrics.stillnessScore != null ? `${Math.round(breathMetrics.stillnessScore * 100)}%` : "-"}</strong>
              </article>
            </div>
          ) : null}
        </div>

        <p className="tm-subtle">{t("playerHint")}</p>
        {!preScanRecord ? <p className="tm-subtle">{t("bioSmartNeedPreHint")}</p> : null}
        {done ? <p className="session-done">{t("sessionCompleteLine")}</p> : null}
      </section>

      {done ? (
        <section className="tm-card tm-card--quiet bio-card">
          <h2 className="tm-h2">{t("bioPostTitle")}</h2>
          <p className="tm-subtle">{t("bioPostLead")}</p>

          <div className="bio-actions">
            <button
              type="button"
              className="tm-btn tm-btn-primary"
              disabled={smartRunning}
              onClick={() => void runSmartCheck("post")}
            >
              {smartRunning ? t("bioSmartRunning") : t("bioPostSmartStart")}
            </button>
            <button type="button" className="tm-btn tm-btn-ghost" onClick={() => nav("/biofeedback")}>
              {t("bioHistoryOpen")}
            </button>
          </div>

          {postScanRecord ? (
            <div className="bio-result">
              <p className="tm-kicker tm-kicker--muted">{t("bioEffectTitle")}</p>

              {preReliable && postReliable ? (
                <>
                  <div className="bio-result-grid">
                    <article className="bio-metric-pill">
                      <span>{t("bioEffectPulse")}</span>
                      <strong>
                        {preScanRecord?.pulse ?? "-"}
                        {" -> "}
                        {postScanRecord.pulse ?? "-"}
                      </strong>
                    </article>
                    <article className="bio-metric-pill">
                      <span>{t("bioEffectCalm")}</span>
                      <strong>
                        {preScanRecord?.calmScore ?? "-"}
                        {" -> "}
                        {postScanRecord.calmScore ?? "-"}
                      </strong>
                    </article>
                    <article className="bio-metric-pill">
                      <span>{t("bioFrontMetric")}</span>
                      <strong>
                        {frontPre?.breathingRate ?? "-"}
                        {" -> "}
                        {frontPost?.breathingRate ?? "-"} bpm
                      </strong>
                    </article>
                    <article className="bio-metric-pill">
                      <span>{t("bioEffectScore")}</span>
                      <strong>{bioSessionRecord?.sessionEffect ?? "-"}</strong>
                    </article>
                  </div>

                  <p className="tm-subtle">{t(summaryKey(bioSessionRecord?.summaryCode))}</p>
                </>
              ) : (
                <p className="tm-subtle">{t("bioEffectIncomplete")}</p>
              )}

              {micSummary ? (
                <p className="tm-subtle">
                  {t("bioMicAfter")}: {micSummary.breathRate ?? "-"} bpm · {t(mapMicGuidanceKey(micSummary.guidance))}
                </p>
              ) : null}
            </div>
          ) : !preReliable ? (
            <p className="tm-subtle">{t("bioPostNeedPre")}</p>
          ) : null}
        </section>
      ) : null}

      <section className="session-script">
        <p className="tm-kicker tm-kicker--muted">{t("sessionTranscript")}</p>
        <div className="session-script-body">{fullText}</div>
      </section>

      {session.script.journal ? (
        <section className="tm-card">
          <p className="tm-kicker tm-kicker--muted">{t("sessionJournal")}</p>
          <p className="tm-lead">{session.script.journal[L]}</p>
        </section>
      ) : null}
    </div>
  );
}







