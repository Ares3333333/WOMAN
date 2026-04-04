import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PenLine } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSessionBySlug } from "@/lib/data/wellness-sessions";
import { Button } from "@/components/ui/button";
import { SessionSignatureGate } from "@/components/premium/session-signature-gate";
import { SessionHero } from "@/components/session/session-hero";
import { SessionTranscriptPanel } from "@/components/session/session-transcript-panel";
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
      <div className="space-y-6 pb-10">
        <div className="rounded-3xl border border-border/50 bg-card/70 px-6 py-8 shadow-soft md:px-8">
          <div className="mx-auto mb-4 h-px w-8 bg-primary/20" aria-hidden />
          <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">{t("app.session.hiddenSensual")}</p>
          <Button asChild variant="secondary" size="lg" className="mt-6 rounded-full">
            <Link href="/app/profile">{t("app.session.openPrefs")}</Link>
          </Button>
        </div>
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

  const favorited = await prisma.favorite.findUnique({
    where: {
      userId_sessionId: { userId: session.user.id, sessionId: ws.id },
    },
  });

  const durationLabel = `${ws.durationMinutes} ${t("sessionCard.min")}`;
  const intensityLabel = t(`sessionCard.intensity.${ws.intensity}`);
  const favoritedHint = favorited ? t("app.session.favoriteHintYes") : t("app.session.favoriteHintNo");

  const sectionTitles = {
    intro: t("app.session.script.intro"),
    settling: t("app.session.script.settling"),
    guidedBreathing: t("app.session.script.guidedBreathing"),
    bodyAwareness: t("app.session.script.bodyAwareness"),
    affirmation: t("app.session.script.affirmation"),
    closing: t("app.session.script.closing"),
  } as const;

  return (
    <div className="space-y-10 pb-36 pt-1">
      <SessionHero
        gradientKey={ws.coverGradient}
        categoryName={ws.category.name}
        title={ws.title}
        shortDescription={ws.shortDescription}
        durationLabel={durationLabel}
        intensityLabel={intensityLabel}
        premium={!ws.freeTier}
        favoritedHint={favoritedHint}
      />

      {locked ? (
        <SessionSignatureGate
          premiumHref={`/app/premium?from=session&slug=${encodeURIComponent(slug)}`}
          copy={{
            eyebrow: t("app.session.gateEyebrow"),
            title: t("app.session.gateTitle"),
            body: t("app.session.gateBody"),
            cta: t("app.session.gateCta"),
            secondary: t("app.session.gateSecondary"),
          }}
        />
      ) : (
        <div className="rounded-lg border border-border/50 bg-card/50 p-1 shadow-sm dark:border-white/[0.07] dark:bg-card/40">
          <Button asChild className="h-14 w-full rounded-md text-base font-medium tracking-tight" size="lg">
            <Link href={`/app/play/${ws.id}`}>{t("app.session.play")}</Link>
          </Button>
        </div>
      )}

      <section className="space-y-3 border-t border-border/40 pt-8">
        <h2 className="font-display text-base font-medium tracking-tight text-foreground md:text-lg">{t("app.session.inThisSession")}</h2>
        <p className="max-w-2xl text-sm leading-[1.75] text-muted-foreground md:text-[0.9375rem]">{ws.longDescription}</p>
      </section>

      {ws.contraindicationNote ? (
        <aside className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/80">{t("app.session.notePrefix")}</span> {ws.contraindicationNote}
        </aside>
      ) : null}

      {sections.journalPrompt ? (
        <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.05] via-card to-muted/20 p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-primary/80">{t("app.session.journalEyebrow")}</p>
              <h3 className="font-display text-xl font-medium tracking-tight">{t("app.session.journalTitle")}</h3>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{t("app.session.journalBody")}</p>
            </div>
            <PenLine className="hidden h-8 w-8 shrink-0 text-primary/25 sm:block" aria-hidden />
          </div>
          <Button asChild className="mt-6 rounded-full px-8" size="lg">
            <Link
              href={`/app/journal?prompt=${encodeURIComponent(sections.journalPrompt)}&sessionId=${ws.id}`}
              className="inline-flex items-center gap-2"
            >
              <PenLine className="h-4 w-4" aria-hidden />
              {t("app.session.openJournal")}
            </Link>
          </Button>
        </div>
      ) : null}

      <SessionTranscriptPanel
        sections={sections}
        sectionTitles={sectionTitles}
        heading={t("app.session.transcriptHeading")}
        hint={t("app.session.transcriptHint")}
        locked={locked}
        lockedEyebrow={t("app.session.transcriptLockedEyebrow")}
        lockedTitle={t("app.session.transcriptLockedTitle")}
        lockedBody={t("app.session.transcriptLockedBody")}
      />
    </div>
  );
}
