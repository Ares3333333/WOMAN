import type { TtsProvider } from "./types";
import { MockTtsProvider } from "./mock-tts";
import { OpenAiTtsProvider } from "./openai-tts";

export function getTtsProvider(): TtsProvider {
  const key = process.env.OPENAI_API_KEY;
  if (process.env.USE_OPENAI_TTS === "true" && key) {
    return new OpenAiTtsProvider(key);
  }
  return new MockTtsProvider();
}
