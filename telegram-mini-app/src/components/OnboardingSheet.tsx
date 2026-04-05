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

const STEP_COUNT = 4;

export function OnboardingSheet({ onClose }: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<OnboardingMood | null>(null);

  const finish = (mood?: OnboardingMood) => {
    saveOnboarding({ done: true, ...(mood ? { mood } : {}) });
    onClose();
  };

  const goNext = () => {
    if (step < STEP_COUNT - 1) {
      setStep((s) => s + 1);
      return;
    }
    finish(selectedMood ?? undefined);
  };

  const titleKeys = [
    "onboardingS0Title",
    "onboardingS1Title",
    "onboardingS2Title",
    "onboardingS3Title",
  ] as const;
  const subKeys = ["onboardingS0Sub", "onboardingS1Sub", "onboardingS2Sub", "onboardingS3Sub"] as const;

  const ctaLabel =
    step === STEP_COUNT - 1
      ? t("onboardingContinue")
      : step === 1 && !selectedMood
        ? t("onboardingContinueHint")
        : t("onboardingNext");

  const stageLine = t("onboardingStepLine")
    .replace("{current}", String(step + 1))
    .replace("{total}", String(STEP_COUNT));

  const sheet = (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-label={t("onboardingEyebrow")}>
      <div className="onboarding-panel">
        <div className="onboarding-head">
          <span className="tm-kicker">{t("onboardingEyebrow")}</span>
          <button type="button" className="onboarding-skip" onClick={() => finish()}>
            {t("onboardingSkip")}
          </button>
        </div>

        <div className="onboarding-progress" aria-hidden>
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <span key={i} className={i <= step ? "on" : ""} />
          ))}
        </div>

        <p className="tm-subtle">{stageLine}</p>

        <h2 className="onboarding-title">{t(titleKeys[step])}</h2>
        <p className="onboarding-sub">{t(subKeys[step])}</p>

        {step === 1 ? (
          <>
            <p className="tm-kicker tm-kicker--muted">{t("onboardingChipsLabel")}</p>
            <div className="onboarding-grid">
              {ONBOARDING_MOOD_ORDER.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`tm-chip ${selectedMood === m ? "on" : ""}`}
                  onClick={() => setSelectedMood(m)}
                >
                  {t(MOOD_KEYS[m])}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <ul className="onboarding-feature-list">
            <li>{t("onboardingFeature1")}</li>
            <li>{t("onboardingFeature2")}</li>
            <li>{t("onboardingFeature3")}</li>
          </ul>
        ) : null}

        {step === 3 ? <div className="tm-card"><p className="tm-subtle">{t("onboardingFinalNote")}</p></div> : null}

        <div className="onboarding-footer">
          <button type="button" className="tm-btn tm-btn-primary tm-btn-block" onClick={goNext}>
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
