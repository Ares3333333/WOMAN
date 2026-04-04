"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIntl } from "@/components/intl-provider";

const PILLARS = [
  { title: "app.premium.pillar1Title", body: "app.premium.pillar1Body" },
  { title: "app.premium.pillar2Title", body: "app.premium.pillar2Body" },
  { title: "app.premium.pillar3Title", body: "app.premium.pillar3Body" },
  { title: "app.premium.pillar4Title", body: "app.premium.pillar4Body" },
  { title: "app.premium.pillar5Title", body: "app.premium.pillar5Body" },
  { title: "app.premium.pillar6Title", body: "app.premium.pillar6Body" },
] as const;

const COMPARE_ROWS = [
  {
    label: "app.premium.rowLibrary",
    explorer: "app.premium.compare.libExplorer",
    signature: "app.premium.compare.libSignature",
  },
  {
    label: "app.premium.rowEvening",
    explorer: "app.premium.compare.eveExplorer",
    signature: "app.premium.compare.eveSignature",
  },
  {
    label: "app.premium.rowPaths",
    explorer: "app.premium.compare.pathExplorer",
    signature: "app.premium.compare.pathSignature",
  },
  {
    label: "app.premium.rowContinuity",
    explorer: "app.premium.compare.contExplorer",
    signature: "app.premium.compare.contSignature",
  },
  {
    label: "app.premium.rowDepth",
    explorer: "app.premium.compare.deepExplorer",
    signature: "app.premium.compare.deepSignature",
  },
  {
    label: "app.premium.rowExperience",
    explorer: "app.premium.compare.expExplorer",
    signature: "app.premium.compare.expSignature",
  },
] as const;

export function PremiumPaywall({ isSubscriber }: { isSubscriber: boolean }) {
  const { t } = useIntl();

  if (isSubscriber) {
    return (
      <div className="mx-auto max-w-lg space-y-10 pb-8 pt-4">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-card to-muted/20 p-8 shadow-sm md:p-10">
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            {t("app.premium.activeEyebrow")}
          </p>
          <h1 className="mt-4 font-display text-3xl font-medium tracking-tight">{t("app.premium.activeTitle")}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t("app.premium.activeBody")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/app">{t("app.premium.activeHome")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/app/library">{t("app.premium.activeLibrary")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-16 pb-16 pt-2">
      <header className="space-y-5 text-center md:text-left">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/80">{t("app.premium.heroEyebrow")}</p>
        <h1 className="font-display text-[1.65rem] font-medium leading-tight tracking-tight text-foreground md:text-4xl">
          {t("app.premium.heroTitle")}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{t("app.premium.heroBody")}</p>
      </header>

      <section className="space-y-5">
        <h2 className="sr-only">{t("app.premium.pillarsSr")}</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((pillar) => (
            <li
              key={pillar.title}
              className="rounded-2xl border border-border/55 bg-card/70 px-6 py-5 shadow-soft backdrop-blur-sm"
            >
              <p className="font-display text-base font-medium text-foreground">{t(pillar.title)}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(pillar.body)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="signature-plans" className="scroll-mt-8 space-y-6">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">{t("app.premium.compareEyebrow")}</p>
          <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">{t("app.premium.compareTitle")}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{t("app.premium.compareSubtitle")}</p>
        </div>

        <div className="space-y-3 sm:hidden">
          {COMPARE_ROWS.map((row, i) => (
            <div key={i} className="rounded-2xl border border-border/55 bg-card/70 p-5 shadow-soft">
              <p className="font-display text-sm font-medium text-foreground">{t(row.label)}</p>
              <div className="mt-4">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {t("app.premium.tierExplorer")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(row.explorer)}</p>
              </div>
              <div className="mt-4 border-t border-border/40 pt-4">
                <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-primary">{t("app.premium.tierSignature")}</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{t(row.signature)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-3xl border border-border/50 bg-muted/[0.12] shadow-soft sm:block">
          <div className="grid grid-cols-[minmax(0,1fr)_1fr_1fr] gap-0 border-b border-border/40 bg-muted/35 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <div className="p-4" />
            <div className="border-l border-border/40 p-4">{t("app.premium.tierExplorer")}</div>
            <div className="border-l border-border/40 bg-primary/[0.06] p-4">{t("app.premium.tierSignature")}</div>
          </div>
          {COMPARE_ROWS.map((row, i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_1fr_1fr]",
                i % 2 === 0 ? "bg-card/30" : "bg-card/50"
              )}
            >
              <div className="p-4 text-sm font-medium text-foreground">{t(row.label)}</div>
              <div className="flex gap-3 border-l border-border/40 p-4">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
                <p className="text-sm leading-relaxed text-muted-foreground">{t(row.explorer)}</p>
              </div>
              <div className="flex gap-3 border-l border-border/40 bg-primary/[0.04] p-4">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <p className="text-sm font-medium leading-relaxed text-foreground">{t(row.signature)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-muted/15 p-8 shadow-sm md:p-10">
        <h2 className="font-display text-xl font-medium tracking-tight md:text-2xl">{t("app.premium.closingTitle")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{t("app.premium.closingBody")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild size="lg" className="h-12 rounded-full px-8 shadow-sm">
            <Link href="/app/settings#signature-membership" className="inline-flex items-center gap-2">
              {t("app.premium.ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="h-12 text-muted-foreground">
            <Link href="/app/library">{t("app.premium.ctaSecondary")}</Link>
          </Button>
        </div>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">{t("app.premium.billingNote")}</p>
      </section>
    </div>
  );
}
