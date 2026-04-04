import { describe, expect, it } from "vitest";
import { detectCrisisLanguage } from "@/lib/safety/crisis";

describe("detectCrisisLanguage", () => {
  it("flags self-harm phrasing", () => {
    expect(detectCrisisLanguage("I want to kill myself")).toBe(true);
  });
  it("allows normal wellness language", () => {
    expect(detectCrisisLanguage("I feel stressed and want calm")).toBe(false);
  });
});
