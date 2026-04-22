import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { OutcomeGuidanceCard } from "../components/biofeedback/OutcomeGuidanceCard";
import { RecommendationPanel } from "../components/biofeedback/RecommendationPanel";
import { SmartCheckPanel } from "../components/biofeedback/SmartCheckPanel";
import { DevRuntimeOverlay } from "../components/biofeedback/DevRuntimeOverlay";
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
  type PulseScanResult,
} from "../lib/biofeedback";
import { startBreathAudioCapture, type BreathAudioCapture, type BreathAudioSummary } from "../lib/audioBreathTracker";
import type { DualCameraProbe } from "../lib/cameraCapabilities";
import type { PulseScanState } from "../lib/cameraPulseScan";
import type { FrontBreathScanResult } from "../lib/frontBreathScan";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { canUserAccessSession } from "../lib/sessionAccess";
import { runSmartCheckOrchestrator, type SmartCheckMode } from "../lib/smartCheckOrchestrator";
import { buildSmartRecommendation, type SmartRecommendation } from "../lib/smartRecommendations";
import { buildOutcomeGuidance, deriveWellnessSnapshot, type WellnessSnapshot } from "../lib/wellnessFusion";
import { hapticLight, useTelegram } from "../telegram/useTelegram";

type PlayerState = "idle" | "playing" | "paused" | "ended";
type SourceMode = "audio" | "voice" | "visual";
type SmartStage = "idle" | "probing" | "dual" | "front" | "rear" | "ready" | "error";
type FlowStep = "precheck" | "recommendation" | "practice" | "postcheck" | "result";
type FlowTransitionReason =
  | "scan_pre_done"
  | "scan_post_done"
  | "practice_start"
  | "practice_done"
  | "rerun"
  | "restart"
  | "fallback";

type DevRuntimeStatus = {
  rear_stream_acquired: boolean;
  front_stream_acquired: boolean;
  rear_video_attached: boolean;
  front_video_attached: boolean;
  rear_play_started: boolean;
  front_play_started: boolean;
  rear_processing_started: boolean;
  front_processing_started: boolean;
  rear_signal_detected: boolean;
  fallback_triggered: boolean;
  fallback_reason: string | null;
};

const EMPTY_RUNTIME_STATUS: DevRuntimeStatus = {
  rear_stream_acquired: false,
  front_stream_acquired: false,
  rear_video_attached: false,
  front_video_attached: false,
  rear_play_started: false,
  front_play_started: false,
  rear_processing_started: false,
  front_processing_started: false,
  rear_signal_detected: false,
  fallback_triggered: false,
  fallback_reason: null,
};

const FLOW_ALLOWED: Record<FlowStep, FlowStep[]> = {
  precheck: ["precheck", "recommendation"],
  recommendation: ["recommendation", "practice", "precheck"],
  practice: ["practice", "postcheck"],
  postcheck: ["postcheck", "result"],
  result: ["result", "precheck"],
};

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

function mapMicGuidanceKey(guidance: BreathAudioSummary["guidance"]): string {
  if (guidance === "excellent") return "bioMicExcellent";
  if (guidance === "good") return "bioMicGood";
  if (guidance === "improving") return "bioMicImproving";
  if (guidance === "irregular") return "bioMicIrregular";
  return "bioMicInsufficient";
}

function mapTorchKey(mode: PulseScanResult["torchMode"] | undefined): string {
  if (mode === "enabled") return "bioTorchEnabled";
  if (mode === "fallback") return "bioTorchFallback";
  return "bioTorchUnavailable";
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

  const [flowStep, setFlowStep] = useState<FlowStep>("precheck");
  const [speed, setSpeed] = useState<number>(1);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [durationSec, setDurationSec] = useState(session ? Math.max(session.audio.durationSec, session.durationMin * 60) : 0);
  const [sourceMode, setSourceMode] = useState<SourceMode>(session?.audio.src ? "audio" : "visual");

  const [smartStage, setSmartStage] = useState<SmartStage>("idle");
  const [smartMode, setSmartMode] = useState<SmartCheckMode | null>(null);
  const [smartErrorKey, setSmartErrorKey] = useState<string | null>(null);
  const [dualProbe, setDualProbe] = useState<DualCameraProbe | null>(null);
  const [recommendation, setRecommendation] = useState<SmartRecommendation | null>(null);

  const [scanProgress, setScanProgress] = useState(0);
  const [scanVisualState, setScanVisualState] = useState<PulseScanState | "idle" | "success">("idle");
  const [scanErrorKey, setScanErrorKey] = useState<string | null>(null);
  const [scanLiveContact, setScanLiveContact] = useState<number | null>(null);
  const [scanLiveDetected, setScanLiveDetected] = useState(false);
  const [lastScanDeviceLabel, setLastScanDeviceLabel] = useState<string | null>(null);
  const [lastTorchMode, setLastTorchMode] = useState<PulseScanResult["torchMode"]>("unavailable");
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
  const [preWellness, setPreWellness] = useState<WellnessSnapshot | null>(null);
  const [postWellness, setPostWellness] = useState<WellnessSnapshot | null>(null);

  const [breathCoachOn, setBreathCoachOn] = useState(false);
  const [breathSeconds, setBreathSeconds] = useState(0);
  const [breathActiveSeconds, setBreathActiveSeconds] = useState(0);
  const [breathMetrics, setBreathMetrics] = useState<BreathCoachMetrics | null>(null);

  const [micStatus, setMicStatus] = useState<"idle" | "recording" | "analyzing" | "ready" | "blocked" | "unsupported">("idle");
  const [micSummary, setMicSummary] = useState<BreathAudioSummary | null>(null);
  const [devDiagEvents, setDevDiagEvents] = useState<string[]>([]);
  const [devRuntimeStatus, setDevRuntimeStatus] = useState<DevRuntimeStatus>(EMPTY_RUNTIME_STATUS);
  const [dualRuntimeConfirmed, setDualRuntimeConfirmed] = useState(false);

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
  const phaseHapticRef = useRef<"inhale" | "pause" | "exhale" | null>(null);
  const dualDiagRef = useRef<string[]>([]);
  const flowStepRef = useRef<FlowStep>("precheck");

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
  const smartRunning = smartStage === "probing" || smartStage === "dual" || smartStage === "front" || smartStage === "rear";

  const goToFlowStep = useCallback((next: FlowStep, reason: FlowTransitionReason) => {
    setFlowStep((prev) => {
      if (prev === next) return prev;
      const allowed = FLOW_ALLOWED[prev].includes(next);
      if (!allowed) {
        if (import.meta.env.DEV) {
          console.warn("[flow]", "blocked transition", { prev, next, reason });
        }
        return prev;
      }
      if (import.meta.env.DEV) {
        console.debug("[flow]", "transition", { prev, next, reason });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    flowStepRef.current = flowStep;
  }, [flowStep]);

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

    setBreathMetrics({
      adherenceScore,
      stillnessScore: null,
    });
    setBreathCoachOn(false);
  }, [breathCoachOn, breathSeconds, breathActiveSeconds]);

  const markSessionDone = useCallback(async () => {
    if (!session) return;
    if (doneOnceRef.current === session.slug) return;
    doneOnceRef.current = session.slug;

    await stopBreathCoach();
    await stopMicCapture();

    setPlayerState("ended");
    setElapsedSec(resolvedDuration);
    goToFlowStep("postcheck", "practice_done");

    completeSession(session.slug);
    selfCareToday();

    try {
      app.HapticFeedback.notificationOccurred("success");
    } catch {
      /* ignore */
    }
  }, [session, stopBreathCoach, stopMicCapture, resolvedDuration, completeSession, selfCareToday, app, goToFlowStep]);

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
        hapticLight(app);
        return true;
      } catch {
        return false;
      }
    },
    [session?.audio.src, speed, app]
  );

  const runSmartCheck = useCallback(
    async (phase: "pre" | "post") => {
      if (!session || smartRunning) return;
      if (phase === "pre" && flowStepRef.current !== "precheck") return;
      if (phase === "post" && flowStepRef.current !== "postcheck") return;
      setSmartErrorKey(null);
      setScanErrorKey(null);
      setFrontErrorKey(null);
      setSmartMode(null);
      setFrontScanState("idle");
      setScanVisualState("idle");
      setFrontProgress(0);
      setScanProgress(0);
      setScanLiveContact(null);
      setScanLiveDetected(false);
      setFrontLiveSignalQuality(null);
      setFrontLiveConfidence(null);

      const abort = new AbortController();
      smartAbortRef.current = abort;
      let guardTimeout: number | null = null;
      dualDiagRef.current = [];
      setDevDiagEvents([]);
      setDevRuntimeStatus(EMPTY_RUNTIME_STATUS);
      setDualRuntimeConfirmed(false);

      try {
        const runPromise = runSmartCheckOrchestrator({
          signal: abort.signal,
          onProbe: (probe) => setDualProbe(probe),
          onMode: (mode) => setSmartMode(mode),
          onStage: (stage) => {
            if (stage === "probing") setSmartStage("probing");
            if (stage === "dual") setSmartStage("dual");
            if (stage === "front") setSmartStage("front");
            if (stage === "rear") setSmartStage("rear");
          },
          onFrontProgress: setFrontProgress,
          onFrontState: setFrontScanState,
          onFrontFrame: (frame) => {
            setFrontLiveSignalQuality(frame.signalQuality);
            setFrontLiveConfidence(frame.confidence);
          },
          onPulseProgress: setScanProgress,
          onPulseState: setScanVisualState,
          onPulseSignal: (signal) => {
            setScanLiveContact(signal.contactConfidence);
            setScanLiveDetected(signal.contactDetected);
          },
          onDiagnostics: (event) => {
            const line = `${event.at} ${event.event}${event.detail ? `:${event.detail}` : ""}`;
            dualDiagRef.current.push(line);
            setDevDiagEvents((prev) => [...prev.slice(-25), line]);
            setDevRuntimeStatus((prev) => {
              const next = { ...prev };
              if (event.event === "rear_stream_acquired") next.rear_stream_acquired = true;
              if (event.event === "front_stream_acquired") next.front_stream_acquired = true;
              if (event.event === "rear_video_attached") next.rear_video_attached = true;
              if (event.event === "front_video_attached") next.front_video_attached = true;
              if (event.event === "rear_play_started") next.rear_play_started = true;
              if (event.event === "front_play_started") next.front_play_started = true;
              if (event.event === "rear_processing_started") next.rear_processing_started = true;
              if (event.event === "front_processing_started") next.front_processing_started = true;
              if (event.event === "rear_signal_detected") next.rear_signal_detected = true;
              if (event.event === "fallback_triggered") {
                next.fallback_triggered = true;
                next.fallback_reason = event.detail ?? "unknown";
              }
              return next;
            });
            if (import.meta.env.DEV) {
              console.debug("[smart-check]", line);
            }
          },
          previewVideo: frontPreviewVideoRef.current,
          previewOverlay: frontPreviewOverlayRef.current,
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          guardTimeout = window.setTimeout(() => {
            abort.abort();
            reject(new Error("smart_timeout"));
          }, 45_000);
        });

        const result = await Promise.race([runPromise, timeoutPromise]);

        setSmartStage("ready");
        setDualRuntimeConfirmed(result.dualRuntimeConfirmed);
        setFrontScanState("done");
        setScanVisualState(result.pulse.rawStatus === "ok" ? "success" : "idle");
        setLastScanDeviceLabel(result.pulse.device?.cameraLabel ?? result.probe.rear.label ?? null);
        setLastTorchMode(result.pulse.torchMode ?? "unavailable");
        setScanLiveContact(result.pulse.contactConfidence ?? null);
        setScanLiveDetected(Boolean(result.pulse.contactDetected));

        if (result.front.rawStatus !== "ok" || result.front.breathingRate == null) {
          setFrontErrorKey(mapFrontFailureKey(result.front));
        }
        if (result.pulse.rawStatus !== "ok" || result.pulse.pulse == null) {
          setScanErrorKey(mapPulseFailureKey(result.pulse));
        }

        if (phase === "pre") {
          const rec = buildSmartRecommendation(
            {
              pulse: result.pulse.pulse,
              calmScore: null,
              breathingRate: result.front.breathingRate,
              breathingRegularity: result.front.regularity,
              frontState: result.front.stateLabel,
              hourOfDay: new Date().getHours(),
              completedCount: state.completedSlugs.length,
              premium: state.premium,
            },
            session
          );
          setRecommendation(rec);
          setFrontPre(result.front);

          const saved = savePreSessionCheckIn({
            meditationSlug: session.slug,
            scan: result.pulse,
            frontSnapshot: toFrontSnapshot(result.front),
            recommendation: {
              mode: rec.mode,
              sessionSlug: rec.sessionSlug,
            },
          });

          setPreScanRecord(saved.scanRecord);
          setBioSessionRecord(saved.sessionRecord);
          setPostScanRecord(null);
          setFrontPost(null);
          setPostWellness(null);

          const wellness = deriveWellnessSnapshot({
            pulse: result.pulse,
            front: result.front,
            mic: null,
            hour: new Date().getHours(),
          });
          setPreWellness(wellness);

          if (saved.reliable) {
            goToFlowStep("recommendation", "scan_pre_done");
          }
        } else {
          setFrontPost(result.front);
          const wellness = deriveWellnessSnapshot({
            pulse: result.pulse,
            front: result.front,
            mic: micSummary,
            hour: new Date().getHours(),
          });
          setPostWellness(wellness);

          if (bioSessionRecord?.id) {
            const saved = savePostSessionCheckIn({
              bioSessionId: bioSessionRecord.id,
              scan: result.pulse,
              breathMetrics,
              frontSnapshot: toFrontSnapshot(result.front),
              audioSnapshot: toAudioSnapshot(micSummary),
            });
            setPostScanRecord(saved.scanRecord);
            setBioSessionRecord(saved.sessionRecord ?? bioSessionRecord);
            if (saved.reliable) {
              goToFlowStep("result", "scan_post_done");
            }
          } else {
            const standalone = saveStandaloneScan({
              phase: "post",
              meditationSlug: session.slug,
              scan: result.pulse,
            });
            setPostScanRecord(standalone);
            goToFlowStep("result", "scan_post_done");
          }
        }
      } catch {
        setDualRuntimeConfirmed(false);
        setSmartErrorKey("bioSmartFailed");
        setSmartStage("error");
      } finally {
        if (guardTimeout) window.clearTimeout(guardTimeout);
        smartAbortRef.current = null;
      }
    },
    [session, smartRunning, state.completedSlugs.length, state.premium, bioSessionRecord, breathMetrics, micSummary, goToFlowStep]
  );

  const cancelSmartCheck = useCallback(() => {
    smartAbortRef.current?.abort();
    setSmartStage("idle");
    setSmartMode(null);
    setDualRuntimeConfirmed(false);
    setFrontScanState("idle");
    setScanVisualState("idle");
    setScanLiveContact(null);
    setScanLiveDetected(false);
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

    window.speechSynthesis.pause();
    clearTtsTick();
    setPlayerState("paused");
  }, [playerState, sourceMode, clearVisualTick, clearTtsTick]);

  const handleStop = useCallback(() => {
    stopAllPlayback();
    void stopMicCapture();
    doneOnceRef.current = null;
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
    if (flowStep !== "practice") return;
    setBreathCoachOn(true);
    setBreathSeconds(0);
    setBreathActiveSeconds(0);
    setBreathMetrics(null);
  }, [flowStep]);

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
  }, [app, nav]);

  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) return;
    const mb = app.MainButton;
    const onClick = () => void runSmartCheck(flowStep === "postcheck" ? "post" : "pre");

    if ((flowStep === "precheck" && !preScanRecord && !smartRunning) || (flowStep === "postcheck" && !smartRunning)) {
      mb.setText(flowStep === "postcheck" ? t("bioPostSmartStart") : t("bioSmartStart"));
      mb.enable();
      mb.show();
      mb.onClick(onClick);
    } else {
      mb.hide();
    }

    return () => {
      mb.offClick(onClick);
      mb.hide();
    };
  }, [app, flowStep, preScanRecord, smartRunning, runSmartCheck, t]);

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

    setFlowStep("precheck");
    setSpeed(1);
    setPlayerState("idle");
    setElapsedSec(0);
    setDurationSec(Math.max(session.audio.durationSec, session.durationMin * 60));
    setSourceMode(session.audio.src ? "audio" : "visual");

    setSmartStage("idle");
    setSmartMode(null);
    setDualRuntimeConfirmed(false);
    setSmartErrorKey(null);
    setDualProbe(null);
    setRecommendation(null);

    setScanProgress(0);
    setScanVisualState("idle");
    setScanErrorKey(null);
    setScanLiveContact(null);
    setScanLiveDetected(false);
    setLastScanDeviceLabel(null);
    setLastTorchMode("unavailable");
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
    setPreWellness(null);
    setPostWellness(null);

    setBreathCoachOn(false);
    setBreathSeconds(0);
    setBreathActiveSeconds(0);
    setBreathMetrics(null);

    setMicStatus("idle");
    setMicSummary(null);
    setDevDiagEvents([]);
    setDevRuntimeStatus(EMPTY_RUNTIME_STATUS);

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
        <section className="tm-card session-gate">
          <h2 className="tm-h2">{t("premiumGateTitle")}</h2>
          <p className="tm-subtle">{t("premiumGateLead")}</p>
          <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={() => nav("/premium")}>
            {t("premiumGateCta")}
          </button>
        </section>
      </div>
    );
  }

  const frontStatusKey = mapFrontStateKey(frontScanState);
  const scanStatusKey = mapPulseStateKey(scanVisualState);
  const frontQualityText = frontLiveSignalQuality != null ? `${Math.round(frontLiveSignalQuality * 100)}%` : "--";
  const frontConfidenceText = frontLiveConfidence != null ? `${Math.round(frontLiveConfidence * 100)}%` : "--";
  const simultaneousCoreReady =
    devRuntimeStatus.rear_stream_acquired &&
    devRuntimeStatus.front_stream_acquired &&
    devRuntimeStatus.rear_video_attached &&
    devRuntimeStatus.front_video_attached &&
    devRuntimeStatus.rear_play_started &&
    devRuntimeStatus.front_play_started &&
    devRuntimeStatus.rear_processing_started &&
    devRuntimeStatus.front_processing_started;
  const rearPulseAlive =
    devRuntimeStatus.rear_signal_detected ||
    scanVisualState === "success" ||
    (scanLiveDetected && (scanLiveContact ?? 0) >= 0.68);
  const strictDualReady =
    smartMode === "dual" &&
    dualRuntimeConfirmed &&
    simultaneousCoreReady &&
    rearPulseAlive &&
    !devRuntimeStatus.fallback_triggered;
  const probeHint =
    strictDualReady
      ? t("bioDualAvailable")
      : smartMode === "staged" || devRuntimeStatus.fallback_triggered || (smartMode === "dual" && !dualRuntimeConfirmed)
        ? t("bioDualFallback")
        : t(mapProbeReasonKey(dualProbe?.reason ?? "concurrency_blocked"));
  const pulseLiveHint =
    scanLiveContact != null
      ? t(scanLiveDetected ? "bioPulseContactGood" : "bioPulseContactPending").replace("{value}", `${Math.round(scanLiveContact * 100)}%`)
      : null;

  const postReliable = Boolean(postScanRecord && postScanRecord.rawStatus === "ok" && postScanRecord.pulse != null);
  const preReliable = Boolean(preScanRecord && preScanRecord.rawStatus === "ok" && preScanRecord.pulse != null);
  const guidance = buildOutcomeGuidance({
    summaryCode: bioSessionRecord?.summaryCode,
    recommendation,
    mic: micSummary,
  });

  const breathPhaseLabel =
    breathPhase.id === "inhale" ? t("bioBreathInhale") : breathPhase.id === "pause" ? t("bioBreathPause") : t("bioBreathExhale");
  const breathPhaseScale = breathPhase.id === "inhale" ? 1.15 : breathPhase.id === "pause" ? 1.06 : 0.92;

  return (
    <div className="tm-page session-stage">
      <Link to="/paths" className="session-back">
        {"<"} {t("back")}
      </Link>

      <section className="session-intro">
        <p className="tm-kicker">{t("sessionAbout")}</p>
        <h1 className="tm-h1">{session.title[L]}</h1>
        <p className="tm-lead">{session.short[L]}</p>
      </section>

      {flowStep === "precheck" ? (
        <>
          <SmartCheckPanel
            title={t("bioSmartTitle")}
            lead={t("bioSmartLead")}
            disclaimer={t("bioWellnessDisclaimer")}
            probeHint={probeHint}
            front={{
              status: t(frontStatusKey),
              progress: frontProgress,
              quality: frontQualityText,
              confidence: frontConfidenceText,
              hint: t("bioFrontPreviewHint"),
              error: frontErrorKey ? t(frontErrorKey) : null,
              videoRef: frontPreviewVideoRef,
              overlayRef: frontPreviewOverlayRef,
              running: smartRunning,
            }}
            rear={{
              status: t(scanStatusKey),
              progress: scanProgress,
              targetHint: t("bioPulseGuideTarget"),
              selectedCamera: t("bioRearSelected").replace("{camera}", lastScanDeviceLabel ?? dualProbe?.rear.label ?? t("bioRearUnknown")),
              coverHint: t("bioPulseGuideCover"),
              liveHint: pulseLiveHint,
              stillHint: t("bioPulseGuideStill"),
              torchHint: preScanRecord || scanProgress > 0 ? t(mapTorchKey(lastTorchMode)) : null,
              error: scanErrorKey ? t(scanErrorKey) : null,
              state: scanVisualState,
            }}
            primaryAction={{
              label: smartRunning ? t("bioSmartRunning") : preScanRecord ? t("bioSmartRepeat") : t("bioSmartStart"),
              onClick: () => void runSmartCheck("pre"),
              disabled: smartRunning,
            }}
            historyAction={{ label: t("bioHistoryOpen"), onClick: () => nav("/biofeedback") }}
            cancelAction={smartRunning ? { label: t("bioScanCancel"), onClick: cancelSmartCheck } : undefined}
            topError={smartErrorKey ? t(smartErrorKey) : null}
          >
            {preScanRecord && frontPre ? (
              <div className="bio-result">
                <p className="tm-subtle">
                  {t("bioMetricPulse")}: {preScanRecord.pulse ?? "-"} · {t("bioMetricCalm")}: {preScanRecord.calmScore ?? "-"}
                </p>
              </div>
            ) : null}
          </SmartCheckPanel>
          <DevRuntimeOverlay
            phase={`flow=${flowStep} smart=${smartStage}`}
            logs={devDiagEvents}
            summary={{
              simultaneousCoreReady,
              rearPulseAlive,
              strictDualReady,
              fallbackTriggered: devRuntimeStatus.fallback_triggered,
              fallbackReason: devRuntimeStatus.fallback_reason,
            }}
          />
        </>
      ) : null}

      {flowStep === "recommendation" && recommendation ? (
        <RecommendationPanel
          title={t("bioRecommendationTitle")}
          lead={t("bioRecommendationLead")}
          stateTitle={preWellness ? t(preWellness.headlineKey) : t("bioFrontToneNeutral")}
          stateSupport={preWellness ? t(preWellness.supportKey) : t("bioRecommendationBalanced")}
          confidenceLabel={t("bioFrontConfidence")}
          confidenceValue={preWellness ? `${Math.round(preWellness.confidence * 100)}%` : "--"}
          reason={t(mapRecommendationReasonKey(recommendation.rationaleKey))}
          patternLine={`${t("bioRecPattern")}: ${recommendation.targetBreathPattern} • ${t("bioRecDuration")}: ${recommendation.targetDurationMin} ${t("sessionMin")}`}
          primaryLabel={t("bioRecommendationStartCurrent")}
          onPrimary={() => {
            goToFlowStep("practice", "practice_start");
          }}
          rerunLabel={t("bioRecommendationRerun")}
          onRerun={() => {
            goToFlowStep("precheck", "rerun");
            void runSmartCheck("pre");
          }}
        />
      ) : null}

      {flowStep === "practice" ? (
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
          />

          <div className="practice-reset-meta">
            <span>{session.durationMin} {t("sessionMin")}</span>
            <span>•</span>
            <span>{session.audio.src ? t("playerAudioReady") : t("bioBreathVisualMode")}</span>
          </div>

          <p className="practice-reset-sub">{t("bioPracticePhonePlacement")}</p>

          {!session.audio.src ? (
            <div className="practice-reset-modes">
              <button
                type="button"
                className={`practice-reset-chip ${sourceMode === "visual" ? "on" : ""}`}
                onClick={() => setSourceMode("visual")}
              >
                {t("bioBreathVisualMode")}
              </button>
              <button
                type="button"
                className={`practice-reset-chip ${sourceMode === "voice" ? "on" : ""}`}
                onClick={() => setSourceMode("voice")}
              >
                {t("bioBreathVoiceMode")}
              </button>
            </div>
          ) : null}

          <div className="practice-reset-orb-wrap">
            <div className="practice-reset-orb" style={{ transform: `scale(${breathPhaseScale})` }}>
              <span>{breathPhaseLabel}</span>
            </div>
            <p className="practice-reset-sub">{Math.round(breathPhase.progress * 100)}%</p>
          </div>

          <div className="practice-reset-progress">
            <div className="wave-meter" aria-hidden>
              <span style={{ width: `${progressPct}%` }} />
            </div>
            <div className="player-progress-meta">
              <span>{formatClock(elapsedSec)}</span>
              <span>{formatClock(resolvedDuration)}</span>
            </div>
          </div>

          {sourceMode !== "visual" ? (
            <div className="practice-reset-speed">
              {SPEED_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`practice-reset-chip ${speed === option ? "on" : ""}`}
                  onClick={() => {
                    setSpeed(option);
                    if (audioRef.current) audioRef.current.playbackRate = option;
                  }}
                >
                  {option.toFixed(2).replace(".00", ".0")}x
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className="practice-reset-primary"
            onClick={() => {
              if (playerState === "playing") {
                handlePause();
                return;
              }
              void handlePlay();
            }}
          >
            {playerState === "playing" ? t("playerPause") : playerState === "paused" ? t("playerResume") : t("playerPlay")}
          </button>

          <button type="button" className="practice-reset-secondary" onClick={() => void handleRestart()}>
            {t("playerRestart")}
          </button>

          <p className="practice-reset-mic">
            {t("bioMicTitle")}: {t(`bioMicStatus_${micStatus}`)}
          </p>
        </section>
      ) : null}
      {flowStep === "postcheck" ? (
        <>
          <SmartCheckPanel
            title={t("bioPostTitle")}
            lead={t("bioPostLead")}
            disclaimer={t("bioWellnessDisclaimer")}
            probeHint={probeHint}
            front={{
              status: t(frontStatusKey),
              progress: frontProgress,
              quality: frontQualityText,
              confidence: frontConfidenceText,
              hint: t("bioFrontPreviewHint"),
              error: frontErrorKey ? t(frontErrorKey) : null,
              videoRef: frontPreviewVideoRef,
              overlayRef: frontPreviewOverlayRef,
              running: smartRunning,
            }}
            rear={{
              status: t(scanStatusKey),
              progress: scanProgress,
              targetHint: t("bioPulseGuideTarget"),
              selectedCamera: t("bioRearSelected").replace("{camera}", lastScanDeviceLabel ?? dualProbe?.rear.label ?? t("bioRearUnknown")),
              coverHint: t("bioPulseGuideCover"),
              liveHint: pulseLiveHint,
              stillHint: t("bioPulseGuideStill"),
              torchHint: postScanRecord || scanProgress > 0 ? t(mapTorchKey(lastTorchMode)) : null,
              error: scanErrorKey ? t(scanErrorKey) : null,
              state: scanVisualState,
            }}
            primaryAction={{
              label: smartRunning ? t("bioSmartRunning") : t("bioPostSmartStart"),
              onClick: () => void runSmartCheck("post"),
              disabled: smartRunning || !preReliable,
            }}
            historyAction={{ label: t("bioHistoryOpen"), onClick: () => nav("/biofeedback") }}
            cancelAction={smartRunning ? { label: t("bioScanCancel"), onClick: cancelSmartCheck } : undefined}
            topError={smartErrorKey ? t(smartErrorKey) : null}
          >
            {!preReliable ? <p className="tm-subtle">{t("bioPostNeedPre")}</p> : null}
          </SmartCheckPanel>
          <DevRuntimeOverlay
            phase={`flow=${flowStep} smart=${smartStage}`}
            logs={devDiagEvents}
            summary={{
              simultaneousCoreReady,
              rearPulseAlive,
              strictDualReady,
              fallbackTriggered: devRuntimeStatus.fallback_triggered,
              fallbackReason: devRuntimeStatus.fallback_reason,
            }}
          />
        </>
      ) : null}

      {flowStep === "result" ? (
        <section className="tm-card tm-card--quiet bio-card">
          <h2 className="tm-h2">{t("bioResultTitle")}</h2>
          <p className="tm-subtle">{t("bioResultLead")}</p>

          {postScanRecord ? (
            <div className="bio-result">
              <p className="tm-kicker tm-kicker--muted">{t("bioEffectTitle")}</p>
              {preReliable && postReliable ? (
                <>
                  <article className="bio-metric-pill">
                    <span>{t("bioEffectPulse")}</span>
                    <strong>
                      {preScanRecord?.pulse ?? "-"}
                      {" -> "}
                      {postScanRecord.pulse ?? "-"}
                    </strong>
                  </article>
                  <p className="tm-subtle">
                    {t("bioEffectCalm")}: {preScanRecord?.calmScore ?? "-"} {" -> "} {postScanRecord.calmScore ?? "-"}
                  </p>
                  <p className="tm-subtle">
                    {t("bioFrontMetric")}: {frontPre?.breathingRate ?? "-"} {" -> "} {frontPost?.breathingRate ?? "-"} bpm
                  </p>
                  <p className="tm-subtle">{t(summaryKey(bioSessionRecord?.summaryCode))}</p>
                </>
              ) : (
                <p className="tm-subtle">{t("bioEffectIncomplete")}</p>
              )}

              {postWellness ? (
                <div className="bio-rec-card">
                  <p className="tm-list-title">{t(postWellness.headlineKey)}</p>
                  <p className="tm-subtle">{t(postWellness.supportKey)}</p>
                </div>
              ) : null}

              {micSummary ? (
                <p className="tm-subtle">
                  {t("bioMicAfter")}: {micSummary.breathRate ?? "-"} bpm • {t(mapMicGuidanceKey(micSummary.guidance))}
                </p>
              ) : null}

              <OutcomeGuidanceCard
                todayTitle={t("bioAdviceTodayTitle")}
                tomorrowTitle={t("bioAdviceTomorrowTitle")}
                todayText={t(guidance.todayKey)}
                tomorrowText={t(guidance.tomorrowKey)}
                quote={t(guidance.quoteKey)}
              />
            </div>
          ) : (
            <p className="tm-subtle">{t("bioEffectIncomplete")}</p>
          )}

          <div className="result-reset-actions">
            <button type="button" className="result-reset-primary" onClick={() => nav("/biofeedback")}>
              {t("bioHistoryOpen")}
            </button>
            <button
              type="button"
              className="result-reset-secondary"
              onClick={() => {
                goToFlowStep("precheck", "restart");
                void runSmartCheck("pre");
              }}
            >
              {t("bioSmartRepeat")}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}



