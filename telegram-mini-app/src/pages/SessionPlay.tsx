import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SESSION_BY_SLUG, scriptToText } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { canUserAccessSession } from "../lib/sessionAccess";
import { hapticLight, useTelegram } from "../telegram/useTelegram";

export function SessionPlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useI18n();
  const { state, completeSession, selfCareToday, rememberSession } = useProgress();
  const { app } = useTelegram();
  const nav = useNavigate();

  const L = lang === "ru" ? "ru" : "en";
  const locale = lang === "ru" ? "ru-RU" : "en-US";

  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const session = slug ? SESSION_BY_SLUG[slug] : undefined;
  const canAccess = session ? canUserAccessSession(session, state) : false;

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (session && canAccess) rememberSession(session.slug);
  }, [session, canAccess, rememberSession]);

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

  const fullText = session ? scriptToText(session.script, L) : "";

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    utterRef.current = null;
  }, []);

  const play = useCallback(() => {
    if (!session || !canAccess) return;

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(fullText);
    u.lang = locale;
    u.rate = 0.92;

    u.onend = () => {
      setPlaying(false);
      setDone(true);
      completeSession(session.slug);
      selfCareToday();
      try {
        app.HapticFeedback.notificationOccurred("success");
      } catch {
        /* ignore */
      }
    };

    u.onerror = () => setPlaying(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setPlaying(true);
    hapticLight(app);
  }, [session, canAccess, fullText, locale, completeSession, selfCareToday, app]);

  const openPremium = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;
    if (!bot) return;
    try {
      app.openTelegramLink(`${bot}?start=premium`);
    } catch {
      window.open(`${bot}?start=premium`, "_blank");
    }
  };

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
        <div className="session-control-meta">
          <span>{t(`pillarTag_${session.pillarId}`)}</span>
          <span>•</span>
          <span>
            {session.durationMin} {t("sessionMin")}
          </span>
          <span>•</span>
          <span>{session.freeTier ? t("free") : t("sessionPremium")}</span>
        </div>

        <p className="tm-subtle">{t("playerTts")}</p>

        <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={() => (playing ? stop() : play())}>
          {playing ? t("playerPause") : t("playerPlay")}
        </button>

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
