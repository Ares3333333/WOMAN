const KEY = "sora_tg_v1";

export type ProgressState = {
  premium: boolean;
  completedSlugs: string[];
  /** YYYY-MM-DD last «today» self-care mark */
  lastSelfCareDate: string | null;
  streak: number;
  /** ISO week key e.g. 2026-W14 */
  weekKey: string;
  weekCompletions: number;
  calmDrops: number;
  sensualMode: "welcome" | "optional" | "hidden";
  /** Last opened listenable session (for «continue» on Home) */
  lastPlayedSlug: string | null;
  /** UX preference — bot reminders not wired in v1 */
  reminderMode: "off" | "evening" | "night";
};

function isoWeekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const n = Math.ceil((+t - +y) / 86400000 / 7);
  return `${t.getUTCFullYear()}-W${String(n).padStart(2, "0")}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function defaultProgress(): ProgressState {
  const now = new Date();
  return {
    premium: false,
    completedSlugs: [],
    lastSelfCareDate: null,
    streak: 0,
    weekKey: isoWeekKey(now),
    weekCompletions: 0,
    calmDrops: 0,
    sensualMode: "optional",
    lastPlayedSlug: null,
    reminderMode: "off",
  };
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const p = JSON.parse(raw) as ProgressState;
    const wk = isoWeekKey(new Date());
    if (p.weekKey !== wk) {
      return { ...p, weekKey: wk, weekCompletions: 0 };
    }
    const merged = { ...defaultProgress(), ...p, weekKey: wk };
    if (merged.lastPlayedSlug === undefined) merged.lastPlayedSlug = null;
    if (!merged.reminderMode || !["off", "evening", "night"].includes(merged.reminderMode)) {
      merged.reminderMode = "off";
    }
    return merged;
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: ProgressState): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function markSessionComplete(p: ProgressState, slug: string): ProgressState {
  const wk = isoWeekKey(new Date());
  let next = { ...p, weekKey: wk };
  if (!next.completedSlugs.includes(slug)) {
    next.completedSlugs = [...next.completedSlugs, slug];
    next.weekCompletions = p.weekKey === wk ? p.weekCompletions + 1 : 1;
    next.calmDrops = p.calmDrops + 1;
  }
  saveProgress(next);
  return next;
}

export function markSelfCareToday(p: ProgressState): ProgressState {
  const t = todayStr();
  if (p.lastSelfCareDate === t) return p;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  let streak = p.streak;
  if (p.lastSelfCareDate === yStr) streak += 1;
  else if (p.lastSelfCareDate === null) streak = 1;
  else streak = 1;
  const next = { ...p, lastSelfCareDate: t, streak };
  saveProgress(next);
  return next;
}

export function setPremium(p: ProgressState, v: boolean): ProgressState {
  const next = { ...p, premium: v };
  saveProgress(next);
  return next;
}

export function setSensualMode(
  p: ProgressState,
  m: ProgressState["sensualMode"]
): ProgressState {
  const next = { ...p, sensualMode: m };
  saveProgress(next);
  return next;
}

export function rememberLastSession(p: ProgressState, slug: string): ProgressState {
  if (p.lastPlayedSlug === slug) return p;
  const next = { ...p, lastPlayedSlug: slug };
  saveProgress(next);
  return next;
}

export function setReminderMode(
  p: ProgressState,
  mode: ProgressState["reminderMode"]
): ProgressState {
  const next = { ...p, reminderMode: mode };
  saveProgress(next);
  return next;
}
