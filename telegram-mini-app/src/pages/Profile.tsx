import { useRef } from "react";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { useTelegram } from "../telegram/useTelegram";

const DEV_PREMIUM_UNLOCK = import.meta.env.DEV;

export function ProfilePage() {
  const { lang, setLang, t } = useI18n();
  const { state, unlockPremium, setSensual, setReminderMode } = useProgress();
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
    <div className="page-head profile-page">
      <p className="profile-eyebrow">{t("profilePageEyebrow")}</p>
      <h1 {...titleHandlers} style={{ marginBottom: 8 }}>
        {t("profileTitle")}
      </h1>
      <p className="sub" style={{ fontSize: "0.8rem", marginBottom: 6 }}>
        {state.premium ? t("profilePremiumActive") : t("profilePremium")}
      </p>
      <p className="sub" style={{ fontSize: "0.72rem", marginBottom: 20 }}>
        {t("profileAge")}
      </p>

      <div className="profile-premium-card">
        <h2 className="profile-card-heading">{t("profilePremium")}</h2>
        <p className="sub profile-card-lead">{t("profilePremiumBody")}</p>
        {!state.premium ? (
          <ul className="home-premium-bullets">
            <li>{t("profileCircleBullet1")}</li>
            <li>{t("profileCircleBullet2")}</li>
            <li>{t("profileCircleBullet3")}</li>
          </ul>
        ) : null}
        {!state.premium ? (
          <button
            type="button"
            className="btn btn-primary btn-command"
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

      <h2 className="profile-section-title">{t("profileReminderTitle")}</h2>
      <p className="profile-section-sub">{t("profileReminderSub")}</p>
      <div className="select-row select-row--profile">
        {(
          [
            ["off", "profileReminderOff"],
            ["evening", "profileReminderEvening"],
            ["night", "profileReminderNight"],
          ] as const
        ).map(([key, labelKey]) => (
          <button
            key={key}
            type="button"
            className={state.reminderMode === key ? "on" : ""}
            onClick={() => setReminderMode(key)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      <h2 className="profile-section-title">{t("profileLang")}</h2>
      <div className="select-row select-row--profile">
        <button type="button" className={lang === "ru" ? "on" : ""} onClick={() => setLang("ru")}>
          Русский
        </button>
        <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
          English
        </button>
      </div>

      <h2 className="profile-section-title">{t("profileSensualSectionTitle")}</h2>
      <p className="profile-section-sub">{t("profileSensualSectionSub")}</p>
      <div className="select-row select-row--profile">
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

      <p className="sub profile-env-line">{isTelegram ? t("profileEnvTelegram") : t("profileEnvLocal")}</p>
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
