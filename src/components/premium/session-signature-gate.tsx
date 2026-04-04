import Link from "next/link";
import { Disc3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SessionSignatureGate({
  premiumHref,
  copy,
}: {
  premiumHref: string;
  copy: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
    secondary: string;
  };
}) {
  return (
    <div className="rounded-lg border border-primary/25 bg-gradient-to-b from-primary/[0.08] via-card to-card p-6 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.04)] dark:border-primary/35 md:p-8">
      <div className="flex items-center gap-2">
        <Disc3 className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{copy.eyebrow}</p>
      </div>
      <h2 className="mt-4 font-display text-xl font-medium tracking-tight md:text-2xl">{copy.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{copy.body}</p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg" className="rounded-md px-7">
          <Link href={premiumHref}>{copy.cta}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-md border-border/60">
          <Link href="/app/library">{copy.secondary}</Link>
        </Button>
      </div>
    </div>
  );
}
