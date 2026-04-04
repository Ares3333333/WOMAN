import { useState } from "react";
import type { OnboardingMood } from "../lib/onboarding";
import { saveOnboarding } from "../lib/onboarding";
import { useI18n } from "../lib/i18n";

type Props = {
  onClose: () => void;
};

const MOODS: OnboardingMood[] = ["stress", "tired", "anxiety", "body"];

const MOOD_KEYS: Record<OnboardingMood, string> = {
  stress: "onboardingMoodStress",
  tired: "onboardingMoodTired",
  anxiety: "onboardingMoodAnxiety",
  body: "onboardingMoodBody",
};

export function OnboardingSheet({ onClose }: Props) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<OnboardingMood | null>(null);

  const finish = (mood?: OnboardingMood) => {
    saveOnboarding({ done: true, ...(mood ? { mood } : {}) });
    onClose();
  };

  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-panel">
        <h2 id="onboarding-title" className="onboarding-title">
          {t("onboardingTitle")}
        </h2>
        <p className="onboarding-sub">{t("onboardingSub")}</p>
        <div className="chip-grid">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              className={`btn-chip ${selected === m ? "on" : ""}`}
              onClick={() => setSelected(m)}
            >
              {t(MOOD_KEYS[m])}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary onboarding-cta" onClick={() => finish(selected ?? undefined)}>
          {t("onboardingContinue")}
        </button>
        <button type="button" className="btn btn-ghost onboarding-skip" onClick={() => finish()}>
          {t("onboardingSkip")}
        </button>
      </div>
    </div>
  );
}
