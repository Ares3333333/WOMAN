import type { ContentPillarId } from "./sessions";

export type ProgramTier = "free" | "mixed" | "premium";

/** Curated paths — slugs must exist in `sessions.ts`. */
export type ProgramPath = {
  readonly id: string;
  readonly pillarId: ContentPillarId;
  readonly tier: ProgramTier;
  readonly signature?: boolean;
  /** Typical continuity block for this path. */
  readonly continuityWeeks: number;
  /** Core outcome axis shown in UI. */
  readonly valueAxis: "stability" | "sleep" | "boundaries" | "private" | "rhythm" | "recovery";
  readonly sessionSlugs: readonly string[];
};

export const PROGRAM_PATHS: readonly ProgramPath[] = [
  {
    id: "nervous_system",
    pillarId: "still_mind",
    tier: "free",
    continuityWeeks: 2,
    valueAxis: "stability",
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
    continuityWeeks: 2,
    valueAxis: "stability",
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
    continuityWeeks: 3,
    valueAxis: "recovery",
    sessionSlugs: [
      "after-hard-news-softening",
      "when-everything-feels-too-much",
      "deep-recovery-sunday-reset",
    ],
  },
  {
    id: "body_embodiment",
    pillarId: "back_body",
    tier: "mixed",
    continuityWeeks: 3,
    valueAxis: "rhythm",
    sessionSlugs: [
      "gentle-body-reconnection",
      "reconnect-with-your-breath",
      "cycle-aware-evening-balance",
    ],
  },
  {
    id: "boundaries_confidence",
    pillarId: "return_you",
    tier: "mixed",
    continuityWeeks: 3,
    valueAxis: "boundaries",
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
    continuityWeeks: 4,
    valueAxis: "sleep",
    sessionSlugs: [
      "grounding-before-bed",
      "sleep-after-an-emotionally-hard-day",
      "midnight-overthinking-off-ramp",
    ],
  },
  {
    id: "signature_evening_rituals",
    pillarId: "soft_evening",
    tier: "premium",
    signature: true,
    continuityWeeks: 4,
    valueAxis: "recovery",
    sessionSlugs: [
      "evening-nervous-system-downshift",
      "cycle-aware-evening-balance",
      "deep-recovery-sunday-reset",
    ],
  },
  {
    id: "premium_sleep_collection",
    pillarId: "tonight",
    tier: "premium",
    signature: true,
    continuityWeeks: 4,
    valueAxis: "sleep",
    sessionSlugs: [
      "deep-sleep-arrival-ritual",
      "midnight-overthinking-off-ramp",
      "sleep-after-an-emotionally-hard-day",
    ],
  },
  {
    id: "cycle_rhythm_support",
    pillarId: "return_you",
    tier: "premium",
    continuityWeeks: 4,
    valueAxis: "rhythm",
    sessionSlugs: [
      "cycle-aware-evening-balance",
      "boundaries-after-social-overload",
      "deep-recovery-sunday-reset",
    ],
  },
  {
    id: "private_self_connection",
    pillarId: "quiet_warmth",
    tier: "premium",
    signature: true,
    continuityWeeks: 4,
    valueAxis: "private",
    sessionSlugs: [
      "sensual-softness-consent-first",
      "private-soft-confidence-body-trust",
    ],
  },
] as const;

