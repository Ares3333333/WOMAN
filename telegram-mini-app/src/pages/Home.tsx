import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OnboardingSheet } from "../components/OnboardingSheet";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG, SESSIONS } from "../data/sessions";
import { homeTimeKey, pickSessionForHome, pickTonightSession } from "../lib/homePick";
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

  const tonightPick = useMemo(() => pickTonightSession(SESSIONS, state), [state]);
  const timeKey = homeTimeKey();

  const continueSession =
    state.lastPlayedSlug &&
    SESSION_BY_SLUG[state.lastPlayedSlug] &&
    canUserAccessSession(SESSION_BY_SLUG[state.lastPlayedSlug], state)
      ? SESSION_BY_SLUG[state.lastPlayedSlug]
      : null;

  const visibleSessions = SESSIONS.filter((s) => !(s.sensual && state.sensualMode === "hidden"));
  const premiumSessionsCount = visibleSessions.filter((s) => !s.freeTier).length;

  const visiblePaths = PROGRAM_PATHS.filter((path) =>
    path.sessionSlugs.some((slug) => {
      const s = SESSION_BY_SLUG[slug];
      if (!s) return false;
      if (s.sensual && state.sensualMode === "hidden") return false;
      return true;
    })
  );

  const premiumPathCount = visiblePaths.filter((p) => p.tier === "premium").length;

  const firstName = app.initDataUnsafe.user?.first_name;
  const heroTitle = firstName
    ? t("homeHeroNamed").replace("{name}", firstName)
    : t("homeHeroAnonymous");

  const primaryLocked = !pick.freeTier && !state.premium;
  const showTonight = Boolean(tonightPick && tonightPick.slug !== pick.slug && timeKey === "Evening");

  const openPremium = () => {
    nav("/premium");
  };

  return (
    <div className="tm-page">
      {onboardingOpen ? <OnboardingSheet onClose={() => setOnboardingOpen(false)} /> : null}

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-hero-time">{t(`homeTime${timeKey}`)}</p>
          <h1 className="home-hero-title">{heroTitle}</h1>
          <p className="tm-lead home-hero-name">{t("homeHeroLead")}</p>

          <div className="home-hero-actions">
            {primaryLocked ? (
              <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={openPremium}>
                {t("homePrimaryLockedCta")}
              </button>
            ) : (
              <Link to={`/session/${pick.slug}`} className="tm-btn tm-btn-primary tm-btn-block">
                {t("homePrimaryCta")}
              </Link>
            )}

            <div className="home-hero-links">
              <Link to="/paths" className="home-hero-link">
                {t("homeQuickPaths")}
              </Link>
              <Link to="/premium" className="home-hero-link">
                {state.premium ? t("shellCircle") : t("homePrimaryLockedCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-next" aria-labelledby="home-next-title">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{t("homeSectionTodayKicker")}</p>
          <h2 id="home-next-title" className="tm-h2">
            {t("homeSectionTodayTitle")}
          </h2>
        </div>

        {primaryLocked ? (
          <button type="button" className={`home-next-card ${pick.gradient} home-next-card--locked`} onClick={openPremium}>
            <p className="home-next-kicker">{t("homeCurrentKicker")}</p>
            <h3 className="home-next-title">{pick.title[L]}</h3>
            <p className="home-next-meta">
              <span>
                {pick.durationMin} {t("sessionMin")}
              </span>
              <span className="home-next-dot" />
              <span>{t("sessionPremium")}</span>
            </p>
            <p className="home-next-note">{t("homeUnlockHint")}</p>
          </button>
        ) : (
          <Link to={`/session/${pick.slug}`} className={`home-next-card ${pick.gradient}`}>
            <p className="home-next-kicker">{t("homeCurrentKicker")}</p>
            <h3 className="home-next-title">{pick.title[L]}</h3>
            <p className="home-next-meta">
              <span>
                {pick.durationMin} {t("sessionMin")}
              </span>
              <span className="home-next-dot" />
              <span>{pick.freeTier ? t("free") : t("sessionPremium")}</span>
            </p>
            <p className="home-next-note">{t("homeOpenHint")}</p>
          </Link>
        )}

        <div className="home-grid-2">
          {continueSession ? (
            <Link to={`/session/${continueSession.slug}`} className="tm-btn tm-btn-secondary tm-btn-block">
              {t("homeContinueLabel")}
            </Link>
          ) : (
            <Link to="/paths" className="tm-btn tm-btn-secondary tm-btn-block">
              {t("homeQuickPaths")}
            </Link>
          )}

          {showTonight && tonightPick ? (
            <Link to={`/session/${tonightPick.slug}`} className="tm-btn tm-btn-ghost tm-btn-block">
              {t("homeTonightLabel")}
            </Link>
          ) : (
            <Link to="/goals" className="tm-btn tm-btn-ghost tm-btn-block">
              {t("navGoals")}
            </Link>
          )}
        </div>
      </section>

      {!state.premium ? (
        <section id="premium-home" className="tm-card home-premium">
          <div className="tm-head">
            <p className="tm-kicker">{t("homePremiumKicker")}</p>
            <h2 className="tm-h2">{t("homePremiumTitle")}</h2>
          </div>

          <div className="home-value-grid">
            <article className="home-value-item">
              <span className="home-value-number">{premiumSessionsCount}</span>
              <span className="home-value-label">{t("homeValueLocked")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{premiumPathCount}</span>
              <span className="home-value-label">{t("homeValuePremiumPaths")}</span>
            </article>
          </div>

          <ul className="home-premium-list">
            <li>{t("homePremiumPoint1")}</li>
            <li>{t("homePremiumPoint2")}</li>
          </ul>

          <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={openPremium}>
            {t("homePrimaryLockedCta")}
          </button>
          <p className="tm-subtle">$100/month</p>
        </section>
      ) : (
        <section className="tm-card home-premium home-premium--active">
          <div className="tm-head">
            <p className="tm-kicker">{t("homeMemberKicker")}</p>
            <h2 className="tm-h2">{t("homeMemberTitle")}</h2>
          </div>
          <Link to="/premium" className="tm-btn tm-btn-secondary tm-btn-block">
            {t("shellCircle")}
          </Link>
        </section>
      )}

      <section className="tm-card" aria-labelledby="home-library-title">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{t("pathsHeroKicker")}</p>
          <h2 id="home-library-title" className="tm-h2">
            {t("homeQuickPaths")}
          </h2>
        </div>

        <div className="tm-list">
          <Link to="/paths" className="tm-list-item">
            <div className="tm-list-copy">
              <span className="tm-list-title">{t("navPaths")}</span>
              <span className="tm-list-sub">{visiblePaths.length}</span>
            </div>
          </Link>
          <Link to="/goals" className="tm-list-item">
            <div className="tm-list-copy">
              <span className="tm-list-title">{t("navGoals")}</span>
              <span className="tm-list-sub">{state.weekCompletions}/3</span>
            </div>
          </Link>
          <Link to="/profile" className="tm-list-item">
            <div className="tm-list-copy">
              <span className="tm-list-title">{t("navProfile")}</span>
              <span className="tm-list-sub">{state.premium ? t("shellCircle") : t("shellStarter")}</span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}


