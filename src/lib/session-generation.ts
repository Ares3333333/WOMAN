import { getAiTextProvider } from "@/lib/ai/factory";
import type { GenerateSessionInput, GeneratedSessionDraft } from "@/lib/ai/types";
import { scriptToTranscript } from "@/types/script";

export async function generateDraftFromTemplate(
  input: GenerateSessionInput
): Promise<GeneratedSessionDraft> {
  const provider = getAiTextProvider();
  return provider.generateSessionDraft(input);
}

export function flattenScriptForTts(script: GeneratedSessionDraft["script"]): string {
  return scriptToTranscript(script);
}
