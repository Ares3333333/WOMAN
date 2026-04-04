import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/section-header";
import { getPageI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getPageI18n();
  return {
    title: `${t("privacy.title")} · ${t("common.brand")}`,
    description: t("privacy.subtitle"),
  };
}

export default async function PrivacyPage() {
  const { t } = await getPageI18n();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 pb-24">
      <Link href="/" className="text-sm text-primary underline">
        {t("privacy.backLink")}
      </Link>
      <SectionHeader className="mt-8" title={t("privacy.title")} description={t("privacy.subtitle")} />
      <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-lg text-foreground">{t("privacy.collectTitle")}</h2>
          <p className="mt-2">{t("privacy.collectBody")}</p>
        </section>
        <section>
          <h2 className="font-display text-lg text-foreground">{t("privacy.dontTitle")}</h2>
          <p className="mt-2">{t("privacy.dontBody")}</p>
        </section>
        <section>
          <h2 className="font-display text-lg text-foreground">{t("privacy.cookiesTitle")}</h2>
          <p className="mt-2">{t("privacy.cookiesBody")}</p>
        </section>
        <section>
          <h2 className="font-display text-lg text-foreground">{t("privacy.choicesTitle")}</h2>
          <p className="mt-2">{t("privacy.choicesBody")}</p>
        </section>
        <p className="text-xs">{t("privacy.legalNote")}</p>
      </div>
    </div>
  );
}
