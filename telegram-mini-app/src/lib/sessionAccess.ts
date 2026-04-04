import type { MiniSession } from "../data/sessions";
import type { ProgressState } from "./progress";

export function canUserAccessSession(s: MiniSession, state: ProgressState): boolean {
  if (s.sensual && state.sensualMode === "hidden") return false;
  if (!s.freeTier && !state.premium) return false;
  return true;
}
