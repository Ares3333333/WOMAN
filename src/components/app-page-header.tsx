import { cn } from "@/lib/utils";

export function AppPageHeader({
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
    <div className={cn("space-y-2", className)}>
      {eyebrow ? (
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/75">{eyebrow}</p>
      ) : null}
      <h1
        className={cn(
          "text-balance font-display text-[1.75rem] font-medium leading-[1.12] tracking-tight text-foreground md:text-[2rem]",
          eyebrow ? "mt-2" : null
        )}
      >
        {title}
      </h1>
      {description ? (
        <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
