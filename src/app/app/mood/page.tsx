import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MoodPicker } from "./ui";
import { getPageI18n } from "@/lib/i18n/server";

export default async function MoodPage() {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  if (!pref?.onboardingComplete) redirect("/app/onboarding");

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("app.mood.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("app.mood.subtitle")}</p>
      </div>
      <MoodPicker />
      <Link href="/app" className="text-sm text-primary underline">
        {t("app.mood.skip")}
      </Link>
    </div>
  );
}
