import type { ScriptSections } from "@/types/script";

export interface GenerateSessionInput {
  targetMood: string;
  category: string;
  durationMinutes: number;
  tone: string;
  goal: string;
  voiceStyle: string;
  forbiddenPhrases?: string;
}

export interface GeneratedSessionDraft {
  title: string;
  titleAlternates: string[];
  shortDescription: string;
  tags: string[];
  script: ScriptSections;
}

export interface AiTextProvider {
  generateSessionDraft(input: GenerateSessionInput): Promise<GeneratedSessionDraft>;
}
