import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/section-header";
import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { listPublishedSessions, sensualFilterForUser } from "@/lib/data/wellness-sessions";
import { pickRecommendedSlugs } from "@/lib/mood-recommendations";
import { canAccessPremiumSession } from "@/lib/subscription";
import { getPageI18n } from "@/lib/i18n/server";

export default async function AppHomePage() {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  if (!pref?.onboardingComplete) redirect("/app/onboarding");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const mood = await prisma.moodCheckin.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const extra = sensualFilterForUser({
    sensualContentMode: pref.sensualContentMode,
    skipSensualInFeed: pref.skipSensualInFeed,
  });

  const all = await listPublishedSessions(extra);
  const slugs = mood ? pickRecommendedSlugs(mood.mood) : ["stress-relief", "breathing", "sleep"];
  const recommended = all.filter((s) => slugs.includes(s.category.slug)).slice(0, 3);
  const fallbackRec = recommended.length >= 3 ? recommended : all.slice(0, 3);

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { session: { include: { category: true } } },
    take: 4,
  });

  const recent = await prisma.playbackHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { lastPlayedAt: "desc" },
    take: 4,
    include: { session: { include: { category: true } } },
  });

  const helloName = user?.name ? `${t("app.home.hello")}, ${user.name.split(" ")[0]}` : t("app.home.hello");

  return (
    <div className="space-y-10 pb-8">
      <div>
        <p className="text-sm text-muted-foreground">{helloName}</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight">{t("app.home.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("app.home.disclaimer")}{" "}
          <Link href="/crisis" className="underline">
            {t("app.home.crisisLink")}
          </Link>
        </p>
      </div>

      <section className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/80 to-card/60 p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{t("app.programs.pathEyebrow")}</p>
        <h2 className="mt-2 font-display text-xl font-medium tracking-tight">{t("app.programs.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("app.programs.homeHint")}</p>
        <Button asChild className="mt-4" size="sm">
          <Link href="/app/learn">{t("app.programs.homeCta")}</Link>
        </Button>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <SectionHeader
            eyebrow={t("app.home.forYouEyebrow")}
            title={mood ? t("app.home.forYouMood") : t("app.home.forYouStart")}
            description={t("app.home.forYouDesc")}
          />
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/mood">{t("app.home.updateMood")}</Link>
          </Button>
        </div>
        <div className="mt-4 grid gap-3">
          {fallbackRec.map((s) => {
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

      {favorites.length > 0 ? (
        <section>
          <SectionHeader title={t("app.home.savedTitle")} />
          <div className="mt-4 grid gap-3">
            {favorites.map((f) => (
              <SessionCard
                key={f.sessionId}
                href={`/app/sessions/${f.session.slug}`}
                title={f.session.title}
                description={f.session.shortDescription}
                durationMinutes={f.session.durationMinutes}
                gradientKey={f.session.coverGradient}
                favorited
              />
            ))}
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section>
          <div className="flex items-end justify-between gap-4">
            <SectionHeader title={t("app.home.recentTitle")} />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/recent">{t("app.home.seeAll")}</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-3">
            {recent.map((r) => (
              <SessionCard
                key={r.id}
                href={`/app/sessions/${r.session.slug}`}
                title={r.session.title}
                description={r.session.shortDescription}
                durationMinutes={r.session.durationMinutes}
                gradientKey={r.session.coverGradient}
              />
            ))}
          </div>
        </section>
      ) : null}

      <Button asChild className="w-full" variant="secondary">
        <Link href="/app/library">{t("app.home.browseLibrary")}</Link>
      </Button>
    </div>
  );
}
