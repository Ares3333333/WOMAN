import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
    include: { session: true },
  });

  return (
    <div className="space-y-6 pb-8">
      <h1 className="font-display text-3xl font-medium">{t("app.recent.title")}</h1>
      {rows.length === 0 ? (
        <EmptyState
          title={t("app.recent.emptyTitle")}
          description={t("app.recent.emptyDesc")}
          action={
            <Button asChild>
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
              description={r.completed ? t("app.home.completed") : t("app.home.inProgress")}
              durationMinutes={r.session.durationMinutes}
              gradientKey={r.session.coverGradient}
            />
          ))}
        </div>
      )}
    </div>
  );
}
