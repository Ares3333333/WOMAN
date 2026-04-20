import type { BaselineState } from "./types";

function clamp(min: number, v: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = average(values);
  const variance = average(values.map((v) => (v - mean) ** 2));
  return Math.sqrt(variance);
}

export const DEFAULT_BASELINE: BaselineState = {
  restingPulse: 72,
  pulseSpread: 8,
  sampleCount: 0,
  version: 1,
};

export function deriveBaselineFromHistory(pulses: number[]): BaselineState {
  if (pulses.length === 0) return DEFAULT_BASELINE;

  const trimmed = pulses.slice(-20);
  const restingPulse = clamp(54, Math.round(average(trimmed)), 96);
  const pulseSpread = clamp(4, Math.round(stdDev(trimmed)), 18);

  return {
    restingPulse,
    pulseSpread,
    sampleCount: trimmed.length,
    version: 1,
  };
}

export function updateBaseline(
  current: BaselineState,
  pulse: number | null,
  signalQuality: number
): BaselineState {
  if (pulse == null || signalQuality < 0.55) return current;

  const qualityWeight = clamp(0.04, signalQuality * 0.2, 0.18);
  const nextRest = Math.round(current.restingPulse * (1 - qualityWeight) + pulse * qualityWeight);
  const nextSpread = clamp(
    4,
    Math.round(current.pulseSpread * (1 - qualityWeight) + Math.abs(pulse - nextRest) * qualityWeight),
    18
  );

  return {
    restingPulse: clamp(50, nextRest, 100),
    pulseSpread: nextSpread,
    sampleCount: current.sampleCount + 1,
    version: current.version + 1,
  };
}

export function baselineReliabilityLevel(sampleCount: number): "initial" | "building" | "stable" {
  if (sampleCount < 3) return "initial";
  if (sampleCount < 8) return "building";
  return "stable";
}

