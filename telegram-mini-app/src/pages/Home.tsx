import { Link } from "react-router-dom";
import { SESSIONS } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import { useTelegram } from "../telegram/useTelegram";

export function HomePage() {
  const { lang, t } = useI18n();
  const { state } = useProgress();
  const { app } = useTelegram();
  const L = lang === "ru" ? "ru" : "en";

  const firstName = app.initDataUnsafe.user?.first_name;
  const greet = firstName ? `${t("homeGreeting")}, ${firstName}` : t("homeGreeting");

  const pick =
    SESSIONS.find((s) => s.freeTier && !state.completedSlugs.includes(s.slug)) ??
    SESSIONS.find((s) => s.freeTier) ??
    SESSIONS[0];

  const weekPct = Math.min(100, (state.weekCompletions / 3) * 100);

  return (
    <div className="page-head">
      <div className="organic-blob" style={{ top: -40, right: -60 }} aria-hidden />
      <p className="pill">{t("brand")}</p>
      <h1>{greet}</h1>
      <p className="sub">{t("homeSub")}</p>
      <p className="sub" style={{ fontSize: "0.8rem", marginTop: -8 }}>
        {t("tagline")}
      </p>

      <div style={{ position: "relative", zIndex: 1, marginTop: 24 }}>
        <p className="pill">{t("goalsWeeklyTarget")}</p>
        <div className="wave-meter" aria-hidden>
          <span style={{ width: `${weekPct}%` }} />
        </div>
        <p className="sub" style={{ marginTop: 8, fontSize: "0.78rem" }}>
          {state.weekCompletions}/3 · {t("goalsWeek")}
        </p>
      </div>

      <Link to={`/session/${pick.slug}`} className={`card ${pick.gradient}`} style={{ marginTop: 24 }}>
        <span className="pill" style={{ opacity: 0.85 }}>
          {t("homeCtaListen")}
        </span>
        <h2 style={{ margin: "4px 0 8px", fontSize: "1.35rem" }}>{pick.title[L]}</h2>
        <p style={{ margin: 0, fontSize: "0.88rem", opacity: 0.88 }}>{pick.short[L]}</p>
        <p style={{ margin: "12px 0 0", fontSize: "0.75rem", opacity: 0.75 }}>
          {pick.durationMin} {t("sessionMin")}
          {pick.freeTier ? ` · ${t("free")}` : ` · ${t("sessionPremium")}`}
        </p>
      </Link>

      <Link to="/paths" className="btn btn-ghost" style={{ marginTop: 12, textDecoration: "none" }}>
        {t("homeCtaPaths")}
      </Link>
      <Link to="/goals" className="btn btn-ghost" style={{ marginTop: 8, textDecoration: "none" }}>
        {t("homeCtaGoals")}
      </Link>

      <p className="sub" style={{ marginTop: 28, fontSize: "0.75rem" }}>
        {t("homeDisclaimer")}
      </p>
    </div>
  );
}
