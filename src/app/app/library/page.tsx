import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { listPublishedSessions } from "@/lib/data/wellness-sessions";
import { AppPageHeader } from "@/components/app-page-header";
import { FilterChip } from "@/components/filter-chip";
import { LibraryCollectionRail } from "@/components/library-collection-rail";
import { SessionCard } from "@/components/session-card";
import { canAccessPremiumSession } from "@/lib/subscription";
import { getPageI18n } from "@/lib/i18n/server";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  if (!pref?.onboardingComplete) redirect("/app/onboarding");

  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const parts: Prisma.WellnessSessionWhereInput[] = [];
  if (pref.sensualContentMode === "hidden" || pref.skipSensualInFeed) {
    parts.push({ category: { slug: { not: "sensual-wellness" } } });
  }
  if (category) {
    parts.push({ category: { slug: category } });
  }
  const where = parts.length > 0 ? { AND: parts } : {};

  const sessions = await listPublishedSessions(where);
  const categories = await prisma.sessionCategory.findMany({ orderBy: { sortOrder: "asc" } });

  const railItems = categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
  }));

  return (
    <div className="space-y-8 pb-12">
      <AppPageHeader title={t("app.library.title")} description={t("app.library.subtitle")} />

      <div className="space-y-3">
        <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("app.library.railLabel")}
        </p>
        <LibraryCollectionRail
          items={railItems}
          activeSlug={category}
          indexEyebrow={t("app.library.railIndexEyebrow")}
          indexTitle={t("app.library.filterAll")}
          collectionEyebrow={t("app.library.railCollectionEyebrow")}
        />
      </div>

      <div>
        <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("app.library.filterLabel")}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <FilterChip href="/app/library" active={!category} label={t("app.library.filterAll")} />
          {categories.map((c) => (
            <FilterChip key={c.id} href={`/app/library?category=${c.slug}`} active={category === c.slug} label={c.name} />
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t("app.library.sessionsLabel")}
        </p>
        <div className="grid gap-3 md:gap-4">
          {sessions.map((s) => {
            const locked =
              !canAccessPremiumSession(user?.subscriptionStatus ?? "none", s.freeTier) && !s.freeTier;
            return (
              <SessionCard
                key={s.id}
                href={locked ? "/app/premium?from=library" : `/app/sessions/${s.slug}`}
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
      </div>
    </div>
  );
}
