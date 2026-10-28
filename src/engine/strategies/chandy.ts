import type { Strategy } from "./index";
import { left, right } from "../types";

/**
 * Chandy & Misra, "The Drinking Philosophers Problem" (ACM TOPLAS 6(4), 1984),
 * dining case: every chopstick is clean or dirty and always stays with a
 * philosopher. A holder yields a requested DIRTY stick (cleaning it) unless it
 * is eating, and keeps a CLEAN one until it has eaten. The protocol itself is
 * in simulation.ts (requestStick); `order` is unused.
 */
export const chandy: Strategy = {
  id: "chandy",
  order: (p, n) => [left(p, n), right(p, n)],
  usesWaiter: false,
  protocol: "chandy",
};
