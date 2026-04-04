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
    <div className="space-y-10 pb-12 pt-1">
      <header className="space-y-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/75">
          {t("app.mood.eyebrow")}
        </p>
        <h1 className="text-balance font-display text-[1.85rem] font-medium leading-[1.1] tracking-tight text-foreground md:text-[2.05rem]">
          {t("app.mood.title")}
        </h1>
        <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">{t("app.mood.subtitle")}</p>
      </header>
      <MoodPicker />
      <Link
        href="/app"
        className="inline-flex text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {t("app.mood.skip")}
      </Link>
    </div>
  );
}
