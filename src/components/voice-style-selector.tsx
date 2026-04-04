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
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useIntl();
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {STYLE_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
            value === id
              ? "border-primary/50 bg-primary/10"
              : "border-border/80 bg-card/40 hover:bg-accent/40"
          )}
        >
          <p className="font-medium">{t(voiceLabelKey(id))}</p>
          <p className="text-muted-foreground">{t(voiceHintKey(id))}</p>
        </button>
      ))}
    </div>
  );
}
