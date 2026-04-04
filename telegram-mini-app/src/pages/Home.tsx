import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OnboardingSheet } from "../components/OnboardingSheet";
import { SESSIONS } from "../data/sessions";
import { homeTimeKey, pickSessionForHome } from "../lib/homePick";
import { useI18n } from "../lib/i18n";
import { readOnboarding } from "../lib/onboarding";
import { useProgress } from "../lib/ProgressContext";
import { useTelegram } from "../telegram/useTelegram";

export function HomePage() {
  const { lang, t } = useI18n();
  const { state } = useProgress();
  const { app } = useTelegram();
  const L = lang === "ru" ? "ru" : "en";

  const [onboardingOpen, setOnboardingOpen] = useState(() => !readOnboarding().done);

  const pick = useMemo(() => {
    const { mood } = readOnboarding();
    return pickSessionForHome(SESSIONS, state, mood);
  }, [state, onboardingOpen]);

  const firstName = app.initDataUnsafe.user?.first_name;
  const greet = firstName ? `${t("homeGreeting")}, ${firstName}` : t("homeGreeting");

  const weekPct = Math.min(100, (state.weekCompletions / 3) * 100);
  const timeKey = homeTimeKey();

  return (
    <div className="page-head">
      {onboardingOpen ? <OnboardingSheet onClose={() => setOnboardingOpen(false)} /> : null}

      <div className="organic-blob" style={{ top: -40, right: -60 }} aria-hidden />
      <p className="brand-line">{t("brand")}</p>
      <h1>{greet}</h1>
      <p className="sub">{t("homeSub")}</p>
      <p className="context-line">{t(`homeTime${timeKey}`)}</p>

      <p className="today-label">{t("homeTodayPickLabel")}</p>

      <Link
        to={`/session/${pick.slug}`}
        className={`card session-hero ${pick.gradient}`}
      >
        <span className="session-hero-label">{t("homePrimaryCta")}</span>
        <h2>{pick.title[L]}</h2>
        <p className="session-hero-desc">{pick.short[L]}</p>
        <p className="session-hero-meta">
          {pick.durationMin} {t("sessionMin")}
          {pick.freeTier ? ` · ${t("free")}` : ` · ${t("sessionPremium")}`}
        </p>
      </Link>

      <div className="week-block">
        <p className="pill">{t("goalsWeeklyTarget")}</p>
        <div className="wave-meter" aria-hidden>
          <span style={{ width: `${weekPct}%` }} />
        </div>
        <p className="sub" style={{ marginTop: 8, fontSize: "0.78rem" }}>
          {state.weekCompletions}/3 · {t("goalsWeek")}
        </p>
      </div>

      <Link to="/paths" className="btn btn-ghost" style={{ marginTop: 14, textDecoration: "none" }}>
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
