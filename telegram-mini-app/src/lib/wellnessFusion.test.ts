import { describe, expect, it } from "vitest";
import { buildOutcomeGuidance, deriveWellnessSnapshot } from "./wellnessFusion";

describe("deriveWellnessSnapshot", () => {
  it("marks elevated state for high pulse and fast irregular breathing", () => {
    const snapshot = deriveWellnessSnapshot({
      pulse: {
        pulse: 102,
        signalQuality: 0.82,
        durationMs: 18_000,
        rawStatus: "ok",
        confidence: 0.84,
      },
      front: {
        breathingRate: 24,
        regularity: 0.31,
        signalQuality: 0.78,
        confidence: 0.76,
        stateLabel: "activated",
        motionScore: 0.64,
        durationMs: 16_000,
        rawStatus: "ok",
        trackingMode: "mesh",
      },
      mic: null,
      hour: 21,
    });

    expect(snapshot.state === "elevated" || snapshot.state === "tense").toBe(true);
    expect(snapshot.confidence).toBeGreaterThan(0.45);
  });

  it("marks calm state for steady low-load signals", () => {
    const snapshot = deriveWellnessSnapshot({
      pulse: {
        pulse: 66,
        signalQuality: 0.86,
        durationMs: 16_000,
        rawStatus: "ok",
        confidence: 0.88,
      },
      front: {
        breathingRate: 11,
        regularity: 0.74,
        signalQuality: 0.84,
        confidence: 0.85,
        stateLabel: "calm",
        motionScore: 0.22,
        durationMs: 16_000,
        rawStatus: "ok",
        trackingMode: "mesh",
      },
      mic: {
        breathRate: 11,
        rhythmStability: 0.77,
        confidence: 0.79,
        recordingMs: 120_000,
        sampleCount: 320,
        guidance: "good",
        rawStatus: "ok",
      },
      hour: 9,
    });

    expect(snapshot.state).toBe("calm");
    expect(snapshot.confidence).toBeGreaterThan(0.5);
  });
});

describe("buildOutcomeGuidance", () => {
  it("returns sleep guidance for sleep_prepare recommendation", () => {
    const guidance = buildOutcomeGuidance({
      summaryCode: "moderate",
      recommendation: {
        mode: "sleep_prepare",
        tone: "soft",
        rationaleKey: "sleep",
        targetBreathPattern: "4-7",
        targetDurationMin: 12,
        sessionSlug: "night-reset-12",
      },
      mic: null,
    });

    expect(guidance.todayKey).toBe("bioAdviceTodaySleep");
    expect(guidance.quoteKey).toBe("bioQuoteNight");
  });
});

