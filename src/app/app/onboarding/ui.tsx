"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SensualContentMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CrisisGuardTextarea } from "@/components/crisis-guard-textarea";
import { VoiceStyleSelector } from "@/components/voice-style-selector";
import { SoftToggle } from "@/components/soft-toggle";
import { saveOnboarding } from "@/app/actions/onboarding";
import { trackEvent } from "@/lib/analytics";
import { InlineError } from "@/components/states/inline-alert";
import { useIntl } from "@/components/intl-provider";

const LENGTHS = ["5-8", "10-15", "15+", "varies"] as const;
const LISTEN_IDS = ["morning", "afternoon", "evening", "sleep"] as const;

function listenKey(id: (typeof LISTEN_IDS)[number]): string {
  const map = {
    morning: "app.onboarding.listenMorning",
    afternoon: "app.onboarding.listenAfternoon",
    evening: "app.onboarding.listenEvening",
    sleep: "app.onboarding.listenSleep",
  } as const;
  return map[id];
}

export function OnboardingForm() {
  const { t } = useIntl();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [bringReason, setBringReason] = useState("");
  const [preferredSessionLength, setPreferredSessionLength] = useState("10-15");
  const [stressLevel, setStressLevel] = useState(5);
  const [sensualContentMode, setSensualContentMode] = useState<SensualContentMode>("optional");
  const [voiceTonePref, setVoiceTonePref] = useState("warm");
  const [listeningTimePref, setListeningTimePref] = useState("evening");
  const [skipSensualInFeed, setSkipSensualInFeed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    setSaveError(null);
    try {
      await saveOnboarding({
        bringReason,
        preferredSessionLength,
        stressLevel,
        sensualContentMode,
        voiceTonePref,
        listeningTimePref,
        skipSensualInFeed,
      });
      await trackEvent("onboarding_completed", {});
      router.push("/app/mood");
      router.refresh();
    } catch {
      setSaveError(t("app.onboarding.saveError"));
    } finally {
      setLoading(false);
    }
  }

  const sensualChoices: [SensualContentMode, string][] = [
    ["welcome", t("app.onboarding.sensualWelcome")],
    ["optional", t("app.onboarding.sensualOptional")],
    ["hidden", t("app.onboarding.sensualHidden")],
  ];

  return (
    <div className="mt-8 space-y-8">
      {saveError ? <InlineError>{saveError}</InlineError> : null}
      {step === 0 && (
        <div className="space-y-3">
          <Label>{t("app.onboarding.q1Label")}</Label>
          <CrisisGuardTextarea
            value={bringReason}
            onChange={(e) => setBringReason(e.target.value)}
            placeholder={t("app.onboarding.q1Placeholder")}
          />
          <Button type="button" onClick={() => setStep(1)} disabled={bringReason.length < 3}>
            {t("app.onboarding.continue")}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Label>{t("app.onboarding.lengthLabel")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {LENGTHS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setPreferredSessionLength(l)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  preferredSessionLength === l ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {l} {t("sessionCard.min")}
              </button>
            ))}
          </div>
          <Label className="pt-2">{t("app.onboarding.stressLabel")}</Label>
          <input
            type="range"
            min={1}
            max={10}
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <p className="text-sm text-muted-foreground">{stressLevel}</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(0)}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" onClick={() => setStep(2)}>
              {t("app.onboarding.continue")}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Label>{t("app.onboarding.sensualTitle")}</Label>
          <p className="text-sm text-muted-foreground">{t("app.onboarding.sensualHint")}</p>
          <div className="grid gap-2">
            {sensualChoices.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSensualContentMode(id)}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${
                  sensualContentMode === id ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <SoftToggle
            id="skip-sensual"
            label={t("app.onboarding.skipSensual")}
            checked={skipSensualInFeed}
            onCheckedChange={setSkipSensualInFeed}
          />
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" onClick={() => setStep(3)}>
              {t("app.onboarding.continue")}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Label>{t("app.onboarding.voiceLabel")}</Label>
          <VoiceStyleSelector value={voiceTonePref} onChange={setVoiceTonePref} />
          <Label className="pt-2">{t("app.onboarding.listenLabel")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {LISTEN_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setListeningTimePref(id)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  listeningTimePref === id ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {t(listenKey(id))}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" onClick={finish} disabled={loading}>
              {loading ? t("app.onboarding.finishing") : t("app.onboarding.finish")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
