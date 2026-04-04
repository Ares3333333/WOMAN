import { cn } from "@/lib/utils";

/** Tonal washes: narrow chroma, daylight on paper — not decorative rainbows. */
const innerFill: Record<string, string> = {
  "rose-plum":
    "bg-[linear-gradient(148deg,hsl(350,26%,94%)_0%,hsl(300,12%,96%)_48%,hsl(280,14%,91%)_100%)] text-charcoal",
  "cream-mauve":
    "bg-[linear-gradient(148deg,hsl(36,28%,96%)_0%,hsl(310,10%,95%)_50%,hsl(280,10%,92%)_100%)] text-charcoal",
  dusk: "bg-[linear-gradient(148deg,hsl(260,14%,93%)_0%,hsl(290,12%,92%)_50%,hsl(320,14%,90%)_100%)] text-charcoal",
  sleep:
    "bg-[linear-gradient(165deg,hsl(250,20%,17%)_0%,hsl(275,16%,20%)_45%,hsl(305,14%,19%)_100%)] text-white/95",
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
        isSleep ? "border-white/[0.08] bg-white/[0.06]" : "border-border/45 bg-border/25",
        className
      )}
    >
      <div className={cn("rounded-2xl p-6 md:p-7", fill)}>{children}</div>
    </div>
  );
}
