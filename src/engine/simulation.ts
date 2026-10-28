import type { Philosopher, SimConfig, SimEvent, SimState } from "./types";
import { left, right } from "./types";
import { randInt } from "./rng";
import { STRATEGIES } from "./strategies";
import { findCycle } from "./deadlock";

const DEFAULTS = {
  seed: 42,
  think: [3, 9] as [number, number],
  eat: [2, 5] as [number, number],
  starveAt: 30,
  startHungry: false,
};

/** Manual-mode philosophers stay full after one meal. */
const FOREVER = 1e9;

export function createSim(cfg: SimConfig): SimState {
  const config: Required<SimConfig> = { ...DEFAULTS, ...cfg };
  if (config.strategy === "manual") config.startHungry = true;

  let rng = config.seed;
  const philosophers: Philosopher[] = [];
  for (let id = 0; id < config.n; id++) {
    let timer = 0;
    if (!config.startHungry) [timer, rng] = randInt(rng, config.think);
    philosophers.push({
      id,
      state: config.startHungry ? "hungry" : "thinking",
      timer,
      wait: 0,
      meals: 0,
      maxWait: 0,
      seated: false,
      starved: false,
    });
  }

  return {
    config,
    tick: 0,
    philosophers,
    chopsticks: Array(config.n).fill(null),
    rng,
    deadlock: null,
    deadlockCount: 0,
    everDeadlocked: false,
    events: [],
  };
}

/** Shallow-clone the mutable parts so React sees a new state. */
function clone(s: SimState): SimState {
  return {
    ...s,
    philosophers: s.philosophers.map((p) => ({ ...p })),
    chopsticks: [...s.chopsticks],
    events: [],
  };
}

function holdsBoth(s: SimState, p: number) {
  const { n } = s.config;
  return s.chopsticks[left(p, n)] === p && s.chopsticks[right(p, n)] === p;
}

function releaseAll(s: SimState, p: number) {
  s.chopsticks.forEach((owner, c) => {
    if (owner === p) {
      s.chopsticks[c] = null;
      s.events.push({ type: "release", p });
    }
  });
}

function startEating(s: SimState, ph: Philosopher) {
  ph.state = "eating";
  [ph.timer, s.rng] = randInt(s.rng, s.config.eat);
  ph.wait = 0;
  s.events.push({ type: "eat", p: ph.id });
}

/** Recompute the deadlock flag after any change. */
function settle(s: SimState): SimState {
  const cycle = findCycle(s);
  if (cycle && !s.deadlock) {
    s.deadlockCount++;
    s.everDeadlocked = true;
    s.events.push({ type: "deadlock", p: cycle[0] });
  }
  s.deadlock = cycle;
  return s;
}

/** Advance the world by one time step. Pure: returns a new state. */
export function tick(prev: SimState): SimState {
  const s = clone(prev);
  const { n, strategy, think, starveAt } = s.config;
  s.tick++;

  // Rotate who acts first each tick so no seat is permanently favoured.
  for (let k = 0; k < n; k++) {
    const ph = s.philosophers[(k + s.tick) % n];

    if (ph.state === "thinking") {
      if (--ph.timer <= 0) {
        ph.state = "hungry";
        ph.wait = 0;
      }
      continue;
    }

    if (ph.state === "eating") {
      if (--ph.timer <= 0) {
        releaseAll(s, ph.id);
        ph.meals++;
        ph.state = "thinking";
        ph.seated = false;
        if (strategy === "manual") ph.timer = FOREVER;
        else [ph.timer, s.rng] = randInt(s.rng, think);
      }
      continue;
    }

    // hungry
    ph.wait++;
    ph.maxWait = Math.max(ph.maxWait, ph.wait);
    if (ph.wait >= starveAt) ph.starved = true;
    if (strategy === "manual") continue; // the player decides

    const strat = STRATEGIES[strategy];
    if (strat.usesWaiter && !ph.seated) {
      const seated = s.philosophers.filter((q) => q.seated).length;
      if (seated < n - 1) {
        ph.seated = true;
        s.events.push({ type: "seat", p: ph.id });
      }
      continue;
    }

    // Acquire at most one chopstick per tick (makes hold-and-wait visible).
    const [a, b] = strat.order(ph.id, n);
    const target = s.chopsticks[a] !== ph.id ? a : s.chopsticks[b] !== ph.id ? b : null;
    if (target !== null && s.chopsticks[target] === null) {
      s.chopsticks[target] = ph.id;
      s.events.push({ type: "grab", p: ph.id });
    }
    if (holdsBoth(s, ph.id)) startEating(s, ph);
  }

  return settle(s);
}

/**
 * Manual mode click: grab any free neighbouring chopsticks; if nothing could
 * be grabbed, put down what you hold (voluntary release).
 */
export function manualToggle(prev: SimState, p: number): SimState {
  const ph = prev.philosophers[p];
  if (ph.state !== "hungry") return prev;
  const s = clone(prev);
  const { n } = s.config;

  let grabbed = false;
  for (const c of [left(p, n), right(p, n)]) {
    if (s.chopsticks[c] === null) {
      s.chopsticks[c] = p;
      grabbed = true;
      s.events.push({ type: "grab", p });
    }
  }
  if (!grabbed) releaseAll(s, p);
  if (holdsBoth(s, p)) startEating(s, s.philosophers[p]);
  return settle(s);
}

/** Dinner bell: every thinking philosopher becomes hungry right now. */
export function ringBell(prev: SimState): SimState {
  const s = clone(prev);
  for (const ph of s.philosophers) {
    if (ph.state === "thinking") {
      ph.state = "hungry";
      ph.timer = 0;
      ph.wait = 0;
    }
  }
  return s;
}

/**
 * Deadlock recovery by preemption: force one philosopher in the cycle to drop
 * its chopsticks (breaks the No-Preemption condition).
 */
export function preempt(prev: SimState): SimState {
  if (!prev.deadlock) return prev;
  const s = clone(prev);
  const [r, rng] = randInt(s.rng, [0, s.deadlock!.length - 1]);
  s.rng = rng;
  const victim = s.deadlock![r];
  releaseAll(s, victim);
  const ph = s.philosophers[victim];
  ph.state = "thinking";
  ph.seated = false;
  [ph.timer, s.rng] = randInt(s.rng, s.config.think);
  s.events.push({ type: "preempt", p: victim });
  return settle(s);
}

export function isStarving(s: SimState, ph: Philosopher) {
  return ph.state === "hungry" && ph.wait >= s.config.starveAt;
}

export type { SimEvent };
