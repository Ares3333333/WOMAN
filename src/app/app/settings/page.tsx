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
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } });

  const sub = (user?.subscriptionStatus ?? "none") as SubscriptionStatus | "none";
  const statusLabel = t(`app.settings.subStatus.${sub}`);

  return (
    <div className="space-y-8 pb-8">
      <h1 className="font-display text-3xl font-medium">{t("app.settings.title")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("app.settings.statusPrefix")} <strong>{statusLabel}</strong>. {t("app.settings.stripeStub")}
      </p>

      <SettingsClient />

      <SignOutButton />

      <div className="grid gap-4">
        {plans.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-lg">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{p.description}</p>
              <Button className="mt-4" type="button" variant="secondary" disabled>
                {p.slug === "premium"
                  ? t("app.settings.upgradeSoon")
                  : p.slug === "addons"
                    ? t("app.settings.addonSoon")
                    : t("app.settings.currentTierCta")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("app.settings.disclaimersTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{t("app.settings.disclaimer1")}</p>
          <p>{t("app.settings.disclaimer2")}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
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
