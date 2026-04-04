import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { confirmAgeGate, hasAgeConfirmation } from "@/app/actions/age-gate";
import { getPageI18n } from "@/lib/i18n/server";

export default async function AgeGatePage() {
  const { t } = await getPageI18n();
  const ok = await hasAgeConfirmation();
  if (ok) redirect("/sign-up");

  async function accept() {
    "use server";
    await confirmAgeGate();
    redirect("/sign-up");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="font-display text-3xl font-medium">{t("ageGate.title")}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{t("ageGate.body")}</p>
      <form action={accept} className="mt-8 space-y-3">
        <Button type="submit" className="w-full" size="lg">
          {t("ageGate.continue")}
        </Button>
        <Button type="button" variant="outline" className="w-full" asChild>
          <Link href="/">{t("ageGate.back")}</Link>
        </Button>
      </form>
    </div>
  );
}
