/**
 * OS mapping used throughout the engine:
 *   Philosopher  → process / thread
 *   Chopstick    → mutex-protected resource
 *   Eating       → critical section (needs BOTH resources)
 *   Strategy     → synchronization policy
 */

export type PState = "thinking" | "hungry" | "eating";

export type StrategyId = "naive" | "hierarchy" | "waiter" | "chandy" | "lehmann" | "manual";

export interface Philosopher {
  id: number;
  state: PState;
  /** Ticks left in the current thinking/eating phase. */
  timer: number;
  /** Ticks spent waiting in the current hungry phase. */
  wait: number;
  meals: number;
  maxWait: number;
  /** Waiter strategy only: holds one of the N-1 seats. */
  seated: boolean;
  /** Ever crossed the starvation threshold. */
  starved: boolean;
  /** Lehmann–Rabin only: the chopstick chosen (by coin flip) to be picked up first, or null to flip again. */
  first: number | null;
  /** Lehmann–Rabin only: coin flips so far (lets the UI replay the flip animation). */
  flips: number;
}

export type SimEventType = "grab" | "release" | "eat" | "seat" | "deadlock" | "preempt";

export interface SimEvent {
  type: SimEventType;
  p: number;
}

export interface SimConfig {
  n: number;
  strategy: StrategyId;
  seed?: number;
  /** [min, max] ticks spent thinking. */
  think?: [number, number];
  /** [min, max] ticks spent eating. */
  eat?: [number, number];
  /** Wait ticks after which a philosopher counts as starving. */
  starveAt?: number;
  /** Everyone sits down hungry at tick 0 (the "dinner bell"). */
  startHungry?: boolean;
}

export interface SimState {
  config: Required<SimConfig>;
  tick: number;
  philosophers: Philosopher[];
  /** chopsticks[i] = id of the philosopher holding it, or null. Chopstick i is shared by P(i-1) and P(i). */
  chopsticks: (number | null)[];
  /** Chandy–Misra only: dirty[i] is true while chopstick i has been used since it last changed hands. */
  dirty: boolean[];
  rng: number;
  /** Philosopher ids forming the wait-for cycle, or null. */
  deadlock: number[] | null;
  deadlockCount: number;
  everDeadlocked: boolean;
  /** Events emitted during the most recent tick/action (drives sound + effects). */
  events: SimEvent[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- symmetric with right()
export const left = (p: number, _n: number) => p;
export const right = (p: number, n: number) => (p + 1) % n;
