import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-[color,box-shadow,background-color,border-color] duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary/28 bg-primary/[0.09] text-primary shadow-inner"
          : "border-border/55 bg-card/80 text-muted-foreground hover:border-border/80 hover:bg-card hover:text-foreground/88"
      )}
    >
      {label}
    </Link>
  );
}
