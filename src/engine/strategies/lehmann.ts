import type { Strategy } from "./index";
import { left, right } from "../types";

// lehmann protocol
export const lehmann: Strategy = {
  id: "lehmann",
  order: (p, n) => [left(p, n), right(p, n)],
  usesWaiter: false,
  protocol: "lehmann",
};
