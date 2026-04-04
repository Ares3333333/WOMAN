"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function recordPlaybackComplete(sessionId: string): Promise<void> {
  const userSession = await auth();
  if (!userSession?.user?.id) return;

  await prisma.playbackHistory.upsert({
    where: {
      userId_sessionId: { userId: userSession.user.id, sessionId },
    },
    create: {
      userId: userSession.user.id,
      sessionId,
      progressSeconds: 0,
      completed: true,
      lastPlayedAt: new Date(),
    },
    update: {
      completed: true,
      lastPlayedAt: new Date(),
    },
  });
  revalidatePath("/app/recent");
}

export async function touchPlayback(sessionId: string): Promise<void> {
  const userSession = await auth();
  if (!userSession?.user?.id) return;

  await prisma.playbackHistory.upsert({
    where: {
      userId_sessionId: { userId: userSession.user.id, sessionId },
    },
    create: {
      userId: userSession.user.id,
      sessionId,
      progressSeconds: 0,
      completed: false,
      lastPlayedAt: new Date(),
    },
    update: {
      lastPlayedAt: new Date(),
    },
  });
}
