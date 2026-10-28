import type { SimState } from "./types";
import { left, right } from "./types";
import { STRATEGIES } from "./strategies";

/** The chopstick philosopher p is currently blocked on, or null if not blocked on one. */
export function blockedOn(s: SimState, p: number): number | null {
  const ph = s.philosophers[p];
  if (ph.state !== "hungry") return null;
  const { n, strategy } = s.config;

  let wanted: number | null = null;
  if (strategy === "manual") {
    const l = left(p, n);
    const r = right(p, n);
    const holdsL = s.chopsticks[l] === p;
    const holdsR = s.chopsticks[r] === p;
    if (holdsL !== holdsR) wanted = holdsL ? r : l;
  } else {
    const strat = STRATEGIES[strategy];
    if (strat.usesWaiter && !ph.seated) return null; // waiting on the waiter, not a chopstick
    const [a, b] = strat.order(p, n);
    wanted = s.chopsticks[a] !== p ? a : s.chopsticks[b] !== p ? b : null;
  }

  if (wanted === null) return null;
  const holder = s.chopsticks[wanted];
  return holder !== null && holder !== p ? wanted : null;
}

/** Wait-for graph edges: p → q means p waits for a chopstick held by q. */
export function waitForEdges(s: SimState): [number, number][] {
  const edges: [number, number][] = [];
  for (let p = 0; p < s.config.n; p++) {
    const c = blockedOn(s, p);
    if (c !== null) edges.push([p, s.chopsticks[c]!]);
  }
  return edges;
}

/**
 * Each philosopher waits on at most one other, so the wait-for graph is a
 * functional graph: follow edges and look for a repeat.
 */
export function findCycle(s: SimState): number[] | null {
  const next = new Map(waitForEdges(s));
  for (const start of next.keys()) {
    const seen: number[] = [];
    let cur: number | undefined = start;
    while (cur !== undefined && !seen.includes(cur)) {
      seen.push(cur);
      cur = next.get(cur);
    }
    if (cur !== undefined) return seen.slice(seen.indexOf(cur));
  }
  return null;
}
