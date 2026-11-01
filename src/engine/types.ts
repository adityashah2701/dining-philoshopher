// engine types

export type PState = "thinking" | "hungry" | "eating";

export type StrategyId = "naive" | "hierarchy" | "waiter" | "chandy" | "lehmann" | "manual";

export interface Philosopher {
  id: number;
  state: PState;
  // phase timer
  timer: number;
  // wait timer
  wait: number;
  meals: number;
  maxWait: number;
  // seated status
  seated: boolean;
  // starved status
  starved: boolean;
  // first stick
  first: number | null;
  // flip count
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
  // think range
  think?: [number, number];
  // eat range
  eat?: [number, number];
  // starve threshold
  starveAt?: number;
  // start hungry
  startHungry?: boolean;
}

export interface SimState {
  config: Required<SimConfig>;
  tick: number;
  philosophers: Philosopher[];
  // stick owners
  chopsticks: (number | null)[];
  // dirty sticks
  dirty: boolean[];
  rng: number;
  // cycle ids
  deadlock: number[] | null;
  deadlockCount: number;
  everDeadlocked: boolean;
  // sim events
  events: SimEvent[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- symmetric with right()
export const left = (p: number, _n: number) => p;
export const right = (p: number, n: number) => (p + 1) % n;
