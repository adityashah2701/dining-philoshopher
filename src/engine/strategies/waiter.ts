import type { Strategy } from "./index";
import { left, right } from "../types";

/**
 * Arbitrator / counting semaphore initialised to N-1.
 * At most N-1 philosophers may try to eat at once, so by pigeonhole at
 * least one of them can always get both chopsticks — no deadlock.
 */
export const waiter: Strategy = {
  id: "waiter",
  order: (p, n) => [left(p, n), right(p, n)],
  usesWaiter: true,
};
