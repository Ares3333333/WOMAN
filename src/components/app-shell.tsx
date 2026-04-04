"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CloudSun, GitBranch, Heart, Home, Library, Settings, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntl } from "@/components/intl-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

const MENU_LINK_CLASS =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-accent/60 active:bg-accent/80";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useIntl();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const nav = [
    { href: "/app", label: t("app.nav.home"), icon: Home },
    { href: "/app/library", label: t("app.nav.library"), icon: Library },
    { href: "/app/favorites", label: t("app.nav.saved"), icon: Heart },
    { href: "/app/settings", label: t("app.nav.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-dvh bg-gradient-mesh pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-40 border-b border-border/45 bg-card/94 shadow-soft backdrop-blur-md backdrop-saturate-150">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3.5">
          <Link
            href="/app"
            className="flex min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.07] text-primary shadow-inner">
              <Sparkles className="h-[1.125rem] w-[1.125rem]" aria-hidden />
            </span>
            <span className="font-display text-[1.0625rem] font-medium tracking-tight text-foreground md:text-lg">
              {t("common.brand")}
            </span>
          </Link>

          <div className="relative z-50 flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/50 bg-card text-foreground/85 shadow-inner transition-colors hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55 focus-visible:ring-offset-2"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label={menuOpen ? t("app.shell.menuClose") : t("app.shell.menuToggle")}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <MenuGlyph />}
            </button>

            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-30 cursor-default bg-transparent"
                  aria-label={t("app.shell.menuClose")}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/50 bg-card py-2 shadow-lift"
                >
                  <p className="px-4 pb-1 pt-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted-foreground/90">
                    {t("app.shell.menuSectionTools")}
                  </p>
                  <div className="px-1.5 pb-1">
                    <Link
                      href="/app/learn"
                      role="menuitem"
                      className={cn(MENU_LINK_CLASS, "text-primary")}
                      onClick={() => setMenuOpen(false)}
                    >
                      <GitBranch className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                      {t("app.nav.programs")}
                    </Link>
                    <Link
                      href="/app/journal"
                      role="menuitem"
                      className={MENU_LINK_CLASS}
                      onClick={() => setMenuOpen(false)}
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      {t("app.nav.journal")}
                    </Link>
                    <Link
                      href="/app/mood"
                      role="menuitem"
                      className={MENU_LINK_CLASS}
                      onClick={() => setMenuOpen(false)}
                    >
                      <CloudSun className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      {t("app.nav.mood")}
                    </Link>
                  </div>
                  <div className="mx-3 border-t border-border/40" />
                  <p className="px-4 pb-1 pt-3 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted-foreground/90">
                    {t("app.shell.menuSectionLang")}
                  </p>
                  <div className="px-3 pb-2">
                    <LanguageSwitcher className="flex w-full justify-stretch border-border/45 bg-muted/25 p-1 shadow-inner [&>button]:flex-1" />
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6 md:pt-8">{children}</main>

      <nav
        className="fixed bottom-0 inset-x-0 z-40 border-t border-border/45 bg-card/96 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_36px_-14px_hsl(var(--shadow-hsl)/0.07)] backdrop-blur-md backdrop-saturate-150"
        aria-label={t("app.shell.mainNavAria")}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-3 pt-1.5">
          {nav.map((item) => {
            const active =
              item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition-colors",
                  active
                    ? "bg-primary/[0.07] text-primary"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground/80"
                )}
              >
                <Icon className={cn("h-[1.35rem] w-[1.35rem] shrink-0", active ? "opacity-100" : "opacity-85")} />
                <span className="max-w-full truncate text-[0.65rem] font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function MenuGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className="text-current">
      <path
        d="M4 6h12M4 10h12M4 14h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
