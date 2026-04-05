import type { MiniSession } from "../data/sessions";
import { SESSION_BY_SLUG } from "../data/sessions";
import type { OnboardingMood } from "./onboarding";
import type { ProgressState } from "./progress";

const RHYTHM_KEY = "sora_rhythm_tracker_v1";

export type RhythmPhase = "unknown" | "period" | "rising" | "social" | "late";
export type RhythmStress = "light" | "loaded" | "high";
export type RhythmSleep = "steady" | "sensitive" | "broken";

export type RhythmProfile = {
  phase: RhythmPhase;
  stress: RhythmStress;
  sleep: RhythmSleep;
  updatedAt: string | null;
};

export const DEFAULT_RHYTHM_PROFILE: RhythmProfile = {
  phase: "unknown",
  stress: "loaded",
  sleep: "sensitive",
  updatedAt: null,
};

export function loadRhythmProfile(): RhythmProfile {
  try {
    const raw = localStorage.getItem(RHYTHM_KEY);
    if (!raw) return DEFAULT_RHYTHM_PROFILE;
    const parsed = JSON.parse(raw) as Partial<RhythmProfile>;

    const phase =
      parsed.phase && ["unknown", "period", "rising", "social", "late"].includes(parsed.phase)
        ? parsed.phase
        : DEFAULT_RHYTHM_PROFILE.phase;

    const stress =
      parsed.stress && ["light", "loaded", "high"].includes(parsed.stress)
        ? parsed.stress
        : DEFAULT_RHYTHM_PROFILE.stress;

    const sleep =
      parsed.sleep && ["steady", "sensitive", "broken"].includes(parsed.sleep)
        ? parsed.sleep
        : DEFAULT_RHYTHM_PROFILE.sleep;

    return {
      phase: phase as RhythmPhase,
      stress: stress as RhythmStress,
      sleep: sleep as RhythmSleep,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return DEFAULT_RHYTHM_PROFILE;
  }
}

export function saveRhythmProfile(next: RhythmProfile): void {
  try {
    localStorage.setItem(RHYTHM_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function updateRhythmProfile(patch: Partial<Omit<RhythmProfile, "updatedAt">>): RhythmProfile {
  const current = loadRhythmProfile();
  const next: RhythmProfile = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveRhythmProfile(next);
  return next;
}

export function buildRhythmInsightKeys(args: {
  profile: RhythmProfile;
  state: ProgressState;
  mood?: OnboardingMood;
}): { headline: string; note: string; suggestion: string } {
  const { profile, state, mood } = args;

  const rhythmTier =
    state.weekCompletions >= 3 ? "stable" : state.weekCompletions === 2 ? "recovery" : "fragile";

  const moodHint = mood ?? "stress";

  let headline = "insightHeadlineStable";
  if (rhythmTier === "recovery") headline = "insightHeadlineRecovery";
  if (rhythmTier === "fragile") headline = "insightHeadlineFragile";

  let note = "insightNoteDefault";

  if (profile.sleep === "broken") note = "insightNoteSleepBroken";
  else if (profile.sleep === "sensitive") note = "insightNoteSleepSensitive";

  if (profile.stress === "high") note = "insightNoteStressHigh";
  else if (profile.stress === "light" && rhythmTier === "stable") note = "insightNoteStressLight";

  let suggestion = "insightSuggestDefault";
  if (profile.phase === "period") suggestion = "insightSuggestPeriod";
  else if (profile.phase === "late") suggestion = "insightSuggestLate";
  else if (profile.phase === "social") suggestion = "insightSuggestSocial";
  else if (moodHint === "anxiety") suggestion = "insightSuggestAnxiety";
  else if (moodHint === "tired") suggestion = "insightSuggestTired";

  return { headline, note, suggestion };
}

export function pickRhythmSession(profile: RhythmProfile, state: ProgressState): MiniSession | null {
  const bySlug = (slug: string) => {
    const s = SESSION_BY_SLUG[slug];
    if (!s) return null;
    if (s.sensual && state.sensualMode === "hidden") return null;
    if (!s.freeTier && !state.premium) return null;
    return s;
  };

  const pool: string[] = [];

  if (profile.sleep === "broken") {
    pool.push("deep-sleep-arrival-ritual", "sleep-after-an-emotionally-hard-day", "grounding-before-bed");
  }

  if (profile.stress === "high") {
    pool.push("evening-nervous-system-downshift", "when-everything-feels-too-much", "five-minute-nervous-system-reset");
  }

  if (profile.phase === "late") {
    pool.push("cycle-aware-evening-balance", "boundaries-after-social-overload");
  }

  if (profile.phase === "period") {
    pool.push("gentle-body-reconnection", "cycle-aware-evening-balance");
  }

  pool.push("reconnect-with-your-breath", "after-hard-news-softening", "micro-pause-overloaded-caregivers");

  for (const slug of pool) {
    const s = bySlug(slug);
    if (s) return s;
  }

  return null;
}

