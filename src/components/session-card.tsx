"use client";

import Link from "next/link";
import type { IntensityLevel } from "@prisma/client";
import { motion } from "framer-motion";
import { Clock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/premium-badge";
import { useIntl } from "@/components/intl-provider";

export type SessionCardVariant = "featured" | "standard" | "compact" | "premiumSpotlight";

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
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const isSpotlight = variant === "premiumSpotlight";

  const intensityShort = intensity ? t(`sessionCard.intensity.${intensity}`) : null;

  const shell = cn(
    "group block overflow-hidden border border-border/55 bg-card/95 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-200",
    isFeatured && "rounded-3xl border-border/50 shadow-md",
    isCompact && "rounded-xl border-border/50",
    !isFeatured && !isCompact && "rounded-2xl",
    isSpotlight && "border-primary/30 shadow-[0_1px_0_0_hsl(var(--primary)/0.06)] ring-1 ring-primary/10",
    isSleep && !isSpotlight && "border-border/40"
  );

  const inner = cn(
    "relative",
    isFeatured && "px-6 py-6 md:px-7 md:py-7",
    isCompact && "px-4 py-3.5",
    !isFeatured && !isCompact && "px-5 py-5",
    isSleep
      ? "bg-gradient-to-b from-muted/25 via-card to-[hsl(270,14%,16%)] text-white"
      : isSpotlight
        ? "bg-gradient-to-br from-primary/[0.04] via-card to-card"
        : "bg-gradient-to-br from-card via-card to-muted/[0.35]"
  );

  const titleClass = cn(
    "font-display font-medium tracking-tight text-balance",
    isFeatured && "text-xl leading-snug md:text-[1.35rem]",
    isCompact && "text-[0.95rem] leading-snug",
    !isFeatured && !isCompact && "text-[1.05rem] leading-snug md:text-lg",
    isSleep && "text-white"
  );

  const descClass = cn(
    "leading-relaxed",
    isFeatured && "mt-3 line-clamp-3 text-[0.9375rem] text-muted-foreground",
    isCompact && "mt-1 line-clamp-1 text-sm text-muted-foreground",
    !isFeatured && !isCompact && "mt-2.5 line-clamp-2 text-sm text-muted-foreground",
    isSleep && "text-white/75"
  );

  const eyebrowClass = cn(
    "text-[0.65rem] font-medium uppercase tracking-[0.2em]",
    isSleep ? "text-white/55" : "text-muted-foreground/90"
  );

  const metaClass = cn(
    "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] font-medium uppercase tracking-[0.14em]",
    isSleep ? "text-white/65" : "text-muted-foreground/85",
    isCompact && "text-[0.65rem]"
  );

  const durationNode = (
    <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
      <Clock className={cn("h-3 w-3 shrink-0 opacity-80", isSleep && "text-white/70")} aria-hidden />
      <span className={cn(isSleep ? "text-white/85" : "text-foreground/80", "text-xs font-normal tracking-normal")}>
        {durationMinutes}
        <span className="mx-0.5 opacity-50">·</span>
        {t("sessionCard.min")}
      </span>
    </span>
  );

  const motionY = isCompact ? -1 : -2;

  return (
    <motion.div layout whileHover={{ y: motionY }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
      <Link href={href} className={shell}>
        <div className={inner}>
          {isFeatured ? (
            <div className={cn("mb-4 h-px w-8 bg-primary/35", isSleep && "bg-white/25")} aria-hidden />
          ) : null}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {categoryLabel && !isCompact ? <p className={cn(eyebrowClass, "mb-2")}>{categoryLabel}</p> : null}
              {categoryLabel && isCompact ? (
                <p className={cn(eyebrowClass, "mb-1 line-clamp-1 opacity-80")}>{categoryLabel}</p>
              ) : null}
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h3 className={titleClass}>{title}</h3>
                {premium && isSpotlight ? (
                  <PremiumBadge variant="editorial" className={cn(isSleep && "text-white/80")} />
                ) : null}
              </div>
            </div>
            {favorited ? (
              <Heart
                className={cn(
                  "h-4 w-4 shrink-0 fill-primary text-primary",
                  isSleep && "fill-white/25 text-white/90"
                )}
                aria-hidden
              />
            ) : null}
          </div>

          {description ? <p className={descClass}>{description}</p> : null}

          <div
            className={cn(
              "mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-border/30 pt-4",
              isFeatured && "mt-5 border-t",
              isCompact && "mt-3 border-t border-border/25 pt-3",
              !isFeatured && !isCompact && "border-t",
              isSleep && "border-white/15"
            )}
          >
            <div className={cn(metaClass, "min-w-0 flex-1")}>
              {stateLabel ? (
                <span className={cn("normal-case tracking-normal", isSleep ? "text-white/80" : "text-foreground/75")}>
                  {stateLabel}
                </span>
              ) : null}
              {stateLabel ? <span className="opacity-40">·</span> : null}
              {durationNode}
              {intensityShort ? <span className="opacity-40">·</span> : null}
              {intensityShort ? (
                <span className={cn("normal-case tracking-normal", isSleep ? "text-white/75" : "text-foreground/70")}>
                  {intensityShort}
                </span>
              ) : null}
            </div>
            {premium && !isSpotlight ? (
              <PremiumBadge variant="editorial" className={cn("ml-auto", isSleep && "text-white/70")} />
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
