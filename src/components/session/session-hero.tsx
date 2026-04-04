import { cn } from "@/lib/utils";
import { PremiumBadge } from "@/components/premium-badge";

const heroInner: Record<string, string> = {
  "rose-plum":
    "bg-gradient-to-br from-[hsl(350,42%,96%)] via-[hsl(300,18%,97%)] to-[hsl(280,20%,93%)] text-charcoal dark:from-[hsl(255,14%,14%)] dark:via-[hsl(268,12%,11%)] dark:to-[hsl(275,10%,8%)] dark:text-foreground",
  "cream-mauve":
    "bg-gradient-to-br from-[hsl(35,38%,97%)] via-[hsl(310,16%,96%)] to-[hsl(280,14%,93%)] text-charcoal dark:from-[hsl(252,12%,13%)] dark:via-[hsl(270,10%,10%)] dark:to-[hsl(280,8%,8%)] dark:text-foreground",
  dusk:
    "bg-gradient-to-br from-[hsl(260,18%,94%)] via-[hsl(290,16%,93%)] to-[hsl(330,22%,92%)] text-charcoal dark:from-[hsl(248,14%,12%)] dark:via-[hsl(260,12%,9%)] dark:to-[hsl(270,10%,7%)] dark:text-foreground",
  sleep:
    "bg-gradient-to-br from-[hsl(240,24%,20%)] via-[hsl(280,18%,24%)] to-[hsl(310,20%,22%)] text-white/95 dark:from-[hsl(245,22%,12%)] dark:via-[hsl(275,18%,10%)] dark:to-[hsl(300,16%,8%)] dark:text-white/95",
};

export function SessionHero({
  gradientKey,
  categoryName,
  title,
  shortDescription,
  durationLabel,
  intensityLabel,
  premium,
  favoritedHint,
}: {
  gradientKey?: string;
  categoryName: string;
  title: string;
  shortDescription: string;
  durationLabel: string;
  intensityLabel: string;
  premium: boolean;
  favoritedHint: string;
}) {
  const g = gradientKey ?? "rose-plum";
  const inner = heroInner[g] ?? heroInner["rose-plum"];
  const isSleep = g === "sleep";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border p-[1px] shadow-sm",
        isSleep
          ? "border-white/10 bg-gradient-to-br from-white/15 to-transparent dark:border-white/[0.08]"
          : "border-border/40 bg-gradient-to-br from-white/50 to-border/20 dark:border-white/[0.06] dark:from-white/[0.04] dark:to-transparent"
      )}
    >
      <div className={cn("rounded-[1.4rem] px-6 py-8 md:px-9 md:py-10", inner)}>
        <p
          className={cn(
            "text-[0.65rem] font-medium uppercase tracking-[0.22em]",
            isSleep ? "text-white/55" : "text-muted-foreground"
          )}
        >
          {categoryName}
        </p>
        <h1 className="mt-4 font-display text-[1.65rem] font-medium leading-tight tracking-tight md:text-4xl">{title}</h1>
        <p className={cn("mt-4 max-w-xl text-base leading-relaxed md:text-[1.05rem]", isSleep ? "text-white/78" : "text-muted-foreground")}>
          {shortDescription}
        </p>

        <div
          className={cn(
            "mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-6",
            isSleep ? "border-white/15" : "border-border/25"
          )}
        >
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] font-medium uppercase tracking-[0.14em]",
              isSleep ? "text-white/60" : "text-muted-foreground"
            )}
          >
            <span className={cn("normal-case tracking-normal text-xs", isSleep ? "text-white/88" : "text-foreground/85")}>
              {durationLabel}
            </span>
            <span className="opacity-35">·</span>
            <span className={cn("normal-case tracking-normal text-xs", isSleep ? "text-white/85" : "text-foreground/80")}>
              {intensityLabel}
            </span>
          </div>
          {premium ? (
            <PremiumBadge variant="editorial" className={cn("ml-auto sm:ml-0", isSleep && "!text-white/70")} />
          ) : null}
        </div>

        <p className={cn("mt-5 text-xs leading-relaxed", isSleep ? "text-white/45" : "text-muted-foreground/85")}>{favoritedHint}</p>
      </div>
    </div>
  );
}
