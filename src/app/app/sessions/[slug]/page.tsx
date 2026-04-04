import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSessionBySlug } from "@/lib/data/wellness-sessions";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/premium-badge";
import { scriptToTranscript } from "@/types/script";
import type { ScriptSections } from "@/types/script";
import { canAccessPremiumSession } from "@/lib/subscription";
import { getPageI18n } from "@/lib/i18n/server";

export default async function SessionDetailPage({ params }: { params: { slug: string } }) {
  const { t } = await getPageI18n();
  const { slug } = params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const ws = await getSessionBySlug(slug);
  if (!ws) notFound();

  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (ws.category.slug === "sensual-wellness" && pref?.sensualContentMode === "hidden") {
    return (
      <div className="space-y-4 pb-8">
        <p className="text-sm text-muted-foreground">{t("app.session.hiddenSensual")}</p>
        <Button asChild variant="secondary">
          <Link href="/app/profile">{t("app.session.openPrefs")}</Link>
        </Button>
      </div>
    );
  }

  const locked =
    !canAccessPremiumSession(user?.subscriptionStatus ?? "none", ws.freeTier) && !ws.freeTier;

  let sections: ScriptSections;
  try {
    sections = JSON.parse(ws.scriptJson) as ScriptSections;
  } catch {
    notFound();
  }

  const transcript = scriptToTranscript(sections);

  const favorited = await prisma.favorite.findUnique({
    where: {
      userId_sessionId: { userId: session.user.id, sessionId: ws.id },
    },
  });

  return (
    <div className="space-y-6 pb-40">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{ws.category.name}</p>
      <h1 className="font-display text-3xl font-medium">{ws.title}</h1>
      <p className="text-sm text-muted-foreground">{ws.shortDescription}</p>
      <div className="flex flex-wrap gap-2">
        {!ws.freeTier ? <PremiumBadge /> : null}
        <span className="rounded-full bg-muted px-3 py-1 text-xs">
          {ws.durationMinutes} {t("sessionCard.min")}
        </span>
        <span className="rounded-full bg-muted px-3 py-1 text-xs">{ws.intensity}</span>
      </div>
      {ws.contraindicationNote ? (
        <p className="rounded-xl border border-border/80 bg-card/60 p-3 text-xs text-muted-foreground">
          {t("app.session.notePrefix")} {ws.contraindicationNote}
        </p>
      ) : null}
      <p className="text-sm leading-relaxed text-foreground/90">{ws.longDescription}</p>

      {locked ? (
        <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium">{t("app.session.premiumTitle")}</p>
          <p className="mt-1 text-muted-foreground">{t("app.session.premiumBody")}</p>
          <Button asChild className="mt-4">
            <Link href="/app/settings">{t("app.session.viewPlans")}</Link>
          </Button>
        </div>
      ) : (
        <Button asChild className="w-full" size="lg">
          <Link href={`/app/play/${ws.id}`}>{t("app.session.play")}</Link>
        </Button>
      )}

      <div>
        <h2 className="font-display text-lg">{t("app.session.transcript")}</h2>
        <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-border/70 bg-card/50 p-4 text-sm text-muted-foreground">
          {transcript}
        </pre>
      </div>

      {sections.journalPrompt ? (
        <Button asChild variant="secondary" className="w-full">
          <Link
            href={`/app/journal?prompt=${encodeURIComponent(sections.journalPrompt)}&sessionId=${ws.id}`}
          >
            {t("app.session.openJournal")}
          </Link>
        </Button>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {favorited ? t("app.session.favoritedYes") : t("app.session.favoritedNo")}
      </p>
    </div>
  );
}
