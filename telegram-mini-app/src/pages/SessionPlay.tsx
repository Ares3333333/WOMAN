import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SESSION_BY_SLUG, scriptToText } from "../data/sessions";
import {
  savePostSessionCheckIn,
  savePreSessionCheckIn,
  saveStandaloneScan,
  type BreathCoachMetrics,
  type PulseScanResult,
  type BiometricScanRecord,
  type MeditationBiofeedbackSessionRecord,
} from "../lib/biofeedback";
import { runPulseScan } from "../lib/cameraPulseScan";
import { createStillnessMonitor } from "../lib/breathStillness";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { canUserAccessSession } from "../lib/sessionAccess";
import { hapticLight, useTelegram } from "../telegram/useTelegram";

type PlayerState = "idle" | "playing" | "paused" | "ended";
type ScanPhase = "idle" | "pre" | "post";

const SPEED_OPTIONS = [0.9, 1, 1.15] as const;

function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const min = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const sec = (safe % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function mapScanFailureKey(result: PulseScanResult): string {
  if (result.rawStatus === "permission_denied") return "bioScanPermission";
  if (result.rawStatus === "unsupported") return "bioScanUnsupported";
  if (result.failureReason === "insufficient_light") return "bioScanLight";
  if (result.failureReason === "high_motion") return "bioScanMotion";
  if (result.failureReason === "finger_not_detected") return "bioScanNoFinger";
  return "bioScanQualityLow";
}

function breathPhaseAt(second: number): { id: "inhale" | "pause" | "exhale"; progress: number } {
  const cycle = 11;
  const tick = second % cycle;
  if (tick < 4) return { id: "inhale", progress: (tick + 1) / 4 };
  if (tick < 5) return { id: "pause", progress: 1 };
  return { id: "exhale", progress: (tick - 5 + 1) / 6 };
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
  const [durationSec, setDurationSec] = useState(session?.audio.durationSec ?? 0);
  const [sourceMode, setSourceMode] = useState<"audio" | "voice">(session?.audio.src ? "audio" : "voice");

  const [scanPhase, setScanPhase] = useState<ScanPhase>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanErrorKey, setScanErrorKey] = useState<string | null>(null);
  const [preScanRecord, setPreScanRecord] = useState<BiometricScanRecord | null>(null);
  const [postScanRecord, setPostScanRecord] = useState<BiometricScanRecord | null>(null);
  const [bioSessionRecord, setBioSessionRecord] = useState<MeditationBiofeedbackSessionRecord | null>(null);

  const [breathCoachOn, setBreathCoachOn] = useState(false);
  const [breathSeconds, setBreathSeconds] = useState(0);
  const [breathActiveSeconds, setBreathActiveSeconds] = useState(0);
  const [breathMetrics, setBreathMetrics] = useState<BreathCoachMetrics | null>(null);
  const [cameraAssistOn, setCameraAssistOn] = useState(false);
  const [cameraAssistError, setCameraAssistError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsTickRef = useRef<number | null>(null);
  const ttsStartedRef = useRef<number | null>(null);
  const doneOnceRef = useRef<string | null>(null);

  const scanAbortRef = useRef<AbortController | null>(null);
  const breathTickRef = useRef<number | null>(null);
  const stillnessRef = useRef(createStillnessMonitor());

  const fullText = session ? scriptToText(session.script, L) : "";
  const textWords = useMemo(() => fullText.split(/\s+/).filter(Boolean).length, [fullText]);

  const estimatedVoiceDuration = useMemo(() => {
    if (!session) return 0;
    if (session.audio.durationSec > 0) return session.audio.durationSec;
    return Math.max(180, Math.round(textWords / 2.2));
  }, [session, textWords]);

  const resolvedDuration = durationSec > 0 ? durationSec : estimatedVoiceDuration;
  const progressPct = resolvedDuration > 0 ? Math.min(100, (elapsedSec / resolvedDuration) * 100) : 0;

  const clearTtsTick = useCallback(() => {
    if (!ttsTickRef.current) return;
    window.clearInterval(ttsTickRef.current);
    ttsTickRef.current = null;
  }, []);

  const stopAllPlayback = useCallback(() => {
    clearTtsTick();
    ttsStartedRef.current = null;

    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }

    window.speechSynthesis.cancel();
    utterRef.current = null;
  }, [clearTtsTick]);

  const stopBreathCoach = useCallback(async () => {
    if (!breathCoachOn) return;

    if (breathTickRef.current) {
      window.clearInterval(breathTickRef.current);
      breathTickRef.current = null;
    }

    let stillnessScore: number | null = null;

    if (cameraAssistOn) {
      try {
        const stillness = await stillnessRef.current.stop();
        stillnessScore = stillness.stillnessScore;
      } catch {
        stillnessScore = null;
      }
    }

    const adherenceScore =
      breathSeconds > 5 ? Number(Math.max(0, Math.min(1, breathActiveSeconds / breathSeconds)).toFixed(2)) : null;

    setBreathMetrics({
      adherenceScore,
      stillnessScore,
    });

    setBreathCoachOn(false);
  }, [breathCoachOn, cameraAssistOn, breathSeconds, breathActiveSeconds]);

  const markSessionDone = useCallback(async () => {
    if (!session) return;
    if (doneOnceRef.current === session.slug) return;

    doneOnceRef.current = session.slug;

    await stopBreathCoach();

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
  }, [session, stopBreathCoach, resolvedDuration, completeSession, selfCareToday, app]);

  const startVoiceTick = useCallback(
    (fromSec: number) => {
      clearTtsTick();
      ttsStartedRef.current = Date.now() - fromSec * 1000;

      ttsTickRef.current = window.setInterval(() => {
        if (ttsStartedRef.current === null) return;
        const nextElapsed = Math.floor((Date.now() - ttsStartedRef.current) / 1000);
        setElapsedSec(Math.min(nextElapsed, resolvedDuration));
      }, 400);
    },
    [clearTtsTick, resolvedDuration]
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
    setDurationSec(estimatedVoiceDuration);
    setPlayerState("playing");
    startVoiceTick(0);

    window.speechSynthesis.speak(utter);
    hapticLight(app);
  }, [session, canAccess, clearTtsTick, fullText, locale, speed, estimatedVoiceDuration, startVoiceTick, markSessionDone, app]);

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

  const handlePlay = useCallback(async () => {
    if (!session || !canAccess) return;

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
  }, [session, canAccess, playerState, sourceMode, playAudio, startVoiceTick, elapsedSec, startVoiceFromStart]);

  const handlePause = useCallback(() => {
    if (playerState !== "playing") return;

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
  }, [playerState, sourceMode, clearTtsTick]);

  const handleStop = useCallback(() => {
    stopAllPlayback();
    doneOnceRef.current = null;
    setDone(false);
    setElapsedSec(0);
    setPlayerState("idle");
  }, [stopAllPlayback]);

  const handleRestart = useCallback(async () => {
    handleStop();

    if (!session || !canAccess) return;

    if (session.audio.src) {
      const ok = await playAudio(true);
      if (ok) return;
      if (!session.audio.fallbackVoice) return;
    }

    startVoiceFromStart();
  }, [handleStop, session, canAccess, playAudio, startVoiceFromStart]);

  const openPremium = () => {
    nav("/premium");
  };

  const startScan = useCallback(
    async (phase: Exclude<ScanPhase, "idle">) => {
      if (!session || scanPhase !== "idle") return;

      setScanErrorKey(null);
      setScanProgress(0);
      setScanPhase(phase);

      const abort = new AbortController();
      scanAbortRef.current = abort;

      try {
        const result = await runPulseScan({
          durationMs: 35_000,
          signal: abort.signal,
          onProgress: setScanProgress,
        });

        if (phase === "pre") {
          const saved = savePreSessionCheckIn({ meditationSlug: session.slug, scan: result });
          setPreScanRecord(saved.scanRecord);
          setBioSessionRecord(saved.sessionRecord);
          setPostScanRecord(null);
        } else {
          if (bioSessionRecord?.id) {
            const saved = savePostSessionCheckIn({
              bioSessionId: bioSessionRecord.id,
              scan: result,
              breathMetrics,
            });
            setPostScanRecord(saved.scanRecord);
            setBioSessionRecord(saved.sessionRecord ?? bioSessionRecord);
          } else {
            const standalone = saveStandaloneScan({ phase: "post", meditationSlug: session.slug, scan: result });
            setPostScanRecord(standalone);
          }
        }

        if (result.rawStatus !== "ok" || result.pulse == null) {
          setScanErrorKey(mapScanFailureKey(result));
        }
      } catch {
        setScanErrorKey("bioScanUnknown");
      } finally {
        setScanPhase("idle");
        scanAbortRef.current = null;
      }
    },
    [session, scanPhase, bioSessionRecord, breathMetrics]
  );

  const cancelScan = useCallback(() => {
    scanAbortRef.current?.abort();
    setScanPhase("idle");
  }, []);

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

  useEffect(() => {
    return () => {
      stopAllPlayback();
      scanAbortRef.current?.abort();
      if (breathTickRef.current) window.clearInterval(breathTickRef.current);
      void stillnessRef.current.stop();
    };
  }, [stopAllPlayback]);

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
    if (!session) return;

    stopAllPlayback();
    doneOnceRef.current = null;

    setSpeed(1);
    setPlayerState("idle");
    setDone(false);
    setElapsedSec(0);
    setDurationSec(session.audio.durationSec);
    setSourceMode(session.audio.src ? "audio" : "voice");

    setScanPhase("idle");
    setScanProgress(0);
    setScanErrorKey(null);
    setPreScanRecord(null);
    setPostScanRecord(null);
    setBioSessionRecord(null);

    setBreathCoachOn(false);
    setBreathSeconds(0);
    setBreathActiveSeconds(0);
    setBreathMetrics(null);
    setCameraAssistOn(false);
    setCameraAssistError(null);

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

          <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={openPremium}>
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

  const recommendationKind = preScanRecord?.calmScore != null
    ? preScanRecord.calmScore < 48
      ? "soft"
      : preScanRecord.calmScore >= 72
        ? "deep"
        : "balanced"
    : null;

  const phase = breathPhaseAt(breathSeconds);
  const phaseLabel =
    phase.id === "inhale"
      ? t("bioBreathInhale")
      : phase.id === "pause"
        ? t("bioBreathPause")
        : t("bioBreathExhale");

  const phaseScale = phase.id === "inhale" ? 1.12 : phase.id === "pause" ? 1.08 : 0.94;

  return (
    <div className="tm-page session-stage">
      <Link to="/paths" className="session-back">
        {"<"} {t("back")}
      </Link>

      <section className="tm-card tm-card--quiet bio-card">
        <div className="bio-head">
          <p className="tm-kicker tm-kicker--muted">{t("bioPreTitle")}</p>
          <h2 className="tm-h2">{t("bioPreLead")}</h2>
          <p className="tm-subtle">{t("bioScanInstruction")}</p>
          <p className="tm-subtle">{t("bioWellnessDisclaimer")}</p>
        </div>

        <div className="bio-actions">
          <button
            type="button"
            className="tm-btn tm-btn-primary"
            disabled={scanPhase !== "idle"}
            onClick={() => void startScan("pre")}
          >
            {scanPhase === "pre" ? t("bioScanMeasuring") : t("bioScanStart")}
          </button>
          <button type="button" className="tm-btn tm-btn-ghost" onClick={() => nav("/biofeedback")}>
            {t("bioHistoryOpen")}
          </button>
          {scanPhase !== "idle" ? (
            <button type="button" className="tm-btn tm-btn-secondary" onClick={cancelScan}>
              {t("bioScanCancel")}
            </button>
          ) : null}
        </div>

        {scanPhase !== "idle" ? (
          <div className="bio-progress">
            <div className="wave-meter" aria-hidden>
              <span style={{ width: `${Math.round(scanProgress * 100)}%` }} />
            </div>
            <p className="tm-subtle">{Math.round(scanProgress * 100)}%</p>
          </div>
        ) : null}

        {scanErrorKey ? <p className="bio-error">{t(scanErrorKey)}</p> : null}

        {preScanRecord ? (
          <div className="bio-result">
            <p className="tm-kicker tm-kicker--muted">{t("bioPreResultTitle")}</p>
            {preReliable ? (
              <>
                <p className="tm-subtle">
                  {t("bioMetricPulse")}: {preScanRecord.pulse} bpm • {t("bioMetricQuality")}: {Math.round(preScanRecord.signalQuality * 100)}%
                </p>
                <p className="tm-subtle">
                  {t("bioMetricCalm")}: {preScanRecord.calmScore} • {t("bioMetricRecovery")}: {preScanRecord.recoveryScore}
                </p>
                {recommendationKind ? (
                  <p className="tm-subtle">
                    {t(
                      recommendationKind === "soft"
                        ? "bioRecommendationSoft"
                        : recommendationKind === "deep"
                          ? "bioRecommendationDeep"
                          : "bioRecommendationBalanced"
                    )}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="tm-subtle">{t("bioScanQualityLow")}</p>
            )}
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

        <div className="player-source-row">
          <span className="tm-pill">{sourceMode === "audio" ? t("playerSourceAudio") : t("playerSourceVoice")}</span>
          <span className="tm-subtle">{session.audio.src ? t("playerAudioReady") : t("playerAudioPending")}</span>
        </div>

        <div className="player-progress-wrap">
          <div className="wave-meter" aria-hidden>
            <span style={{ width: `${progressPct}%` }} />
          </div>
          <div className="player-progress-meta">
            <span>{formatClock(elapsedSec)}</span>
            <span>{formatClock(resolvedDuration)}</span>
          </div>
        </div>

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

        <div className="player-controls-grid">
          <button
            type="button"
            className="tm-btn tm-btn-primary tm-btn-block"
            onClick={() => void handlePlay()}
            disabled={playerState === "playing"}
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
                setCameraAssistError(null);

                if (cameraAssistOn) {
                  try {
                    await stillnessRef.current.start();
                  } catch {
                    setCameraAssistError("bioScanUnsupported");
                    setCameraAssistOn(false);
                  }
                }
              }}
            >
              {breathCoachOn ? t("bioBreathStop") : t("bioBreathStart")}
            </button>

            {stillnessRef.current.supported ? (
              <button
                type="button"
                className="tm-btn tm-btn-ghost"
                onClick={() => {
                  setCameraAssistOn((prev) => !prev);
                  setCameraAssistError(null);
                }}
              >
                {cameraAssistOn ? t("bioBreathCameraOn") : t("bioBreathCameraOff")}
              </button>
            ) : null}
          </div>

          {breathCoachOn ? (
            <div className="bio-breath-live">
              <div className="bio-orb" style={{ transform: `scale(${phaseScale})` }}>
                <span>{Math.round(phase.progress * 100)}%</span>
              </div>
              <p className="tm-subtle">{phaseLabel}</p>
            </div>
          ) : null}

          {cameraAssistError ? <p className="bio-error">{t(cameraAssistError)}</p> : null}

          {breathMetrics ? (
            <p className="tm-subtle">
              {t("bioBreathAdherence")}: {breathMetrics.adherenceScore != null ? `${Math.round(breathMetrics.adherenceScore * 100)}%` : "—"} • {t("bioBreathStillness")}: {breathMetrics.stillnessScore != null ? `${Math.round(breathMetrics.stillnessScore * 100)}%` : "—"}
            </p>
          ) : null}
        </div>

        <p className="tm-subtle">{t("playerHint")}</p>

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
              disabled={scanPhase !== "idle"}
              onClick={() => void startScan("post")}
            >
              {scanPhase === "post" ? t("bioScanMeasuring") : t("bioPostStart")}
            </button>
            <button type="button" className="tm-btn tm-btn-ghost" onClick={() => nav("/biofeedback")}>
              {t("bioHistoryOpen")}
            </button>
          </div>

          {scanPhase === "post" ? (
            <div className="bio-progress">
              <div className="wave-meter" aria-hidden>
                <span style={{ width: `${Math.round(scanProgress * 100)}%` }} />
              </div>
              <p className="tm-subtle">{Math.round(scanProgress * 100)}%</p>
            </div>
          ) : null}

          {postScanRecord ? (
            <div className="bio-result">
              <p className="tm-kicker tm-kicker--muted">{t("bioEffectTitle")}</p>

              {preReliable && postReliable ? (
                <>
                  <p className="tm-subtle">
                    {t("bioEffectPulse")}: {preScanRecord?.pulse ?? "—"} → {postScanRecord.pulse ?? "—"}
                  </p>
                  <p className="tm-subtle">
                    {t("bioEffectCalm")}: {preScanRecord?.calmScore ?? "—"} → {postScanRecord.calmScore ?? "—"}
                  </p>
                  <p className="tm-subtle">
                    {t("bioEffectScore")}: {bioSessionRecord?.sessionEffect ?? "—"}
                  </p>
                </>
              ) : (
                <p className="tm-subtle">{t("bioEffectIncomplete")}</p>
              )}
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
