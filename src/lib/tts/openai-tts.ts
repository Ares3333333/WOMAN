import type { TtsProvider, TtsResult } from "./types";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export class OpenAiTtsProvider implements TtsProvider {
  constructor(private readonly apiKey: string) {}

  async generateAudio(params: { text: string; voiceStyle: string }): Promise<TtsResult> {
    const voiceMap: Record<string, string> = {
      calm: "alloy",
      warm: "nova",
      confident: "shimmer",
      bedtime_soft: "fable",
    };
    const voice = voiceMap[params.voiceStyle] ?? "alloy";
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_TTS_MODEL ?? "tts-1",
        voice,
        input: params.text.slice(0, 4096),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI TTS error: ${res.status} ${err}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const id = randomUUID();
    const dir = path.join(process.cwd(), "public", "uploads", "tts");
    await mkdir(dir, { recursive: true });
    const filename = `${id}.mp3`;
    const fsPath = path.join(dir, filename);
    await writeFile(fsPath, buf);
    const url = `/uploads/tts/${filename}`;

    return {
      url,
      durationSecondsEstimate: Math.round(params.text.length / 12),
      provider: "openai",
      metadata: { voice },
    };
  }
}
