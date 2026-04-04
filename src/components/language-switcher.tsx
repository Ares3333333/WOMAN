"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setUserLocale } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/types";
import { useIntl } from "@/components/intl-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, t } = useIntl();
  const router = useRouter();
  const [pending, start] = useTransition();

  function select(next: Locale) {
    if (next === locale) return;
    start(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      className={cn("inline-flex rounded-full border border-border/80 bg-card/80 p-0.5 text-xs", className)}
      role="group"
      aria-label={t("languageSwitcher.aria")}
    >
      <button
        type="button"
        disabled={pending}
        onClick={() => select("en")}
        className={cn(
          "rounded-full px-2.5 py-1 font-medium transition-colors",
          locale === "en" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("common.english")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => select("ru")}
        className={cn(
          "rounded-full px-2.5 py-1 font-medium transition-colors",
          locale === "ru" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("common.russian")}
      </button>
    </div>
  );
}
