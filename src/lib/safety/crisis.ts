const CRISIS_PATTERNS =
  /\b(self[\s-]?harm|suicid|kill myself|end my life|panic attack|can't breathe|abuse|coerced|emergency|hurt me)\b/i;

export function detectCrisisLanguage(text: string): boolean {
  return CRISIS_PATTERNS.test(text);
}

export const CRISIS_COPY = {
  title: "You deserve real-world support",
  body: "Sora Calm offers wellness audio only. It is not crisis care, therapy, or medical advice. If you are in danger, thinking of harming yourself, or in an emergency, please reach out to local emergency services or a crisis line now.",
};
