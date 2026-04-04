import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0", className)}>
      {eyebrow ? (
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground/90 dark:text-primary/72">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-balance font-display text-[1.375rem] font-medium leading-[1.2] tracking-tight text-foreground md:text-[1.625rem]",
          eyebrow ? "mt-3" : null
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground md:mt-4">
          {description}
        </p>
      ) : null}
    </div>
  );
}
