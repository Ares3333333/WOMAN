import { describe, expect, it } from "vitest";
import { calculateCalmSnapshot, summarizeBiofeedbackTrends, type BiofeedbackStore } from "./biofeedback";

describe("calculateCalmSnapshot", () => {
  it("increases scores for lower pulse and stable breathing", () => {
    const snapshot = calculateCalmSnapshot(
      64,
      0.8,
      72,
      -6,
      { adherenceScore: 0.85, stillnessScore: 0.7 }
    );

    expect(snapshot.calmScore).toBeGreaterThan(70);
    expect(snapshot.recoveryScore).toBeGreaterThan(70);
    expect(snapshot.level).toBe("calm");
  });

  it("returns lower calm for missing pulse", () => {
    const snapshot = calculateCalmSnapshot(null, 0.4, 72, null, null);
    expect(snapshot.calmScore).toBeLessThan(60);
  });
});

describe("summarizeBiofeedbackTrends", () => {
  it("returns upward direction when effect improves", () => {
    const store: BiofeedbackStore = {
      baseline: {
        restingPulse: 72,
        pulseSpread: 8,
        sampleCount: 4,
        version: 2,
        updatedAt: new Date().toISOString(),
      },
      scans: [],
      sessions: [
        {
          id: "s1",
          meditationSlug: "a",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          preScanId: null,
          postScanId: null,
          prePulse: 82,
          postPulse: 78,
          preBreathingRate: 18,
          postBreathingRate: 14,
          preFrontState: "activated",
          postFrontState: "neutral",
          preCalmScore: 45,
          postCalmScore: 54,
          recoveryScoreAfter: 58,
          breathAdherence: null,
          breathStillness: null,
          micBreathRate: null,
          micRhythmStability: null,
          micConfidence: null,
          micGuidance: null,
          recommendationMode: null,
          recommendedSessionSlug: null,
          sessionEffect: 4,
          summaryCode: "mixed",
        },
        {
          id: "s2",
          meditationSlug: "b",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          preScanId: null,
          postScanId: null,
          prePulse: 80,
          postPulse: 71,
          preBreathingRate: 16,
          postBreathingRate: 12,
          preFrontState: "neutral",
          postFrontState: "calm",
          preCalmScore: 46,
          postCalmScore: 64,
          recoveryScoreAfter: 66,
          breathAdherence: null,
          breathStillness: null,
          micBreathRate: null,
          micRhythmStability: null,
          micConfidence: null,
          micGuidance: null,
          recommendationMode: null,
          recommendedSessionSlug: null,
          sessionEffect: 16,
          summaryCode: "strong",
        },
      ],
    };

    const trend = summarizeBiofeedbackTrends(store);
    expect(trend.completedSessions).toBe(2);
    expect(trend.recentDirection).toBe("up");
  });
});
