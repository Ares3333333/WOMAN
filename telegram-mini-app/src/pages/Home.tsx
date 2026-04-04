import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OnboardingSheet } from "../components/OnboardingSheet";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG, SESSIONS } from "../data/sessions";
import { homeTimeKey, pickSessionForHome, pickTonightSession } from "../lib/homePick";
import { useI18n } from "../lib/i18n";
import {
  ONBOARDING_MOOD_ORDER,
  type OnboardingMood,
  readOnboarding,
  saveOnboarding,
} from "../lib/onboarding";
import { useProgress } from "../lib/ProgressContext";
import { canUserAccessSession } from "../lib/sessionAccess";
import { useTelegram } from "../telegram/useTelegram";

const MOOD_KEYS: Record<OnboardingMood, string> = {
  stress: "onboardingMoodStress",
  tired: "onboardingMoodTired",
  anxiety: "onboardingMoodAnxiety",
  body: "onboardingMoodBody",
};

const HOME_PATH_SLICE = 4;

export function HomePage() {
  const { lang, pathTitle, t } = useI18n();
  const { state } = useProgress();
  const { app } = useTelegram();
  const L = lang === "ru" ? "ru" : "en";

  const [onboardingOpen, setOnboardingOpen] = useState(() => !readOnboarding().done);
  const [moodVersion, setMoodVersion] = useState(0);

  const pick = useMemo(() => {
    const { mood } = readOnboarding();
    return pickSessionForHome(SESSIONS, state, mood);
  }, [state, onboardingOpen, moodVersion]);

  const tonightPick = useMemo(() => pickTonightSession(SESSIONS, state), [state]);

  const firstName = app.initDataUnsafe.user?.first_name;
  const greetLine = firstName ? `${t("homeGreeting")}, ${firstName}` : null;

  const weekPct = Math.min(100, (state.weekCompletions / 3) * 100);
  const timeKey = homeTimeKey();

  const continueSlug = state.lastPlayedSlug;
  const continueSession =
    continueSlug && SESSION_BY_SLUG[continueSlug] && canUserAccessSession(SESSION_BY_SLUG[continueSlug], state)
      ? SESSION_BY_SLUG[continueSlug]
      : null;
  const showContinue = Boolean(continueSession && continueSession.slug !== pick.slug);

  const showTonightBlock =
    Boolean(tonightPick) &&
    timeKey === "Evening" &&
    tonightPick!.slug !== pick.slug;

  const setMood = (m: OnboardingMood) => {
    saveOnboarding({ done: true, mood: m });
    setMoodVersion((v) => v + 1);
  };

  const currentMood = readOnboarding().mood;

  const openPremium = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;
    if (bot) {
      try {
        app.openTelegramLink(`${bot}?start=premium`);
      } catch {
        window.open(`${bot}?start=premium`, "_blank");
      }
    }
  };

  return (
    <div className="page-head home-page">
      {onboardingOpen ? <OnboardingSheet onClose={() => setOnboardingOpen(false)} /> : null}

      <div className="home-ambient" aria-hidden />
      <p className="home-private-eyebrow">{t("homePrivateEyebrow")}</p>
      <h1 className="home-greeting home-headline">{t("homeHeadline")}</h1>
      {greetLine ? <p className="home-greet-line">{greetLine}</p> : null}
      <p className="sub home-tagline">{t("homeSub")}</p>
      <p className="context-line home-time">{t(`homeTime${timeKey}`)}</p>

      <p className="today-label">{t("homeTodayPickLabel")}</p>
      <Link to={`/session/${pick.slug}`} className={`card session-hero ${pick.gradient}`}>
        <span className="session-hero-label">{t("homeHeroMomentLabel")}</span>
        <h2>{pick.title[L]}</h2>
        <p className="session-hero-desc">{pick.short[L]}</p>
        <p className="session-hero-meta">
          <span className="session-hero-tag">{t(`pillarTag_${pick.pillarId}`)}</span>
          {" · "}
          {pick.durationMin} {t("sessionMin")}
          {pick.freeTier ? ` · ${t("free")}` : ` · ${t("sessionPremium")}`}
        </p>
      </Link>

      {showContinue && continueSession ? (
        <Link to={`/session/${continueSession.slug}`} className="home-continue-card">
          <span className="home-continue-label">{t("homeContinueLabel")}</span>
          <span className="home-continue-title">{continueSession.title[L]}</span>
          <span className="home-continue-sub">{t("homeContinueSub")}</span>
        </Link>
      ) : !state.lastPlayedSlug ? (
        <p className="home-continue-empty">{t("homeContinueEmpty")}</p>
      ) : null}

      {showTonightBlock && tonightPick ? (
        <section className="home-section home-tonight-section" aria-labelledby="home-tonight-h">
          <p id="home-tonight-h" className="home-section-label">
            {t("homeTonightSectionLabel")}
          </p>
          <p className="home-section-sub">{t("homeTonightSub")}</p>
          <Link to={`/session/${tonightPick.slug}`} className={`card home-tonight-card ${tonightPick.gradient}`}>
            <span className="session-hero-label">{t("homeCtaListen")}</span>
            <h2 className="home-tonight-title">{tonightPick.title[L]}</h2>
            <p className="session-hero-desc">{tonightPick.short[L]}</p>
            <p className="session-hero-meta">
              {tonightPick.durationMin} {t("sessionMin")}
              {tonightPick.freeTier ? ` · ${t("free")}` : ` · ${t("sessionPremium")}`}
            </p>
          </Link>
        </section>
      ) : null}

      <section className="home-section" aria-labelledby="home-mood-heading">
        <p id="home-mood-heading" className="home-section-label">
          {t("homeMoodSectionLabel")}
        </p>
        <div className="mood-strip" role="group">
          {ONBOARDING_MOOD_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              className={`mood-chip ${currentMood === m ? "on" : ""}`}
              onClick={() => setMood(m)}
            >
              {t(MOOD_KEYS[m])}
            </button>
          ))}
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-paths-heading">
        <p id="home-paths-heading" className="home-section-label">
          {t("homePathsSectionTitle")}
        </p>
        <p className="home-section-sub">{t("homePathsSectionSub")}</p>
        <div className="home-path-scroll">
          {PROGRAM_PATHS.slice(0, HOME_PATH_SLICE).map((path) => {
            const count = path.sessionSlugs.filter((slug) => {
              const s = SESSION_BY_SLUG[slug];
              if (!s) return false;
              if (s.sensual && state.sensualMode === "hidden") return false;
              return true;
            }).length;
            if (count === 0) return null;
            return (
              <Link key={path.id} to={`/path/${path.id}`} className="home-path-chip">
                <span className="home-path-chip-pillar">{t(`pillarTag_${path.pillarId}`)}</span>
                <span className="home-path-chip-title">{pathTitle(path.id)}</span>
                <span className="home-path-chip-meta">
                  {count} {t("pathSessions")}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {timeKey === "Evening" ? (
        <Link to="/path/sleep_deep_rest" className="home-evening-hint">
          {t("homeEveningRowCta")}
        </Link>
      ) : null}

      {!state.premium ? (
        <section className="home-premium-block" aria-labelledby="home-premium-h">
          <h2 id="home-premium-h" className="home-premium-title">
            {t("homePremiumBlockTitle")}
          </h2>
          <p className="home-premium-sub">{t("homePremiumBlockSub")}</p>
          <button type="button" className="btn btn-primary home-premium-cta" onClick={openPremium}>
            {t("homePremiumCta")}
          </button>
        </section>
      ) : null}

      <div className="week-block home-week">
        <p className="pill">{t("goalsWeeklyTarget")}</p>
        <div className="wave-meter" aria-hidden>
          <span style={{ width: `${weekPct}%` }} />
        </div>
        <p className="home-week-caption">
          {state.weekCompletions}/3 · {t("goalsWeek")}
        </p>
      </div>

      <div className="home-footer-links">
        <Link to="/paths">{t("homeFooterPaths")}</Link>
        <span className="home-footer-dot" aria-hidden>
          ·
        </span>
        <Link to="/goals">{t("homeFooterGoals")}</Link>
      </div>

      <p className="sub home-disclaimer">{t("homeDisclaimer")}</p>
    </div>
  );
}
