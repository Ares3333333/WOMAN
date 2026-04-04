"use client";

import Link from "next/link";
import type { IntensityLevel } from "@prisma/client";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/premium-badge";
import { useIntl } from "@/components/intl-provider";

export type SessionCardVariant =
  | "hero"
  | "support"
  | "standard"
  | "compact"
  | "premiumSpotlight";

export function SessionCard({
  href,
  title,
  description,
  durationMinutes,
  gradientKey,
  favorited,
  premium,
  variant = "standard",
  categoryLabel,
  intensity,
  stateLabel,
}: {
  href: string;
  title: string;
  description: string;
  durationMinutes: number;
  gradientKey?: string;
  favorited?: boolean;
  premium?: boolean;
  variant?: SessionCardVariant;
  categoryLabel?: string;
  intensity?: IntensityLevel;
  stateLabel?: string;
}) {
  const { t } = useIntl();
  const isSleep = gradientKey === "sleep";
  const isHero = variant === "hero";
  const isSupport = variant === "support";
  const isCompact = variant === "compact";
  const isSpotlight = variant === "premiumSpotlight";
  const isStandard = variant === "standard";

  const intensityShort = intensity ? t(`sessionCard.intensity.${intensity}`) : null;

  const sleepInner =
    "bg-gradient-to-b from-muted/25 via-card to-[hsl(270,14%,16%)] text-white dark:from-[hsl(255,18%,14%)] dark:via-[hsl(275,14%,10%)] dark:to-[hsl(295,12%,8%)]";
  const spotlightInner =
    "bg-gradient-to-br from-primary/[0.12] via-card to-muted/30 dark:from-primary/[0.14] dark:via-card dark:to-muted/40";
  const standardInner =
    "bg-gradient-to-br from-card via-card to-muted/[0.35] dark:from-card dark:via-card dark:to-muted/25";

  const shell = cn(
    "group block overflow-hidden transition-[border-color,box-shadow,transform] duration-300 ease-out",
    isHero &&
      "rounded-lg border border-border/60 bg-card shadow-[0_1px_0_0_hsl(var(--foreground)/0.04)] dark:border-white/[0.08]",
    isSupport &&
      "rounded-lg border border-border/55 bg-card/90 dark:border-white/[0.06] dark:bg-card/70",
    isStandard && "rounded-lg border border-border/55 bg-card/95 dark:border-white/[0.06]",
    isCompact && "rounded-md border border-border/50 dark:border-white/[0.05]",
    isSpotlight &&
      "rounded-lg border border-primary/35 shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.12)] ring-1 ring-primary/15 dark:border-primary/40"
  );

  const inner = cn(
    "relative",
    isHero && "border-l-[3px] border-primary px-6 py-8 md:px-8 md:py-10",
    isSupport && "px-4 py-4 sm:px-5 sm:py-4",
    isStandard && "px-5 py-5",
    isCompact && "px-3.5 py-3",
    isSpotlight && "px-5 py-5 md:px-6 md:py-6",
    isSleep ? sleepInner : isSpotlight ? spotlightInner : isHero || isSupport ? standardInner : standardInner
  );

  const durationNode = (
    <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
      <Clock className={cn("h-3 w-3 shrink-0 opacity-80", isSleep && "text-white/70")} aria-hidden />
      <span
        className={cn(
          isSleep ? "text-white/85" : "text-foreground/85",
          "text-xs font-medium tabular-nums tracking-normal"
        )}
      >
        {durationMinutes}
        <span className="mx-0.5 font-normal opacity-45">·</span>
        {t("sessionCard.min")}
      </span>
    </span>
  );

  if (isSupport) {
    return (
      <motion.div layout whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}>
        <Link href={href} className={shell}>
          <div className={cn(inner, isSleep && sleepInner)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1">
                {categoryLabel ? (
                  <p
                    className={cn(
                      "text-[0.6rem] font-semibold uppercase tracking-[0.2em]",
                      isSleep ? "text-white/50" : "text-muted-foreground"
                    )}
                  >
                    {categoryLabel}
                  </p>
                ) : null}
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3
                    className={cn(
                      "font-display text-[1.05rem] font-medium leading-snug tracking-tight",
                      isSleep ? "text-white" : "text-foreground"
                    )}
                  >
                    {title}
                  </h3>
                  {premium ? (
                    <PremiumBadge variant="editorial" className={cn(isSleep && "!text-white/65")} />
                  ) : null}
                </div>
                {description ? (
                  <p
                    className={cn(
                      "mt-1 line-clamp-1 text-sm leading-relaxed",
                      isSleep ? "text-white/65" : "text-muted-foreground"
                    )}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-x-2 text-[0.65rem] font-medium uppercase tracking-wider",
                    isSleep ? "text-white/55" : "text-muted-foreground"
                  )}
                >
                  {stateLabel ? (
                    <span className="normal-case tracking-normal text-xs text-foreground/80">{stateLabel}</span>
                  ) : null}
                  {stateLabel ? <span className="opacity-35">·</span> : null}
                  {durationNode}
                  {intensityShort ? <span className="opacity-35">·</span> : null}
                  {intensityShort ? (
                    <span className="normal-case tracking-normal text-xs text-foreground/75">{intensityShort}</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {favorited ? (
                    <Heart
                      className={cn(
                        "h-4 w-4 shrink-0 fill-primary text-primary",
                        isSleep && "fill-white/20 text-white/90"
                      )}
                      aria-hidden
                    />
                  ) : null}
                  <ChevronRight
                    className={cn("h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5", isSleep && "text-white/50")}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (isHero) {
    return (
      <motion.div layout whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 320, damping: 26 }}>
        <Link href={href} className={shell}>
          <div className={cn(inner, isSleep ? sleepInner : "bg-card dark:bg-card")}>
            <div className={cn("mb-5 h-px w-12", isSleep ? "bg-white/20" : "bg-primary/40")} aria-hidden />
            {categoryLabel ? (
              <p
                className={cn(
                  "text-[0.6rem] font-semibold uppercase tracking-[0.22em]",
                  isSleep ? "text-white/50" : "text-muted-foreground"
                )}
              >
                {categoryLabel}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
              <h3
                className={cn(
                  "max-w-[20ch] font-display text-2xl font-medium leading-[1.15] tracking-tight md:max-w-none md:text-[1.85rem]",
                  isSleep ? "text-white" : "text-foreground"
                )}
              >
                {title}
              </h3>
              {premium ? (
                <PremiumBadge variant="editorial" className={cn("mb-0.5", isSleep && "!text-white/65")} />
              ) : null}
            </div>
            {description ? (
              <p
                className={cn(
                  "mt-4 max-w-xl text-[0.9375rem] leading-relaxed md:text-base",
                  isSleep ? "text-white/72" : "text-muted-foreground"
                )}
              >
                {description}
              </p>
            ) : null}
            <div
              className={cn(
                "mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6",
                isSleep ? "border-white/12" : "border-border/40"
              )}
            >
              <div
                className={cn(
                  "flex flex-wrap items-center gap-x-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em]",
                  isSleep ? "text-white/55" : "text-muted-foreground"
                )}
              >
                {durationNode}
                {intensityShort ? <span className="opacity-35">·</span> : null}
                {intensityShort ? (
                  <span className="normal-case text-xs font-medium tracking-normal text-foreground/80">
                    {intensityShort}
                  </span>
                ) : null}
              </div>
              {favorited ? (
                <Heart className={cn("h-4 w-4 fill-primary text-primary", isSleep && "fill-white/25 text-white")} aria-hidden />
              ) : (
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSleep ? "text-white/45" : "text-primary/90"
                  )}
                >
                  {t("sessionCard.heroHint")}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  const titleClass = cn(
    "font-display font-medium tracking-tight text-balance",
    isStandard && "text-[1.0625rem] leading-snug md:text-lg",
    isCompact && "text-[0.9rem] leading-snug",
    isSpotlight && "text-[1.08rem] leading-snug md:text-[1.15rem]",
    isSleep && "text-white"
  );

  const descClass = cn(
    "leading-relaxed",
    isStandard && "mt-2.5 line-clamp-2 text-sm text-muted-foreground",
    isCompact && "mt-1 line-clamp-1 text-xs text-muted-foreground",
    isSpotlight && "mt-2 line-clamp-2 text-sm text-muted-foreground",
    isSleep && "text-white/72"
  );

  const eyebrowClass = cn(
    "text-[0.6rem] font-semibold uppercase tracking-[0.2em]",
    isSleep ? "text-white/50" : "text-muted-foreground"
  );

  const metaClass = cn(
    "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em]",
    isSleep ? "text-white/55" : "text-muted-foreground/90",
    isCompact && "text-[0.6rem]"
  );

  const motionY = isCompact ? -1 : -2;

  return (
    <motion.div layout whileHover={{ y: motionY }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
      <Link href={href} className={shell}>
        <div className={cn(inner, isSleep ? sleepInner : isSpotlight ? spotlightInner : standardInner)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {categoryLabel && !isCompact ? <p className={cn(eyebrowClass, "mb-1.5")}>{categoryLabel}</p> : null}
              {categoryLabel && isCompact ? (
                <p className={cn(eyebrowClass, "mb-1 line-clamp-1 opacity-80")}>{categoryLabel}</p>
              ) : null}
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className={titleClass}>{title}</h3>
                {premium && isSpotlight ? (
                  <PremiumBadge variant="editorial" className={cn(isSleep && "text-white/75")} />
                ) : null}
              </div>
            </div>
            {favorited ? (
              <Heart
                className={cn("h-4 w-4 shrink-0 fill-primary text-primary", isSleep && "fill-white/25 text-white/90")}
                aria-hidden
              />
            ) : null}
          </div>

          {description ? <p className={descClass}>{description}</p> : null}

          <div
            className={cn(
              "mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-border/30 pt-4",
              isStandard && "border-t",
              isCompact && "mt-3 border-t border-border/25 pt-3",
              isSpotlight && "border-t border-primary/10",
              isSleep && "border-white/12"
            )}
          >
            <div className={cn(metaClass, "min-w-0 flex-1")}>
              {stateLabel ? (
                <span className={cn("normal-case tracking-normal text-xs", isSleep ? "text-white/78" : "text-foreground/78")}>
                  {stateLabel}
                </span>
              ) : null}
              {stateLabel ? <span className="opacity-35">·</span> : null}
              {durationNode}
              {intensityShort ? <span className="opacity-35">·</span> : null}
              {intensityShort ? (
                <span className={cn("normal-case tracking-normal text-xs", isSleep ? "text-white/72" : "text-foreground/72")}>
                  {intensityShort}
                </span>
              ) : null}
            </div>
            {premium && !isSpotlight ? (
              <PremiumBadge variant="editorial" className={cn("ml-auto", isSleep && "text-white/65")} />
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
