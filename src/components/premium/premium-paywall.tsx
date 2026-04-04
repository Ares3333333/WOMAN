"use client";

import Link from "next/link";
import { ArrowRight, Check, Disc3 } from "lucide-react";
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

const TIER_POINTS = {
  explorer: [
    "app.premium.tierEx1",
    "app.premium.tierEx2",
    "app.premium.tierEx3",
  ],
  signature: [
    "app.premium.tierSig1",
    "app.premium.tierSig2",
    "app.premium.tierSig3",
  ],
} as const;

export function PremiumPaywall({ isSubscriber }: { isSubscriber: boolean }) {
  const { t } = useIntl();

  if (isSubscriber) {
    return (
      <div className="mx-auto max-w-lg space-y-8 pb-10 pt-2">
        <div className="rounded-lg border border-primary/25 bg-card/80 p-8 md:p-10">
          <div className="flex items-center gap-2">
            <Disc3 className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("app.premium.activeEyebrow")}</p>
          </div>
          <h1 className="mt-4 font-display text-2xl font-medium tracking-tight md:text-3xl">{t("app.premium.activeTitle")}</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{t("app.premium.activeBody")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-md">
              <Link href="/app">{t("app.premium.activeHome")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-md">
              <Link href="/app/library">{t("app.premium.activeLibrary")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-14 pb-16 pt-1">
      <header className="space-y-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/90">{t("app.premium.heroEyebrow")}</p>
        <h1 className="font-display text-[1.85rem] font-medium leading-[1.1] tracking-tight text-foreground md:text-[2.25rem]">
          {t("app.premium.heroTitle")}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{t("app.premium.heroBody")}</p>
      </header>

      <section aria-labelledby="tier-compare-heading" className="space-y-4">
        <h2 id="tier-compare-heading" className="font-display text-lg font-medium tracking-tight">
          {t("app.premium.compareTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("app.premium.compareSubtitle")}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border/55 bg-card/50 p-5 dark:border-white/[0.08]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("app.premium.tierExplorer")}</p>
            <p className="mt-2 font-display text-base font-medium">{t("app.premium.tierExplorerLead")}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {TIER_POINTS.explorer.map((key) => (
                <li key={key} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/[0.06] p-5 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.04)] dark:border-primary/35">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">{t("app.premium.tierSignature")}</p>
            <p className="mt-2 font-display text-base font-medium text-foreground">{t("app.premium.tierSignatureLead")}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground/90">
              {TIER_POINTS.signature.map((key) => (
                <li key={key} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="sr-only">{t("app.premium.pillarsSr")}</h2>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{t("app.premium.pillarsEyebrow")}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PILLARS.map((pillar, i) => (
            <li
              key={pillar.title}
              className={cn(
                "rounded-lg border border-border/50 px-4 py-4 dark:border-white/[0.06]",
                i % 2 === 0 ? "bg-card/40" : "bg-muted/15"
              )}
            >
              <p className="font-display text-[0.95rem] font-medium text-foreground">{t(pillar.title)}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground md:text-sm">{t(pillar.body)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="signature-plans" className="scroll-mt-8 rounded-lg border border-border/50 bg-muted/10 p-6 dark:border-white/[0.06] md:p-8">
        <h2 className="font-display text-lg font-medium tracking-tight">{t("app.premium.closingTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("app.premium.closingBody")}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="rounded-md">
            <Link href="/app/settings#signature-membership" className="inline-flex items-center gap-2">
              {t("app.premium.ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="rounded-md text-muted-foreground">
            <Link href="/app/library">{t("app.premium.ctaSecondary")}</Link>
          </Button>
        </div>
        <p className="mt-6 text-[0.7rem] leading-relaxed text-muted-foreground">{t("app.premium.billingNote")}</p>
      </section>
    </div>
  );
}
