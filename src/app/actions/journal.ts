"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveJournalEntry(prompt: string, content: string, sessionId?: string) {
  const userSession = await auth();
  if (!userSession?.user?.id) throw new Error("Unauthorized");

  await prisma.journalEntry.create({
    data: {
      userId: userSession.user.id,
      prompt,
      content,
      sessionId: sessionId ?? null,
    },
  });
  revalidatePath("/app/journal");
}
