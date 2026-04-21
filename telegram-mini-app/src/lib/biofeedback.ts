export type BiofeedbackRawStatus =
  | "ok"
  | "low_signal"
  | "permission_denied"
  | "unsupported"
  | "timeout"
  | "canceled";

export type BiofeedbackFailureReason =
  | "insufficient_light"
  | "high_motion"
  | "finger_not_detected"
  | "unstable_signal"
  | "permission_denied"
  | "camera_unavailable"
  | "timeout"
  | "canceled"
  | "unknown";

export type ScanPhase = "pre" | "post" | "standalone";

export type PulseScanResult = {
  pulse: number | null;
  signalQuality: number;
  durationMs: number;
  rawStatus: BiofeedbackRawStatus;
  failureReason?: BiofeedbackFailureReason;
  confidence: number;
  device?: {
    cameraFacing: "environment" | "unknown";
    torchAvailable: boolean;
    torchEnabled: boolean;
    cameraLabel?: string;
  };
};

export type BaselineReliability = "initial" | "building" | "stable";

export type BiofeedbackBaseline = {
  restingPulse: number;
  pulseSpread: number;
  sampleCount: number;
  version: number;
  updatedAt: string;
};

export type BiometricScanRecord = {
  id: string;
  createdAt: string;
  meditationSlug: string | null;
  phase: ScanPhase;
  pulse: number | null;
  breathingRate: number | null;
  breathingRegularity: number | null;
  frontStateLabel: string | null;
  signalQuality: number;
  durationMs: number;
  rawStatus: BiofeedbackRawStatus;
  failureReason: BiofeedbackFailureReason | null;
  confidence: number;
  calmScore: number | null;
  recoveryScore: number | null;
  baselineVersion: number;
};

export type MeditationBiofeedbackSessionRecord = {
  id: string;
  meditationSlug: string;
  startedAt: string;
  endedAt: string | null;
  preScanId: string | null;
  postScanId: string | null;
  prePulse: number | null;
  postPulse: number | null;
  preBreathingRate: number | null;
  postBreathingRate: number | null;
  preFrontState: string | null;
  postFrontState: string | null;
  preCalmScore: number | null;
  postCalmScore: number | null;
  recoveryScoreAfter: number | null;
  breathAdherence: number | null;
  breathStillness: number | null;
  micBreathRate: number | null;
  micRhythmStability: number | null;
  micConfidence: number | null;
  micGuidance: string | null;
  recommendationMode: string | null;
  recommendedSessionSlug: string | null;
  sessionEffect: number | null;
  summaryCode: "strong" | "moderate" | "mixed" | "incomplete";
};

export type BiofeedbackStore = {
  baseline: BiofeedbackBaseline;
  scans: BiometricScanRecord[];
  sessions: MeditationBiofeedbackSessionRecord[];
};

export type CalmSnapshot = {
  calmScore: number;
  recoveryScore: number;
  confidence: number;
  level: "tense" | "neutral" | "calm";
};

export type BreathCoachMetrics = {
  adherenceScore: number | null;
  stillnessScore: number | null;
};

export type FrontWellnessSnapshot = {
  breathingRate: number | null;
  regularity: number | null;
  stateLabel: string | null;
  confidence: number;
  signalQuality: number;
};

export type AudioBreathSnapshot = {
  breathRate: number | null;
  rhythmStability: number | null;
  confidence: number;
  guidance: string;
};

const STORAGE_KEY = "sora_tg_biofeedback_v1";
const MIN_QUALITY_FOR_SCORE = 0.45;
const STORE_LIMIT = 120;

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function uid(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now()}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function defaultBaseline(): BiofeedbackBaseline {
  return {
    restingPulse: 72,
    pulseSpread: 8,
    sampleCount: 0,
    version: 1,
    updatedAt: nowIso(),
  };
}

function defaultStore(): BiofeedbackStore {
  return {
    baseline: defaultBaseline(),
    scans: [],
    sessions: [],
  };
}

export function loadBiofeedbackStore(): BiofeedbackStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw) as Partial<BiofeedbackStore>;

    return {
      baseline: parsed.baseline ?? defaultBaseline(),
      scans: Array.isArray(parsed.scans) ? parsed.scans.slice(-STORE_LIMIT) : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions.slice(-STORE_LIMIT) : [],
    };
  } catch {
    return defaultStore();
  }
}

function saveBiofeedbackStore(store: BiofeedbackStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function isReliable(scan: PulseScanResult): boolean {
  return scan.rawStatus === "ok" && scan.pulse != null && scan.signalQuality >= MIN_QUALITY_FOR_SCORE;
}

function normalizeDeviation(pulse: number, baseline: number): number {
  const delta = Math.abs(pulse - baseline);
  return clamp(0, delta / Math.max(9, baseline * 0.2), 1.2);
}

export function calculateCalmSnapshot(
  pulse: number | null,
  signalQuality: number,
  baselinePulse: number,
  preToPostDelta: number | null,
  breathMetrics: BreathCoachMetrics | null
): CalmSnapshot {
  let calm = 62;
  let recovery = 58;

  if (pulse != null) {
    const d = normalizeDeviation(pulse, baselinePulse);
    calm -= d * 27;
    recovery -= d * 20;
    if (pulse <= baselinePulse - 4) {
      calm += 7;
      recovery += 8;
    }
  } else {
    calm -= 10;
    recovery -= 8;
  }

  if (preToPostDelta != null) {
    const bonus = clamp(-8, -preToPostDelta * 1.3, 12);
    calm += bonus * 0.7;
    recovery += bonus;
  }

  if (breathMetrics?.adherenceScore != null) {
    calm += clamp(0, breathMetrics.adherenceScore, 1) * 12;
    recovery += clamp(0, breathMetrics.adherenceScore, 1) * 11;
  }

  if (breathMetrics?.stillnessScore != null) {
    calm += clamp(0, breathMetrics.stillnessScore, 1) * 8;
    recovery += clamp(0, breathMetrics.stillnessScore, 1) * 7;
  }

  calm = Math.round(clamp(20, calm, 97));
  recovery = Math.round(clamp(18, recovery, 98));

  const level: CalmSnapshot["level"] = calm >= 72 ? "calm" : calm >= 48 ? "neutral" : "tense";
  const confidence = Number(clamp(0.2, signalQuality * 0.92, 0.98).toFixed(2));

  return {
    calmScore: calm,
    recoveryScore: recovery,
    confidence,
    level,
  };
}

function updateBaseline(current: BiofeedbackBaseline, pulse: number | null, signalQuality: number): BiofeedbackBaseline {
  if (pulse == null || signalQuality < MIN_QUALITY_FOR_SCORE) return current;

  const weight = clamp(0.05, signalQuality * 0.18, 0.18);
  const nextRest = Math.round(current.restingPulse * (1 - weight) + pulse * weight);
  const nextSpread = clamp(
    4,
    Math.round(current.pulseSpread * (1 - weight) + Math.abs(pulse - nextRest) * weight),
    18
  );

  return {
    restingPulse: clamp(50, nextRest, 100),
    pulseSpread: nextSpread,
    sampleCount: current.sampleCount + 1,
    version: current.version + 1,
    updatedAt: nowIso(),
  };
}

export function baselineReliability(sampleCount: number): BaselineReliability {
  if (sampleCount < 3) return "initial";
  if (sampleCount < 8) return "building";
  return "stable";
}

function calcSessionEffect(
  preCalm: number | null,
  postCalm: number | null,
  prePulse: number | null,
  postPulse: number | null
): { sessionEffect: number | null; summaryCode: MeditationBiofeedbackSessionRecord["summaryCode"] } {
  if (preCalm == null || postCalm == null || prePulse == null || postPulse == null) {
    return { sessionEffect: null, summaryCode: "incomplete" };
  }

  const calmDelta = postCalm - preCalm;
  const pulseDelta = prePulse - postPulse;
  const score = Math.round(clamp(-40, calmDelta * 1.35 + pulseDelta * 1.05, 40));

  if (score >= 16) return { sessionEffect: score, summaryCode: "strong" };
  if (score >= 6) return { sessionEffect: score, summaryCode: "moderate" };
  return { sessionEffect: score, summaryCode: "mixed" };
}

function appendWithLimit<T>(items: T[], next: T): T[] {
  return [...items, next].slice(-STORE_LIMIT);
}

export function savePreSessionCheckIn(input: {
  meditationSlug: string;
  scan: PulseScanResult;
  frontSnapshot?: FrontWellnessSnapshot | null;
  recommendation?: { mode: string; sessionSlug: string | null } | null;
}): {
  scanRecord: BiometricScanRecord;
  sessionRecord: MeditationBiofeedbackSessionRecord | null;
  baseline: BiofeedbackBaseline;
  reliable: boolean;
} {
  const store = loadBiofeedbackStore();
  const reliable = isReliable(input.scan);
  const nextBaseline = updateBaseline(store.baseline, input.scan.pulse, input.scan.signalQuality);

  const calm = reliable
    ? calculateCalmSnapshot(input.scan.pulse, input.scan.signalQuality, nextBaseline.restingPulse, null, null)
    : null;

  const scanRecord: BiometricScanRecord = {
    id: uid("scan"),
    createdAt: nowIso(),
    meditationSlug: input.meditationSlug,
    phase: "pre",
    pulse: reliable ? input.scan.pulse : null,
    breathingRate: input.frontSnapshot?.breathingRate ?? null,
    breathingRegularity: input.frontSnapshot?.regularity ?? null,
    frontStateLabel: input.frontSnapshot?.stateLabel ?? null,
    signalQuality: Number(input.scan.signalQuality.toFixed(2)),
    durationMs: input.scan.durationMs,
    rawStatus: input.scan.rawStatus,
    failureReason: input.scan.failureReason ?? null,
    confidence: input.scan.confidence,
    calmScore: calm?.calmScore ?? null,
    recoveryScore: calm?.recoveryScore ?? null,
    baselineVersion: nextBaseline.version,
  };

  let sessionRecord: MeditationBiofeedbackSessionRecord | null = null;
  if (reliable) {
    sessionRecord = {
      id: uid("bio_session"),
      meditationSlug: input.meditationSlug,
      startedAt: nowIso(),
      endedAt: null,
      preScanId: scanRecord.id,
      postScanId: null,
      prePulse: scanRecord.pulse,
      postPulse: null,
      preBreathingRate: scanRecord.breathingRate,
      postBreathingRate: null,
      preFrontState: scanRecord.frontStateLabel,
      postFrontState: null,
      preCalmScore: scanRecord.calmScore,
      postCalmScore: null,
      recoveryScoreAfter: null,
      breathAdherence: null,
      breathStillness: null,
      micBreathRate: null,
      micRhythmStability: null,
      micConfidence: null,
      micGuidance: null,
      recommendationMode: input.recommendation?.mode ?? null,
      recommendedSessionSlug: input.recommendation?.sessionSlug ?? null,
      sessionEffect: null,
      summaryCode: "incomplete",
    };
  }

  const nextStore: BiofeedbackStore = {
    baseline: nextBaseline,
    scans: appendWithLimit(store.scans, scanRecord),
    sessions: sessionRecord ? appendWithLimit(store.sessions, sessionRecord) : store.sessions,
  };

  saveBiofeedbackStore(nextStore);

  return {
    scanRecord,
    sessionRecord,
    baseline: nextBaseline,
    reliable,
  };
}

export function saveStandaloneScan(input: {
  phase: "post" | "standalone";
  meditationSlug: string | null;
  scan: PulseScanResult;
}): BiometricScanRecord {
  const store = loadBiofeedbackStore();
  const reliable = isReliable(input.scan);
  const nextBaseline = updateBaseline(store.baseline, input.scan.pulse, input.scan.signalQuality);
  const calm = reliable
    ? calculateCalmSnapshot(input.scan.pulse, input.scan.signalQuality, nextBaseline.restingPulse, null, null)
    : null;

  const scanRecord: BiometricScanRecord = {
    id: uid("scan"),
    createdAt: nowIso(),
    meditationSlug: input.meditationSlug,
    phase: input.phase,
    pulse: reliable ? input.scan.pulse : null,
    breathingRate: null,
    breathingRegularity: null,
    frontStateLabel: null,
    signalQuality: Number(input.scan.signalQuality.toFixed(2)),
    durationMs: input.scan.durationMs,
    rawStatus: input.scan.rawStatus,
    failureReason: input.scan.failureReason ?? null,
    confidence: input.scan.confidence,
    calmScore: calm?.calmScore ?? null,
    recoveryScore: calm?.recoveryScore ?? null,
    baselineVersion: nextBaseline.version,
  };

  saveBiofeedbackStore({
    baseline: nextBaseline,
    scans: appendWithLimit(store.scans, scanRecord),
    sessions: store.sessions,
  });

  return scanRecord;
}

export function savePostSessionCheckIn(input: {
  bioSessionId: string;
  scan: PulseScanResult;
  breathMetrics: BreathCoachMetrics | null;
  frontSnapshot?: FrontWellnessSnapshot | null;
  audioSnapshot?: AudioBreathSnapshot | null;
}): {
  scanRecord: BiometricScanRecord;
  sessionRecord: MeditationBiofeedbackSessionRecord | null;
  reliable: boolean;
} {
  const store = loadBiofeedbackStore();
  const session = store.sessions.find((s) => s.id === input.bioSessionId) ?? null;

  if (!session) {
    const fallbackScan = saveStandaloneScan({
      phase: "post",
      meditationSlug: null,
      scan: input.scan,
    });
    return {
      scanRecord: fallbackScan,
      sessionRecord: null,
      reliable: isReliable(input.scan),
    };
  }

  const reliable = isReliable(input.scan);
  const nextBaseline = updateBaseline(store.baseline, input.scan.pulse, input.scan.signalQuality);

  const preToPostDelta =
    session.prePulse != null && input.scan.pulse != null ? input.scan.pulse - session.prePulse : null;

  const calm = reliable
    ? calculateCalmSnapshot(
        input.scan.pulse,
        input.scan.signalQuality,
        nextBaseline.restingPulse,
        preToPostDelta,
        input.breathMetrics
      )
    : null;

  const scanRecord: BiometricScanRecord = {
    id: uid("scan"),
    createdAt: nowIso(),
    meditationSlug: session.meditationSlug,
    phase: "post",
    pulse: reliable ? input.scan.pulse : null,
    breathingRate: input.frontSnapshot?.breathingRate ?? null,
    breathingRegularity: input.frontSnapshot?.regularity ?? null,
    frontStateLabel: input.frontSnapshot?.stateLabel ?? null,
    signalQuality: Number(input.scan.signalQuality.toFixed(2)),
    durationMs: input.scan.durationMs,
    rawStatus: input.scan.rawStatus,
    failureReason: input.scan.failureReason ?? null,
    confidence: input.scan.confidence,
    calmScore: calm?.calmScore ?? null,
    recoveryScore: calm?.recoveryScore ?? null,
    baselineVersion: nextBaseline.version,
  };

  const updatedSessions = store.sessions.map((item) => {
    if (item.id !== session.id) return item;

    const effect = calcSessionEffect(
      item.preCalmScore,
      calm?.calmScore ?? null,
      item.prePulse,
      scanRecord.pulse
    );

    return {
      ...item,
      endedAt: nowIso(),
      postScanId: scanRecord.id,
      postPulse: scanRecord.pulse,
      postBreathingRate: scanRecord.breathingRate,
      postFrontState: scanRecord.frontStateLabel,
      postCalmScore: calm?.calmScore ?? null,
      recoveryScoreAfter: calm?.recoveryScore ?? null,
      breathAdherence: input.breathMetrics?.adherenceScore ?? null,
      breathStillness: input.breathMetrics?.stillnessScore ?? null,
      micBreathRate: input.audioSnapshot?.breathRate ?? null,
      micRhythmStability: input.audioSnapshot?.rhythmStability ?? null,
      micConfidence: input.audioSnapshot?.confidence ?? null,
      micGuidance: input.audioSnapshot?.guidance ?? null,
      sessionEffect: effect.sessionEffect,
      summaryCode: effect.summaryCode,
    };
  });

  const nextStore: BiofeedbackStore = {
    baseline: nextBaseline,
    scans: appendWithLimit(store.scans, scanRecord),
    sessions: updatedSessions,
  };

  saveBiofeedbackStore(nextStore);

  return {
    scanRecord,
    sessionRecord: updatedSessions.find((s) => s.id === session.id) ?? null,
    reliable,
  };
}

export function buildSessionRecommendation(level: CalmSnapshot["level"]): "soft" | "deep" | "balanced" {
  if (level === "tense") return "soft";
  if (level === "calm") return "deep";
  return "balanced";
}

export function summarizeBiofeedbackTrends(store: BiofeedbackStore): {
  completedSessions: number;
  avgPulseDelta: number | null;
  avgEffect: number | null;
  recentDirection: "up" | "down" | "flat";
} {
  const completed = store.sessions.filter((s) => s.prePulse != null && s.postPulse != null);
  if (completed.length === 0) {
    return { completedSessions: 0, avgPulseDelta: null, avgEffect: null, recentDirection: "flat" };
  }

  const pulseDelta =
    completed.reduce((sum, s) => sum + ((s.prePulse as number) - (s.postPulse as number)), 0) / completed.length;

  const effects = completed
    .map((s) => s.sessionEffect)
    .filter((v): v is number => typeof v === "number");

  const avgEffect =
    effects.length > 0 ? effects.reduce((sum, value) => sum + value, 0) / effects.length : null;

  const recent = completed
    .slice(-4)
    .map((s) => s.sessionEffect)
    .filter((value): value is number => typeof value === "number");
  const recentDirection: "up" | "down" | "flat" =
    recent.length < 2
      ? "flat"
      : recent[recent.length - 1] - recent[0] > 4
        ? "up"
        : recent[recent.length - 1] - recent[0] < -4
          ? "down"
          : "flat";

  return {
    completedSessions: completed.length,
    avgPulseDelta: Number(pulseDelta.toFixed(1)),
    avgEffect: avgEffect != null ? Number(avgEffect.toFixed(1)) : null,
    recentDirection,
  };
}
