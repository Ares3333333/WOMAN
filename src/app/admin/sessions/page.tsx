import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { adminDeleteSessionForm } from "@/app/actions/admin";
import { getPageI18n } from "@/lib/i18n/server";

export default async function AdminSessionsPage() {
  const { t } = await getPageI18n();
  const sessions = await prisma.wellnessSession.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-medium">{t("admin.sessionsTitle")}</h1>
        <Button asChild>
          <Link href="/admin/sessions/new">{t("admin.new")}</Link>
        </Button>
      </div>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-card/60 p-3 text-sm"
          >
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-xs text-muted-foreground">
                {s.category.name} · {s.published ? t("admin.published") : t("admin.draft")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/admin/sessions/${s.id}/edit`}>{t("admin.edit")}</Link>
              </Button>
              <form action={adminDeleteSessionForm}>
                <input type="hidden" name="id" value={s.id} />
                <Button size="sm" variant="outline" type="submit">
                  {t("admin.delete")}
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
