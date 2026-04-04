import { cn } from "@/lib/utils";

const gradients: Record<string, string> = {
  "rose-plum": "from-[hsl(350,45%,92%)] via-[hsl(300,20%,96%)] to-[hsl(280,22%,88%)]",
  "cream-mauve": "from-[hsl(35,40%,96%)] via-[hsl(310,18%,94%)] to-[hsl(280,15%,90%)]",
  "dusk": "from-[hsl(260,20%,92%)] via-[hsl(290,18%,90%)] to-[hsl(330,25%,88%)]",
  "sleep": "from-[hsl(240,25%,22%)] via-[hsl(280,20%,28%)] to-[hsl(330,22%,32%)] text-white",
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
  const g = gradients[gradientKey ?? "rose-plum"] ?? gradients["rose-plum"];
  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br p-[1px] shadow-sm",
        gradientKey === "sleep" ? "from-white/10" : "from-white/40",
        className
      )}
    >
      <div
        className={cn(
          "rounded-2xl bg-gradient-to-br p-6",
          g,
          gradientKey === "sleep" ? "text-white/95" : "text-charcoal"
        )}
      >
        {children}
      </div>
    </div>
  );
}
