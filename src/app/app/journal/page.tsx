import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { JournalForm } from "./ui";
import { getPageI18n } from "@/lib/i18n/server";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { t } = await getPageI18n();
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const prompt = typeof searchParams.prompt === "string" ? searchParams.prompt : "";
  const sessionId = typeof searchParams.sessionId === "string" ? searchParams.sessionId : undefined;

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-display text-3xl font-medium">{t("app.journal.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("app.journal.subtitle")}</p>
      </div>
      <JournalForm
        initialPrompt={prompt}
        sessionId={sessionId}
        defaultPrompt={t("app.journal.defaultPrompt")}
      />
      <div className="space-y-3">
        <h2 className="font-display text-lg">{t("app.journal.recentTitle")}</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("app.journal.empty")}</p>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="rounded-xl border border-border/70 bg-card/50 p-3 text-sm">
              <p className="text-xs text-muted-foreground">{e.createdAt.toLocaleString()}</p>
              <p className="mt-1 font-medium">
                {e.prompt.length > 120 ? `${e.prompt.slice(0, 120)}…` : e.prompt}
              </p>
              <p className="mt-2 text-muted-foreground">{e.content}</p>
            </div>
          ))
        )}
      </div>
      <Link href="/app" className="text-sm text-primary underline">
        {t("app.journal.backHome")}
      </Link>
    </div>
  );
}
