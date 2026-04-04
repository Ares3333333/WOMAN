"use client";

import { cn } from "@/lib/utils";

export function SoftToggle({
  checked,
  onCheckedChange,
  label,
  id,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label: string;
  id: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-8 w-14 rounded-full border border-border/80 transition-colors",
          checked ? "bg-primary/90" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-6 w-6 rounded-full bg-card shadow transition-transform",
            checked ? "left-7 translate-x-0" : "left-1"
          )}
        />
      </button>
      <span className="text-sm text-foreground/90">{label}</span>
    </label>
  );
}
