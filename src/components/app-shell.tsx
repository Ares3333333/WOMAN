"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CloudSun, Disc3, GitBranch, Heart, Home, Library, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIntl } from "@/components/intl-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

const MENU_LINK_CLASS =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-accent/80 active:bg-accent";

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
    <div className="app-canvas min-h-dvh pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-card/80 shadow-[inset_0_-1px_0_0_hsl(var(--border)/0.35)] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/72">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3 md:py-3.5">
          <Link
            href="/app"
            className="flex min-w-0 items-center gap-3 rounded-xl py-1 pr-1 outline-none ring-offset-background transition-opacity hover:opacity-[0.94] focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-b from-muted/50 to-muted/20 text-primary shadow-[inset_0_1px_0_0_hsl(var(--primary)/0.14)] ring-1 ring-border/50">
              <Disc3 className="h-[1.15rem] w-[1.15rem] stroke-[1.4]" aria-hidden />
            </span>
            <span className="font-display text-[1.0625rem] font-medium tracking-tight text-foreground md:text-lg">
              {t("common.brand")}
            </span>
          </Link>

          <div className="relative z-50 flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/55 bg-muted/25 text-foreground/90 shadow-inner transition-[background-color,box-shadow,color] hover:border-border/70 hover:bg-accent/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border/55 bg-card/98 py-2 shadow-lift backdrop-blur-xl"
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

      <main className="mx-auto max-w-lg px-4 pt-5 md:pt-7">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2 pointer-events-none"
        aria-label={t("app.shell.mainNavAria")}
      >
        <div className="pointer-events-auto mx-auto max-w-lg px-3">
          <div className="flex items-stretch justify-between gap-0.5 rounded-2xl border border-border/50 bg-card/88 p-1.5 shadow-[0_1px_0_0_hsl(var(--border)/0.25),0_-20px_56px_-12px_hsl(var(--shadow-hsl)/0.65)] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/78">
            {nav.map((item) => {
              const active =
                item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex min-h-[3.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-[color,background-color,box-shadow] duration-200",
                    active
                      ? "bg-primary/[0.11] text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.12)]"
                      : "text-muted-foreground hover:bg-muted/45 hover:text-foreground/92"
                  )}
                >
                  {active ? (
                    <span
                      className="absolute top-1.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary/90"
                      aria-hidden
                    />
                  ) : null}
                  <Icon
                    className={cn("mt-1 h-[1.15rem] w-[1.15rem] shrink-0", active ? "opacity-100" : "opacity-[0.72]")}
                    strokeWidth={1.65}
                  />
                  <span className="max-w-full truncate text-[0.625rem] font-semibold tracking-[0.04em]">{item.label}</span>
                </Link>
              );
            })}
          </div>
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
