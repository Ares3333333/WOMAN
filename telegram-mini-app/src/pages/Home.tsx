import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OnboardingSheet } from "../components/OnboardingSheet";
import { SESSION_BY_SLUG, SESSIONS } from "../data/sessions";
import { homeTimeKey, pickSessionForHome } from "../lib/homePick";
import { useI18n } from "../lib/i18n";
import { readOnboarding } from "../lib/onboarding";
import { useProgress } from "../lib/ProgressContext";
import { canUserAccessSession } from "../lib/sessionAccess";
import { useTelegram } from "../telegram/useTelegram";

export function HomePage() {
  const { lang, t } = useI18n();
  const { state } = useProgress();
  const { app } = useTelegram();
  const nav = useNavigate();

  const L = lang === "ru" ? "ru" : "en";
  const [onboardingOpen, setOnboardingOpen] = useState(() => !readOnboarding().done);

  const pick = useMemo(() => {
    const { mood } = readOnboarding();
    return pickSessionForHome(SESSIONS, state, mood);
  }, [state, onboardingOpen]);

  const continueSession =
    state.lastPlayedSlug &&
    SESSION_BY_SLUG[state.lastPlayedSlug] &&
    canUserAccessSession(SESSION_BY_SLUG[state.lastPlayedSlug], state)
      ? SESSION_BY_SLUG[state.lastPlayedSlug]
      : null;

  const timeKey = homeTimeKey();
  const firstName = app.initDataUnsafe.user?.first_name;
  const heroTitle = firstName ? t("homeHeroNamed").replace("{name}", firstName) : t("homeHeroAnonymous");

  const primaryLocked = !pick.freeTier && !state.premium;
  const premiumSessionsCount = SESSIONS.filter((s) => !s.freeTier && !(s.sensual && state.sensualMode === "hidden")).length;

  return (
    <div className="tm-page">
      {onboardingOpen ? <OnboardingSheet onClose={() => setOnboardingOpen(false)} /> : null}

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-hero-time">{t(`homeTime${timeKey}`)}</p>
          <h1 className="home-hero-title">{heroTitle}</h1>
          <p className="tm-lead home-hero-name">{t("homeHeroLead")}</p>
          <p className="tm-subtle">{pick.title[L]}</p>

          {primaryLocked ? (
            <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={() => nav("/premium")}>
              {t("homePrimaryLockedCta")}
            </button>
          ) : (
            <Link to={`/session/${pick.slug}`} className="tm-btn tm-btn-primary tm-btn-block">
              {t("homePrimaryCta")}
            </Link>
          )}
        </div>
      </section>

      <section className="tm-card tm-card--quiet home-flow">
        <Link to={continueSession ? `/session/${continueSession.slug}` : "/paths"} className="home-row">
          <span className="home-row-label">{t("homeContinueLabel")}</span>
          <span className="home-row-title">{continueSession ? continueSession.title[L] : t("navPaths")}</span>
        </Link>
        <Link to="/paths" className="home-row">
          <span className="home-row-label">{t("navPaths")}</span>
          <span className="home-row-title">{t("homeSectionTodayTitle")}</span>
        </Link>
      </section>

      {!state.premium ? (
        <section className="home-premium-strip">
          <p className="tm-subtle">{t("homePremiumSub")}</p>
          <p className="tm-subtle home-premium-count">+{premiumSessionsCount} {t("homeValueLocked")}</p>
          <Link to="/premium" className="tm-btn tm-btn-ghost tm-btn-block">
            {t("homePrimaryLockedCta")}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
