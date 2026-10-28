import type { Strategy } from "./index";
import { left, right } from "../types";

/**
 * Lehmann & Rabin, "On the Advantages of Free Choice" (POPL 1981): flip a coin
 * to pick the first stick, wait for it, then TRY the second; if it is busy put
 * the first one down and flip again. The protocol itself is in simulation.ts
 * (freeChoice); `order` is unused.
 */
export const lehmann: Strategy = {
  id: "lehmann",
  order: (p, n) => [left(p, n), right(p, n)],
  usesWaiter: false,
  protocol: "lehmann",
};
