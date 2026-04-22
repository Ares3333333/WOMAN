import type { BreathAudioSummary } from "./audioBreathTracker";
import type { FrontBreathScanResult } from "./frontBreathScan";
import type { PulseScanResult } from "./biofeedback";
import type { SmartRecommendation } from "./smartRecommendations";

export type WellnessState = "calm" | "balanced" | "elevated" | "fatigued" | "tense";

export type WellnessSnapshot = {
  state: WellnessState;
  confidence: number;
  headlineKey: string;
  supportKey: string;
};

export type OutcomeGuidance = {
  todayKey: string;
  tomorrowKey: string;
  quoteKey: string;
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function deriveWellnessSnapshot(input: {
  pulse: PulseScanResult | null;
  front: FrontBreathScanResult | null;
  mic: BreathAudioSummary | null;
  hour: number;
}): WellnessSnapshot {
  const pulse = input.pulse?.pulse ?? null;
  const breathingRate = input.front?.breathingRate ?? null;
  const regularity = input.front?.regularity ?? null;
  const frontState = input.front?.stateLabel ?? "neutral";
  const pulseQuality = clamp((input.pulse?.signalQuality ?? 0.42) * (input.pulse?.confidence ?? 0.42));
  const frontQuality = clamp((input.front?.signalQuality ?? 0.42) * (input.front?.confidence ?? 0.42));
  const micQuality = clamp(input.mic?.confidence ?? 0.38);
  const blendedSignal = clamp(pulseQuality * 0.38 + frontQuality * 0.44 + micQuality * 0.18);

  let elevated = 0;
  let fatigue = 0;
  let tense = 0;
  let calm = 0;

  if (pulse != null) {
    if (pulse >= 92) elevated += 0.4 * pulseQuality;
    if (pulse <= 60) fatigue += 0.2 * pulseQuality;
    if (pulse >= 84 && pulse < 92) tense += 0.18 * pulseQuality;
    if (pulse < 74) calm += 0.2 * pulseQuality;
  }

  if (breathingRate != null) {
    if (breathingRate >= 20) elevated += 0.35 * frontQuality;
    if (breathingRate <= 9) fatigue += 0.18 * frontQuality;
    if (breathingRate >= 16 && breathingRate < 20) tense += 0.15 * frontQuality;
    if (breathingRate >= 10 && breathingRate <= 14) calm += 0.18 * frontQuality;
  }

  if (regularity != null) {
    if (regularity < 0.38) tense += 0.28 * frontQuality;
    if (regularity >= 0.62) calm += 0.22 * frontQuality;
  }

  if (frontState === "activated") elevated += 0.28 * frontQuality;
  if (frontState === "tense") tense += 0.3 * frontQuality;
  if (frontState === "calm") calm += 0.25 * frontQuality;

  if (input.mic?.guidance === "irregular") tense += 0.2 * micQuality;
  if (input.mic?.guidance === "good" || input.mic?.guidance === "excellent") calm += 0.14 * micQuality;

  if (input.hour >= 22 || input.hour < 5) {
    if (elevated > 0.35) tense += 0.12;
    if (fatigue > 0.2) fatigue += 0.08;
  }

  const packed: Array<{ state: WellnessState; score: number }> = [
    { state: "calm", score: calm },
    { state: "balanced", score: 0.42 + calm * 0.15 - tense * 0.15 },
    { state: "elevated", score: elevated },
    { state: "fatigued", score: fatigue },
    { state: "tense", score: tense },
  ];

  const sorted = packed.sort((a, b) => b.score - a.score);
  const best = sorted[0] ?? { state: "balanced" as WellnessState, score: 0.45 };
  const second = sorted[1] ?? { state: "balanced" as WellnessState, score: 0.35 };

  const rawConfidence = 0.42 + clamp(best.score - second.score, 0, 0.4);
  const confidence = Number(clamp(rawConfidence * (0.55 + blendedSignal * 0.45), 0.28, 0.96).toFixed(2));
  const conservativeState: WellnessState =
    confidence < 0.42 || blendedSignal < 0.35 ? "balanced" : (best.state as WellnessState);

  return {
    state: conservativeState,
    confidence,
    headlineKey: `wellnessState_${conservativeState}`,
    supportKey: `wellnessStateSupport_${conservativeState}`,
  };
}

export function buildOutcomeGuidance(input: {
  summaryCode: "strong" | "moderate" | "mixed" | "incomplete" | undefined;
  recommendation: SmartRecommendation | null;
  mic: BreathAudioSummary | null;
}): OutcomeGuidance {
  if (input.recommendation?.mode === "sleep_prepare") {
    return {
      todayKey: "bioAdviceTodaySleep",
      tomorrowKey: "bioAdviceTomorrowSleep",
      quoteKey: "bioQuoteNight",
    };
  }

  if (input.recommendation?.mode === "focus") {
    return {
      todayKey: "bioAdviceTodayFocus",
      tomorrowKey: "bioAdviceTomorrowFocus",
      quoteKey: "bioQuoteFocus",
    };
  }

  if (input.mic?.guidance === "irregular") {
    return {
      todayKey: "bioAdviceTodayIrregular",
      tomorrowKey: "bioAdviceTomorrowIrregular",
      quoteKey: "bioQuoteGentle",
    };
  }

  if (input.summaryCode === "strong") {
    return {
      todayKey: "bioAdviceTodayStrong",
      tomorrowKey: "bioAdviceTomorrowStrong",
      quoteKey: "bioQuoteStrong",
    };
  }

  return {
    todayKey: "bioAdviceTodayBaseline",
    tomorrowKey: "bioAdviceTomorrowBaseline",
    quoteKey: "bioQuoteBaseline",
  };
}
