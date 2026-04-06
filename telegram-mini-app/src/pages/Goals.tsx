import { Link } from "react-router-dom";
import { readOnboarding } from "../lib/onboarding";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { buildRhythmInsightKeys, loadRhythmProfile, pickRhythmSession } from "../lib/rhythmTracker";
import { useTelegram } from "../telegram/useTelegram";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function GoalsPage() {
  const { lang, t } = useI18n();
  const { state, selfCareToday } = useProgress();
  const { app } = useTelegram();

  const L = lang === "ru" ? "ru" : "en";
  const today = todayISO();
  const marked = state.lastSelfCareDate === today;

  const profile = loadRhythmProfile();
  const mood = readOnboarding().mood;
  const insight = buildRhythmInsightKeys({ profile, state, mood });
  const recommendation = pickRhythmSession(profile, state);

  return (
    <div className="tm-page">
      <header className="tm-head">
        <h1 className="tm-h1">{t("navGoals")}</h1>
        <p className="tm-lead">{t("goalsHeroSub")}</p>
      </header>

      <section className="tm-card">
        <h2 className="tm-h2">{t("goalsInsightTitle")}</h2>
        <p className="tm-subtle">{t(insight.headline)}</p>
        <p className="tm-subtle">{t(insight.note)}</p>

        {state.premium ? (
          recommendation ? (
            <Link to={`/session/${recommendation.slug}`} className="tm-btn tm-btn-secondary tm-btn-block">
              {recommendation.title[L]}
            </Link>
          ) : (
            <p className="tm-subtle">{t("homeContinueEmptySub")}</p>
          )
        ) : (
          <Link to="/premium" className="tm-btn tm-btn-secondary tm-btn-block">
            {t("homePrimaryLockedCta")}
          </Link>
        )}
      </section>

      <section className="tm-card">
        <h2 className="tm-h2">{t("goalsWeeklyTarget")}</h2>
        <div className="home-week-head">
          <span className="tm-subtle">{state.weekCompletions}/3</span>
          <span className="tm-subtle">{t("goalsStreak")}: {state.streak}</span>
        </div>
        <button
          type="button"
          className="tm-btn tm-btn-primary tm-btn-block"
          disabled={marked}
          onClick={() => {
            selfCareToday();
            try {
              app.HapticFeedback.notificationOccurred("success");
            } catch {
              /* ignore */
            }
          }}
        >
          {marked ? t("goalsTodayDone") : t("goalsToday")}
        </button>
      </section>
    </div>
  );
}
