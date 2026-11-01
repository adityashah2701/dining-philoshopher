import type { Strategy } from "./index";
import { left, right } from "../types";

// naive strategy
export const naive: Strategy = {
  id: "naive",
  order: (p, n) => [left(p, n), right(p, n)],
  usesWaiter: false,
};
