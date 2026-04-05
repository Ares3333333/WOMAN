import { useRef } from "react";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSIONS } from "../data/sessions";
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

  const premiumSessionCount = SESSIONS.filter((s) => !s.freeTier).length;
  const premiumPathCount = PROGRAM_PATHS.filter((p) => p.tier === "premium").length;
  const signatureCount = PROGRAM_PATHS.filter((p) => p.signature).length;

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
      }
    : {};

  return (
    <div className="tm-page">
      <header className="tm-head">
        <p className="tm-kicker">{t("profileHeroKicker")}</p>
        <h1 className="tm-h1" {...titleHandlers} style={{ userSelect: "none" }}>
          {t("profileHeroTitle")}
        </h1>
        <p className="tm-lead">{state.premium ? t("profilePremiumActive") : t("profilePremiumSub")}</p>
      </header>

      <div className="profile-stack">
        <section className="profile-card profile-card--premium">
          <p className="tm-kicker tm-kicker--muted">{t("profilePremium")}</p>
          <h2 className="tm-h2">{t("profilePremiumTitle")}</h2>
          <p className="tm-subtle">{t("profilePremiumBody")}</p>

          <div className="home-value-grid">
            <article className="home-value-item">
              <span className="home-value-number">{premiumSessionCount}</span>
              <span className="home-value-label">{t("profilePremiumStatSessions")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{premiumPathCount}</span>
              <span className="home-value-label">{t("profilePremiumStatPaths")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{signatureCount}</span>
              <span className="home-value-label">{t("profilePremiumStatSignature")}</span>
            </article>
          </div>

          {!state.premium ? (
            <>
              <ul className="home-premium-list">
                <li>{t("profileCircleBullet1")}</li>
                <li>{t("profileCircleBullet2")}</li>
                <li>{t("profileCircleBullet3")}</li>
              </ul>

              <button
                type="button"
                className="tm-btn tm-btn-primary tm-btn-block"
                onClick={() => {
                  if (!bot) {
                    unlockPremium();
                    return;
                  }
                  try {
                    app.openTelegramLink(`${bot}?start=premium`);
                  } catch {
                    window.open(`${bot}?start=premium`, "_blank");
                  }
                }}
              >
                {t("profileUpgrade")}
              </button>
              <p className="tm-subtle">{t("profilePremiumPrice")}</p>
            </>
          ) : null}

          {bot ? (
            <button
              type="button"
              className="tm-btn tm-btn-ghost tm-btn-block"
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
        </section>

        <section className="profile-card">
          <p className="tm-kicker tm-kicker--muted">{t("profileReminderTitle")}</p>
          <p className="tm-subtle">{t("profileReminderSub")}</p>
          <div className="segmented">
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
        </section>

        <section className="profile-card">
          <p className="tm-kicker tm-kicker--muted">{t("profileLang")}</p>
          <div className="segmented segmented-2">
            <button type="button" className={lang === "ru" ? "on" : ""} onClick={() => setLang("ru")}>
              Русский
            </button>
            <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
              English
            </button>
          </div>
        </section>

        <section className="profile-card">
          <p className="tm-kicker tm-kicker--muted">{t("profileSensualSectionTitle")}</p>
          <p className="tm-subtle">{t("profileSensualSectionSub")}</p>
          <div className="segmented">
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
        </section>

        <section className="profile-card">
          <p className="profile-footnote">{isTelegram ? t("profileEnvTelegram") : t("profileEnvLocal")}</p>
          <p className="profile-footnote">{t("profileAge")}</p>
          <button
            type="button"
            className="tm-btn tm-btn-secondary tm-btn-block"
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
        </section>
      </div>
    </div>
  );
}
