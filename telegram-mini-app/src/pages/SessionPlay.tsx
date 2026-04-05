import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SESSION_BY_SLUG, scriptToText } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { canUserAccessSession } from "../lib/sessionAccess";
import { hapticLight, useTelegram } from "../telegram/useTelegram";

type PlayerState = "idle" | "playing" | "paused" | "ended";

const SPEED_OPTIONS = [0.9, 1, 1.15] as const;

function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const min = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const sec = (safe % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsTickRef = useRef<number | null>(null);
  const ttsStartedRef = useRef<number | null>(null);
  const doneOnceRef = useRef<string | null>(null);

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

  const markSessionDone = useCallback(() => {
    if (!session) return;
    if (doneOnceRef.current === session.slug) return;

    doneOnceRef.current = session.slug;
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
  }, [session, resolvedDuration, completeSession, selfCareToday, app]);

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
      markSessionDone();
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
  }, [
    session,
    canAccess,
    clearTtsTick,
    fullText,
    locale,
    speed,
    estimatedVoiceDuration,
    startVoiceTick,
    markSessionDone,
    app,
  ]);

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
  }, [
    session,
    canAccess,
    playerState,
    sourceMode,
    playAudio,
    startVoiceTick,
    elapsedSec,
    startVoiceFromStart,
  ]);

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
    const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;
    if (!bot) return;
    try {
      app.openTelegramLink(`${bot}?start=premium`);
    } catch {
      window.open(`${bot}?start=premium`, "_blank");
    }
  };

  useEffect(() => {
    return () => {
      stopAllPlayback();
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

    if (canAccess) rememberSession(session.slug);
  }, [session, canAccess, rememberSession, stopAllPlayback]);

  if (!session) {
    return (
      <div className="tm-page session-stage">
        <Link to="/paths" className="session-back">
          ← {t("back")}
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
          ← {t("back")}
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
          ← {t("back")}
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

  return (
    <div className="tm-page session-stage">
      <Link to="/paths" className="session-back">
        ← {t("back")}
      </Link>

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
          onEnded={markSessionDone}
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
            onClick={handlePlay}
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

          <button type="button" className="tm-btn tm-btn-ghost tm-btn-block" onClick={handleRestart}>
            {t("playerRestart")}
          </button>
        </div>

        <p className="tm-subtle">{t("playerHint")}</p>

        {done ? <p className="session-done">{t("sessionCompleteLine")}</p> : null}
      </section>

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
