import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSessionById } from "@/lib/data/wellness-sessions";
import { canAccessPremiumSession } from "@/lib/subscription";
import type { ScriptSections } from "@/types/script";
import { PlayClient } from "./play-client";

export default async function PlayPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const ws = await getSessionById(sessionId);
  if (!ws) notFound();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const locked =
    !canAccessPremiumSession(user?.subscriptionStatus ?? "none", ws.freeTier) && !ws.freeTier;
  if (locked) redirect(`/app/premium?from=play&sessionId=${encodeURIComponent(sessionId)}`);

  const pref = await prisma.preference.findUnique({ where: { userId: session.user.id } });
  if (ws.category.slug === "sensual-wellness" && pref?.sensualContentMode === "hidden") {
    redirect("/app/library");
  }

  let script: ScriptSections;
  try {
    script = JSON.parse(ws.scriptJson) as ScriptSections;
  } catch {
    notFound();
  }

  const favorited = !!(await prisma.favorite.findUnique({
    where: {
      userId_sessionId: { userId: session.user.id, sessionId: ws.id },
    },
  }));

  const useBrowserTts =
    process.env.NEXT_PUBLIC_USE_BROWSER_TTS === "true" || !ws.audioFileUrl;
  const breathCoachEligible = ["breathing", "stress-relief", "emotional-reset", "sleep"].includes(
    ws.category.slug
  );

  return (
    <PlayClient
      sessionId={ws.id}
      title={ws.title}
      audioUrl={ws.audioFileUrl}
      script={script}
      favorited={favorited}
      useBrowserTts={useBrowserTts}
      meditationType={ws.category.slug}
      biofeedbackOnboardingComplete={pref?.biofeedbackOnboardingComplete ?? false}
      breathCoachEligible={breathCoachEligible}
    />
  );
}
