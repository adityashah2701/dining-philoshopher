import { expect, it } from "vitest";
import { createSim, tick, ringBell } from "../src/engine/simulation";
import type { StrategyId } from "../src/engine/types";

// maxWait is the per-run longest wait, averaged over seeds.
// Same setup as report §8.6: 2000 ticks, 30 seeds, all start hungry, bell every 200 ticks, starving = wait >= 30.
it("compares strategies", () => {
  for (const n of [5, 8]) {
    console.log(`\nN=${n}`);
    for (const strategy of ["naive", "hierarchy", "waiter", "chandy", "lehmann"] as StrategyId[]) {
      let meals = 0, maxWait = 0, spread = 0, dead = 0, starve = 0;
      for (let seed = 1; seed <= 30; seed++) {
        let s = createSim({ n, strategy, startHungry: true, seed });
        for (let t = 1; t <= 2000; t++) {
          s = tick(s);
          if (t % 200 === 0) s = ringBell(s);
        }
        const m = s.philosophers.map((p) => p.meals);
        const total = m.reduce((a, b) => a + b, 0);
        meals += total / 20;
        maxWait += Math.max(...s.philosophers.map((p) => p.maxWait));
        spread += Math.max(...m) - Math.min(...m);
        if (s.everDeadlocked) dead++;
        if (s.philosophers.some((p) => p.starved)) starve++;
      }
      expect(dead).toBe(strategy === "naive" ? 30 : 0);
      console.log(strategy.padEnd(10), "meals/100:", (meals / 30).toFixed(2), "maxWait:", (maxWait / 30).toFixed(1), "spread:", (spread / 30).toFixed(1), `deadlock ${dead}/30`, `starve ${starve}/30`);
    }
  }
});
