import { AppShell } from "@/components/app-shell";

/** Dark luxury shell — isolated from marketing routes (light :root). */
export default function AppAreaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark min-h-dvh bg-background text-foreground antialiased">
      <AppShell>{children}</AppShell>
    </div>
  );
}
