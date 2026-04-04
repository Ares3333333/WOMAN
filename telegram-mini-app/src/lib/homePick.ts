import type { MiniSession } from "../data/sessions";
import type { OnboardingMood } from "./onboarding";
import type { ProgressState } from "./progress";

export function mapMoodToCategories(mood: OnboardingMood): string[] {
  switch (mood) {
    case "stress":
      return ["stress-relief", "emotional-reset"];
    case "tired":
      return ["sleep", "breathing"];
    case "anxiety":
      return ["breathing", "stress-relief"];
    case "body":
      return ["body-awareness", "confidence"];
    default:
      return [];
  }
}

export function pickSessionForHome(
  sessions: MiniSession[],
  state: ProgressState,
  mood: OnboardingMood | undefined
): MiniSession {
  const cats = mood ? mapMoodToCategories(mood) : [];
  if (cats.length > 0) {
    const match =
      sessions.find(
        (s) =>
          s.freeTier &&
          !state.completedSlugs.includes(s.slug) &&
          cats.includes(s.categorySlug)
      ) ??
      sessions.find((s) => s.freeTier && cats.includes(s.categorySlug)) ??
      sessions.find((s) => s.freeTier && !state.completedSlugs.includes(s.slug)) ??
      sessions.find((s) => s.freeTier) ??
      sessions[0];
    return match;
  }
  return (
    sessions.find((s) => s.freeTier && !state.completedSlugs.includes(s.slug)) ??
    sessions.find((s) => s.freeTier) ??
    sessions[0]
  );
}

export function homeTimeKey(): "Morning" | "Afternoon" | "Evening" {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}
