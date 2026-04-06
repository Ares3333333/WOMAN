import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { readOnboarding } from "../lib/onboarding";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { buildRhythmInsightKeys, loadRhythmProfile, pickRhythmSession, updateRhythmProfile, type RhythmPhase } from "../lib/rhythmTracker";
import { useTelegram } from "../telegram/useTelegram";

export function ProfilePage() {
  const { lang, setLang, t } = useI18n();
  const { state, setSensual, setReminderMode } = useProgress();
  const { app, isTelegram } = useTelegram();
  const nav = useNavigate();

  const L = lang === "ru" ? "ru" : "en";
  const supportTitle = L === "ru" ? "Поддержка" : "Support";
  const careTitle = L === "ru" ? "Private Care" : "Private Care";
  const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;

  const [rhythm, setRhythm] = useState(() => loadRhythmProfile());
  const mood = readOnboarding().mood;
  const rhythmInsight = buildRhythmInsightKeys({ profile: rhythm, state, mood });
  const rhythmSession = pickRhythmSession(rhythm, state);

  const setPhase = (phase: RhythmPhase) => {
    const next = updateRhythmProfile({ phase });
    setRhythm(next);
  };

  const openConcierge = () => {
    if (!bot) {
      nav("/premium");
      return;
    }
    try {
      app.openTelegramLink(`${bot}?start=concierge`);
    } catch {
      window.open(`${bot}?start=concierge`, "_blank");
    }
  };

  return (
    <div className="tm-page">
      <header className="tm-head">
        <h1 className="tm-h1">{t("profileHeroTitle")}</h1>
        <p className="tm-lead">{state.premium ? t("profilePremiumActive") : t("profilePremiumSub")}</p>
      </header>

      <section className="profile-card profile-card--premium">
        <h2 className="tm-h2">{t("profilePremiumTitle")}</h2>
        <p className="tm-subtle">{t("profilePremiumBody")}</p>
        {!state.premium ? (
          <>
            <Link to="/premium" className="tm-btn tm-btn-primary tm-btn-block">
              {t("profileUpgrade")}
            </Link>
            <p className="tm-subtle">{t("profilePremiumPrice")}</p>
          </>
        ) : (
          <p className="tm-subtle">{t("profilePremiumActive")}</p>
        )}
      </section>

      <section className="profile-card profile-card--quiet">
        <h2 className="tm-h2">{t("profileTrackerTitle")}</h2>

        {state.premium ? (
          <>
            <p className="tm-subtle">{t(rhythmInsight.headline)}</p>
            <p className="tm-subtle">{t(rhythmInsight.suggestion)}</p>

            <div className="profile-tracker-group">
              <p className="tm-subtle">{t("trackerPhaseLabel")}</p>
              <div className="segmented segmented-5">
                {(["unknown", "period", "rising", "social", "late"] as RhythmPhase[]).map((phase) => (
                  <button key={phase} type="button" className={rhythm.phase === phase ? "on" : ""} onClick={() => setPhase(phase)}>
                    {t(`trackerPhase_${phase}`)}
                  </button>
                ))}
              </div>
            </div>

            {rhythmSession ? (
              <Link to={`/session/${rhythmSession.slug}`} className="tm-btn tm-btn-secondary tm-btn-block">
                {rhythmSession.title[L]}
              </Link>
            ) : null}
          </>
        ) : (
          <p className="tm-subtle">
            {t("profileTrackerLocked")}{" "}
            <Link to="/premium" className="tm-btn-inline">
              {t("profileUpgrade")}
            </Link>
          </p>
        )}

        <div className="tm-divider" />

        <h3 className="tm-h3">{t("profileReminderTitle")}</h3>

        <div className="profile-tracker-group">
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
        </div>

        <div className="profile-tracker-group">
          <p className="tm-subtle">{t("profileSensualSectionTitle")}</p>
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

      <section className="profile-card profile-card--quiet">
        <h2 className="tm-h2">{supportTitle}</h2>
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

        <div className="tm-divider" />

        <h3 className="tm-h3">{careTitle}</h3>
        <p className="tm-subtle">{t("profileConciergeSub")}</p>
        {state.premium ? (
          <button type="button" className="tm-btn tm-btn-secondary tm-btn-block" onClick={openConcierge}>
            {t("profileConciergeRequest")}
          </button>
        ) : (
          <Link to="/premium" className="tm-btn-inline">
            {t("profileUpgrade")}
          </Link>
        )}
      </section>
    </div>
  );
}
