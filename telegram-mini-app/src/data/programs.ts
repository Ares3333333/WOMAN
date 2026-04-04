import type { ContentPillarId } from "./sessions";

/** Curated paths — slugs must exist in `sessions.ts`. */
export type ProgramPath = {
  readonly id: string;
  readonly pillarId: ContentPillarId;
  readonly sessionSlugs: readonly string[];
};

export const PROGRAM_PATHS: readonly ProgramPath[] = [
  {
    id: "nervous_system",
    pillarId: "still_mind",
    sessionSlugs: [
      "five-minute-nervous-system-reset",
      "when-everything-feels-too-much",
      "when-anxiety-surges-breath-anchor",
      "reconnect-with-your-breath",
    ],
  },
  {
    id: "sleep_deep_rest",
    pillarId: "tonight",
    sessionSlugs: ["grounding-before-bed", "sleep-after-an-emotionally-hard-day"],
  },
  {
    id: "boundaries_confidence",
    pillarId: "return_you",
    sessionSlugs: ["morning-confidence-reset"],
  },
  {
    id: "emotional_care",
    pillarId: "close_day",
    sessionSlugs: ["after-hard-news-softening"],
  },
  {
    id: "body_embodiment",
    pillarId: "back_body",
    sessionSlugs: ["gentle-body-reconnection", "sensual-softness-consent-first"],
  },
  {
    id: "overload_cycle_care",
    pillarId: "when_lot",
    sessionSlugs: ["micro-pause-overloaded-caregivers"],
  },
] as const;
