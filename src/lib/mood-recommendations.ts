/** Maps mood check-in IDs to preferred category slugs for ranking. */
export const MOOD_TO_CATEGORIES: Record<string, string[]> = {
  overwhelmed: ["stress-relief", "breathing", "grounding"],
  anxious: ["breathing", "stress-relief", "emotional-reset"],
  disconnected: ["body-awareness", "grounding", "sensual-wellness"],
  restless: ["breathing", "morning-reset", "grounding"],
  emotionally_heavy: ["emotional-reset", "stress-relief", "sleep"],
  cant_sleep: ["sleep", "breathing", "stress-relief"],
  want_softness: ["sensual-wellness", "stress-relief", "body-awareness"],
  need_confidence: ["confidence-soft-power", "morning-reset", "emotional-reset"],
  reconnect_body: ["body-awareness", "sensual-wellness", "breathing"],
};

export function pickRecommendedSlugs(moodId: string): string[] {
  return MOOD_TO_CATEGORIES[moodId] ?? ["stress-relief", "breathing", "sleep"];
}
