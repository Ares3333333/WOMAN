import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPageI18n } from "@/lib/i18n/server";

export default async function CrisisPage() {
  const { t } = await getPageI18n();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl font-medium">{t("crisis.title")}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{t("crisis.body")}</p>
      <Card className="mt-8 border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-base">{t("crisis.usTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">988</strong> — {t("crisis.us988Rest")}
          </p>
          <p>
            <strong className="text-foreground">911</strong> — {t("crisis.us911Rest")}
          </p>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t("crisis.elsewhereTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{t("crisis.elsewhereBody")}</CardContent>
      </Card>
      <Button asChild className="mt-10 w-full" variant="secondary">
        <Link href="/">{t("crisis.returnHome")}</Link>
      </Button>
    </div>
  );
}
