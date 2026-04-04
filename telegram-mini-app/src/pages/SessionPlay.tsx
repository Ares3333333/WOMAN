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
    if (bot) {
      try {
        app.openTelegramLink(`${bot}?start=premium`);
      } catch {
        window.open(`${bot}?start=premium`, "_blank");
      }
    }
  };

  if (!session) {
    return (
      <div className="page-head">
        <Link to="/paths" className="session-back">
          ← {t("back")}
        </Link>
      </div>
    );
  }

  if (session.sensual && state.sensualMode === "hidden") {
    return (
      <div className="page-head">
        <p className="session-page-lead">{t("sensualNote")}</p>
        <Link to="/profile" className="btn btn-primary btn-command">
          {t("profileTitle")}
        </Link>
      </div>
    );
  }

  if (!session.freeTier && !state.premium) {
    return (
      <div className="page-head session-play-page">
        <Link to="/paths" className="session-back">
          ← {t("back")}
        </Link>
        <p className="page-eyebrow">{t("premiumGateEyebrow")}</p>
        <h1 className="path-detail-title">{session.title[L]}</h1>
        <p className="session-page-lead">{session.short[L]}</p>

        <div className="premium-gate-card premium-gate-card--v2">
          <h2 className="premium-gate-heading">{t("premiumGateTitle")}</h2>
          <p className="sub premium-gate-lead">{t("premiumGateLead")}</p>
          <ul className="home-premium-bullets">
            <li>{t("premiumGateBullet1")}</li>
            <li>{t("premiumGateBullet2")}</li>
            <li>{t("premiumGateBullet3")}</li>
          </ul>
          <p className="sub gate-privacy">{t("premiumGatePrivacy")}</p>
          <button type="button" className="btn btn-primary btn-command" onClick={openPremium}>
            {t("premiumGateCta")}
          </button>
          <button type="button" className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => nav("/profile")}>
            {t("premiumGateProfile")}
          </button>
          <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={() => nav(-1)}>
            {t("premiumGateLater")}
          </button>
        </div>
        {!import.meta.env.VITE_TELEGRAM_BOT && !import.meta.env.PROD ? (
          <p className="sub" style={{ marginTop: 12, fontSize: "0.8rem" }}>
            Укажи VITE_TELEGRAM_BOT=https://t.me/ТвойБот в .env — кнопка откроет бота для оплаты Stars / подписки.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="page-head session-play-page">
      <Link to="/paths" className="session-back">
        ← {t("back")}
      </Link>
      <p className="page-eyebrow">{t("sessionAbout")}</p>
      <h1 className="path-detail-title">{session.title[L]}</h1>
      <p className="session-page-lead">{session.short[L]}</p>
      <p className="session-page-lead" style={{ fontSize: "0.78rem", marginTop: -4 }}>
        {t("playerTts")}
      </p>

      <div className="play-cta-frame">
        <button type="button" className="btn btn-primary btn-command" onClick={() => (playing ? stop() : play())}>
          {playing ? t("playerPause") : t("playerPlay")}
        </button>
      </div>

      {done ? (
        <p className="session-complete-line">{t("sessionCompleteLine")}</p>
      ) : null}

      <h2 className="transcript-heading">{t("sessionTranscript")}</h2>
      <div className="transcript">{fullText}</div>

      {session.script.journal ? (
        <p className="sub journal-block">
          <strong>{t("sessionJournal")}:</strong> {session.script.journal[L]}
        </p>
      ) : null}
    </div>
  );
}
