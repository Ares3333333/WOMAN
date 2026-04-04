"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { SensualContentMode } from "@prisma/client";

export async function saveOnboarding(data: {
  bringReason: string;
  preferredSessionLength: string;
  stressLevel: number;
  sensualContentMode: SensualContentMode;
  voiceTonePref: string;
  listeningTimePref: string;
  skipSensualInFeed: boolean;
}): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.preference.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      onboardingComplete: true,
      onboardingStep: 5,
      bringReason: data.bringReason,
      preferredSessionLength: data.preferredSessionLength,
      stressLevel: data.stressLevel,
      sensualContentMode: data.sensualContentMode,
      voiceTonePref: data.voiceTonePref,
      listeningTimePref: data.listeningTimePref,
      skipSensualInFeed: data.skipSensualInFeed,
    },
    update: {
      onboardingComplete: true,
      onboardingStep: 5,
      bringReason: data.bringReason,
      preferredSessionLength: data.preferredSessionLength,
      stressLevel: data.stressLevel,
      sensualContentMode: data.sensualContentMode,
      voiceTonePref: data.voiceTonePref,
      listeningTimePref: data.listeningTimePref,
      skipSensualInFeed: data.skipSensualInFeed,
    },
  });
  revalidatePath("/app");
}
