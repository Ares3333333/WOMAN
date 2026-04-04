"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Library, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntl } from "@/components/intl-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useIntl();

  const nav = [
    { href: "/app", label: t("app.nav.home"), icon: Home },
    { href: "/app/library", label: t("app.nav.library"), icon: Library },
    { href: "/app/favorites", label: t("app.nav.saved"), icon: Heart },
    { href: "/app/settings", label: t("app.nav.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-dvh bg-gradient-mesh pb-24">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-3">
          <Link href="/app" className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg tracking-tight">{t("common.brand")}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <Link
              href="/app/journal"
              className="rounded-full border border-border/80 bg-card/80 px-2.5 py-1.5 text-xs font-medium text-foreground/80 sm:px-3"
            >
              {t("app.nav.journal")}
            </Link>
            <Link
              href="/app/mood"
              className="rounded-full border border-border/80 bg-card/80 px-2.5 py-1.5 text-xs font-medium text-foreground/80 sm:px-3"
            >
              {t("app.nav.mood")}
            </Link>
            <Link
              href="/app/learn"
              className="inline-flex shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary sm:px-3"
            >
              {t("app.nav.programs")}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 pt-6">{children}</main>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
          {nav.map((item) => {
            const active =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-xs",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
