import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OnboardingSheet } from "../components/OnboardingSheet";
import { IconChevron } from "../components/MiniNavIcons";
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

  const alternates = useMemo(() => {
    const { mood } = readOnboarding();
    return pickAlternateSessions(SESSIONS, state, mood, pick.slug, 2);
  }, [state, onboardingOpen, moodVersion, pick.slug]);

  const tonightPick = useMemo(() => pickTonightSession(SESSIONS, state), [state]);

  const firstName = app.initDataUnsafe.user?.first_name;
  const greetTitle = firstName ? t("homeCommandNamed").replace("{name}", firstName) : t("homeCommandAnonymous");

  const weekPct = Math.min(100, (state.weekCompletions / 3) * 100);
  const timeKey = homeTimeKey();

  const continueSlug = state.lastPlayedSlug;
  const continueSession =
    continueSlug && SESSION_BY_SLUG[continueSlug] && canUserAccessSession(SESSION_BY_SLUG[continueSlug], state)
      ? SESSION_BY_SLUG[continueSlug]
      : null;
  const showContinue = Boolean(continueSession && continueSession.slug !== pick.slug);

  const showTonightBlock =
    Boolean(tonightPick) && timeKey === "Evening" && tonightPick!.slug !== pick.slug;

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

  const openCrisis = () => {
    const url = lang === "ru" ? "https://www.telefonseelsorge.ru/" : "https://findahelpline.com/";
    try {
      app.openLink(url);
    } catch {
      window.open(url, "_blank");
    }
  };

  const primaryLocked = !pick.freeTier && !state.premium;
  const primaryHref = `/session/${pick.slug}`;

  return (
    <div className="page-head home-page">
      {onboardingOpen ? <OnboardingSheet onClose={() => setOnboardingOpen(false)} /> : null}

      <div className="home-canvas-glow" aria-hidden />

      <header className="home-command">
        <p className="home-command-eyebrow">{t("homeCommandEyebrow")}</p>
        <h1 className="home-command-title">{greetTitle}</h1>
        <p className="home-command-lead">{t("homeCommandLead")}</p>
        <p className="home-time-hint">{t(`homeTime${timeKey}`)}</p>

        <div className="home-command-actions">
          {primaryLocked ? (
            <button type="button" className="btn btn-primary btn-command" onClick={openPremium}>
              {t("homePrimaryLockedCta")}
            </button>
          ) : (
            <Link to={primaryHref} className="btn btn-primary btn-command">
              {t("homePrimaryCta")}
            </Link>
          )}
          <div className="home-command-links">
            <a href="#home-mood-anchor" className="home-command-link home-command-link--accent">
              {t("homeLinkMood")}
            </a>
            <Link to="/paths" className="home-command-link">
              {t("homeLinkPaths")}
            </Link>
            <button type="button" className="home-command-link" onClick={openPremium}>
              {t("homeLinkCircle")}
            </button>
          </div>
        </div>

        <p className="home-command-disclaimer">
          {t("homeDisclaimer")}{" "}
          <button type="button" className="home-inline-link" onClick={openCrisis}>
            {t("homeCrisisLink")}
          </button>
        </p>
      </header>

      <section className="home-band" aria-labelledby="home-today-h">
        <h2 id="home-today-h" className="home-band-label">
          {t("homeTodayBand")}
        </h2>
        <p className="home-band-desc">{t("homeTodayBandDesc")}</p>

        {primaryLocked ? (
          <button type="button" className={`home-hero-card card home-hero-card--action ${pick.gradient}`} onClick={openPremium}>
            <span className="home-hero-accent" aria-hidden />
            <span className="home-hero-eyebrow">{t("homeHeroMomentLabel")}</span>
            <h3 className="home-hero-title">{pick.title[L]}</h3>
            <p className="home-hero-desc">{pick.short[L]}</p>
            <p className="home-hero-meta">
              <span>{t(`pillarTag_${pick.pillarId}`)}</span>
              <span className="home-meta-dot">·</span>
              <span>
                {pick.durationMin} {t("sessionMin")}
              </span>
              <span className="home-meta-dot">·</span>
              <span>{t("sessionPremium")}</span>
            </p>
            <span className="home-hero-hint">{t("homeHeroHintUnlock")}</span>
          </button>
        ) : (
          <Link to={primaryHref} className={`home-hero-card card ${pick.gradient}`}>
            <span className="home-hero-accent" aria-hidden />
            <span className="home-hero-eyebrow">{t("homeHeroMomentLabel")}</span>
            <h3 className="home-hero-title">{pick.title[L]}</h3>
            <p className="home-hero-desc">{pick.short[L]}</p>
            <p className="home-hero-meta">
              <span>{t(`pillarTag_${pick.pillarId}`)}</span>
              <span className="home-meta-dot">·</span>
              <span>
                {pick.durationMin} {t("sessionMin")}
              </span>
              <span className="home-meta-dot">·</span>
              <span>{pick.freeTier ? t("free") : t("sessionPremium")}</span>
            </p>
            <span className="home-hero-hint">{t("homeHeroHint")}</span>
          </Link>
        )}

        {alternates.length > 0 ? (
          <ul className="home-support-list">
            {alternates.map((s) => {
              const locked = !s.freeTier && !state.premium;
              return (
                <li key={s.slug}>
                  <Link
                    to={locked ? "#premium-home" : `/session/${s.slug}`}
                    className="home-support-row"
                    onClick={(e) => {
                      if (locked) {
                        e.preventDefault();
                        openPremium();
                      }
                    }}
                  >
                    <div className="home-support-copy">
                      <span className="home-support-eyebrow">{t(`pillarTag_${s.pillarId}`)}</span>
                      <span className="home-support-title">{s.title[L]}</span>
                      <span className="home-support-meta">
                        {s.durationMin} {t("sessionMin")} · {s.freeTier ? t("free") : t("sessionPremium")}
                      </span>
                    </div>
                    <IconChevron className="home-support-chevron" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {showTonightBlock && tonightPick ? (
        <section className="home-band home-band--tight" aria-labelledby="home-tonight-h">
          <h2 id="home-tonight-h" className="home-band-label">
            {t("homeTonightSectionLabel")}
          </h2>
          <p className="home-band-desc">{t("homeTonightSub")}</p>
          <Link to={`/session/${tonightPick.slug}`} className={`home-tonight-card card ${tonightPick.gradient}`}>
            <span className="home-hero-eyebrow">{t("homeCtaListen")}</span>
            <h3 className="home-tonight-title">{tonightPick.title[L]}</h3>
            <p className="home-hero-desc">{tonightPick.short[L]}</p>
            <p className="home-hero-meta">
              {tonightPick.durationMin} {t("sessionMin")}
              {tonightPick.freeTier ? ` · ${t("free")}` : ` · ${t("sessionPremium")}`}
            </p>
          </Link>
        </section>
      ) : null}

      <section className="home-studio" aria-labelledby="home-studio-h">
        <h2 id="home-studio-h" className="home-band-label">
          {t("homeStudioTitle")}
        </h2>
        <p className="home-band-desc">{t("homeStudioDesc")}</p>

        <div className="home-studio-block">
          <h3 className="home-studio-sub">{t("homeStudioContinue")}</h3>
          {showContinue && continueSession ? (
            <Link to={`/session/${continueSession.slug}`} className="home-studio-row">
              <div>
                <span className="home-studio-row-title">{continueSession.title[L]}</span>
                <span className="home-studio-row-sub">{t("homeContinueSub")}</span>
              </div>
              <IconChevron className="home-support-chevron" />
            </Link>
          ) : (
            <p className="home-studio-empty">{t("homeContinueEmpty")}</p>
          )}
        </div>
      </section>

      <section className="home-band" id="home-mood-anchor" aria-labelledby="home-mood-heading">
        <h2 id="home-mood-heading" className="home-band-label">
          {t("homeMoodSectionLabel")}
        </h2>
        <p className="home-band-desc">{t("homeMoodSectionDesc")}</p>
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

      <section className="home-band" aria-labelledby="home-paths-heading">
        <h2 id="home-paths-heading" className="home-band-label">
          {t("homePathsSectionTitle")}
        </h2>
        <p className="home-band-desc">{t("homePathsSectionSub")}</p>
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
        <section className="home-premium-block" id="premium-home" aria-labelledby="home-premium-h">
          <p id="home-premium-h" className="home-premium-eyebrow">
            {t("homePremiumEyebrow")}
          </p>
          <h2 className="home-premium-title">{t("homePremiumBlockTitle")}</h2>
          <p className="home-premium-sub">{t("homePremiumBlockSub")}</p>
          <ul className="home-premium-bullets">
            <li>{t("homePremiumPt1")}</li>
            <li>{t("homePremiumPt2")}</li>
            <li>{t("homePremiumPt3")}</li>
          </ul>
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
    </div>
  );
}
