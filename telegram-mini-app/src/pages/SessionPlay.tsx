import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SESSION_BY_SLUG, scriptToText } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { hapticLight, useTelegram } from "../telegram/useTelegram";

export function SessionPlayPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t } = useI18n();
  const { state, completeSession, selfCareToday } = useProgress();
  const { app } = useTelegram();
  const nav = useNavigate();
  const L = lang === "ru" ? "ru" : "en";
  const locale = lang === "ru" ? "ru-RU" : "en-US";

  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const session = slug ? SESSION_BY_SLUG[slug] : undefined;

  const canAccess =
    session &&
    (!session.sensual || state.sensualMode !== "hidden") &&
    (session.freeTier || state.premium);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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

  if (!session) {
    return (
      <p>
        <Link to="/paths">{t("back")}</Link>
      </p>
    );
  }

  if (session.sensual && state.sensualMode === "hidden") {
    return (
      <div className="page-head">
        <p className="sub">{t("sensualNote")}</p>
        <Link to="/profile" className="btn btn-primary" style={{ marginTop: 16 }}>
          {t("profileTitle")}
        </Link>
      </div>
    );
  }

  if (!session.freeTier && !state.premium) {
    return (
      <div className="page-head">
        <Link to="/paths" style={{ fontSize: "0.85rem" }}>
          ← {t("back")}
        </Link>
        <h1 style={{ marginTop: 12 }}>{session.title[L]}</h1>
        <p className="sub">{session.short[L]}</p>
        <div className="premium-gate-card">
          <h2 style={{ marginTop: 0 }}>{t("premiumGateTitle")}</h2>
          <p className="sub" style={{ marginBottom: 12 }}>
            {t("premiumGateLead")}
          </p>
          <ul className="premium-bullet-list">
            <li>{t("premiumGateBullet1")}</li>
            <li>{t("premiumGateBullet2")}</li>
            <li>{t("premiumGateBullet3")}</li>
          </ul>
          <p className="sub gate-privacy">{t("premiumGatePrivacy")}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;
              if (bot) {
                try {
                  app.openTelegramLink(`${bot}?start=premium`);
                } catch {
                  window.open(`${bot}?start=premium`, "_blank");
                }
              }
            }}
          >
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
    <div className="page-head">
      <Link to="/paths" style={{ fontSize: "0.85rem" }}>
        ← {t("back")}
      </Link>
      <h1 style={{ marginTop: 12 }}>{session.title[L]}</h1>
      <p className="sub">{session.short[L]}</p>
      <p className="sub" style={{ fontSize: "0.78rem" }}>
        {t("playerTts")}
      </p>

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 20 }}
        onClick={() => (playing ? stop() : play())}
      >
        {playing ? t("playerPause") : t("playerPlay")}
      </button>

      {done ? (
        <p style={{ marginTop: 16, color: "var(--tg-link)", fontSize: "0.9rem", lineHeight: 1.45 }}>
          {t("sessionCompleteLine")}
        </p>
      ) : null}

      <h2 style={{ marginTop: 28, fontSize: "1rem" }}>{t("sessionTranscript")}</h2>
      <div className="transcript">{fullText}</div>

      {session.script.journal ? (
        <p className="sub" style={{ marginTop: 16 }}>
          <strong>{t("sessionJournal")}:</strong> {session.script.journal[L]}
        </p>
      ) : null}
    </div>
  );
}
