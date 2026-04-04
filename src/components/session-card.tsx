"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/premium-badge";
import { useIntl } from "@/components/intl-provider";

export function SessionCard({
  href,
  title,
  description,
  durationMinutes,
  gradientKey,
  favorited,
  premium,
}: {
  href: string;
  title: string;
  description: string;
  durationMinutes: number;
  gradientKey?: string;
  favorited?: boolean;
  premium?: boolean;
}) {
  const { t } = useIntl();
  const bg =
    gradientKey === "sleep"
      ? "from-[hsl(260,22%,28%)] to-[hsl(310,20%,24%)] text-white"
      : "from-[hsl(350,40%,94%)] to-[hsl(280,18%,90%)] text-charcoal";

  return (
    <motion.div layout whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
      <Link
        href={href}
        className="group block overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-sm backdrop-blur-sm"
      >
        <div className={cn("bg-gradient-to-br px-5 py-4", bg)}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-medium leading-snug">{title}</h3>
            {favorited ? (
              <Heart className="h-4 w-4 shrink-0 fill-primary text-primary" aria-hidden />
            ) : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm opacity-80">{description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs opacity-90">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">
              <Clock className="h-3 w-3" />
              {durationMinutes} {t("sessionCard.min")}
            </span>
            {premium ? <PremiumBadge className="border-white/20 bg-white/10 text-white" /> : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
