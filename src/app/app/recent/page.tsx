import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppPageHeader } from "@/components/app-page-header";
import { EmptyState } from "@/components/empty-state";
import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { getPageI18n } from "@/lib/i18n/server";

export default async function RecentPage() {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const rows = await prisma.playbackHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { lastPlayedAt: "desc" },
    include: { session: { include: { category: true } } },
  });

  return (
    <div className="space-y-8 pb-10">
      <AppPageHeader title={t("app.recent.title")} description={t("app.recent.subtitle")} />
      {rows.length === 0 ? (
        <EmptyState
          title={t("app.recent.emptyTitle")}
          description={t("app.recent.emptyDesc")}
          action={
            <Button asChild size="lg" className="rounded-full">
              <Link href="/app/library">{t("app.recent.browse")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
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
      )}
    </div>
  );
}
