import type { Strategy } from "./index";
import { left, right } from "../types";

/**
 * Resource ordering: always grab the LOWER-numbered chopstick first.
 * The last philosopher therefore reaches "right" first, so a cycle can never
 * close — this breaks the Circular Wait condition.
 */
export const hierarchy: Strategy = {
  id: "hierarchy",
  order: (p, n) => {
    const a = left(p, n);
    const b = right(p, n);
    return a < b ? [a, b] : [b, a];
  },
  usesWaiter: false,
};
