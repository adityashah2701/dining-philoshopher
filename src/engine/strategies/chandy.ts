import type { Strategy } from "./index";
import { left, right } from "../types";

// chandy protocol
export const chandy: Strategy = {
  id: "chandy",
  order: (p, n) => [left(p, n), right(p, n)],
  usesWaiter: false,
  protocol: "chandy",
};
