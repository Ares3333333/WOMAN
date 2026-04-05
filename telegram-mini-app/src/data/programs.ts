import type { ContentPillarId } from "./sessions";

export type ProgramTier = "free" | "mixed" | "premium";

/** Curated paths — slugs must exist in `sessions.ts`. */
export type ProgramPath = {
  readonly id: string;
  readonly pillarId: ContentPillarId;
  readonly tier: ProgramTier;
  readonly signature?: boolean;
  readonly sessionSlugs: readonly string[];
};

export const PROGRAM_PATHS: readonly ProgramPath[] = [
  {
    id: "nervous_system",
    pillarId: "still_mind",
    tier: "free",
    sessionSlugs: [
      "five-minute-nervous-system-reset",
      "when-anxiety-surges-breath-anchor",
      "micro-pause-overloaded-caregivers",
      "after-hard-news-softening",
    ],
  },
  {
    id: "overload_cycle_care",
    pillarId: "when_lot",
    tier: "free",
    sessionSlugs: [
      "when-everything-feels-too-much",
      "micro-pause-overloaded-caregivers",
      "after-hard-news-softening",
    ],
  },
  {
    id: "emotional_care",
    pillarId: "close_day",
    tier: "mixed",
    sessionSlugs: [
      "after-hard-news-softening",
      "when-everything-feels-too-much",
      "sleep-after-an-emotionally-hard-day",
    ],
  },
  {
    id: "body_embodiment",
    pillarId: "back_body",
    tier: "mixed",
    sessionSlugs: [
      "gentle-body-reconnection",
      "reconnect-with-your-breath",
      "sensual-softness-consent-first",
    ],
  },
  {
    id: "boundaries_confidence",
    pillarId: "return_you",
    tier: "mixed",
    sessionSlugs: [
      "morning-confidence-reset",
      "boundaries-after-social-overload",
      "reconnect-with-your-breath",
    ],
  },
  {
    id: "sleep_deep_rest",
    pillarId: "tonight",
    tier: "mixed",
    sessionSlugs: [
      "grounding-before-bed",
      "sleep-after-an-emotionally-hard-day",
      "evening-nervous-system-downshift",
    ],
  },
  {
    id: "signature_evening_rituals",
    pillarId: "soft_evening",
    tier: "premium",
    signature: true,
    sessionSlugs: [
      "evening-nervous-system-downshift",
      "grounding-before-bed",
      "deep-sleep-arrival-ritual",
    ],
  },
  {
    id: "premium_sleep_collection",
    pillarId: "tonight",
    tier: "premium",
    signature: true,
    sessionSlugs: [
      "deep-sleep-arrival-ritual",
      "sleep-after-an-emotionally-hard-day",
      "grounding-before-bed",
    ],
  },
  {
    id: "private_self_connection",
    pillarId: "quiet_warmth",
    tier: "premium",
    signature: true,
    sessionSlugs: [
      "sensual-softness-consent-first",
      "private-soft-confidence-body-trust",
    ],
  },
] as const;
