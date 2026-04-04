import { describe, expect, it } from "vitest";
import { adminSessionSchema } from "@/lib/validations/admin-session";

describe("adminSessionSchema", () => {
  it("coerces published flags from strings", () => {
    const parsed = adminSessionSchema.safeParse({
      title: "Test session title here",
      slug: "test-session",
      shortDescription: "A short description that is long enough for the schema minimum chars.",
      longDescription: "A longer description for the session that meets minimum length rules.",
      categoryId: "category-id-1",
      durationMinutes: "10",
      intensity: "light",
      tone: "soft",
      voiceStyle: "calm",
      coverGradient: "rose-plum",
      published: "false",
      freeTier: "true",
      scriptJson: JSON.stringify({ intro: "a".repeat(20) }),
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.published).toBe(false);
      expect(parsed.data.freeTier).toBe(true);
    }
  });
});
