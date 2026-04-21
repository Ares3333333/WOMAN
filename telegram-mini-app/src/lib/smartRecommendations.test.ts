import { describe, expect, it } from "vitest";
import { buildSmartRecommendation } from "./smartRecommendations";

describe("buildSmartRecommendation", () => {
  it("picks calming flow for high-load state", () => {
    const rec = buildSmartRecommendation(
      {
        pulse: 96,
        calmScore: 42,
        breathingRate: 22,
        breathingRegularity: 0.3,
        frontState: "activated",
        hourOfDay: 14,
        completedCount: 1,
        premium: false,
      },
      null
    );

    expect(rec.mode).toBe("calm_down");
    expect(rec.targetBreathPattern).toBe("4-6");
    expect(rec.sessionSlug).toBeTruthy();
  });

  it("picks sleep flow in late hours", () => {
    const rec = buildSmartRecommendation(
      {
        pulse: 74,
        calmScore: 68,
        breathingRate: 13,
        breathingRegularity: 0.61,
        frontState: "neutral",
        hourOfDay: 23,
        completedCount: 5,
        premium: true,
      },
      null
    );

    expect(rec.mode).toBe("sleep_prepare");
    expect(rec.tone).toBe("soft");
  });

  it("picks focus flow in stable mornings", () => {
    const rec = buildSmartRecommendation(
      {
        pulse: 69,
        calmScore: 74,
        breathingRate: 11,
        breathingRegularity: 0.74,
        frontState: "calm",
        hourOfDay: 8,
        completedCount: 3,
        premium: false,
      },
      null
    );

    expect(rec.mode).toBe("focus");
    expect(rec.targetBreathPattern).toBe("box-4");
  });
});
