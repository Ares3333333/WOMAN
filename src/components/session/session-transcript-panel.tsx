import { ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScriptSections } from "@/types/script";

const SECTION_ORDER = [
  "intro",
  "settling",
  "guidedBreathing",
  "bodyAwareness",
  "affirmation",
  "closing",
] as const satisfies readonly (keyof ScriptSections)[];

type SectionKey = (typeof SECTION_ORDER)[number];

export function SessionTranscriptPanel({
  sections,
  sectionTitles,
  heading,
  hint,
  locked,
  lockedEyebrow,
  lockedTitle,
  lockedBody,
}: {
  sections: ScriptSections;
  sectionTitles: Record<SectionKey, string>;
  heading: string;
  hint: string;
  locked: boolean;
  lockedEyebrow: string;
  lockedTitle: string;
  lockedBody: string;
}) {
  if (locked) {
    return (
      <section className="space-y-4" aria-labelledby="transcript-locked-heading">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/[0.06] text-primary shadow-inner"
            aria-hidden
          >
            <Lock className="h-4 w-4 opacity-80" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-primary/80">{lockedEyebrow}</p>
            <h2 id="transcript-locked-heading" className="font-display text-lg font-medium tracking-tight md:text-xl">
              {lockedTitle}
            </h2>
          </div>
        </div>
        <div className="rounded-2xl border border-border/45 bg-gradient-to-br from-muted/25 via-card/50 to-card/80 px-5 py-5 text-sm leading-relaxed text-muted-foreground shadow-sm">
          {lockedBody}
        </div>
      </section>
    );
  }

  const filled = SECTION_ORDER.filter((key) => sections[key]?.trim());

  if (filled.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="transcript-heading">
      <div>
        <h2 id="transcript-heading" className="font-display text-lg font-medium tracking-tight md:text-xl">
          {heading}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{hint}</p>
      </div>
      <div className="divide-y divide-border/40 rounded-2xl border border-border/45 bg-card/30 px-1 shadow-sm">
        {filled.map((key) => (
          <details key={key} className="group px-4 py-1">
            <summary
              className={cn(
                "cursor-pointer list-none py-3 font-display text-[0.95rem] font-medium tracking-tight outline-none transition-colors",
                "marker:content-none [&::-webkit-details-marker]:hidden",
                "text-foreground/90 hover:text-foreground"
              )}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span>{sectionTitles[key]}</span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </span>
            </summary>
            <div className="border-l-2 border-primary/15 pb-4 pl-4 text-sm leading-[1.65] text-muted-foreground">
              {sections[key]}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
