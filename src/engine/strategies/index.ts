import type { StrategyId } from "../types";
import { naive } from "./naive";
import { hierarchy } from "./hierarchy";
import { waiter } from "./waiter";
import { chandy } from "./chandy";
import { lehmann } from "./lehmann";

/**
 * A strategy decides the ORDER in which a philosopher acquires its two
 * chopsticks, and whether it must first get permission from a waiter.
 * The engine acquires one resource per tick so the "holding one" moment
 * (hold-and-wait) is visible.
 */
export interface Strategy {
  id: Exclude<StrategyId, "manual">;
  /** Chopstick ids in acquisition order for philosopher p. */
  order(p: number, n: number): [number, number];
  /** Must hold one of the N-1 waiter seats before picking up chopsticks. */
  usesWaiter: boolean;
  /** Strategies that follow their own protocol instead of "order, one stick per tick". */
  protocol?: "chandy" | "lehmann";
}

export const STRATEGIES: Record<Strategy["id"], Strategy> = { naive, hierarchy, waiter, chandy, lehmann };
