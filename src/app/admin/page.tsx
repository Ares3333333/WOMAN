import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getPageI18n } from "@/lib/i18n/server";

export default async function AdminHomePage() {
  const { t } = await getPageI18n();
  const counts = await prisma.wellnessSession.count();
  const logs = await prisma.adminGenerationLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("admin.homeTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("admin.homeBody")}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/sessions">
            {t("admin.manageSessions")} ({counts})
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/sessions/new">{t("admin.newWithAi")}</Link>
        </Button>
      </div>
      <div>
        <h2 className="font-display text-lg">{t("admin.logsTitle")}</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {logs.length === 0 ? (
            <li>{t("admin.logsEmpty")}</li>
          ) : (
            logs.map((l) => (
              <li key={l.id} className="rounded-lg border border-border/70 bg-card/50 p-2">
                <span className="font-medium text-foreground">{l.kind}</span> · {l.createdAt.toLocaleString()}
                {l.error ? <span className="text-destructive"> — {l.error}</span> : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
