import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Disc3 } from "lucide-react";
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
    take: 5,
  });

  const recent = await prisma.playbackHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { lastPlayedAt: "desc" },
    take: 4,
    include: { session: { include: { category: true } } },
  });

  const sub = user?.subscriptionStatus ?? "none";
  const isPremium = sub === "active" || sub === "trialing";

  function hrefForSession(s: ListedSession) {
    const locked = !canAccessPremiumSession(sub, s.freeTier) && !s.freeTier;
    return locked ? "/app/premium?from=home" : `/app/sessions/${s.slug}`;
  }

  const primaryPick = fallbackRec[0];
  const secondaryPicks = fallbackRec.slice(1, 3);
  const sleepPool = all.filter((s) => s.category.slug === "sleep");
  const eveningPool =
    sleepPool.length > 0
      ? sleepPool
      : all.filter((s) => ["emotional-reset", "breathing", "stress-relief"].includes(s.category.slug));
  const forTonight = eveningPool.slice(0, 3);

  const helloName = user?.name ? `${user.name.split(" ")[0]}` : null;

  return (
    <div className="space-y-16 pb-20 pt-1 md:space-y-20">
      {/* Command center — one decision */}
      <header className="space-y-8">
        <div className="space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/75">
            {t("app.home.commandEyebrow")}
          </p>
          <h1 className="font-display text-[1.85rem] font-medium leading-[1.12] tracking-tight text-foreground md:text-[2.15rem]">
            {helloName ? t("app.home.commandGreetingNamed").replace("{name}", helloName) : t("app.home.commandGreeting")}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-[0.9375rem]">
            {t("app.home.commandLead")}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="h-14 w-full rounded-md text-base font-medium tracking-tight shadow-sm">
            <Link href={primaryPick ? hrefForSession(primaryPick) : "/app/library"}>
              {primaryPick ? t("app.home.commandPrimaryCta") : t("app.home.commandPrimaryCtaLibrary")}
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/40 pt-5 text-sm">
            <Link
              href="/app/mood"
              className="font-medium text-foreground underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary"
            >
              {t("app.home.commandLinkMood")}
            </Link>
            <Link
              href="/app/library"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("app.home.commandLinkLibrary")}
            </Link>
            <Link
              href="/app/premium"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("app.home.commandLinkSignature")}
            </Link>
          </div>
        </div>

        <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
          {t("app.home.disclaimer")}{" "}
          <Link href="/crisis" className="underline underline-offset-2 decoration-muted-foreground/50 hover:text-foreground">
            {t("app.home.crisisLink")}
          </Link>
        </p>
      </header>

      {/* Now — hero + supporting row */}
      <section className="space-y-6">
        <SectionHeader
          eyebrow={t("app.home.forNowEyebrow")}
          title={t("app.home.forNowTitle")}
          description={t("app.home.forNowDesc")}
        />
        {primaryPick ? (
          <SessionCard
            href={hrefForSession(primaryPick)}
            title={primaryPick.title}
            description={primaryPick.shortDescription}
            durationMinutes={primaryPick.durationMinutes}
            gradientKey={primaryPick.coverGradient}
            premium={!primaryPick.freeTier}
            variant="hero"
            categoryLabel={primaryPick.category.name}
            intensity={primaryPick.intensity}
          />
        ) : null}
        {secondaryPicks.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {secondaryPicks.map((s) => {
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
                  variant="support"
                  categoryLabel={s.category.name}
                  intensity={s.intensity}
                />
              );
            })}
          </div>
        ) : null}
      </section>

      {/* Evening band */}
      <section className="space-y-6 rounded-lg border border-primary/20 bg-primary/[0.05] px-5 py-8 md:px-8 md:py-10 dark:border-primary/25 dark:bg-primary/[0.07]">
        <SectionHeader
          eyebrow={t("app.home.tonightEyebrow")}
          title={t("app.home.tonightTitle")}
          description={t("app.home.tonightDesc")}
        />
        <div className="grid gap-3">
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
                variant={!s.freeTier ? "premiumSpotlight" : "support"}
                categoryLabel={s.category.name}
                intensity={s.intensity}
              />
            );
          })}
        </div>
      </section>

      {/* Your studio — continue + marked, always */}
      <section className="space-y-8">
        <SectionHeader
          eyebrow={t("app.home.studioEyebrow")}
          title={t("app.home.studioTitle")}
          description={t("app.home.studioDesc")}
        />

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-3 border-b border-border/40 pb-2">
            <h3 className="font-display text-base font-medium tracking-tight text-foreground">{t("app.home.studioContinue")}</h3>
            {recent.length > 0 ? (
              <Button variant="ghost" size="sm" className="h-8 shrink-0 rounded-md px-2 text-xs text-muted-foreground" asChild>
                <Link href="/app/recent">{t("app.home.seeAll")}</Link>
              </Button>
            ) : null}
          </div>
          {recent.length > 0 ? (
            <div className="grid gap-2">
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
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">{t("app.home.studioEmptyRecent")}</p>
          )}
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-3 border-b border-border/40 pb-2">
            <h3 className="font-display text-base font-medium tracking-tight text-foreground">{t("app.home.studioMarked")}</h3>
            {favorites.length > 0 ? (
              <Button variant="ghost" size="sm" className="h-8 shrink-0 rounded-md px-2 text-xs text-muted-foreground" asChild>
                <Link href="/app/favorites">{t("app.home.savedViewAll")}</Link>
              </Button>
            ) : null}
          </div>
          {favorites.length > 0 ? (
            <div className="grid gap-2">
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
          ) : (
            <EmptyState
              title={t("app.home.savedEmptyTitle")}
              description={t("app.home.savedEmptyDesc")}
              className="py-10"
              action={
                <Button asChild size="sm" variant="secondary" className="rounded-md">
                  <Link href="/app/library">{t("app.home.savedEmptyCta")}</Link>
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* Signature */}
      {!isPremium ? (
        <section>
          <GradientCard gradientKey="cream-mauve" className="border border-border/40 dark:border-white/[0.06]">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Disc3 className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {t("app.home.premiumEyebrow")}
                </p>
              </div>
              <div className="space-y-3">
                <h2 className="font-display text-2xl font-medium tracking-tight md:text-[1.75rem]">{t("app.home.premiumTitle")}</h2>
                <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{t("app.home.premiumDesc")}</p>
              </div>
              <ul className="grid gap-3 text-sm text-foreground/95 sm:grid-cols-3">
                <li className="border-l-2 border-primary/40 pl-3">{t("app.home.premiumPoint1")}</li>
                <li className="border-l-2 border-primary/40 pl-3">{t("app.home.premiumPoint2")}</li>
                <li className="border-l-2 border-primary/40 pl-3">{t("app.home.premiumPoint3")}</li>
              </ul>
              <Button asChild className="h-12 w-full rounded-md sm:w-auto" size="lg">
                <Link href="/app/premium?from=home">{t("app.home.premiumCta")}</Link>
              </Button>
            </div>
          </GradientCard>
        </section>
      ) : null}

      {/* Index */}
      <section className="rounded-lg border border-border/50 bg-card/30 px-6 py-8 md:px-8 md:py-9 dark:border-white/[0.06] dark:bg-card/20">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("app.home.libraryEyebrow")}</p>
        <h2 className="mt-2 font-display text-xl font-medium tracking-tight md:text-2xl">{t("app.home.libraryTitle")}</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{t("app.home.libraryDesc")}</p>
        <Button asChild variant="secondary" size="lg" className="mt-6 rounded-md">
          <Link href="/app/library" className="inline-flex items-center gap-2">
            {t("app.home.libraryCta")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <p className="mt-8 text-xs text-muted-foreground">
          {t("app.home.programsFootnote")}{" "}
          <Link href="/app/learn" className="font-medium text-foreground underline underline-offset-4">
            {t("app.home.programsFootnoteLink")}
          </Link>
        </p>
      </section>
    </div>
  );
}
