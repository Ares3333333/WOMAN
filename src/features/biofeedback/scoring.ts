import type {
  CalmScoreInput,
  CalmScoreOutput,
  SessionEffectInput,
  SessionEffectOutput,
} from "./types";

function clamp(min: number, v: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function normalizePulseDeviation(pulse: number, baseline: number): number {
  const deviation = Math.abs(pulse - baseline);
  return clamp(0, deviation / Math.max(10, baseline * 0.2), 1);
}

export function calculateCalmSnapshot(input: CalmScoreInput): CalmScoreOutput {
  const {
    pulse,
    baselinePulse,
    signalQuality,
    breathingConsistency = null,
    stillnessScore = null,
    preToPostPulseDelta = null,
  } = input;

  let calm = 62;
  let recovery = 58;

  if (pulse != null) {
    const deviation = normalizePulseDeviation(pulse, baselinePulse);
    calm -= deviation * 28;
    recovery -= deviation * 20;

    if (pulse <= baselinePulse - 4) {
      calm += 7;
      recovery += 8;
    }
  } else {
    calm -= 8;
    recovery -= 6;
  }

  if (breathingConsistency != null) {
    calm += clamp(0, breathingConsistency, 1) * 16;
    recovery += clamp(0, breathingConsistency, 1) * 12;
  }

  if (stillnessScore != null) {
    calm += clamp(0, stillnessScore, 1) * 10;
    recovery += clamp(0, stillnessScore, 1) * 8;
  }

  if (preToPostPulseDelta != null) {
    const bonus = clamp(-8, -preToPostPulseDelta * 1.4, 12);
    recovery += bonus;
    calm += bonus * 0.7;
  }

  const confidence = clamp(0.2, signalQuality * 0.92, 0.98);
  calm = Math.round(clamp(20, calm, 98));
  recovery = Math.round(clamp(18, recovery, 98));

  const level: CalmScoreOutput["level"] =
    calm >= 72 ? "calm" : calm >= 48 ? "neutral" : "tense";

  let summary = "State appears fairly balanced.";
  if (level === "tense") summary = "You look a little tense right now.";
  if (level === "calm") summary = "Your state looks calmer than usual.";

  return {
    calmScore: calm,
    recoveryScore: recovery,
    confidence: Number(confidence.toFixed(2)),
    summary,
    level,
  };
}

export function calculateSessionEffect(input: SessionEffectInput): SessionEffectOutput {
  const { preCalmScore, postCalmScore, prePulse, postPulse } = input;

  const calmDelta = postCalmScore - preCalmScore;
  const pulseDelta = prePulse != null && postPulse != null ? prePulse - postPulse : 0;
  const combined = clamp(-35, Math.round(calmDelta * 1.3 + pulseDelta * 1.1), 40);

  let summary = "Session completed. Keep the slower pace for a few minutes.";
  if (combined >= 16) {
    summary = "State became noticeably calmer after this session.";
  } else if (combined >= 6) {
    summary = "State became a little calmer after this session.";
  } else if (combined <= -10) {
    summary = "Effect is mixed today. Try a softer, shorter track next.";
  }

  return {
    sessionEffect: combined,
    summary,
  };
}

export function recommendationFromCalmLevel(
  level: CalmScoreOutput["level"],
  locale: "en" | "ru"
): string {
  if (locale === "ru") {
    if (level === "tense") return "Подойдёт мягкая дыхательная практика на 8–12 минут.";
    if (level === "calm") return "Состояние ровное: можно выбрать более глубокую медитацию.";
    return "Хорошо сработает спокойная практика со средним темпом.";
  }

  if (level === "tense") return "A soft breathing practice for 8–12 minutes is a good fit.";
  if (level === "calm") return "State looks steady. You can choose a deeper meditation.";
  return "A calm, mid-length practice should fit well now.";
}

