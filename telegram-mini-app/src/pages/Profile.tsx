import { useRef } from "react";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { useTelegram } from "../telegram/useTelegram";

const DEV_PREMIUM_UNLOCK = import.meta.env.DEV;

export function ProfilePage() {
  const { lang, setLang, t } = useI18n();
  const { state, unlockPremium, setSensual } = useProgress();
  const { app, isTelegram } = useTelegram();
  const pressRef = useRef<number | null>(null);

  const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;

  const titleHandlers = DEV_PREMIUM_UNLOCK
    ? {
        onPointerDown: () => {
          pressRef.current = window.setTimeout(() => {
            unlockPremium();
            try {
              app.HapticFeedback.notificationOccurred("success");
            } catch {
              /* ignore */
            }
          }, 2800);
        },
        onPointerUp: () => {
          if (pressRef.current) clearTimeout(pressRef.current);
        },
        onPointerLeave: () => {
          if (pressRef.current) clearTimeout(pressRef.current);
        },
        style: { userSelect: "none" as const },
      }
    : {};

  return (
    <div className="page-head">
      <h1 {...titleHandlers}>{t("profileTitle")}</h1>
      <p className="sub" style={{ fontSize: "0.72rem" }}>
        {state.premium ? t("profilePremiumActive") : t("profilePremium")} · {t("profileAge")}
      </p>

      <div className="profile-premium-card">
        <h2 style={{ marginTop: 0, fontSize: "1.08rem" }}>{t("profilePremium")}</h2>
        <p className="sub" style={{ marginBottom: 12 }}>
          {t("profilePremiumBody")}
        </p>
        {!state.premium ? (
          <ul className="premium-bullet-list" style={{ marginTop: 0 }}>
            <li>{t("profileCircleBullet1")}</li>
            <li>{t("profileCircleBullet2")}</li>
            <li>{t("profileCircleBullet3")}</li>
          </ul>
        ) : null}
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
        ) : null}
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

      <h2 style={{ marginTop: 24, fontSize: "1rem" }}>{t("profileSensualSectionTitle")}</h2>
      <p className="sub" style={{ fontSize: "0.82rem" }}>
        {t("profileSensualSectionSub")}
      </p>
      <div className="select-row">
        {(
          [
            ["welcome", "profileSensualWelcome"],
            ["optional", "profileSensualOptional"],
            ["hidden", "profileSensualHidden"],
          ] as const
        ).map(([key, labelKey]) => (
          <button
            key={key}
            type="button"
            className={state.sensualMode === key ? "on" : ""}
            onClick={() => setSensual(key)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <p className="sub" style={{ marginTop: 32, fontSize: "0.75rem" }}>
        {isTelegram ? t("profileEnvTelegram") : t("profileEnvLocal")}
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
