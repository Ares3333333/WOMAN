import { useRef } from "react";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { useTelegram } from "../telegram/useTelegram";

export function ProfilePage() {
  const { lang, setLang, t } = useI18n();
  const { state, unlockPremium, setSensual } = useProgress();
  const { app, isTelegram } = useTelegram();
  const pressRef = useRef<number | null>(null);

  const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;

  return (
    <div className="page-head">
      <h1
        onPointerDown={() => {
          pressRef.current = window.setTimeout(() => {
            unlockPremium();
            try {
              app.HapticFeedback.notificationOccurred("success");
            } catch {
              /* ignore */
            }
          }, 2800);
        }}
        onPointerUp={() => {
          if (pressRef.current) clearTimeout(pressRef.current);
        }}
        onPointerLeave={() => {
          if (pressRef.current) clearTimeout(pressRef.current);
        }}
        style={{ userSelect: "none" }}
      >
        {t("profileTitle")}
      </h1>
      <p className="sub" style={{ fontSize: "0.72rem" }}>
        {state.premium ? "Sora Circle ✓" : t("profilePremium")} · {t("profileAge")}
      </p>

      <div
        style={{
          marginTop: 20,
          padding: 18,
          borderRadius: "var(--radius-xl)",
          background: "color-mix(in srgb, var(--tg-secondary) 90%, transparent)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.05rem" }}>{t("profilePremium")}</h2>
        <p className="sub" style={{ marginBottom: 14 }}>
          {t("profilePremiumBody")}
        </p>
        {!state.premium ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (bot) {
                try {
                  app.openTelegramLink(`${bot}?start=premium`);
                } catch {
                  window.open(`${bot}?start=premium`, "_blank");
                }
              } else {
                unlockPremium();
              }
            }}
          >
            {t("profileUpgrade")}
          </button>
        ) : (
          <p style={{ margin: 0, color: "var(--tg-link)", fontSize: "0.9rem" }}>Premium активен (локально)</p>
        )}
        {bot ? (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: 10 }}
            onClick={() => {
              try {
                app.openTelegramLink(bot);
              } catch {
                window.open(bot, "_blank");
              }
            }}
          >
            {t("profileManage")}
          </button>
        ) : null}
      </div>

      <h2 style={{ marginTop: 28, fontSize: "1rem" }}>{t("profileLang")}</h2>
      <div className="select-row">
        <button type="button" className={lang === "ru" ? "on" : ""} onClick={() => setLang("ru")}>
          Русский
        </button>
        <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
          English
        </button>
      </div>

      <h2 style={{ marginTop: 24, fontSize: "1rem" }}>Sensual / чувственный контент</h2>
      <p className="sub" style={{ fontSize: "0.8rem" }}>{t("sensualNote")}</p>
      <div className="select-row">
        {(
          [
            ["welcome", "Welcome / Добро"],
            ["optional", "Optional / По желанию"],
            ["hidden", "Hidden / Скрыть"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={state.sensualMode === key ? "on" : ""}
            onClick={() => setSensual(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="sub" style={{ marginTop: 32, fontSize: "0.75rem" }}>
        {isTelegram ? "Telegram WebApp" : "Локальный режим (без Telegram)"}
      </p>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ marginTop: 8 }}
        onClick={() => {
          const url = lang === "ru" ? "https://www.telefonseelsorge.ru/" : "https://findahelpline.com/";
          try {
            app.openLink(url);
          } catch {
            window.open(url, "_blank");
          }
        }}
      >
        {t("profileCrisis")}
      </button>
    </div>
  );
}
