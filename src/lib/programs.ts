/**
 * Curated learning paths — session slugs must exist in seed / DB.
 */
export const PROGRAM_PATHS = [
  {
    id: "nervous_system",
    sessionSlugs: [
      "five-minute-nervous-system-reset",
      "when-everything-feels-too-much",
      "when-anxiety-surges-breath-anchor",
      "reconnect-with-your-breath",
      "afternoon-exhale",
      "return-to-your-center",
      "wind-down-for-sensitive-systems",
    ],
  },
  {
    id: "sleep_deep_rest",
    sessionSlugs: [
      "grounding-before-bed",
      "sleep-after-an-emotionally-hard-day",
      "deep-rest-invitation",
    ],
  },
  {
    id: "boundaries_confidence",
    sessionSlugs: [
      "morning-confidence-reset",
      "quiet-strength-for-hard-meetings",
      "before-a-difficult-conversation",
      "inner-boundary-rehearsal",
    ],
  },
  {
    id: "emotional_care",
    sessionSlugs: [
      "after-hard-news-softening",
      "emotional-release-without-overwhelm",
      "self-held-gentleness",
      "softness-after-stress",
    ],
  },
  {
    id: "body_embodiment",
    sessionSlugs: [
      "gentle-body-reconnection",
      "body-scan-for-tired-minds",
      "first-light-ritual",
      "sensual-softness-consent-first",
    ],
  },
  {
    id: "overload_cycle_care",
    sessionSlugs: [
      "micro-pause-overloaded-caregivers",
      "cycle-stress-softening",
      "wind-down-for-sensitive-systems",
    ],
  },
] as const;
