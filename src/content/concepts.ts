import type { StrategyId } from "@/engine";

export type CoffmanId = "mutex" | "hold" | "nopreempt" | "circular";

export const COFFMAN: { id: CoffmanId; icon: string; name: string; plain: string }[] = [
  { id: "mutex", icon: "🥢", name: "Mutual Exclusion", plain: "One stick, one hand" },
  { id: "hold", icon: "✊", name: "Hold & Wait", plain: "Hold one, wait for the other" },
  { id: "nopreempt", icon: "🚫", name: "No Preemption", plain: "Nobody snatches sticks" },
  { id: "circular", icon: "🔄", name: "Circular Wait", plain: "Everyone waits in a ring" },
];

export interface StrategyInfo {
  id: Exclude<StrategyId, "manual">;
  icon: string;
  name: string;
  tagline: string;
  /** Which Coffman condition the strategy removes. */
  breaks: CoffmanId | null;
  deadlockFree: boolean;
  color: string;
  code: string;
}

export const STRATEGY_INFO: Record<StrategyInfo["id"], StrategyInfo> = {
  naive: {
    id: "naive",
    icon: "😐",
    name: "Grab Left First",
    tagline: "Left stick, then right",
    breaks: null,
    deadlockFree: false,
    color: "#ff4d6d",
    code: `wait(stick[i])
wait(stick[(i+1) % N])
eat()
signal(stick[i])
signal(stick[(i+1) % N])`,
  },
  hierarchy: {
    id: "hierarchy",
    icon: "🔢",
    name: "Numbered Sticks",
    tagline: "Lower number first",
    breaks: "circular",
    deadlockFree: true,
    color: "#4cc9f0",
    code: `a = min(i, (i+1) % N)
b = max(i, (i+1) % N)
wait(stick[a])
wait(stick[b])
eat()
signal(stick[a]); signal(stick[b])`,
  },
  waiter: {
    id: "waiter",
    icon: "🧑‍🍳",
    name: "The Waiter",
    tagline: "Max N−1 at the table",
    breaks: "hold",
    deadlockFree: true,
    color: "#5ef2a8",
    code: `semaphore seats = N - 1
wait(seats)
wait(stick[i])
wait(stick[(i+1) % N])
eat()
signal(both sticks)
signal(seats)`,
  },
};

export const MAPPING = [
  { icon: "🧔", thing: "Philosopher", os: "Process" },
  { icon: "🥢", thing: "Chopstick", os: "Resource / Mutex" },
  { icon: "🍜", thing: "Eating", os: "Critical Section" },
  { icon: "💭", thing: "Thinking", os: "Non-critical work" },
  { icon: "🔒", thing: "Everyone stuck", os: "Deadlock" },
  { icon: "💀", thing: "Never gets to eat", os: "Starvation" },
];
