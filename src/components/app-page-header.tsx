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
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1
        className={cn(
          "font-display text-3xl font-medium tracking-tight text-foreground",
          eyebrow ? "mt-1" : null
        )}
      >
        {title}
      </h1>
      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
