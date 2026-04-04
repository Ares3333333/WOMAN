import type { AiTextProvider, GenerateSessionInput, GeneratedSessionDraft } from "./types";
import type { ScriptSections } from "@/types/script";

export class OpenAiProvider implements AiTextProvider {
  constructor(private readonly apiKey: string) {}

  async generateSessionDraft(input: GenerateSessionInput): Promise<GeneratedSessionDraft> {
    const system = `You are a wellness copywriter for Sora Calm, a women-focused audio wellness app.
Rules:
- Wellness and nervous system regulation only. Not therapy, not medical advice, not explicit sexual content.
- Sensual wellness means breath, embodiment, softness, self-connection — never graphic or orgasm instructions.
- Use consent-first language. No coercion, no degrading language.
- Output valid JSON only with keys: title, titleAlternates (array of 2 strings), shortDescription, tags (array of strings), script (object with keys intro, settling, guidedBreathing, bodyAwareness, affirmation, closing, journalPrompt optional).
- Respect forbidden phrases: do not use them.`;

    const user = JSON.stringify({
      targetMood: input.targetMood,
      category: input.category,
      durationMinutes: input.durationMinutes,
      tone: input.tone,
      goal: input.goal,
      voiceStyle: input.voiceStyle,
      forbiddenPhrases: input.forbiddenPhrases ?? "",
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error: ${res.status} ${err}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty OpenAI response");

    const parsed = JSON.parse(raw) as {
      title: string;
      titleAlternates: string[];
      shortDescription: string;
      tags: string[];
      script: ScriptSections;
    };

    return {
      title: parsed.title,
      titleAlternates: parsed.titleAlternates ?? [],
      shortDescription: parsed.shortDescription,
      tags: parsed.tags ?? [],
      script: parsed.script,
    };
  }
}
