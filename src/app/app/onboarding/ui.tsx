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

const DATA_STEPS = 4;
const TRANSITION_STEP = 4;
const TOTAL_SEGMENTS = 5;

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
        "rounded-2xl border px-4 py-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        selected
          ? "border-primary/45 bg-primary/[0.08] shadow-sm ring-1 ring-primary/20"
          : "border-border/60 bg-card/40 hover:border-border hover:bg-muted/25",
        className
      )}
    >
      <p className="font-display text-base font-medium leading-snug text-foreground">{title}</p>
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
          <div className="rounded-3xl border border-border/50 bg-gradient-to-b from-muted/30 to-card/30 p-1 shadow-sm">
            <CrisisGuardTextarea
              value={bringReason}
              onChange={(e) => setBringReason(e.target.value)}
              placeholder={t("app.onboarding.q1Placeholder")}
              className="min-h-[132px] resize-none border-0 bg-transparent px-4 py-4 text-base shadow-none focus-visible:ring-0"
            />
          </div>
          <nav className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" size="lg" className="h-12 rounded-full px-8" onClick={() => setStep(1)} disabled={bringReason.length < 3}>
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
            <Button type="button" size="lg" className="rounded-full px-8" onClick={() => setStep(2)}>
              {t("app.onboarding.continue")}
            </Button>
          </nav>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <header className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/80">{t("app.onboarding.boundariesEyebrow")}</p>
            <h1 className="font-display text-3xl font-medium tracking-tight md:text-[2rem]">{t("app.onboarding.boundariesTitle")}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{t("app.onboarding.boundariesDesc")}</p>
          </header>
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
          <div className="rounded-2xl border border-border/40 bg-card/50 px-4 py-4">
            <SoftToggle
              id="skip-sensual"
              label={t("app.onboarding.skipSensual")}
              checked={skipSensualInFeed}
              onCheckedChange={setSkipSensualInFeed}
            />
          </div>
          <nav className="flex flex-col-reverse gap-3 border-t border-border/30 pt-8 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => setStep(1)}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" size="lg" className="rounded-full px-8" onClick={() => setStep(3)}>
              {t("app.onboarding.continue")}
            </Button>
          </nav>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <header className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/80">{t("app.onboarding.soundEyebrow")}</p>
            <h1 className="font-display text-3xl font-medium tracking-tight md:text-[2rem]">{t("app.onboarding.soundTitle")}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{t("app.onboarding.soundDesc")}</p>
          </header>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{t("app.onboarding.voiceSectionLabel")}</p>
            <VoiceStyleSelector variant="rich" value={voiceTonePref} onChange={setVoiceTonePref} />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">{t("app.onboarding.listenSectionLabel")}</p>
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
            <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => setStep(2)}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" size="lg" className="rounded-full px-8" onClick={() => setStep(TRANSITION_STEP)}>
              {t("app.onboarding.toTransition")}
            </Button>
          </nav>
        </div>
      )}

      {step === TRANSITION_STEP && (
        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-card to-muted/20 p-8 shadow-sm md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">{t("app.onboarding.transitionEyebrow")}</p>
            <h1 className="mt-4 font-display text-2xl font-medium leading-snug tracking-tight text-foreground md:text-3xl">{transitionHeadline}</h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{t("app.onboarding.transitionBody")}</p>
            <ul className="mt-8 space-y-3 text-sm leading-relaxed text-foreground/90">
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                <span>{t("app.onboarding.transitionBullet1")}</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                <span>{t("app.onboarding.transitionBullet2")}</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                <span>{t("app.onboarding.transitionBullet3")}</span>
              </li>
            </ul>
          </div>
          <nav className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => setStep(3)} disabled={loading}>
              {t("app.onboarding.back")}
            </Button>
            <Button type="button" size="lg" className="h-12 rounded-full px-10 shadow-sm" onClick={finish} disabled={loading}>
              {loading ? t("app.onboarding.finishing") : t("app.onboarding.transitionCta")}
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
