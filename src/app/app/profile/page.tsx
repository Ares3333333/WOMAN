import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ui";
import { getPageI18n } from "@/lib/i18n/server";

export default async function ProfilePage() {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  return (
    <div className="space-y-6 pb-8">
      <h1 className="font-display text-3xl font-medium">{t("app.profile.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("app.profile.subtitle")}</p>
      <ProfileForm
        displayName={profile?.displayName ?? ""}
        sensualContentMode={pref?.sensualContentMode ?? "optional"}
        skipSensualInFeed={pref?.skipSensualInFeed ?? false}
        voiceTonePref={pref?.voiceTonePref ?? "warm"}
        listeningTimePref={pref?.listeningTimePref ?? "evening"}
      />
    </div>
  );
}
