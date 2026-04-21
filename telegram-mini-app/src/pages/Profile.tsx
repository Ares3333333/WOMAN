import { Link, useNavigate } from "react-router-dom";
import { readOnboarding } from "../lib/onboarding";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { buildRhythmInsightKeys, loadRhythmProfile, pickRhythmSession } from "../lib/rhythmTracker";
import { useTelegram } from "../telegram/useTelegram";

export function ProfilePage() {
  const { lang, setLang, t } = useI18n();
  const { state, setReminderMode, setSensual } = useProgress();
  const { app } = useTelegram();
  const nav = useNavigate();
  const L = lang === "ru" ? "ru" : "en";

  const rhythm = loadRhythmProfile();
  const mood = readOnboarding().mood;
  const insight = buildRhythmInsightKeys({ profile: rhythm, state, mood });
  const suggested = pickRhythmSession(rhythm, state);
  const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;

  return (
    <div className="tm-page">
      <header className="tm-head">
        <h1 className="tm-h1">{t("profileHeroTitle")}</h1>
        <p className="tm-lead">{state.premium ? t("profilePremiumActive") : t("profilePremiumSub")}</p>
      </header>

      <section className="tm-card tm-card--quiet">
        <h2 className="tm-h2">{t("profilePremiumTitle")}</h2>
        <p className="tm-subtle">{t("profilePremiumBody")}</p>
        {!state.premium ? (
          <Link to="/premium" className="tm-btn tm-btn-primary tm-btn-block">
            {t("profileUpgrade")}
          </Link>
        ) : (
          <p className="tm-subtle">{t("profilePremiumActive")}</p>
        )}
      </section>

      <section className="tm-card tm-card--quiet">
        <h2 className="tm-h2">{t("profileTrackerTitle")}</h2>
        {state.premium ? (
          <>
            <p className="tm-subtle">{t(insight.headline)}</p>
            <p className="tm-subtle">{t(insight.suggestion)}</p>
            {suggested ? (
              <Link to={`/session/${suggested.slug}`} className="tm-btn tm-btn-secondary tm-btn-block">
                {suggested.title[L]}
              </Link>
            ) : null}
          </>
        ) : (
          <p className="tm-subtle">{t("profileTrackerLocked")}</p>
        )}
      </section>

      <section className="tm-card tm-card--quiet">
        <h2 className="tm-h2">{t("profilePreferencesTitle")}</h2>
        <p className="tm-subtle">{t("profileReminderSub")}</p>
        <div className="segmented">
          {(
            [
              ["off", "profileReminderOff"],
              ["evening", "profileReminderEvening"],
              ["night", "profileReminderNight"],
            ] as const
          ).map(([key, labelKey]) => (
            <button key={key} type="button" className={state.reminderMode === key ? "on" : ""} onClick={() => setReminderMode(key)}>
              {t(labelKey)}
            </button>
          ))}
        </div>

        <p className="tm-subtle">{t("profileSensualSectionTitle")}</p>
        <div className="segmented">
          {(
            [
              ["welcome", "profileSensualWelcome"],
              ["optional", "profileSensualOptional"],
              ["hidden", "profileSensualHidden"],
            ] as const
          ).map(([key, labelKey]) => (
            <button key={key} type="button" className={state.sensualMode === key ? "on" : ""} onClick={() => setSensual(key)}>
              {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="segmented segmented-2">
          <button type="button" className={lang === "ru" ? "on" : ""} onClick={() => setLang("ru")}>
            Русский
          </button>
          <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
            English
          </button>
        </div>
      </section>

      <section className="tm-card tm-card--quiet">
        <h2 className="tm-h2">{L === "ru" ? "Поддержка" : "Support"}</h2>
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

        {state.premium ? (
          <button
            type="button"
            className="tm-btn tm-btn-ghost tm-btn-block"
            onClick={() => {
              if (!bot) {
                nav("/premium");
                return;
              }
              const url = `${bot}?start=concierge`;
              try {
                app.openTelegramLink(url);
              } catch {
                window.open(url, "_blank");
              }
            }}
          >
            {t("profileConciergeRequest")}
          </button>
        ) : (
          <Link to="/premium" className="tm-btn tm-btn-ghost tm-btn-block">
            {t("profileUpgrade")}
          </Link>
        )}
      </section>
    </div>
  );
}

