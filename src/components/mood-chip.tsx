"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MoodChip({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      layout
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border px-4 py-3 text-left transition-colors",
        selected
          ? "border-primary/50 bg-primary/10 shadow-sm"
          : "border-border/80 bg-card/50 hover:bg-accent/40"
      )}
    >
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.button>
  );
}
