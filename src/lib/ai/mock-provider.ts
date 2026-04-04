import type { AiTextProvider, GenerateSessionInput, GeneratedSessionDraft } from "./types";

export class MockAiProvider implements AiTextProvider {
  async generateSessionDraft(input: GenerateSessionInput): Promise<GeneratedSessionDraft> {
    const forbidden = input.forbiddenPhrases?.toLowerCase() ?? "";
    const safeNote = forbidden ? ` Avoiding: ${forbidden.slice(0, 120)}.` : "";

    const script = {
      intro: `Welcome. This is a gentle ${input.durationMinutes}-minute space for ${input.goal}, with a ${input.tone} tone. You chose ${input.targetMood} as your entry mood — honor that with patience.${safeNote}`,
      settling: "Find a supported seat or lie down. Soften your jaw. Let your shoulders be heavy. Nothing here needs to be fixed — only witnessed.",
      guidedBreathing: "Inhale softly through the nose for four. Exhale longer through the mouth for six. Repeat quietly, without forcing. Let the exhale signal safety to your nervous system.",
      bodyAwareness: "Notice contact points where your body meets support. Feel temperature on your skin. If thoughts race, return kindly to one physical sensation.",
      affirmation: "You are allowed to move slowly. Calm is not performance; it is permission.",
      closing: "When you are ready, deepen one breath, wiggle fingers and toes, and return gently. Carry this softness in small pockets through your day.",
      journalPrompt: "What felt kinder in your body by the end of this pause?",
    };

    return {
      title: `Gentle reset: ${input.category}`,
      titleAlternates: [
        `Soft ${input.category} for ${input.targetMood}`,
        `${input.durationMinutes} minutes of ${input.tone} calm`,
      ],
      shortDescription: `A ${input.durationMinutes}-minute guided audio to support ${input.goal} — wellness only, never medical advice.`,
      tags: [input.category, input.tone, input.voiceStyle, "guided audio"],
      script,
    };
  }
}
