import type { TtsProvider, TtsResult } from "./types";

/** Returns a placeholder public URL; player uses browser TTS when no file exists. */
export class MockTtsProvider implements TtsProvider {
  async generateAudio(params: { text: string; voiceStyle: string }): Promise<TtsResult> {
    const wordCount = params.text.split(/\s+/).filter(Boolean).length;
    const durationSecondsEstimate = Math.max(60, Math.round(wordCount / 2.2));
    return {
      url: "/audio/placeholder-silence.mp3",
      durationSecondsEstimate,
      provider: "mock",
      metadata: { voiceStyle: params.voiceStyle, mock: true },
    };
  }
}
