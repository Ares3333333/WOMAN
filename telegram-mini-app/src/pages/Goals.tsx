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
    <div className="page-head">
      <h1>{t("goalsTitle")}</h1>
      <p className="sub">{t("goalsSub")}</p>

      <div
        style={{
          padding: 20,
          borderRadius: "var(--radius-xl)",
          background: "color-mix(in srgb, var(--tg-secondary) 88%, transparent)",
          marginTop: 8,
        }}
      >
        <p className="metric-label">{t("goalsStreak")}</p>
        <p style={{ margin: 0, fontSize: "2.5rem", fontFamily: "var(--font-display)" }}>{state.streak}</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "var(--tg-hint)" }}>{t("goalsWeek")}</p>
        <div className="wave-meter">
          <span style={{ width: `${weekPct}%` }} />
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "0.85rem" }}>
          {state.weekCompletions} / 3 — {t("goalsWeeklyHint")}
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "var(--tg-hint)" }}>{t("goalsDrops")}</p>
        <p style={{ margin: 0, fontSize: "1.5rem", fontFamily: "var(--font-display)" }}>{state.calmDrops}</p>
      </div>

      <button
        type="button"
        className="btn btn-primary"
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
