import type { PulseEstimation, PulseSample } from "./types";

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

function movingAverage(values: number[], window: number): number[] {
  if (values.length === 0) return [];
  const out: number[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const start = Math.max(0, i - window + 1);
    out.push(average(values.slice(start, i + 1)));
  }
  return out;
}

function detectPeaks(signal: number[], times: number[]): number[] {
  if (signal.length < 3 || times.length !== signal.length) return [];
  const threshold = average(signal) + stdDev(signal) * 0.45;
  const peaks: number[] = [];
  let lastPeakTs = -Infinity;
  const minDistanceMs = 320;

  for (let i = 1; i < signal.length - 1; i += 1) {
    const prev = signal[i - 1];
    const cur = signal[i];
    const next = signal[i + 1];
    const ts = times[i];

    if (cur > threshold && cur > prev && cur >= next) {
      if (ts - lastPeakTs >= minDistanceMs) {
        peaks.push(ts);
        lastPeakTs = ts;
      } else if (peaks.length > 0 && cur > signal[i - 1]) {
        peaks[peaks.length - 1] = ts;
        lastPeakTs = ts;
      }
    }
  }
  return peaks;
}

export function estimatePulseFromSamples(samples: PulseSample[]): PulseEstimation {
  if (samples.length < 80) {
    return { pulse: null, confidence: 0, peakCount: 0 };
  }

  const raw = samples.map((s) => s.signal);
  const times = samples.map((s) => s.t);
  const smooth = movingAverage(raw, 5);
  const mean = average(smooth);
  const normalized = smooth.map((v) => v - mean);
  const peaks = detectPeaks(normalized, times);

  if (peaks.length < 4) {
    return { pulse: null, confidence: 0.2, peakCount: peaks.length };
  }

  const start = times[0];
  const end = times[times.length - 1];
  const durationSec = Math.max(1, (end - start) / 1000);
  const bpm = (peaks.length / durationSec) * 60;
  const inRange = bpm >= 45 && bpm <= 160;

  if (!inRange) {
    return { pulse: null, confidence: 0.15, peakCount: peaks.length };
  }

  const intervals = peaks.slice(1).map((ts, i) => ts - peaks[i]);
  const rrVariation = stdDev(intervals);
  const confidence = clamp(0.25, 1 - rrVariation / 220, 0.96);

  return {
    pulse: Math.round(bpm),
    confidence,
    peakCount: peaks.length,
  };
}

