import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { useTelegram } from "../telegram/useTelegram";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function GoalsPage() {
  const { t } = useI18n();
  const { state, selfCareToday } = useProgress();
  const { app } = useTelegram();

  const today = todayISO();
  const marked = state.lastSelfCareDate === today;
  const weekPct = Math.min(100, (state.weekCompletions / 3) * 100);

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
