import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OnboardingSheet } from "../components/OnboardingSheet";
import { IconChevron } from "../components/MiniNavIcons";
import { CONCIERGE_SERVICES } from "../data/concierge";
import { CIRCLE_FEATURES } from "../data/premium";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSION_BY_SLUG, SESSIONS } from "../data/sessions";
import { homeTimeKey, pickAlternateSessions, pickSessionForHome, pickTonightSession } from "../lib/homePick";
import { useI18n } from "../lib/i18n";
import {
  ONBOARDING_MOOD_ORDER,
  type OnboardingMood,
  readOnboarding,
  saveOnboarding,
} from "../lib/onboarding";
import { useProgress } from "../lib/ProgressContext";
import { buildRhythmInsightKeys, loadRhythmProfile, pickRhythmSession } from "../lib/rhythmTracker";
import { canUserAccessSession } from "../lib/sessionAccess";
import { useTelegram } from "../telegram/useTelegram";

const MOOD_KEYS: Record<OnboardingMood, string> = {
  stress: "onboardingMoodStress",
  tired: "onboardingMoodTired",
  anxiety: "onboardingMoodAnxiety",
  body: "onboardingMoodBody",
};

export function HomePage() {
  const { lang, pathTitle, t } = useI18n();
  const { state, unlockPremium } = useProgress();
  const { app } = useTelegram();
  const L = lang === "ru" ? "ru" : "en";

  const [onboardingOpen, setOnboardingOpen] = useState(() => !readOnboarding().done);
  const [moodVersion, setMoodVersion] = useState(0);

  const pick = useMemo(() => {
    const { mood } = readOnboarding();
    return pickSessionForHome(SESSIONS, state, mood);
  }, [state, onboardingOpen, moodVersion]);

  const alternates = useMemo(() => {
    const { mood } = readOnboarding();
    return pickAlternateSessions(SESSIONS, state, mood, pick.slug, 3);
  }, [state, onboardingOpen, moodVersion, pick.slug]);

  const tonightPick = useMemo(() => pickTonightSession(SESSIONS, state), [state]);
  const timeKey = homeTimeKey();
  const weekPct = Math.min(100, (state.weekCompletions / 3) * 100);

  const continueSession =
    state.lastPlayedSlug &&
    SESSION_BY_SLUG[state.lastPlayedSlug] &&
    canUserAccessSession(SESSION_BY_SLUG[state.lastPlayedSlug], state)
      ? SESSION_BY_SLUG[state.lastPlayedSlug]
      : null;

  const visibleSessions = SESSIONS.filter((s) => !(s.sensual && state.sensualMode === "hidden"));
  const freeSessionsCount = visibleSessions.filter((s) => s.freeTier).length;
  const premiumSessionsCount = visibleSessions.filter((s) => !s.freeTier).length;
  const unlockedSessionsCount = state.premium ? visibleSessions.length : freeSessionsCount;

  const visiblePaths = PROGRAM_PATHS.filter((path) =>
    path.sessionSlugs.some((slug) => {
      const s = SESSION_BY_SLUG[slug];
      if (!s) return false;
      if (s.sensual && state.sensualMode === "hidden") return false;
      return true;
    })
  );
  const featuredPaths = useMemo(() => {
    const core = visiblePaths.filter((p) => p.tier !== "premium").slice(0, 4);
    const premium = visiblePaths.filter((p) => p.tier === "premium").slice(0, 2);
    return [...core, ...premium];
  }, [visiblePaths]);

  const premiumPathCount = visiblePaths.filter((p) => p.tier === "premium").length;
  const signaturePathCount = visiblePaths.filter((p) => p.signature).length;
  const firstName = app.initDataUnsafe.user?.first_name;
  const heroTitle = firstName
    ? t("homeHeroNamed").replace("{name}", firstName)
    : t("homeHeroAnonymous");

  const primaryLocked = !pick.freeTier && !state.premium;
  const primaryHref = `/session/${pick.slug}`;
  const showTonight = Boolean(tonightPick && tonightPick.slug !== pick.slug && timeKey === "Evening");
  const currentMood = readOnboarding().mood;
  const rhythmProfile = useMemo(() => loadRhythmProfile(), [state.premium, moodVersion, state.weekCompletions]);
  const rhythmInsight = useMemo(
    () =>
      buildRhythmInsightKeys({
        profile: rhythmProfile,
        state,
        mood: currentMood,
      }),
    [rhythmProfile, state, currentMood]
  );
  const rhythmSession = useMemo(() => pickRhythmSession(rhythmProfile, state), [rhythmProfile, state]);
  const trackerSnapshot = [
    t(`trackerPhase_${rhythmProfile.phase}`),
    t(`trackerStress_${rhythmProfile.stress}`),
    t(`trackerSleep_${rhythmProfile.sleep}`),
  ];

  const setMood = (m: OnboardingMood) => {
    saveOnboarding({ done: true, mood: m });
    setMoodVersion((v) => v + 1);
  };

  const openPremium = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;
    if (!bot) {
      unlockPremium();
      return;
    }
    try {
      app.openTelegramLink(`${bot}?start=premium`);
    } catch {
      window.open(`${bot}?start=premium`, "_blank");
    }
  };

  const openConcierge = () => {
    const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;
    if (!bot) {
      openPremium();
      return;
    }
    try {
      app.openTelegramLink(`${bot}?start=concierge`);
    } catch {
      window.open(`${bot}?start=concierge`, "_blank");
    }
  };

  const openCrisis = () => {
    const url = lang === "ru" ? "https://www.telefonseelsorge.ru/" : "https://findahelpline.com/";
    try {
      app.openLink(url);
    } catch {
      window.open(url, "_blank");
    }
  };

  const tierLabel = (tier: "free" | "mixed" | "premium") => {
    if (tier === "free") return t("tierFree");
    if (tier === "mixed") return t("tierMixed");
    return t("tierPremium");
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
              <Link to={primaryHref} className="tm-btn tm-btn-primary tm-btn-block">
                {t("homePrimaryCta")}
              </Link>
            )}

            <div className="home-hero-links">
              <Link to="/paths" className="home-hero-link">
                {t("homeQuickPaths")}
              </Link>
              <Link to="/goals" className="home-hero-link">
                {t("homeQuickGoals")}
              </Link>
              <button
                type="button"
                className="home-hero-link"
                onClick={() => document.getElementById("home-mood")?.scrollIntoView({ behavior: "smooth", block: "start" })}
              >
                {t("homeQuickMood")}
              </button>
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
            <p className="home-next-desc">{pick.short[L]}</p>
            <p className="home-next-meta">
              <span>{t(`pillarTag_${pick.pillarId}`)}</span>
              <span className="home-next-dot" />
              <span>
                {pick.durationMin} {t("sessionMin")}
              </span>
              <span className="home-next-dot" />
              <span>{t("sessionPremium")}</span>
            </p>
            <p className="home-next-note">{t("homeUnlockHint")}</p>
          </button>
        ) : (
          <Link to={primaryHref} className={`home-next-card ${pick.gradient}`}>
            <p className="home-next-kicker">{t("homeCurrentKicker")}</p>
            <h3 className="home-next-title">{pick.title[L]}</h3>
            <p className="home-next-desc">{pick.short[L]}</p>
            <p className="home-next-meta">
              <span>{t(`pillarTag_${pick.pillarId}`)}</span>
              <span className="home-next-dot" />
              <span>
                {pick.durationMin} {t("sessionMin")}
              </span>
              <span className="home-next-dot" />
              <span>{pick.freeTier ? t("free") : t("sessionPremium")}</span>
            </p>
            <p className="home-next-note">{t("homeOpenHint")}</p>
          </Link>
        )}
      </section>

      <section className="tm-card" aria-labelledby="home-studio-title">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{t("homeStudioKicker")}</p>
          <h2 id="home-studio-title" className="tm-h2">
            {t("homeStudioTitle")}
          </h2>
          <p className="tm-subtle">{t("homeStudioSub")}</p>
        </div>

        <div className="tm-list">
          {continueSession ? (
            <Link to={`/session/${continueSession.slug}`} className="tm-list-item">
              <div className="tm-list-copy">
                <span className="tm-pill tm-pill--accent">{t("homeContinueLabel")}</span>
                <span className="tm-list-title">{continueSession.title[L]}</span>
                <span className="tm-list-sub">{t("homeContinueSub")}</span>
              </div>
              <IconChevron className="tm-chevron" />
            </Link>
          ) : (
            <div className="tm-list-item">
              <div className="tm-list-copy">
                <span className="tm-list-title">{t("homeContinueEmptyTitle")}</span>
                <span className="tm-list-sub">{t("homeContinueEmptySub")}</span>
              </div>
            </div>
          )}

          {showTonight && tonightPick ? (
            <Link to={`/session/${tonightPick.slug}`} className="tm-list-item">
              <div className="tm-list-copy">
                <span className="tm-pill">{t("homeTonightLabel")}</span>
                <span className="tm-list-title">{tonightPick.title[L]}</span>
                <span className="tm-list-sub">
                  {tonightPick.durationMin} {t("sessionMin")} • {t(`pillarTag_${tonightPick.pillarId}`)}
                </span>
              </div>
              <IconChevron className="tm-chevron" />
            </Link>
          ) : null}

          {alternates.map((s) => {
            const locked = !s.freeTier && !state.premium;
            return (
              <Link
                key={s.slug}
                to={locked ? "#premium-home" : `/session/${s.slug}`}
                className="tm-list-item"
                onClick={(e) => {
                  if (!locked) return;
                  e.preventDefault();
                  openPremium();
                }}
              >
                <div className="tm-list-copy">
                  <span className="tm-pill">{t(`pillarTag_${s.pillarId}`)}</span>
                  <span className="tm-list-title">{s.title[L]}</span>
                  <span className="tm-list-sub">
                    {s.durationMin} {t("sessionMin")} • {s.freeTier ? t("free") : t("sessionPremium")}
                  </span>
                </div>
                <IconChevron className="tm-chevron" />
              </Link>
            );
          })}
        </div>
      </section>

      <section id="home-mood" className="tm-card" aria-labelledby="home-mood-title">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{t("homeMoodKicker")}</p>
          <h2 id="home-mood-title" className="tm-h2">
            {t("homeMoodTitle")}
          </h2>
          <p className="tm-subtle">{t("homeMoodSub")}</p>
        </div>

        <div className="tm-chip-row">
          {ONBOARDING_MOOD_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              className={`tm-chip ${currentMood === m ? "on" : ""}`}
              onClick={() => setMood(m)}
            >
              {t(MOOD_KEYS[m])}
            </button>
          ))}
        </div>
      </section>

      <section className="tm-card" aria-labelledby="home-path-title">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{t("homePathsKicker")}</p>
          <h2 id="home-path-title" className="tm-h2">
            {t("homePathsTitle")}
          </h2>
          <p className="tm-subtle">{t("homePathsSub")}</p>
        </div>

        <div className="home-path-grid">
          {featuredPaths.map((path) => {
            const count = path.sessionSlugs.filter((slug) => {
              const s = SESSION_BY_SLUG[slug];
              if (!s) return false;
              if (s.sensual && state.sensualMode === "hidden") return false;
              return true;
            }).length;
            if (count === 0) return null;

            const lockForFree = !state.premium && path.tier === "premium";

            return (
              <Link
                key={path.id}
                to={lockForFree ? "#premium-home" : `/path/${path.id}`}
                className={`home-path-card${lockForFree ? " home-path-card--locked" : ""}`}
                onClick={(e) => {
                  if (!lockForFree) return;
                  e.preventDefault();
                  openPremium();
                }}
              >
                <span className="tm-pill">{tierLabel(path.tier)}</span>
                <span className="home-path-title">{pathTitle(path.id)}</span>
                <span className="home-path-meta">
                  {count} {t("pathSessions")}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="tm-card" aria-labelledby="home-tracker-title">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{t("homeTrackerKicker")}</p>
          <h2 id="home-tracker-title" className="tm-h2">
            {t("homeTrackerTitle")}
          </h2>
          <p className="tm-subtle">{t("homeTrackerSub")}</p>
        </div>

        {state.premium ? (
          <div className="home-insight-stack">
            <div className="tracker-pill-row">
              {trackerSnapshot.map((label) => (
                <span key={label} className="tm-pill">
                  {label}
                </span>
              ))}
            </div>
            <article className="home-insight-card">
              <p className="tm-kicker tm-kicker--muted">{t(rhythmInsight.headline)}</p>
              <p className="tm-subtle">{t(rhythmInsight.note)}</p>
              <p className="tm-subtle">{t(rhythmInsight.suggestion)}</p>
            </article>

            {rhythmSession ? (
              <Link to={`/session/${rhythmSession.slug}`} className="tm-btn tm-btn-secondary tm-btn-block">
                {t("homeTrackerCta")} · {rhythmSession.title[L]}
              </Link>
            ) : (
              <p className="tm-subtle">{t("homeContinueEmptySub")}</p>
            )}
          </div>
        ) : (
          <div className="home-insight-stack">
            <p className="tm-subtle">{t("homeTrackerLocked")}</p>
            <button type="button" className="tm-btn tm-btn-secondary tm-btn-block" onClick={openPremium}>
              {t("homePrimaryLockedCta")}
            </button>
          </div>
        )}
      </section>

      <section className="tm-card" aria-labelledby="home-concierge-title">
        <div className="tm-head">
          <p className="tm-kicker tm-kicker--muted">{t("homeConciergeKicker")}</p>
          <h2 id="home-concierge-title" className="tm-h2">
            {t("homeConciergeTitle")}
          </h2>
          <p className="tm-subtle">{t("homeConciergeSub")}</p>
        </div>

        <div className="home-concierge-list">
          {CONCIERGE_SERVICES.slice(0, 2).map((item) => (
            <article key={item.id} className="home-concierge-item">
              <p className="tm-list-title">{item.title[L]}</p>
              <p className="tm-subtle">{item.summary[L]}</p>
              <div className="concierge-meta-inline">
                <span className="tm-pill">{t(`conciergeCategory_${item.category}`)}</span>
                <span className="tm-subtle">{t("profileConciergeAddon").replace("{price}", `$${item.priceFromUsd}`)}</span>
              </div>
            </article>
          ))}
        </div>

        <p className="tm-subtle">{state.premium ? t("profileConciergeSub") : t("homeConciergeLocked")}</p>
        <button
          type="button"
          className="tm-btn tm-btn-secondary tm-btn-block"
          onClick={state.premium ? openConcierge : openPremium}
        >
          {state.premium ? t("profileConciergeRequest") : t("homePrimaryLockedCta")}
        </button>
      </section>

      {!state.premium ? (
        <section id="premium-home" className="tm-card home-premium">
          <div className="tm-head">
            <p className="tm-kicker">{t("homePremiumKicker")}</p>
            <h2 className="tm-h2">{t("homePremiumTitle")}</h2>
            <p className="tm-lead">{t("homePremiumSub")}</p>
          </div>

          <div className="home-value-grid">
            <article className="home-value-item">
              <span className="home-value-number">{unlockedSessionsCount}</span>
              <span className="home-value-label">{t("homeValueUnlocked")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{premiumSessionsCount}</span>
              <span className="home-value-label">{t("homeValueLocked")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{premiumPathCount}</span>
              <span className="home-value-label">{t("homeValuePremiumPaths")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{signaturePathCount}</span>
              <span className="home-value-label">{t("homeValueSignature")}</span>
            </article>
          </div>

          <div className="premium-feature-grid">
            {CIRCLE_FEATURES.map((feature) => (
              <article key={feature.id} className="premium-feature-card">
                <p className="tm-list-title">{feature.title[L]}</p>
                <p className="tm-subtle">{feature.summary[L]}</p>
              </article>
            ))}
          </div>

          <div className="premium-compare-grid">
            <article className="premium-compare-card">
              <p className="tm-kicker tm-kicker--muted">{t("homeCompareFreeTitle")}</p>
              <ul className="home-premium-list">
                <li>{t("homeCompareFreeItem1")}</li>
                <li>{t("homeCompareFreeItem2")}</li>
                <li>{t("homeCompareFreeItem3")}</li>
              </ul>
            </article>
            <article className="premium-compare-card premium-compare-card--accent">
              <p className="tm-kicker">{t("homeComparePremiumTitle")}</p>
              <ul className="home-premium-list">
                <li>{t("homeComparePremiumItem1")}</li>
                <li>{t("homeComparePremiumItem2")}</li>
                <li>{t("homeComparePremiumItem3")}</li>
              </ul>
            </article>
          </div>

          <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={openPremium}>
            {t("homePremiumCta")}
          </button>
          <p className="tm-subtle">{t("homePremiumPrice")}</p>
        </section>
      ) : (
        <section className="tm-card home-premium home-premium--active">
          <div className="tm-head">
            <p className="tm-kicker">{t("homeMemberKicker")}</p>
            <h2 className="tm-h2">{t("homeMemberTitle")}</h2>
            <p className="tm-subtle">{t("homeMemberSub")}</p>
          </div>
        </section>
      )}

      <section className="home-grid-2">
        <div className="home-week">
          <div className="home-week-head">
            <span className="tm-pill">{t("goalsWeeklyTarget")}</span>
            <span className="tm-subtle">{state.weekCompletions}/3</span>
          </div>
          <div className="wave-meter" aria-hidden>
            <span style={{ width: `${weekPct}%` }} />
          </div>
          <p className="home-footer-line">{t("homeWeekHint")}</p>
        </div>

        <div className="home-week">
          <span className="tm-pill">{t("homeSupportKicker")}</span>
          <p className="home-footer-line">{t("homeSupportCopy")}</p>
          <button type="button" className="tm-btn-inline" onClick={openCrisis}>
            {t("homeSupportLink")}
          </button>
        </div>
      </section>
    </div>
  );
}
