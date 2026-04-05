import { Link } from "react-router-dom";
import { SESSIONS } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
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
  const weekPct = Math.min(100, (state.weekCompletions / 3) * 100);

  const nextPremium = state.premium
    ? SESSIONS.find((s) => !s.freeTier && !state.completedSlugs.includes(s.slug))
    : null;

  return (
    <div className="tm-page">
      <header className="tm-head">
        <p className="tm-kicker">{t("goalsHeroKicker")}</p>
        <h1 className="tm-h1">{t("goalsHeroTitle")}</h1>
        <p className="tm-lead">{t("goalsHeroSub")}</p>
      </header>

      <section className="goals-grid">
        <article className="metric-card">
          <p className="metric-label">{t("goalsStreak")}</p>
          <p className="metric-value">{state.streak}</p>
          <p className="tm-subtle">{t("goalsStreakHint")}</p>
        </article>

        <article className="metric-card">
          <p className="metric-label">{t("goalsDrops")}</p>
          <p className="metric-value">{state.calmDrops}</p>
          <p className="tm-subtle">{t("goalsDropsHint")}</p>
        </article>
      </section>

      <section className="tm-card">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{t("goalsWeekKicker")}</p>
          <h2 className="tm-h2">{t("goalsWeekTitle")}</h2>
          <p className="tm-subtle">{t("goalsWeekSub")}</p>
        </div>

        <div className="home-week">
          <div className="home-week-head">
            <span className="tm-pill">{t("goalsWeeklyTarget")}</span>
            <span className="tm-subtle">{state.weekCompletions}/3</span>
          </div>
          <div className="wave-meter" aria-hidden>
            <span style={{ width: `${weekPct}%` }} />
          </div>
          <p className="home-footer-line">{t("goalsWeeklyHint")}</p>
        </div>
      </section>

      {state.premium ? (
        <section className="tm-card">
          <p className="tm-kicker tm-kicker--muted">{t("goalsPremiumKicker")}</p>
          <h2 className="tm-h2">{t("goalsPremiumTitle")}</h2>
          <p className="tm-subtle">{t("goalsPremiumSub")}</p>
          {nextPremium ? (
            <Link to={`/session/${nextPremium.slug}`} className="tm-btn tm-btn-secondary tm-btn-block">
              {t("goalsPremiumNext")} · {nextPremium.title[L]}
            </Link>
          ) : (
            <p className="tm-subtle">{t("goalsPremiumDone")}</p>
          )}
        </section>
      ) : (
        <section className="tm-card session-gate">
          <p className="tm-kicker">{t("goalsPremiumKicker")}</p>
          <h2 className="tm-h2">{t("goalsPremiumLockedTitle")}</h2>
          <p className="tm-subtle">{t("goalsPremiumLockedSub")}</p>
        </section>
      )}

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
    </div>
  );
}
