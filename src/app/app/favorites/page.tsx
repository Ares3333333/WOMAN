import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
    include: { session: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 pb-8">
      <h1 className="font-display text-3xl font-medium">{t("app.favorites.title")}</h1>
      {favorites.length === 0 ? (
        <EmptyState
          title={t("app.favorites.emptyTitle")}
          description={t("app.favorites.emptyDesc")}
          action={
            <Button asChild>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
