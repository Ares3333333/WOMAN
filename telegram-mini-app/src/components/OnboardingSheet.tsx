import { useState } from "react";
import { createPortal } from "react-dom";
import type { OnboardingMood } from "../lib/onboarding";
import { ONBOARDING_MOOD_ORDER, saveOnboarding } from "../lib/onboarding";
import { useI18n } from "../lib/i18n";

type Props = {
  onClose: () => void;
};

const MOOD_KEYS: Record<OnboardingMood, string> = {
  stress: "onboardingMoodStress",
  tired: "onboardingMoodTired",
  anxiety: "onboardingMoodAnxiety",
  body: "onboardingMoodBody",
};

const STEP_COUNT = 6;

export function OnboardingSheet({ onClose }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<OnboardingMood | null>(null);

  const finish = (mood?: OnboardingMood) => {
    saveOnboarding({ done: true, ...(mood ? { mood } : {}) });
    onClose();
  };

  const goNext = () => {
    if (step < STEP_COUNT - 1) setStep((s) => s + 1);
    else finish(selectedMood ?? undefined);
  };

  const titleId = `onboarding-step-${step}-title`;

  const sheet = (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="onboarding-panel">
        <div className="onboarding-panel-top">
          <span className="onboarding-eyebrow">{t("onboardingEyebrow")}</span>
          <button type="button" className="onboarding-skip-link" onClick={() => finish()}>
            {t("onboardingSkip")}
          </button>
        </div>

        <div className="onboarding-dots" aria-hidden>
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? "on" : ""}`} />
          ))}
        </div>

        <h2 id={titleId} className="onboarding-title">
          {t(`onboardingStep${step}Title`)}
        </h2>
        <p className="onboarding-sub">{t(`onboardingStep${step}Sub`)}</p>

        {step === 3 ? (
          <>
            <p className="onboarding-chips-label">{t("onboardingChipsLabel")}</p>
            <div className="chip-grid">
              {ONBOARDING_MOOD_ORDER.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`btn-chip ${selectedMood === m ? "on" : ""}`}
                  onClick={() => setSelectedMood(m)}
                >
                  {t(MOOD_KEYS[m])}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <button type="button" className="btn btn-primary onboarding-cta" onClick={goNext}>
          {step === STEP_COUNT - 1
            ? t("onboardingContinue")
            : step === 3 && !selectedMood
              ? t("onboardingContinueHint")
              : t("onboardingNext")}
        </button>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
