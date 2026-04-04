"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleFavorite(sessionId: string): Promise<{ favorited: boolean }> {
  const userSession = await auth();
  if (!userSession?.user?.id) throw new Error("Unauthorized");

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_sessionId: { userId: userSession.user.id, sessionId },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_sessionId: { userId: userSession.user.id, sessionId } },
    });
    revalidatePath("/app");
    revalidatePath("/app/favorites");
    return { favorited: false };
  }

  await prisma.favorite.create({
    data: { userId: userSession.user.id, sessionId },
  });
  revalidatePath("/app");
  revalidatePath("/app/favorites");
  return { favorited: true };
}
