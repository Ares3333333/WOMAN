import Link from "next/link";
import { redirect } from "next/navigation";
import type { SubscriptionStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsClient } from "./ui";
import { SignOutButton } from "@/components/sign-out-button";
import { getPageI18n } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const sub = (user?.subscriptionStatus ?? "none") as SubscriptionStatus | "none";
  const statusLabel = t(`app.settings.subStatus.${sub}`);
  const isSubscriber = sub === "active" || sub === "trialing";

  return (
    <div className="space-y-10 pb-8">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("app.settings.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("app.settings.statusPrefix")} <strong>{statusLabel}</strong>
        </p>
      </div>

      <SettingsClient />

      <SignOutButton />

      <Card id="signature-membership" className="scroll-mt-8 overflow-hidden border-primary/15 shadow-sm">
        <CardHeader className="border-b border-border/40 bg-primary/[0.04] pb-4">
          <CardTitle className="font-display text-xl">{t("app.settings.signatureCardTitle")}</CardTitle>
          <p className="text-sm font-normal leading-relaxed text-muted-foreground">{t("app.settings.signatureCardLead")}</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {isSubscriber ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{t("app.settings.signatureActiveBody")}</p>
          ) : (
            <>
              <ul className="space-y-3 text-sm leading-relaxed text-foreground/90">
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                  <span>{t("app.settings.signaturePoint1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                  <span>{t("app.settings.signaturePoint2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                  <span>{t("app.settings.signaturePoint3")}</span>
                </li>
              </ul>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/app/premium?from=settings">{t("app.settings.signatureOpenPaywall")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/app/library">{t("app.settings.signatureBrowseFree")}</Link>
                </Button>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{t("app.settings.signatureFootnote")}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">{t("app.settings.explorerCardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>{t("app.settings.explorerCardBody")}</p>
          <Button asChild variant="secondary" className="rounded-full">
            <Link href="/app/library">{t("app.settings.explorerCta")}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">{t("app.settings.disclaimersTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("app.settings.disclaimer1")}</p>
          <p>{t("app.settings.disclaimer2")}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
            <Button asChild variant="link" className="h-auto p-0">
              <Link href="/privacy">{t("app.settings.privacy")}</Link>
            </Button>
            <Button asChild variant="link" className="h-auto p-0">
              <Link href="/crisis">{t("app.settings.crisis")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
