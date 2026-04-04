import type { ContentPillarId } from "./sessions";

/** Editorial order for Path list grouping and content hierarchy */
export const PILLAR_ORDER: ContentPillarId[] = [
  "still_mind",
  "when_lot",
  "close_day",
  "back_body",
  "soft_evening",
  "tonight",
  "return_you",
  "quiet_warmth",
];

export function pillarSortIndex(id: ContentPillarId): number {
  const i = PILLAR_ORDER.indexOf(id);
  return i === -1 ? 999 : i;
}
