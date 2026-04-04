"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveMoodCheckin(mood: string): Promise<void> {
  const userSession = await auth();
  if (!userSession?.user?.id) throw new Error("Unauthorized");

  await prisma.moodCheckin.create({
    data: { userId: userSession.user.id, mood },
  });
  revalidatePath("/app");
}
