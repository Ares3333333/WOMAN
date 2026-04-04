/** Curated paths — slugs must exist in `sessions.ts`. */
export const PROGRAM_PATHS = [
  {
    id: "nervous_system",
    sessionSlugs: [
      "five-minute-nervous-system-reset",
      "when-everything-feels-too-much",
      "when-anxiety-surges-breath-anchor",
      "reconnect-with-your-breath",
    ],
  },
  {
    id: "sleep_deep_rest",
    sessionSlugs: ["grounding-before-bed", "sleep-after-an-emotionally-hard-day"],
  },
  {
    id: "boundaries_confidence",
    sessionSlugs: ["morning-confidence-reset"],
  },
  {
    id: "emotional_care",
    sessionSlugs: ["after-hard-news-softening"],
  },
  {
    id: "body_embodiment",
    sessionSlugs: ["gentle-body-reconnection", "sensual-softness-consent-first"],
  },
  {
    id: "overload_cycle_care",
    sessionSlugs: ["micro-pause-overloaded-caregivers"],
  },
] as const;
