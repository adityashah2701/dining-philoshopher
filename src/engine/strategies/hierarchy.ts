import type { Strategy } from "./index";
import { left, right } from "../types";

// resource hierarchy
export const hierarchy: Strategy = {
  id: "hierarchy",
  order: (p, n) => {
    const a = left(p, n);
    const b = right(p, n);
    return a < b ? [a, b] : [b, a];
  },
  usesWaiter: false,
};
