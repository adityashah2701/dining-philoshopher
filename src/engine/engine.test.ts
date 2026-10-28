import { describe, expect, it } from "vitest";
import { createSim, tick, manualToggle, preempt, ringBell } from "./simulation";
import type { SimConfig, SimState } from "./types";
import { findCycle } from "./deadlock";

function run(cfg: SimConfig, ticks: number): SimState {
  let s = createSim(cfg);
  for (let i = 0; i < ticks; i++) s = tick(s);
  return s;
}

describe("naive (left then right)", () => {
  it("deadlocks with a full 5-cycle when everyone is hungry at once", () => {
    const s = run({ n: 5, strategy: "naive", startHungry: true }, 3);
    expect(s.deadlock).not.toBeNull();
    expect([...s.deadlock!].sort()).toEqual([0, 1, 2, 3, 4]);
    expect(s.chopsticks).toEqual([0, 1, 2, 3, 4]);
  });

  it("stays deadlocked until preempted", () => {
    let s = run({ n: 5, strategy: "naive", startHungry: true }, 20);
    expect(s.philosophers.every((p) => p.meals === 0)).toBe(true);
    s = preempt(s);
    expect(s.deadlock).toBeNull();
    for (let i = 0; i < 20; i++) s = tick(s);
    expect(s.philosophers.some((p) => p.meals > 0)).toBe(true);
  });
});

describe.each(["hierarchy", "waiter"] as const)("%s", (strategy) => {
  it.each([3, 5, 8])("never deadlocks over 10k ticks (n=%i)", (n) => {
    let s = createSim({ n, strategy, startHungry: true, seed: n * 7 });
    for (let i = 0; i < 10_000; i++) {
      s = tick(s);
      if (i % 500 === 0) s = ringBell(s);
      expect(s.deadlock).toBeNull();
    }
    expect(s.everDeadlocked).toBe(false);
    expect(Math.min(...s.philosophers.map((p) => p.meals))).toBeGreaterThan(0);
  });

  it("feeds everyone without starvation within 80 ticks (level 3 goal)", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const s = run({ n: 5, strategy, startHungry: true, seed }, 80);
      expect(s.philosophers.every((p) => p.meals > 0 && !p.starved)).toBe(true);
    }
  });
});

describe("manual mode", () => {
  it("lets the player feed philosophers and detects a self-made deadlock", () => {
    let s = createSim({ n: 5, strategy: "manual", eat: [3, 3] });
    s = manualToggle(s, 0);
    expect(s.philosophers[0].state).toBe("eating");
    s = manualToggle(s, 1); // grabs only its right stick
    expect(s.philosophers[1].state).toBe("hungry");
    s = manualToggle(s, 1); // nothing free → drops it
    expect(s.chopsticks[2]).toBeNull();

    // Everyone holding their left stick is a deadlock the player can create.
    const d = { ...createSim({ n: 5, strategy: "manual" }), chopsticks: [0, 1, 2, 3, 4] };
    expect(findCycle(d)?.length).toBe(5);
    // Voluntarily dropping a stick (click with nothing free) resolves it.
    expect(manualToggle(d, 0).deadlock).toBeNull();
  });
});
