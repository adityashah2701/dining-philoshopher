import type { Strategy } from "./index";
import { left, right } from "../types";

// waiter semaphore
export const waiter: Strategy = {
  id: "waiter",
  order: (p, n) => [left(p, n), right(p, n)],
  usesWaiter: true,
};
