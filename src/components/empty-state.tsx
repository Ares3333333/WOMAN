import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-card/75 px-8 py-16 text-center shadow-soft",
        className
      )}
    >
      <div className="mx-auto mb-5 h-px w-10 bg-primary/25" aria-hidden />
      <p className="font-display text-xl font-medium tracking-tight text-foreground md:text-2xl">{title}</p>
      {description ? (
        <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-8 w-full max-w-xs [&_a]:w-full [&_button]:w-full">{action}</div> : null}
    </div>
  );
}
