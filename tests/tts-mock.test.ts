import { describe, expect, it } from "vitest";
import { MockTtsProvider } from "@/lib/tts/mock-tts";

describe("MockTtsProvider", () => {
  it("returns placeholder url and metadata", async () => {
    const tts = new MockTtsProvider();
    const res = await tts.generateAudio({ text: "hello world calm breath", voiceStyle: "calm" });
    expect(res.url).toContain("placeholder");
    expect(res.provider).toBe("mock");
    expect(res.durationSecondsEstimate).toBeGreaterThan(0);
  });
});
