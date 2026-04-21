import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OnboardingSheet } from "../components/OnboardingSheet";
import { SESSIONS } from "../data/sessions";
import { pickSessionForHome } from "../lib/homePick";
import { useI18n } from "../lib/i18n";
import { readOnboarding } from "../lib/onboarding";
import { useProgress } from "../lib/ProgressContext";
import { canUserAccessSession } from "../lib/sessionAccess";
import { useTelegram } from "../telegram/useTelegram";

export function HomePage() {
  const { t } = useI18n();
  const { state } = useProgress();
  const { app } = useTelegram();
  const nav = useNavigate();

  const [onboardingOpen, setOnboardingOpen] = useState(() => !readOnboarding().done);
  const firstName = app.initDataUnsafe.user?.first_name;

  const pick = useMemo(() => {
    const { mood } = readOnboarding();
    return pickSessionForHome(SESSIONS, state, mood);
  }, [state, onboardingOpen]);

  const locked = !canUserAccessSession(pick, state);

  return (
    <div className="tm-page home-reset">
      {onboardingOpen ? <OnboardingSheet onClose={() => setOnboardingOpen(false)} /> : null}

      <section className="home-reset-hero">
        <p className="home-reset-kicker">{t("homeTimeEvening")}</p>
        <h1 className="home-reset-title">
          {firstName ? t("homeHeroNamed").replace("{name}", firstName) : t("homeHeroAnonymous")}
        </h1>
        <p className="home-reset-sub">{t("homeHeroLead")}</p>

        {locked ? (
          <button type="button" className="home-reset-primary" onClick={() => nav("/premium")}>
            {t("homePrimaryLockedCta")}
          </button>
        ) : (
          <Link to={`/session/${pick.slug}`} className="home-reset-primary">
            {t("homePrimaryCta")}
          </Link>
        )}

        <Link to="/paths" className="home-reset-secondary">
          {t("navPaths")}
        </Link>
      </section>

      <section className="home-reset-note">
        <p>{t("bioWellnessDisclaimer")}</p>
      </section>
    </div>
  );
}

