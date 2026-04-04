import Link from "next/link";
import { cn } from "@/lib/utils";

export type CollectionItem = { id: string; slug: string; name: string; description: string | null };

export function LibraryCollectionRail({
  items,
  activeSlug,
  indexEyebrow,
  indexTitle,
  collectionEyebrow,
}: {
  items: CollectionItem[];
  activeSlug?: string;
  indexEyebrow: string;
  indexTitle: string;
  collectionEyebrow: string;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1 pt-0.5 [scrollbar-width:thin]">
      <div className="flex min-w-min gap-3">
        <Link
          href="/app/library"
          className={cn(
            "shrink-0 rounded-lg border px-4 py-3 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            !activeSlug
              ? "border-primary/35 bg-primary/10 text-foreground"
              : "border-border/50 bg-muted/20 text-muted-foreground hover:border-border hover:bg-muted/35 hover:text-foreground"
          )}
        >
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] opacity-80">{indexEyebrow}</p>
          <p className="mt-1 font-display text-sm font-medium tracking-tight">{indexTitle}</p>
        </Link>
        {items.map((c) => {
          const active = activeSlug === c.slug;
          return (
            <Link
              key={c.id}
              href={`/app/library?category=${c.slug}`}
              className={cn(
                "max-w-[11.5rem] shrink-0 rounded-lg border px-4 py-3 transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "border-primary/35 bg-primary/10 text-foreground"
                  : "border-border/50 bg-card/50 text-foreground hover:border-border hover:bg-card"
              )}
            >
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{collectionEyebrow}</p>
              <p className="mt-1 font-display text-sm font-medium leading-snug tracking-tight">{c.name}</p>
              {c.description ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
