import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/section-header";
import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { PROGRAM_PATHS } from "@/lib/programs";
import { canAccessPremiumSession } from "@/lib/subscription";
import { getPageI18n } from "@/lib/i18n/server";

export default async function LearnPage() {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  if (!pref?.onboardingComplete) redirect("/app/onboarding");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const allSlugs = Array.from(new Set(PROGRAM_PATHS.flatMap((p) => Array.from(p.sessionSlugs))));
  const dbSessions = await prisma.wellnessSession.findMany({
    where: { slug: { in: allSlugs }, published: true },
    include: { category: true },
  });
  const bySlug = Object.fromEntries(dbSessions.map((s) => [s.slug, s]));

  return (
    <div className="space-y-14 pb-10">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("app.programs.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("app.programs.subtitle")}</p>
        <Button asChild className="mt-4" variant="outline" size="sm">
          <Link href="/app/library">{t("app.programs.browseAll")}</Link>
        </Button>
      </div>

      {PROGRAM_PATHS.map((path) => {
        const title = t(`app.programs.paths.${path.id}.title`);
        const desc = t(`app.programs.paths.${path.id}.desc`);
        const ordered = path.sessionSlugs.map((slug) => bySlug[slug]).filter(Boolean);
        if (ordered.length === 0) return null;

        return (
          <section key={path.id} className="space-y-4">
            <SectionHeader eyebrow={t("app.programs.pathEyebrow")} title={title} description={desc} />
            <p className="text-xs text-muted-foreground">
              {ordered.length} {t("app.programs.sessionWord")}
            </p>
            <div className="grid gap-3">
              {ordered.map((s) => {
                const locked =
                  !canAccessPremiumSession(user?.subscriptionStatus ?? "none", s.freeTier) && !s.freeTier;
                return (
                  <SessionCard
                    key={s.id}
                    href={locked ? "/app/settings" : `/app/sessions/${s.slug}`}
                    title={s.title}
                    description={s.shortDescription}
                    durationMinutes={s.durationMinutes}
                    gradientKey={s.coverGradient}
                    premium={!s.freeTier}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
