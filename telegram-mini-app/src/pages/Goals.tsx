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
    <div className="page-head goals-page">
      <p className="page-eyebrow">{t("goalsPageEyebrow")}</p>
      <h1>{t("goalsTitle")}</h1>
      <p className="sub paths-catalog-lead">{t("goalsSub")}</p>

      <div className="goals-hero-card">
        <p className="goals-section-label">{t("goalsStreak")}</p>
        <p className="goals-hero-value">{state.streak}</p>
      </div>

      <div style={{ marginTop: 24 }}>
        <p className="goals-section-label">{t("goalsWeek")}</p>
        <div className="wave-meter">
          <span style={{ width: `${weekPct}%` }} />
        </div>
        <p className="goals-hint-line">
          {state.weekCompletions} / 3 — {t("goalsWeeklyHint")}
        </p>
      </div>

      <div style={{ marginTop: 22 }}>
        <p className="goals-section-label">{t("goalsDrops")}</p>
        <p className="goals-hero-value" style={{ fontSize: "1.65rem" }}>
          {state.calmDrops}
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-command"
        style={{ marginTop: 28 }}
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
