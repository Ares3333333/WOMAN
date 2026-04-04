"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function MoodChip({
  label,
  description,
  selected,
  onSelect,
  index = 0,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  index?: number;
}) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: index * 0.035 }}
      whileTap={{ scale: 0.985 }}
      onClick={onSelect}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow] duration-200",
        selected
          ? "border-primary/45 bg-gradient-to-br from-primary/[0.12] via-primary/[0.06] to-transparent shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.1),0_12px_40px_-28px_hsl(var(--shadow-hsl)/0.85)]"
          : "border-border/70 bg-card/40 shadow-inner hover:border-border hover:bg-accent/35"
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-[3px] rounded-l-xl transition-opacity duration-200",
          selected ? "bg-primary opacity-100" : "bg-primary/0 opacity-0 group-hover:bg-primary/25 group-hover:opacity-100"
        )}
        aria-hidden
      />
      <span className="flex items-start justify-between gap-3 pl-1">
        <span className="min-w-0 space-y-1">
          <span className="block font-display text-[1.0625rem] font-medium leading-snug tracking-tight text-foreground">
            {label}
          </span>
          <span className="block text-[0.8125rem] leading-relaxed text-muted-foreground">{description}</span>
        </span>
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-[border-color,background-color,color,opacity] duration-200",
            selected
              ? "border-primary/35 bg-primary/15 text-primary"
              : "border-border/50 bg-muted/20 text-transparent"
          )}
          aria-hidden
        >
          <Check className="h-4 w-4 stroke-[2.25]" />
        </span>
      </span>
    </motion.button>
  );
}
