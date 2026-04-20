import type { PulseSample, SignalQualityEvaluation } from "./types";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
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

export function evaluatePulseSignal(samples: PulseSample[]): SignalQualityEvaluation {
  if (samples.length < 80) {
    return {
      quality: 0,
      status: "low_signal",
      failureReason: "unstable_signal",
      metrics: {
        coverageRatio: 0,
        motionStability: 0,
        brightnessScore: 0,
        sampleCount: samples.length,
      },
    };
  }

  const redDominance = samples.map((s) => s.redDominance);
  const brightness = samples.map((s) => s.brightness);
  const signal = samples.map((s) => s.signal);
  const diffs = signal.slice(1).map((v, i) => Math.abs(v - signal[i]));

  const coverageRatio = redDominance.filter((v) => v > 1.15).length / samples.length;
  const avgBrightness = average(brightness);
  const brightnessScore =
    avgBrightness < 20
      ? clamp01(avgBrightness / 20)
      : avgBrightness > 245
        ? clamp01((260 - avgBrightness) / 15)
        : 1;

  const motionNoise = stdDev(diffs);
  const motionStability = clamp01(1 - motionNoise / 22);

  const quality = clamp01(coverageRatio * 0.5 + motionStability * 0.3 + brightnessScore * 0.2);

  if (coverageRatio < 0.55) {
    return {
      quality,
      status: "low_signal",
      failureReason: "finger_not_detected",
      metrics: { coverageRatio, motionStability, brightnessScore, sampleCount: samples.length },
    };
  }

  if (brightnessScore < 0.5) {
    return {
      quality,
      status: "low_signal",
      failureReason: "insufficient_light",
      metrics: { coverageRatio, motionStability, brightnessScore, sampleCount: samples.length },
    };
  }

  if (motionStability < 0.45) {
    return {
      quality,
      status: "low_signal",
      failureReason: "high_motion",
      metrics: { coverageRatio, motionStability, brightnessScore, sampleCount: samples.length },
    };
  }

  return {
    quality,
    status: quality >= 0.45 ? "ok" : "low_signal",
    failureReason: quality >= 0.45 ? undefined : "unstable_signal",
    metrics: { coverageRatio, motionStability, brightnessScore, sampleCount: samples.length },
  };
}

