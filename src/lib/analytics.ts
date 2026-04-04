"use client";

/**
 * Privacy: keep payloads small and non-identifying. Do not send journal text, emails, or passwords.
 * Prefer opaque IDs already used in URLs (e.g. sessionId) only when needed for product analytics.
 */
export type AnalyticsEvent =
  | "session_started"
  | "session_completed"
  | "mood_checkin_submitted"
  | "favorite_added"
  | "onboarding_completed"
  | "trial_started"
  | "paywall_viewed";

export async function trackEvent(
  name: AnalyticsEvent,
  payload?: Record<string, unknown>
): Promise<void> {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, payload: payload ?? {}, ts: Date.now() }),
    });
  } catch {
    /* non-blocking */
  }
}
