"use client";

import { cn } from "@/lib/utils";
import { useIntl } from "@/components/intl-provider";

const STYLE_IDS = ["calm", "warm", "confident", "bedtime_soft"] as const;

function voiceLabelKey(id: (typeof STYLE_IDS)[number]): string {
  if (id === "bedtime_soft") return "voiceStyles.bedtime";
  return `voiceStyles.${id}`;
}

function voiceHintKey(id: (typeof STYLE_IDS)[number]): string {
  if (id === "bedtime_soft") return "voiceStyles.bedtimeHint";
  return `voiceStyles.${id}Hint`;
}

export function VoiceStyleSelector({
  value,
  onChange,
  variant = "default",
}: {
  value: string;
  onChange: (v: string) => void;
  variant?: "default" | "rich";
}) {
  const { t } = useIntl();
  const rich = variant === "rich";
  return (
    <div className={cn("grid sm:grid-cols-2", rich ? "gap-3" : "gap-2")}>
      {STYLE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "text-left transition-all",
            rich
              ? cn(
                  "rounded-2xl border px-5 py-4 shadow-sm",
                  value === id
                    ? "border-primary/45 bg-primary/[0.09] ring-2 ring-primary/25"
                    : "border-border/60 bg-card/50 hover:border-border hover:bg-muted/30"
                )
              : cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  value === id
                    ? "border-primary/50 bg-primary/10"
                    : "border-border/80 bg-card/40 hover:bg-accent/40"
                )
          )}
        >
          <p className={cn("font-medium", rich && "font-display text-base")}>{t(voiceLabelKey(id))}</p>
          <p className={cn("text-muted-foreground", rich ? "mt-1.5 text-sm leading-relaxed" : "text-sm")}>
            {t(voiceHintKey(id))}
          </p>
        </button>
      ))}
    </div>
  );
}
