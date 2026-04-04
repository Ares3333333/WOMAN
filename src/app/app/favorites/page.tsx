import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppPageHeader } from "@/components/app-page-header";
import { EmptyState } from "@/components/empty-state";
import { SessionCard } from "@/components/session-card";
import { Button } from "@/components/ui/button";
import { getPageI18n } from "@/lib/i18n/server";

export default async function FavoritesPage() {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { session: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-10">
      <AppPageHeader title={t("app.favorites.title")} description={t("app.favorites.subtitle")} />
      {favorites.length === 0 ? (
        <EmptyState
          title={t("app.favorites.emptyTitle")}
          description={t("app.favorites.emptyDesc")}
          action={
            <Button asChild size="lg" className="rounded-full">
              <Link href="/app/library">{t("app.favorites.browse")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
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
      )}
    </div>
  );
}
