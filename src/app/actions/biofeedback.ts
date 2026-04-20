"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_BASELINE,
  baselineReliabilityLevel,
  updateBaseline,
  type BaselineState,
} from "@/features/biofeedback/baseline";
import {
  calculateCalmSnapshot,
  calculateSessionEffect,
  recommendationFromCalmLevel,
} from "@/features/biofeedback/scoring";

const MIN_QUALITY_FOR_SCORE = 0.45;

const scanPayloadSchema = z.object({
  pulse: z.number().int().nullable(),
  breathingRate: z.number().nullable(),
  signalQuality: z.number().min(0).max(1),
  durationMs: z.number().int().positive(),
  deviceMode: z.string().min(2),
  rawStatus: z.string().min(2),
  failureReason: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

const preScanSchema = z.object({
  meditationSessionId: z.string().min(8),
  meditationType: z.string().min(2),
  locale: z.enum(["en", "ru"]).default("en"),
  scan: scanPayloadSchema,
});

const postScanSchema = z.object({
  biofeedbackSessionId: z.string().min(8),
  locale: z.enum(["en", "ru"]).default("en"),
  scan: scanPayloadSchema,
  breathMetrics: z
    .object({
      adherenceScore: z.number().min(0).max(1).nullable(),
      stillnessScore: z.number().min(0).max(1).nullable(),
    })
    .optional(),
});

function isScanReliable(scan: z.infer<typeof scanPayloadSchema>): boolean {
  return scan.rawStatus === "ok" && scan.pulse != null && scan.signalQuality >= MIN_QUALITY_FOR_SCORE;
}

function lowSignalSummary(locale: "en" | "ru"): string {
  if (locale === "ru") return "Сигнал недостаточного качества. Попробуйте снова и удерживайте палец неподвижно.";
  return "Signal quality was too low. Try again and keep your finger still.";
}

function postMissingSummary(locale: "en" | "ru"): string {
  if (locale === "ru") return "Сессию завершили, но замер после практики не получился. Можно повторить позже.";
  return "Session finished, but the after-scan was not reliable. You can retry later.";
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

async function loadOrCreateBaseline(userId: string): Promise<{
  dbId: string;
  baseline: BaselineState;
}> {
  const existing = await prisma.personalBiometricBaseline.findUnique({
    where: { userId },
  });

  if (!existing) {
    const created = await prisma.personalBiometricBaseline.create({
      data: {
        userId,
        restingPulse: DEFAULT_BASELINE.restingPulse,
        pulseSpread: DEFAULT_BASELINE.pulseSpread,
        sampleCount: DEFAULT_BASELINE.sampleCount,
        version: DEFAULT_BASELINE.version,
      },
    });
    return {
      dbId: created.id,
      baseline: {
        restingPulse: created.restingPulse,
        pulseSpread: created.pulseSpread,
        sampleCount: created.sampleCount,
        version: created.version,
      },
    };
  }

  return {
    dbId: existing.id,
    baseline: {
      restingPulse: existing.restingPulse,
      pulseSpread: existing.pulseSpread,
      sampleCount: existing.sampleCount,
      version: existing.version,
    },
  };
}

async function persistBaselineIfChanged(
  baselineDbId: string,
  previous: BaselineState,
  next: BaselineState
): Promise<void> {
  if (
    previous.restingPulse === next.restingPulse &&
    previous.pulseSpread === next.pulseSpread &&
    previous.sampleCount === next.sampleCount &&
    previous.version === next.version
  ) {
    return;
  }

  await prisma.personalBiometricBaseline.update({
    where: { id: baselineDbId },
    data: {
      restingPulse: next.restingPulse,
      pulseSpread: next.pulseSpread,
      sampleCount: next.sampleCount,
      version: next.version,
    },
  });
}

export async function acceptBiofeedbackConsent(): Promise<void> {
  const userId = await requireUserId();

  await prisma.preference.upsert({
    where: { userId },
    create: {
      userId,
      biofeedbackOnboardingComplete: true,
      biofeedbackConsentAt: new Date(),
    },
    update: {
      biofeedbackOnboardingComplete: true,
      biofeedbackConsentAt: new Date(),
    },
  });

  revalidatePath("/app/profile");
  revalidatePath("/app/play");
}

export async function savePreSessionBiofeedback(input: unknown) {
  const userId = await requireUserId();
  const parsed = preScanSchema.parse(input);
  const reliable = isScanReliable(parsed.scan);

  const { dbId: baselineDbId, baseline } = await loadOrCreateBaseline(userId);
  const nextBaseline = updateBaseline(baseline, parsed.scan.pulse, parsed.scan.signalQuality);
  await persistBaselineIfChanged(baselineDbId, baseline, nextBaseline);

  const scan = await prisma.biometricScan.create({
    data: {
      userId,
      measurementType: "pre_session",
      pulse: parsed.scan.pulse ?? null,
      breathingRate: parsed.scan.breathingRate ?? null,
      signalQuality: parsed.scan.signalQuality,
      durationMs: parsed.scan.durationMs,
      deviceMode: parsed.scan.deviceMode,
      rawStatus: parsed.scan.rawStatus,
      failureReason: parsed.scan.failureReason,
      baselineVersion: nextBaseline.version,
      baselineId: baselineDbId,
      sessionId: parsed.meditationSessionId,
    },
  });

  if (!reliable) {
    revalidatePath("/app/biofeedback");
    return {
      ok: false,
      biofeedbackSessionId: null,
      preScanId: scan.id,
      preCalmSnapshotId: null,
      pulse: null,
      signalQuality: scan.signalQuality,
      calmScore: null,
      recoveryScore: null,
      confidence: 0,
      baselinePulse: nextBaseline.restingPulse,
      baselineReliability: baselineReliabilityLevel(nextBaseline.sampleCount),
      recommendation: lowSignalSummary(parsed.locale),
      summary: lowSignalSummary(parsed.locale),
      failureReason: scan.failureReason ?? "unstable_signal",
    };
  }

  const calm = calculateCalmSnapshot({
    pulse: scan.pulse,
    baselinePulse: nextBaseline.restingPulse,
    signalQuality: scan.signalQuality,
  });

  const calmSnapshot = await prisma.calmScoreSnapshot.create({
    data: {
      userId,
      calmScore: calm.calmScore,
      recoveryScore: calm.recoveryScore,
      confidence: calm.confidence,
      inputsSummary: JSON.stringify({
        phase: "pre",
        pulse: scan.pulse,
        baselinePulse: nextBaseline.restingPulse,
        signalQuality: scan.signalQuality,
      }),
      scanId: scan.id,
    },
  });

  const bioSession = await prisma.meditationBiofeedbackSession.create({
    data: {
      userId,
      meditationSessionId: parsed.meditationSessionId,
      meditationType: parsed.meditationType,
      preScanId: scan.id,
      preCalmSnapshotId: calmSnapshot.id,
    },
  });

  revalidatePath("/app/biofeedback");

  return {
    ok: true,
    biofeedbackSessionId: bioSession.id,
    preScanId: scan.id,
    preCalmSnapshotId: calmSnapshot.id,
    pulse: scan.pulse,
    signalQuality: scan.signalQuality,
    calmScore: calm.calmScore,
    recoveryScore: calm.recoveryScore,
    confidence: calm.confidence,
    baselinePulse: nextBaseline.restingPulse,
    baselineReliability: baselineReliabilityLevel(nextBaseline.sampleCount),
    recommendation: recommendationFromCalmLevel(calm.level, parsed.locale),
    summary: calm.summary,
    failureReason: null,
  };
}

export async function savePostSessionBiofeedback(input: unknown) {
  const userId = await requireUserId();
  const parsed = postScanSchema.parse(input);

  const bioSession = await prisma.meditationBiofeedbackSession.findFirst({
    where: {
      id: parsed.biofeedbackSessionId,
      userId,
    },
    include: {
      preScan: true,
      preCalmSnapshot: true,
      meditationSession: true,
    },
  });

  if (!bioSession) throw new Error("Biofeedback session not found");

  const { dbId: baselineDbId, baseline } = await loadOrCreateBaseline(userId);
  const nextBaseline = updateBaseline(baseline, parsed.scan.pulse, parsed.scan.signalQuality);
  await persistBaselineIfChanged(baselineDbId, baseline, nextBaseline);

  const postScan = await prisma.biometricScan.create({
    data: {
      userId,
      measurementType: "post_session",
      pulse: parsed.scan.pulse ?? null,
      breathingRate: parsed.scan.breathingRate ?? null,
      signalQuality: parsed.scan.signalQuality,
      durationMs: parsed.scan.durationMs,
      deviceMode: parsed.scan.deviceMode,
      rawStatus: parsed.scan.rawStatus,
      failureReason: parsed.scan.failureReason,
      baselineVersion: nextBaseline.version,
      baselineId: baselineDbId,
      sessionId: bioSession.meditationSessionId,
    },
  });

  const reliablePost = isScanReliable(parsed.scan);
  if (!reliablePost) {
    await prisma.meditationBiofeedbackSession.update({
      where: { id: bioSession.id },
      data: {
        endedAt: new Date(),
        durationMs: bioSession.startedAt ? Date.now() - bioSession.startedAt.getTime() : null,
        postScanId: postScan.id,
        summaryText: postMissingSummary(parsed.locale),
      },
    });

    revalidatePath("/app/biofeedback");
    revalidatePath("/app/recent");

    return {
      ok: false,
      postScanId: postScan.id,
      postCalmSnapshotId: null,
      pulseBefore: bioSession.preScan?.pulse ?? null,
      pulseAfter: null,
      calmBefore: bioSession.preCalmSnapshot?.calmScore ?? null,
      calmAfter: null,
      recoveryAfter: null,
      confidence: 0,
      sessionEffect: null,
      summary: postMissingSummary(parsed.locale),
      failureReason: postScan.failureReason ?? "unstable_signal",
    };
  }

  const pulseDelta =
    bioSession.preScan?.pulse != null && postScan.pulse != null
      ? postScan.pulse - bioSession.preScan.pulse
      : null;

  const postCalm = calculateCalmSnapshot({
    pulse: postScan.pulse,
    baselinePulse: nextBaseline.restingPulse,
    signalQuality: postScan.signalQuality,
    preToPostPulseDelta: pulseDelta,
    breathingConsistency: parsed.breathMetrics?.adherenceScore ?? null,
    stillnessScore: parsed.breathMetrics?.stillnessScore ?? null,
  });

  const postCalmSnapshot = await prisma.calmScoreSnapshot.create({
    data: {
      userId,
      calmScore: postCalm.calmScore,
      recoveryScore: postCalm.recoveryScore,
      confidence: postCalm.confidence,
      inputsSummary: JSON.stringify({
        phase: "post",
        pulse: postScan.pulse,
        baselinePulse: nextBaseline.restingPulse,
        signalQuality: postScan.signalQuality,
        preToPostPulseDelta: pulseDelta,
        breath: parsed.breathMetrics ?? null,
      }),
      scanId: postScan.id,
    },
  });

  const preCalm = bioSession.preCalmSnapshot;
  const effect = calculateSessionEffect({
    preCalmScore: preCalm?.calmScore ?? 50,
    postCalmScore: postCalm.calmScore,
    prePulse: bioSession.preScan?.pulse ?? null,
    postPulse: postScan.pulse ?? null,
  });

  await prisma.meditationBiofeedbackSession.update({
    where: { id: bioSession.id },
    data: {
      endedAt: new Date(),
      durationMs: bioSession.startedAt ? Date.now() - bioSession.startedAt.getTime() : null,
      postScanId: postScan.id,
      postCalmSnapshotId: postCalmSnapshot.id,
      sessionEffect: effect.sessionEffect,
      summaryText: effect.summary,
    },
  });

  revalidatePath("/app/biofeedback");
  revalidatePath("/app/recent");

  return {
    ok: true,
    postScanId: postScan.id,
    postCalmSnapshotId: postCalmSnapshot.id,
    pulseBefore: bioSession.preScan?.pulse ?? null,
    pulseAfter: postScan.pulse,
    calmBefore: preCalm?.calmScore ?? null,
    calmAfter: postCalm.calmScore,
    recoveryAfter: postCalm.recoveryScore,
    confidence: postCalm.confidence,
    sessionEffect: effect.sessionEffect,
    summary: effect.summary,
    failureReason: null,
  };
}
