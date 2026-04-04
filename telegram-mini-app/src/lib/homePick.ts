import type { ContentPillarId } from "../data/sessions";
import type { MiniSession } from "../data/sessions";
import type { OnboardingMood } from "./onboarding";
import type { ProgressState } from "./progress";
import { canUserAccessSession } from "./sessionAccess";

export function mapMoodToPillars(mood: OnboardingMood): ContentPillarId[] {
  switch (mood) {
    case "stress":
      return ["when_lot", "still_mind", "close_day"];
    case "tired":
      return ["tonight", "soft_evening", "when_lot"];
    case "anxiety":
      return ["still_mind", "when_lot"];
    case "body":
      return ["back_body", "return_you", "still_mind"];
    default:
      return [];
  }
}

export function pickSessionForHome(
  sessions: MiniSession[],
  state: ProgressState,
  mood: OnboardingMood | undefined
): MiniSession {
  const pillars = mood ? mapMoodToPillars(mood) : [];
  const accessible = (s: MiniSession) => canUserAccessSession(s, state);

  if (pillars.length > 0) {
    const match =
      sessions.find(
        (s) =>
          s.freeTier &&
          accessible(s) &&
          !state.completedSlugs.includes(s.slug) &&
          pillars.includes(s.pillarId)
      ) ??
      sessions.find((s) => s.freeTier && accessible(s) && pillars.includes(s.pillarId)) ??
      sessions.find((s) => s.freeTier && accessible(s) && !state.completedSlugs.includes(s.slug)) ??
      sessions.find((s) => s.freeTier && accessible(s)) ??
      sessions.find(accessible) ??
      sessions[0];
    return match;
  }
  return (
    sessions.find((s) => s.freeTier && accessible(s) && !state.completedSlugs.includes(s.slug)) ??
    sessions.find((s) => s.freeTier && accessible(s)) ??
    sessions.find(accessible) ??
    sessions[0]
  );
}

/** First accessible evening / sleep-leaning session for home «tonight» block */
export function pickTonightSession(
  sessions: MiniSession[],
  state: ProgressState
): MiniSession | null {
  const pool = sessions.filter(
    (s) =>
      (s.pillarId === "tonight" || s.pillarId === "soft_evening" || s.eveningHint) &&
      canUserAccessSession(s, state)
  );
  if (pool.length === 0) return null;

  const score = (s: MiniSession) => {
    let v = 0;
    if (!state.completedSlugs.includes(s.slug)) v += 4;
    if (s.freeTier) v += 2;
    if (s.pillarId === "tonight") v += 1;
    return v;
  };

  return [...pool].sort((a, b) => score(b) - score(a))[0] ?? null;
}

export function homeTimeKey(): "Morning" | "Afternoon" | "Evening" {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}
