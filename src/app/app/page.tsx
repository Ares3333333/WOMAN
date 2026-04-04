import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/empty-state";
import { SectionHeader } from "@/components/section-header";
import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/gradient-card";
import { listPublishedSessions, sensualFilterForUser } from "@/lib/data/wellness-sessions";
import { pickRecommendedSlugs } from "@/lib/mood-recommendations";
import { canAccessPremiumSession } from "@/lib/subscription";
import { getPageI18n } from "@/lib/i18n/server";

type ListedSession = Awaited<ReturnType<typeof listPublishedSessions>>[number];

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
    take: 6,
  });

  const recent = await prisma.playbackHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { lastPlayedAt: "desc" },
    take: 3,
    include: { session: { include: { category: true } } },
  });

  const sub = user?.subscriptionStatus ?? "none";
  const isPremium = sub === "active" || sub === "trialing";

  function hrefForSession(s: ListedSession) {
    const locked = !canAccessPremiumSession(sub, s.freeTier) && !s.freeTier;
    return locked ? "/app/premium?from=home" : `/app/sessions/${s.slug}`;
  }

  const primaryPick = fallbackRec[0];
  const sleepPool = all.filter((s) => s.category.slug === "sleep");
  const eveningPool =
    sleepPool.length > 0
      ? sleepPool
      : all.filter((s) => ["emotional-reset", "breathing", "stress-relief"].includes(s.category.slug));
  const forTonight = eveningPool.slice(0, 3);

  const helloName = user?.name ? `${t("app.home.hello")}, ${user.name.split(" ")[0]}` : t("app.home.hello");

  return (
    <div className="space-y-20 pb-16 pt-2">
      {/* Hero — ritual space */}
      <section className="relative overflow-hidden rounded-3xl border border-border/45 bg-gradient-to-br from-primary/[0.08] via-card to-muted/20 px-7 py-10 shadow-sm md:px-11 md:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/[0.06] blur-3xl" aria-hidden />
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">{t("app.home.heroEyebrow")}</p>
        <p className="mt-5 font-display text-2xl font-medium tracking-tight text-foreground md:text-[1.75rem]">{helloName}</p>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">{t("app.home.heroKicker")}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-base shadow-sm">
            <Link href={primaryPick ? hrefForSession(primaryPick) : "/app/library"}>
              {primaryPick ? t("app.home.heroCta") : t("app.home.heroCtaLibrary")}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="h-12 text-muted-foreground hover:text-foreground">
            <Link href="/app/mood">{t("app.home.heroMoodLink")}</Link>
          </Button>
        </div>
        <p className="mt-10 max-w-xl text-xs leading-relaxed text-muted-foreground">
          {t("app.home.disclaimer")}{" "}
          <Link href="/crisis" className="underline underline-offset-4 decoration-muted-foreground/60 hover:decoration-foreground">
            {t("app.home.crisisLink")}
          </Link>
        </p>
      </section>

      {/* For right now */}
      <section className="space-y-8">
        <SectionHeader
          eyebrow={t("app.home.forNowEyebrow")}
          title={t("app.home.forNowTitle")}
          description={t("app.home.forNowDesc")}
        />
        <div className="grid gap-4 md:gap-5">
          {fallbackRec.map((s, i) => {
            const locked = !canAccessPremiumSession(sub, s.freeTier) && !s.freeTier;
            return (
              <SessionCard
                key={s.id}
                href={locked ? "/app/premium?from=home" : `/app/sessions/${s.slug}`}
                title={s.title}
                description={s.shortDescription}
                durationMinutes={s.durationMinutes}
                gradientKey={s.coverGradient}
                premium={!s.freeTier}
                variant={i === 0 ? "featured" : "standard"}
                categoryLabel={s.category.name}
                intensity={s.intensity}
              />
            );
          })}
        </div>
      </section>

      {/* For tonight */}
      <section className="space-y-8 rounded-3xl border border-primary/10 bg-primary/[0.03] px-6 py-9 md:px-9 md:py-11">
        <SectionHeader
          eyebrow={t("app.home.tonightEyebrow")}
          title={t("app.home.tonightTitle")}
          description={t("app.home.tonightDesc")}
        />
        <div className="grid gap-4 md:gap-5">
          {forTonight.map((s) => {
            const locked = !canAccessPremiumSession(sub, s.freeTier) && !s.freeTier;
            return (
              <SessionCard
                key={s.id}
                href={locked ? "/app/premium?from=home" : `/app/sessions/${s.slug}`}
                title={s.title}
                description={s.shortDescription}
                durationMinutes={s.durationMinutes}
                gradientKey={s.coverGradient}
                premium={!s.freeTier}
                variant={!s.freeTier ? "premiumSpotlight" : "standard"}
                categoryLabel={s.category.name}
                intensity={s.intensity}
              />
            );
          })}
        </div>
      </section>

      {/* Continue your path */}
      {recent.length > 0 ? (
        <section className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              className="sm:max-w-xl"
              eyebrow={t("app.home.pathEyebrow")}
              title={t("app.home.pathTitle")}
              description={t("app.home.pathDesc")}
            />
            <Button variant="outline" size="sm" asChild className="shrink-0 self-start rounded-full sm:self-auto">
              <Link href="/app/recent">{t("app.home.seeAll")}</Link>
            </Button>
          </div>
          <div className="grid gap-2.5">
            {recent.map((r) => (
              <SessionCard
                key={r.id}
                href={`/app/sessions/${r.session.slug}`}
                title={r.session.title}
                description={r.session.shortDescription}
                durationMinutes={r.session.durationMinutes}
                gradientKey={r.session.coverGradient}
                variant="compact"
                categoryLabel={r.session.category.name}
                intensity={r.session.intensity}
                premium={!r.session.freeTier}
                stateLabel={r.completed ? t("app.home.completed") : t("app.home.inProgress")}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Saved rituals */}
      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            className="sm:max-w-xl"
            eyebrow={t("app.home.savedEyebrow")}
            title={t("app.home.savedTitle")}
            description={t("app.home.savedDesc")}
          />
          {favorites.length > 0 ? (
            <Button variant="outline" size="sm" asChild className="shrink-0 self-start rounded-full sm:self-auto">
              <Link href="/app/favorites">{t("app.home.savedViewAll")}</Link>
            </Button>
          ) : null}
        </div>
        {favorites.length > 0 ? (
          <div className="rounded-3xl border border-border/50 bg-gradient-to-b from-muted/25 to-card/40 p-5 shadow-sm md:p-7">
            <div className="grid gap-2.5">
              {favorites.map((f) => (
                <SessionCard
                  key={f.sessionId}
                  href={`/app/sessions/${f.session.slug}`}
                  title={f.session.title}
                  description={f.session.shortDescription}
                  durationMinutes={f.session.durationMinutes}
                  gradientKey={f.session.coverGradient}
                  favorited
                  variant="compact"
                  categoryLabel={f.session.category.name}
                  intensity={f.session.intensity}
                  premium={!f.session.freeTier}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title={t("app.home.savedEmptyTitle")}
            description={t("app.home.savedEmptyDesc")}
            action={
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link href="/app/library">{t("app.home.savedEmptyCta")}</Link>
              </Button>
            }
          />
        )}
      </section>

      {/* Premium */}
      {!isPremium ? (
        <section>
          <GradientCard gradientKey="cream-mauve" className="border border-border/30">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-10">
              <div className="space-y-4 md:max-w-lg">
                <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {t("app.home.premiumEyebrow")}
                </p>
                <h2 className="font-display text-2xl font-medium tracking-tight md:text-3xl">{t("app.home.premiumTitle")}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{t("app.home.premiumDesc")}</p>
              </div>
              <ul className="space-y-3 text-sm leading-relaxed text-foreground/90 md:min-w-[240px]">
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                  <span>{t("app.home.premiumPoint1")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                  <span>{t("app.home.premiumPoint2")}</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                  <span>{t("app.home.premiumPoint3")}</span>
                </li>
              </ul>
            </div>
            <Button asChild className="mt-8 rounded-full" size="lg">
              <Link href="/app/premium?from=home">{t("app.home.premiumCta")}</Link>
            </Button>
          </GradientCard>
        </section>
      ) : null}

      {/* Curated library */}
      <section className="rounded-3xl border border-border/40 bg-card/50 px-7 py-9 md:px-10 md:py-11">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">{t("app.home.libraryEyebrow")}</p>
        <h2 className="mt-3 font-display text-2xl font-medium tracking-tight md:text-3xl">{t("app.home.libraryTitle")}</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{t("app.home.libraryDesc")}</p>
        <Button asChild variant="secondary" size="lg" className="mt-8 rounded-full px-7">
          <Link href="/app/library" className="inline-flex items-center gap-2">
            {t("app.home.libraryCta")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <p className="mt-10 text-sm text-muted-foreground">
          {t("app.home.programsFootnote")}{" "}
          <Link href="/app/learn" className="font-medium text-foreground underline underline-offset-4">
            {t("app.home.programsFootnoteLink")}
          </Link>
        </p>
      </section>
    </div>
  );
}
