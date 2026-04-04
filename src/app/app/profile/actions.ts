"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { SensualContentMode } from "@prisma/client";

export async function updateProfilePrefs(data: {
  displayName: string;
  sensualContentMode: SensualContentMode;
  skipSensualInFeed: boolean;
  voiceTonePref: string;
  listeningTimePref: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName: data.displayName || null,
    },
    update: { displayName: data.displayName || null },
  });

  await prisma.preference.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      sensualContentMode: data.sensualContentMode,
      skipSensualInFeed: data.skipSensualInFeed,
      voiceTonePref: data.voiceTonePref,
      listeningTimePref: data.listeningTimePref,
    },
    update: {
      sensualContentMode: data.sensualContentMode,
      skipSensualInFeed: data.skipSensualInFeed,
      voiceTonePref: data.voiceTonePref,
      listeningTimePref: data.listeningTimePref,
    },
  });

  revalidatePath("/app/profile");
  revalidatePath("/app");
}
