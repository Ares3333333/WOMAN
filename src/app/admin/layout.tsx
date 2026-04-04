import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getPageI18n } from "@/lib/i18n/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getPageI18n();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-card/80 px-4 py-3">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2">
          <span className="font-display text-lg">{t("admin.studio")}</span>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            <nav className="flex flex-wrap gap-3 text-sm">
              <Link href="/admin" className="text-primary underline">
                {t("admin.overview")}
              </Link>
              <Link href="/admin/sessions" className="text-primary underline">
                {t("admin.sessions")}
              </Link>
              <Link href="/admin/sessions/new" className="text-primary underline">
                {t("admin.generator")}
              </Link>
              <Link href="/app" className="text-muted-foreground underline">
                {t("admin.appLink")}
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
