import { SESSIONS, type MiniSession } from "../data/sessions";

export type SmartStateInputs = {
  pulse: number | null;
  calmScore: number | null;
  breathingRate: number | null;
  breathingRegularity: number | null;
  frontState: "calm" | "neutral" | "activated" | "tense";
  hourOfDay: number;
  completedCount: number;
  premium: boolean;
};

export type SmartRecommendation = {
  mode: "calm_down" | "stabilize" | "focus" | "sleep_prepare";
  tone: "soft" | "steady" | "energize";
  rationaleKey: "high_load" | "evening_slow" | "morning_focus" | "balanced" | "sleep";
  targetBreathPattern: "4-6" | "4-7" | "box-4" | "natural";
  targetDurationMin: number;
  sessionSlug: string | null;
};

function matchSessionByCategory(
  categories: string[],
  premium: boolean,
  fallbackCurrent: MiniSession | null
): MiniSession | null {
  for (const category of categories) {
    const found = SESSIONS.find((s) => s.categorySlug === category && (premium || s.freeTier));
    if (found) return found;
  }
  return fallbackCurrent;
}

export function buildSmartRecommendation(
  input: SmartStateInputs,
  fallbackCurrentSession: MiniSession | null
): SmartRecommendation {
  const isNight = input.hourOfDay >= 21 || input.hourOfDay < 5;
  const isMorning = input.hourOfDay >= 5 && input.hourOfDay < 11;
  const isEveningWindow = input.hourOfDay >= 18 || input.hourOfDay < 5;

  const highPulse = input.pulse != null && input.pulse >= 88;
  const highBreath = input.breathingRate != null && input.breathingRate >= 19;
  const lowRegularity = input.breathingRegularity != null && input.breathingRegularity < 0.42;

  if (isNight || (isEveningWindow && highPulse && input.frontState !== "calm")) {
    const session = matchSessionByCategory(
      ["sleep", "night-recovery", "soft-evening", "stress-relief"],
      input.premium,
      fallbackCurrentSession
    );

    return {
      mode: "sleep_prepare",
      tone: "soft",
      rationaleKey: isNight ? "sleep" : "evening_slow",
      targetBreathPattern: "4-7",
      targetDurationMin: session?.durationMin ?? 14,
      sessionSlug: session?.slug ?? null,
    };
  }

  if (highPulse || highBreath || input.frontState === "activated" || lowRegularity) {
    const session = matchSessionByCategory(
      ["anxiety", "stress-relief", "overwhelm", "breathing"],
      input.premium,
      fallbackCurrentSession
    );

    return {
      mode: "calm_down",
      tone: "soft",
      rationaleKey: "high_load",
      targetBreathPattern: "4-6",
      targetDurationMin: Math.min(12, session?.durationMin ?? 10),
      sessionSlug: session?.slug ?? null,
    };
  }

  if (isMorning && input.frontState !== "tense") {
    const session = matchSessionByCategory(
      ["confidence", "breathing", "stress-relief"],
      input.premium,
      fallbackCurrentSession
    );

    return {
      mode: "focus",
      tone: "energize",
      rationaleKey: "morning_focus",
      targetBreathPattern: "box-4",
      targetDurationMin: Math.min(10, session?.durationMin ?? 8),
      sessionSlug: session?.slug ?? null,
    };
  }

  const session = matchSessionByCategory(
    ["breathing", "stress-relief", "emotional-reset"],
    input.premium,
    fallbackCurrentSession
  );

  return {
    mode: "stabilize",
    tone: input.completedCount >= 3 ? "steady" : "soft",
    rationaleKey: "balanced",
    targetBreathPattern: "natural",
    targetDurationMin: session?.durationMin ?? 10,
    sessionSlug: session?.slug ?? null,
  };
}
