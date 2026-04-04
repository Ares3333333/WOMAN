import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function InlineSuccess({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}

export function InlineError({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive",
        className
      )}
    >
      {children}
    </p>
  );
}
