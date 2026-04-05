import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONCIERGE_SERVICES } from "../data/concierge";
import { CIRCLE_INCLUDED_ITEMS } from "../data/premium";
import { PROGRAM_PATHS } from "../data/programs";
import { SESSIONS } from "../data/sessions";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/ProgressContext";
import {
  loadRhythmProfile,
  updateRhythmProfile,
  type RhythmPhase,
  type RhythmSleep,
  type RhythmStress,
} from "../lib/rhythmTracker";
import { useTelegram } from "../telegram/useTelegram";

const DEV_PREMIUM_UNLOCK = import.meta.env.DEV;

export function ProfilePage() {
  const { lang, setLang, t } = useI18n();
  const { state, unlockPremium, setSensual, setReminderMode } = useProgress();
  const { app, isTelegram } = useTelegram();
  const nav = useNavigate();

  const pressRef = useRef<number | null>(null);
  const bot = import.meta.env.VITE_TELEGRAM_BOT as string | undefined;
  const [rhythm, setRhythm] = useState(() => loadRhythmProfile());
  const L = lang === "ru" ? "ru" : "en";

  const premiumSessionCount = SESSIONS.filter((s) => !s.freeTier).length;
  const premiumPathCount = PROGRAM_PATHS.filter((p) => p.tier === "premium").length;
  const signatureCount = PROGRAM_PATHS.filter((p) => p.signature).length;
  const deepTracksCount = SESSIONS.filter((s) => !s.freeTier && s.durationMin >= 15).length;

  const titleHandlers = DEV_PREMIUM_UNLOCK
    ? {
        onPointerDown: () => {
          pressRef.current = window.setTimeout(() => {
            unlockPremium();
            try {
              app.HapticFeedback.notificationOccurred("success");
            } catch {
              /* ignore */
            }
          }, 2800);
        },
        onPointerUp: () => {
          if (pressRef.current) clearTimeout(pressRef.current);
        },
        onPointerLeave: () => {
          if (pressRef.current) clearTimeout(pressRef.current);
        },
      }
    : {};

  const openPremium = () => {
    nav("/premium");
  };

  const openConcierge = () => {
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

  const setRhythmField = (patch: Partial<{ phase: RhythmPhase; stress: RhythmStress; sleep: RhythmSleep }>) => {
    const next = updateRhythmProfile(patch);
    setRhythm(next);
  };

  return (
    <div className="tm-page">
      <header className="tm-head">
        <p className="tm-kicker">{t("profileHeroKicker")}</p>
        <h1 className="tm-h1" {...titleHandlers} style={{ userSelect: "none" }}>
          {t("profileHeroTitle")}
        </h1>
        <p className="tm-lead">{state.premium ? t("profilePremiumActive") : t("profilePremiumSub")}</p>
      </header>

      <div className="profile-stack">
        <section className="profile-card profile-card--premium">
          <p className="tm-kicker tm-kicker--muted">{t("profilePremium")}</p>
          <h2 className="tm-h2">{t("profilePremiumTitle")}</h2>
          <p className="tm-subtle">{t("profilePremiumBody")}</p>

          <div className="home-value-grid">
            <article className="home-value-item">
              <span className="home-value-number">{premiumSessionCount}</span>
              <span className="home-value-label">{t("profilePremiumStatSessions")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{deepTracksCount}</span>
              <span className="home-value-label">{t("homeValueSignature")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{premiumPathCount}</span>
              <span className="home-value-label">{t("profilePremiumStatPaths")}</span>
            </article>
            <article className="home-value-item">
              <span className="home-value-number">{signatureCount}</span>
              <span className="home-value-label">{t("profilePremiumStatSignature")}</span>
            </article>
          </div>

          <div className="profile-included-list">
            {CIRCLE_INCLUDED_ITEMS.map((item) => (
              <p key={item.en} className="tm-subtle">
                • {item[L]}
              </p>
            ))}
          </div>

          {!state.premium ? (
            <>
              <ul className="home-premium-list">
                <li>{t("profileCircleBullet1")}</li>
                <li>{t("profileCircleBullet2")}</li>
                <li>{t("profileCircleBullet3")}</li>
              </ul>

              <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={openPremium}>
                {t("profileUpgrade")}
              </button>
              <p className="tm-subtle">{t("profilePremiumPrice")}</p>
            </>
          ) : null}

          {bot ? (
            <button
              type="button"
              className="tm-btn tm-btn-ghost tm-btn-block"
              onClick={() => {
                try {
                  app.openTelegramLink(bot);
                } catch {
                  window.open(bot, "_blank");
                }
              }}
            >
              {t("profileManage")}
            </button>
          ) : null}
        </section>

        <section className="profile-card">
          <p className="tm-kicker tm-kicker--muted">{t("profileTrackerTitle")}</p>
          <p className="tm-subtle">{t("profileTrackerSub")}</p>

          {state.premium ? (
            <div className="profile-tracker-stack">
              <div className="profile-tracker-group">
                <p className="tm-subtle">{t("trackerPhaseLabel")}</p>
                <div className="segmented segmented-5">
                  {(["unknown", "period", "rising", "social", "late"] as RhythmPhase[]).map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      className={rhythm.phase === phase ? "on" : ""}
                      onClick={() => setRhythmField({ phase })}
                    >
                      {t(`trackerPhase_${phase}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-tracker-group">
                <p className="tm-subtle">{t("trackerStressLabel")}</p>
                <div className="segmented">
                  {(["light", "loaded", "high"] as RhythmStress[]).map((stress) => (
                    <button
                      key={stress}
                      type="button"
                      className={rhythm.stress === stress ? "on" : ""}
                      onClick={() => setRhythmField({ stress })}
                    >
                      {t(`trackerStress_${stress}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-tracker-group">
                <p className="tm-subtle">{t("trackerSleepLabel")}</p>
                <div className="segmented">
                  {(["steady", "sensitive", "broken"] as RhythmSleep[]).map((sleep) => (
                    <button
                      key={sleep}
                      type="button"
                      className={rhythm.sleep === sleep ? "on" : ""}
                      onClick={() => setRhythmField({ sleep })}
                    >
                      {t(`trackerSleep_${sleep}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-tracker-stack">
              <p className="tm-subtle">{t("profileTrackerLocked")}</p>
              <button type="button" className="tm-btn tm-btn-secondary tm-btn-block" onClick={openPremium}>
                {t("profileUpgrade")}
              </button>
            </div>
          )}
        </section>

        <section className="profile-card">
          <p className="tm-kicker tm-kicker--muted">{t("profileConciergeTitle")}</p>
          <p className="tm-subtle">{t("profileConciergeSub")}</p>

          {state.premium ? (
            <div className="concierge-list">
              {CONCIERGE_SERVICES.map((item) => (
                <article key={item.id} className="concierge-card">
                  <p className="tm-list-title">{item.title[L]}</p>
                  <p className="tm-subtle">{item.summary[L]}</p>
                  <p className="tm-subtle">{item.bookingHint[L]}</p>
                  <div className="concierge-meta">
                    <span className="tm-pill">{t(`conciergeCategory_${item.category}`)}</span>
                    <span className="tm-pill tm-pill--accent">
                      {t("profileConciergeAddon").replace("{price}", `$${item.priceFromUsd}`)}
                    </span>
                    <span className="tm-subtle">{item.premiumBenefit[L]}</span>
                  </div>
                </article>
              ))}

              <p className="tm-subtle">{t("profileConciergeTrust")}</p>
              <button type="button" className="tm-btn tm-btn-secondary tm-btn-block" onClick={openConcierge}>
                {t("profileConciergeRequest")}
              </button>
            </div>
          ) : (
            <div className="concierge-list">
              {CONCIERGE_SERVICES.slice(0, 2).map((item) => (
                <article key={item.id} className="concierge-card concierge-card--locked">
                  <p className="tm-list-title">{item.title[L]}</p>
                  <p className="tm-subtle">{item.summary[L]}</p>
                  <div className="concierge-meta-inline">
                    <span className="tm-pill">{t(`conciergeCategory_${item.category}`)}</span>
                    <span className="tm-subtle">{t("profileConciergeAddon").replace("{price}", `$${item.priceFromUsd}`)}</span>
                  </div>
                </article>
              ))}
              <p className="tm-subtle">{t("profileConciergeLocked")}</p>
              <button type="button" className="tm-btn tm-btn-secondary tm-btn-block" onClick={openPremium}>
                {t("profileUpgrade")}
              </button>
            </div>
          )}
        </section>

        <section className="profile-card">
          <p className="tm-kicker tm-kicker--muted">{t("profileReminderTitle")}</p>
          <p className="tm-subtle">{t("profileReminderSub")}</p>
          <div className="segmented">
            {(
              [
                ["off", "profileReminderOff"],
                ["evening", "profileReminderEvening"],
                ["night", "profileReminderNight"],
              ] as const
            ).map(([key, labelKey]) => (
              <button
                key={key}
                type="button"
                className={state.reminderMode === key ? "on" : ""}
                onClick={() => setReminderMode(key)}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-card">
          <p className="tm-kicker tm-kicker--muted">{t("profileLang")}</p>
          <div className="segmented segmented-2">
            <button type="button" className={lang === "ru" ? "on" : ""} onClick={() => setLang("ru")}>
              Русский
            </button>
            <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
              English
            </button>
          </div>
        </section>

        <section className="profile-card">
          <p className="tm-kicker tm-kicker--muted">{t("profileSensualSectionTitle")}</p>
          <p className="tm-subtle">{t("profileSensualSectionSub")}</p>
          <div className="segmented">
            {(
              [
                ["welcome", "profileSensualWelcome"],
                ["optional", "profileSensualOptional"],
                ["hidden", "profileSensualHidden"],
              ] as const
            ).map(([key, labelKey]) => (
              <button
                key={key}
                type="button"
                className={state.sensualMode === key ? "on" : ""}
                onClick={() => setSensual(key)}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-card">
          <p className="profile-footnote">{isTelegram ? t("profileEnvTelegram") : t("profileEnvLocal")}</p>
          <p className="profile-footnote">{t("profileAge")}</p>
          <button
            type="button"
            className="tm-btn tm-btn-secondary tm-btn-block"
            onClick={() => {
              const url = lang === "ru" ? "https://www.telefonseelsorge.ru/" : "https://findahelpline.com/";
              try {
                app.openLink(url);
              } catch {
                window.open(url, "_blank");
              }
            }}
          >
            {t("profileCrisis")}
          </button>
        </section>
      </div>
    </div>
  );
}

