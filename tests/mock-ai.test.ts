import { describe, expect, it } from "vitest";
import { MockAiProvider } from "@/lib/ai/mock-provider";

describe("MockAiProvider", () => {
  it("returns structured script sections", async () => {
    const p = new MockAiProvider();
    const draft = await p.generateSessionDraft({
      targetMood: "overwhelmed",
      category: "stress-relief",
      durationMinutes: 10,
      tone: "soft",
      goal: "calm the nervous system",
      voiceStyle: "calm",
      forbiddenPhrases: "test phrase",
    });
    expect(draft.title.length).toBeGreaterThan(3);
    expect(draft.script.intro).toContain("overwhelmed");
    expect(draft.script.guidedBreathing.length).toBeGreaterThan(10);
    expect(draft.tags.length).toBeGreaterThan(0);
  });
});
