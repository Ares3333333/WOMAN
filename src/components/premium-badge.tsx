"use client";

import { cn } from "@/lib/utils";
import { useIntl } from "@/components/intl-provider";

export function PremiumBadge({
  className,
  variant = "pill",
}: {
  className?: string;
  variant?: "pill" | "editorial";
}) {
  const { t } = useIntl();
  const editorial = (
    <span
      className={cn(
        "whitespace-nowrap text-[0.6rem] font-medium uppercase tracking-[0.2em] text-primary/75",
        className
      )}
    >
      {t("sessionCard.signatureMark")}
    </span>
  );
  if (variant === "editorial") {
    return editorial;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/18 bg-primary/[0.05] px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-primary/90 shadow-inner",
        className
      )}
    >
      {t("sessionCard.signatureMark")}
    </span>
  );
}
