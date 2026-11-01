import type { StrategyId } from "../types";
import { naive } from "./naive";
import { hierarchy } from "./hierarchy";
import { waiter } from "./waiter";
import { chandy } from "./chandy";
import { lehmann } from "./lehmann";

// strategy contract
export interface Strategy {
  id: Exclude<StrategyId, "manual">;
  // stick order
  order(p: number, n: number): [number, number];
  // waiter guard
  usesWaiter: boolean;
  // custom protocol
  protocol?: "chandy" | "lehmann";
}

export const STRATEGIES: Record<Strategy["id"], Strategy> = { naive, hierarchy, waiter, chandy, lehmann };
