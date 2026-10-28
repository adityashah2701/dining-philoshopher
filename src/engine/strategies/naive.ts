import type { Strategy } from "./index";
import { left, right } from "../types";

/** Grab LEFT, then RIGHT. If everyone grabs left at once → circular wait → deadlock. */
export const naive: Strategy = {
  id: "naive",
  order: (p, n) => [left(p, n), right(p, n)],
  usesWaiter: false,
};
