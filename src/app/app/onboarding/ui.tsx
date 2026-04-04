"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SensualContentMode } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CrisisGuardTextarea } from "@/components/crisis-guard-textarea";
import { VoiceStyleSelector } from "@/components/voice-style-selector";
import { SoftToggle } from "@/components/soft-toggle";
import { saveOnboarding } from "@/app/actions/onboarding";
import { trackEvent } from "@/lib/analytics";
import { InlineError } from "@/components/states/inline-alert";
import { useIntl } from "@/components/intl-provider";

const LENGTHS = ["5-8", "10-15", "15+", "varies"] as const;
const LISTEN_IDS = ["morning", "afternoon", "evening", "sleep"] as const;

/** Three configuration beats + transition (merged boundaries + sound into one beat). */
const DATA_STEPS = 3;
const TRANSITION_STEP = 3;
const TOTAL_SEGMENTS = 4;

function listenKey(id: (typeof LISTEN_IDS)[number]): string {
  const map = {
    morning: "app.onboarding.listenMorning",
    afternoon: "app.onboarding.listenAfternoon",
    evening: "app.onboarding.listenEvening",
    sleep: "app.onboarding.listenSleep",
  } as const;
  return map[id];
}

function listenHintKey(id: (typeof LISTEN_IDS)[number]): string {
  const map = {
    morning: "app.onboarding.listenMorningHint",
    afternoon: "app.onboarding.listenAfternoonHint",
    evening: "app.onboarding.listenEveningHint",
    sleep: "app.onboarding.listenSleepHint",
  } as const;
  return map[id];
}

function lengthTitleKey(l: (typeof LENGTHS)[number]): string {
  const map = {
    "5-8": "app.onboarding.length58Title",
    "10-15": "app.onboarding.length1015Title",
    "15+": "app.onboarding.length15pTitle",
    varies: "app.onboarding.lengthVariesTitle",
  } as const;
  return map[l];
}

function lengthHintKey(l: (typeof LENGTHS)[number]): string {
  const map = {
    "5-8": "app.onboarding.length58Hint",
    "10-15": "app.onboarding.length1015Hint",
    "15+": "app.onboarding.length15pHint",
    varies: "app.onboarding.lengthVariesHint",
  } as const;
  return map[l];
}

function stressBandKey(level: number): string {
  if (level <= 3) return "app.onboarding.stressBandLow";
  if (level <= 6) return "app.onboarding.stressBandMid";
  return "app.onboarding.stressBandHigh";
}

function OnboardingProgress({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-300",
            i <= step ? "bg-primary/80" : "bg-muted-foreground/15"
          )}
        />
      ))}
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  title,
  description,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border-l-[3px] border border-border/50 bg-card/50 px-4 py-4 text-left transition-[border-color,background-color,box-shadow] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "border-primary/50 border-l-primary bg-primary/[0.09] shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.03)]"
          : "border-l-transparent hover:border-border hover:bg-muted/30",
        className
      )}
    >
      <p className="font-display text-[0.95rem] font-medium leading-snug tracking-tight text-foreground">{title}</p>
      {description ? <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
    </button>
  );
}

export function OnboardingForm({ givenName }: { givenName?: string | null }) {
  const { t } = useIntl();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [bringReason, setBringReason] = useState("");
  const [preferredSessionLength, setPreferredSessionLength] = useState<(typeof LENGTHS)[number]>("10-15");
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

  const sensualChoices: [SensualContentMode, string, string][] = [
    ["welcome", t("app.onboarding.sensualWelcome"), t("app.onboarding.sensualWelcomeDesc")],
    ["optional", t("app.onboarding.sensualOptional"), t("app.onboarding.sensualOptionalDesc")],
    ["hidden", t("app.onboarding.sensualHidden"), t("app.onboarding.sensualHiddenDesc")],
  ];

  const transitionHeadline =
    givenName && givenName.length > 0
      ? t("app.onboarding.transitionTitleNamed").replace("{name}", givenName)
      : t("app.onboarding.transitionTitleAnonymous");

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-10 space-y-3">
        <OnboardingProgress step={step} />
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {step < DATA_STEPS
            ? t("app.onboarding.progressStep")
                .replace("{current}", String(step + 1))
                .replace("{total}", String(DATA_STEPS))
            : t("app.onboarding.progressFinal")}
        </p>
      </div>

      {saveError ? (
        <div className="mb-8">
          <InlineError>{saveError}</InlineError>
        </div>
      ) : null}

      {step === 0 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <header className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/80">{t("app.onboarding.arrivalEyebrow")}</p>
            <h1 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-[2rem]">
              {t("app.onboarding.arrivalTitle")}
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">{t("app.onboarding.arrivalDesc")}</p>
          </header>
          <div className="rounded-lg border border-border/50 bg-muted/15 p-1">
            <CrisisGuardTextarea
              value={bringReason}
              onChange={(e) => setBringReason(e.target.value)}
              placeholder={t("app.onboarding.q1Placeholder")}
              className="min-h-[132px] resize-none border-0 bg-transparent px-4 py-4 text-base shadow-none focus-visible:ring-0"
            />
          </div>
          <nav className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" size="lg" className="h-12 rounded-md px-8" onClick={() => setStep(1)} disabled={bringReason.length < 3}>
              {t("app.onboarding.continue")}
            </Button>
          </nav>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <header className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/80">{t("app.onboarding.paceEyebrow")}</p>
            <h1 className="font-display text-3xl font-medium tracking-tight md:text-[2rem]">{t("app.onboarding.paceTitle")}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{t("app.onboarding.paceDesc")}</p>
          </header>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{t("app.onboarding.lengthSectionLabel")}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LENGTHS.map((l) => (
                <ChoiceCard
                  key={l}
                  selected={preferredSessionLength === l}
                  onClick={() => setPreferredSessionLength(l)}
                  title={t(lengthTitleKey(l))}
                  description={t(lengthHintKey(l))}
                  className="sm:min-h-[108px]"
                />
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-border/45 bg-muted/15 px-5 py-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{t("app.onboarding.stressSectionLabel")}</p>
              <span className="font-display text-2xl tabular-nums text-primary">{stressLevel}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label={t("app.onboarding.stressSectionLabel")}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("app.onboarding.stressScaleLow")}</span>
              <span>{t("app.onboarding.stressScaleHigh")}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{t(stressBandKey(stressLevel))}</p>
          </div>
          <nav className="flex flex-col-reverse gap-3 border-t border-border/30 pt-8 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => setStep(0)}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" size="lg" className="rounded-md px-8" onClick={() => setStep(2)}>
              {t("app.onboarding.continue")}
            </Button>
          </nav>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <header className="space-y-4">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/90">{t("app.onboarding.spaceEyebrow")}</p>
            <h1 className="font-display text-[1.75rem] font-medium leading-tight tracking-tight md:text-[2rem]">
              {t("app.onboarding.spaceTitle")}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{t("app.onboarding.spaceDesc")}</p>
          </header>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("app.onboarding.boundariesShortLabel")}</p>
            <div className="grid gap-3">
              {sensualChoices.map(([id, label, desc]) => (
                <ChoiceCard
                  key={id}
                  selected={sensualContentMode === id}
                  onClick={() => setSensualContentMode(id)}
                  title={label}
                  description={desc}
                />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-4">
            <SoftToggle
              id="skip-sensual"
              label={t("app.onboarding.skipSensual")}
              checked={skipSensualInFeed}
              onCheckedChange={setSkipSensualInFeed}
            />
          </div>

          <div className="border-t border-border/40 pt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("app.onboarding.voiceSectionLabel")}</p>
            <div className="mt-3">
              <VoiceStyleSelector variant="rich" value={voiceTonePref} onChange={setVoiceTonePref} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("app.onboarding.listenSectionLabel")}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LISTEN_IDS.map((id) => (
                <ChoiceCard
                  key={id}
                  selected={listeningTimePref === id}
                  onClick={() => setListeningTimePref(id)}
                  title={t(listenKey(id))}
                  description={t(listenHintKey(id))}
                />
              ))}
            </div>
          </div>

          <nav className="flex flex-col-reverse gap-3 border-t border-border/30 pt-8 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => setStep(1)}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" size="lg" className="rounded-md px-8" onClick={() => setStep(TRANSITION_STEP)}>
              {t("app.onboarding.toTransition")}
            </Button>
          </nav>
        </div>
      )}

      {step === TRANSITION_STEP && (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-b from-primary/[0.08] via-card to-card p-8 md:p-10">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("app.onboarding.transitionEyebrow")}</p>
            <h1 className="mt-4 font-display text-2xl font-medium leading-snug tracking-tight text-foreground md:text-[1.75rem]">{transitionHeadline}</h1>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">{t("app.onboarding.transitionBody")}</p>
            <ul className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/95">
              <li className="border-l-2 border-primary/35 pl-4">{t("app.onboarding.transitionBullet1")}</li>
              <li className="border-l-2 border-primary/35 pl-4">{t("app.onboarding.transitionBullet2")}</li>
              <li className="border-l-2 border-primary/35 pl-4">{t("app.onboarding.transitionBullet3")}</li>
            </ul>
          </div>
          <nav className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => setStep(2)} disabled={loading}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" size="lg" className="h-12 rounded-md px-10" onClick={finish} disabled={loading}>
              {loading ? t("app.onboarding.finishing") : t("app.onboarding.transitionCta")}
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
