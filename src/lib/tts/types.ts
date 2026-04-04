export interface TtsResult {
  url: string;
  durationSecondsEstimate: number;
  provider: "mock" | "openai" | "custom";
  metadata?: Record<string, unknown>;
}

export interface TtsProvider {
  generateAudio(params: {
    text: string;
    voiceStyle: string;
  }): Promise<TtsResult>;
}
