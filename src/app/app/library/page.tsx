import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { listPublishedSessions } from "@/lib/data/wellness-sessions";
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

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("app.library.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("app.library.subtitle")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/app/library" active={!category} label={t("app.library.filterAll")} />
        {categories.map((c) => (
          <FilterChip key={c.id} href={`/app/library?category=${c.slug}`} active={category === c.slug} label={c.name} />
        ))}
      </div>
      <div className="grid gap-3">
        {sessions.map((s) => {
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
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-xs ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card/60"
      }`}
    >
      {label}
    </Link>
  );
}
