/** Sent as password when DEV_SKIP_LOGIN=true — checked only on the server. */
export const DEV_BYPASS_PASSWORD = "__SORA_CALM_DEV_BYPASS__";

export function isDevSkipLoginEnabled(): boolean {
  return process.env.DEV_SKIP_LOGIN === "true";
}

export function devAutoLoginEmail(): string {
  const e = process.env.DEV_LOGIN_EMAIL?.trim().toLowerCase();
  return e && e.includes("@") ? e : "premium@soracalm.app";
}
