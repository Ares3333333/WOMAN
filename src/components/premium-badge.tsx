"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntl } from "@/components/intl-provider";

export function PremiumBadge({ className }: { className?: string }) {
  const { t } = useIntl();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary",
        className
      )}
    >
      <Sparkles className="h-3 w-3" />
      {t("premiumBadge")}
    </span>
  );
}
