import { describe, expect, it } from "vitest";
import { estimateBreathingFromSignal } from "./frontBreathScan";

function buildBreathSignal(ratePerMinute: number, totalMs: number, stepMs: number): { t: number; value: number }[] {
  const samples: { t: number; value: number }[] = [];
  const hz = ratePerMinute / 60;

  for (let t = 0; t <= totalMs; t += stepMs) {
    const value = Math.sin(2 * Math.PI * hz * (t / 1000)) + Math.sin(2 * Math.PI * hz * 0.5 * (t / 1000)) * 0.15;
    samples.push({ t, value });
  }

  return samples;
}

describe("estimateBreathingFromSignal", () => {
  it("detects plausible breath rate from rhythmic signal", () => {
    const samples = buildBreathSignal(12, 60_000, 220);
    const result = estimateBreathingFromSignal(samples);

    expect(result.breathingRate).not.toBeNull();
    expect(result.breathingRate as number).toBeGreaterThanOrEqual(10);
    expect(result.breathingRate as number).toBeLessThanOrEqual(14);
    expect(result.regularity).not.toBeNull();
  });

  it("returns null for too-short input", () => {
    const result = estimateBreathingFromSignal(buildBreathSignal(14, 5_000, 250));
    expect(result.breathingRate).toBeNull();
  });
});
