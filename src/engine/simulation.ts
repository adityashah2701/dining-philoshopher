import type { Philosopher, SimConfig, SimEvent, SimState } from "./types";
import { left, right } from "./types";
import { nextRandom, randInt } from "./rng";
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
      first: null,
    });
  }

  return {
    config,
    tick: 0,
    philosophers,
    chopsticks: initialChopsticks(config.n, config.strategy),
    dirty: Array(config.n).fill(true),
    rng,
    deadlock: null,
    deadlockCount: 0,
    everDeadlocked: false,
    events: [],
  };
}

/**
 * Chandy–Misra starts with every stick dirty and placed so the precedence graph
 * is acyclic: stick c (shared by P(c-1) and P(c)) goes to the lower-numbered one.
 * Every other strategy starts with all sticks on the table.
 */
function initialChopsticks(n: number, strategy: SimConfig["strategy"]): (number | null)[] {
  return Array.from({ length: n }, (_, c) => (strategy === "chandy" ? Math.max(c - 1, 0) : null));
}

/** Shallow-clone the mutable parts so React sees a new state. */
function clone(s: SimState): SimState {
  return {
    ...s,
    philosophers: s.philosophers.map((p) => ({ ...p })),
    chopsticks: [...s.chopsticks],
    dirty: [...s.dirty],
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
  const { n } = s.config;
  s.dirty[left(ph.id, n)] = s.dirty[right(ph.id, n)] = true; // using a stick dirties it
  ph.first = null;
  ph.state = "eating";
  [ph.timer, s.rng] = randInt(s.rng, s.config.eat);
  ph.wait = 0;
  s.events.push({ type: "eat", p: ph.id });
}

/**
 * Chandy–Misra: ask for each stick we lack. The holder hands it over (cleaned)
 * only if it is dirty and the holder is not eating; a clean stick is kept until
 * its holder has eaten. One hand-over per tick keeps the moves visible.
 */
function requestStick(s: SimState, ph: Philosopher) {
  const { n } = s.config;
  for (const c of [left(ph.id, n), right(ph.id, n)]) {
    const holder = s.chopsticks[c];
    if (holder === null || holder === ph.id) continue;
    if (s.philosophers[holder].state === "eating" || !s.dirty[c]) continue;
    s.chopsticks[c] = ph.id;
    s.dirty[c] = false;
    s.events.push({ type: "release", p: holder }, { type: "grab", p: ph.id });
    return;
  }
}

/**
 * Lehmann–Rabin: coin-flip the first stick and wait for it; then try the other
 * once. If it is busy, put the first one down and flip again next tick.
 */
function freeChoice(s: SimState, ph: Philosopher) {
  const { n } = s.config;
  const l = left(ph.id, n);
  const r = right(ph.id, n);
  if (ph.first === null) {
    let coin: number;
    [coin, s.rng] = nextRandom(s.rng);
    ph.first = coin < 0.5 ? l : r;
  }
  if (s.chopsticks[ph.first] !== ph.id) {
    if (s.chopsticks[ph.first] === null) {
      s.chopsticks[ph.first] = ph.id;
      s.events.push({ type: "grab", p: ph.id });
    }
    return;
  }
  const second = ph.first === l ? r : l;
  if (s.chopsticks[second] === null) {
    s.chopsticks[second] = ph.id;
    s.events.push({ type: "grab", p: ph.id });
  } else {
    s.chopsticks[ph.first] = null;
    ph.first = null;
    s.events.push({ type: "release", p: ph.id });
  }
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
  const protocol = strategy === "manual" ? undefined : STRATEGIES[strategy].protocol;
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
        // Chandy–Misra philosophers keep their (now dirty) sticks until asked.
        if (protocol !== "chandy") releaseAll(s, ph.id);
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
    if (protocol === "chandy") requestStick(s, ph);
    else if (protocol === "lehmann") freeChoice(s, ph);
    else {
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
