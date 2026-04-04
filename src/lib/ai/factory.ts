import type { AiTextProvider } from "./types";
import { MockAiProvider } from "./mock-provider";
import { OpenAiProvider } from "./openai-provider";

export function getAiTextProvider(): AiTextProvider {
  const key = process.env.OPENAI_API_KEY;
  if (key) return new OpenAiProvider(key);
  return new MockAiProvider();
}
