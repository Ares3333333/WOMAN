export type IntensityLevel = "light" | "medium" | "deep";
export type SessionTone = "soft" | "grounding" | "uplifting" | "sensual_soft" | "sleep";

export type VoiceStyleKey = "calm" | "warm" | "confident" | "bedtime_soft";

export interface ScriptSections {
  intro: string;
  settling: string;
  guidedBreathing: string;
  bodyAwareness: string;
  affirmation: string;
  closing: string;
  journalPrompt?: string;
}

export function scriptToTranscript(sections: ScriptSections): string {
  const parts = [
    sections.intro,
    sections.settling,
    sections.guidedBreathing,
    sections.bodyAwareness,
    sections.affirmation,
    sections.closing,
  ];
  if (sections.journalPrompt) parts.push(`Journal prompt: ${sections.journalPrompt}`);
  return parts.filter(Boolean).join("\n\n");
}

export interface MoodOption {
  id: string;
  label: string;
  description: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "overwhelmed", label: "Overwhelmed", description: "Everything feels like too much" },
  { id: "anxious", label: "Anxious", description: "My mind won’t settle" },
  { id: "disconnected", label: "Disconnected", description: "I feel far from myself" },
  { id: "restless", label: "Restless", description: "I can’t find stillness" },
  { id: "emotionally_heavy", label: "Emotionally heavy", description: "Carrying a lot today" },
  { id: "cant_sleep", label: "Can’t sleep", description: "My body won’t let me rest" },
  { id: "want_softness", label: "Want softness", description: "I need something gentle" },
  { id: "need_confidence", label: "Need confidence", description: "I want quiet strength" },
  { id: "reconnect_body", label: "Reconnect with my body", description: "Return to embodied calm" },
];

export type SessionMeta = {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  categorySlug: string;
  tagSlugs: string[];
  durationMinutes: number;
  intensity: IntensityLevel;
  tone: SessionTone;
  contraindicationNote?: string;
  voiceStyle: VoiceStyleKey;
  coverGradient: string;
  published: boolean;
  freeTier: boolean;
  script: ScriptSections;
};
