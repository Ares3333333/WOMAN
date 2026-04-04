import { cn } from "@/lib/utils";

/** Tonal washes: narrow chroma, daylight on paper — not decorative rainbows. */
const innerFill: Record<string, string> = {
  "rose-plum":
    "bg-[linear-gradient(148deg,hsl(350,26%,94%)_0%,hsl(300,12%,96%)_48%,hsl(280,14%,91%)_100%)] text-charcoal dark:bg-[linear-gradient(148deg,hsl(255,14%,13%)_0%,hsl(268,11%,10%)_48%,hsl(275,9%,8%)_100%)] dark:text-foreground",
  "cream-mauve":
    "bg-[linear-gradient(148deg,hsl(36,28%,96%)_0%,hsl(310,10%,95%)_50%,hsl(280,10%,92%)_100%)] text-charcoal dark:bg-[linear-gradient(148deg,hsl(252,12%,12%)_0%,hsl(268,10%,9%)_50%,hsl(278,8%,7%)_100%)] dark:text-foreground",
  dusk:
    "bg-[linear-gradient(148deg,hsl(260,14%,93%)_0%,hsl(290,12%,92%)_50%,hsl(320,14%,90%)_100%)] text-charcoal dark:bg-[linear-gradient(148deg,hsl(248,13%,11%)_0%,hsl(258,11%,9%)_50%,hsl(268,9%,7%)_100%)] dark:text-foreground",
  sleep:
    "bg-[linear-gradient(165deg,hsl(250,20%,17%)_0%,hsl(275,16%,20%)_45%,hsl(305,14%,19%)_100%)] text-white/95 dark:bg-[linear-gradient(165deg,hsl(248,24%,10%)_0%,hsl(278,18%,8%)_45%,hsl(298,14%,7%)_100%)] dark:text-white/95",
};

export function GradientCard({
  gradientKey,
  className,
  children,
}: {
  gradientKey?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const key = gradientKey ?? "rose-plum";
  const fill = innerFill[key] ?? innerFill["rose-plum"];
  const isSleep = key === "sleep";

  return (
    <div
      className={cn(
        "rounded-2xl border p-[1px] shadow-soft",
        isSleep
          ? "border-white/[0.08] bg-white/[0.06] dark:border-white/[0.07]"
          : "border-border/45 bg-border/25 dark:border-border/60 dark:bg-border/40",
        className
      )}
    >
      <div className={cn("rounded-2xl p-6 md:p-7", fill)}>{children}</div>
    </div>
  );
}
