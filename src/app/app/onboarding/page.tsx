import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingForm } from "./ui";
import { getPageI18n } from "@/lib/i18n/server";

export default async function OnboardingPage() {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  if (pref?.onboardingComplete) redirect("/app");

  return (
    <div className="pb-12">
      <h1 className="font-display text-3xl font-medium">{t("app.onboarding.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("app.onboarding.subtitle")}</p>
      <OnboardingForm />
    </div>
  );
}
