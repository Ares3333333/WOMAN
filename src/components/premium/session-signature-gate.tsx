import Link from "next/link";
import { Sparkles } from "lucide-react";
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
    <div className="overflow-hidden rounded-3xl border border-primary/18 bg-gradient-to-br from-primary/[0.06] via-card to-muted/25 p-6 shadow-soft ring-1 ring-primary/[0.04] md:p-8">
      <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
        {copy.eyebrow}
      </p>
      <h2 className="mt-3 font-display text-xl font-medium tracking-tight md:text-2xl">{copy.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{copy.body}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg" className="rounded-full px-7">
          <Link href={premiumHref}>{copy.cta}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full">
          <Link href="/app/library">{copy.secondary}</Link>
        </Button>
      </div>
    </div>
  );
}
