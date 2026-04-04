const KEY = "sora_onboarding_v1";

export type OnboardingMood = "stress" | "tired" | "anxiety" | "body";

export const ONBOARDING_MOOD_ORDER: OnboardingMood[] = ["stress", "tired", "anxiety", "body"];

export type OnboardingState = {
  done: boolean;
  mood?: OnboardingMood;
};

export function readOnboarding(): OnboardingState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { done: false };
    const p = JSON.parse(raw) as OnboardingState;
    return { done: Boolean(p.done), mood: p.mood };
  } catch {
    return { done: false };
  }
}

export function saveOnboarding(state: OnboardingState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
