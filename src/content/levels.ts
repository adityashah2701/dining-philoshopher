export interface LevelInfo {
  id: number;
  icon: string;
  title: string;
  /** What the player does, in one glance. */
  verb: "PLAY" | "WATCH" | "CHOOSE";
  goal: string;
}

export const LEVELS: LevelInfo[] = [
  { id: 1, icon: "🥢", title: "Two Sticks Rule", verb: "PLAY", goal: "Feed all 5" },
  { id: 2, icon: "🔒", title: "Everyone Grabs Left", verb: "WATCH", goal: "Spot the trap" },
  { id: 3, icon: "🛡", title: "Fix the Dinner", verb: "CHOOSE", goal: "Survive the rush" },
];

/** Level 3 survival length, in ticks. */
export const SURVIVE_TICKS = 80;

/** Level 1 star thresholds, in ticks. */
export function level1Stars(ticks: number) {
  return ticks <= 20 ? 3 : ticks <= 32 ? 2 : 1;
}
