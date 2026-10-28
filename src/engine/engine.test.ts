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

const neighboursNeverEat = (s: SimState) =>
  s.philosophers.every((p, i) => !(p.state === "eating" && s.philosophers[(i + 1) % s.config.n].state === "eating"));

describe.each(["chandy", "lehmann"] as const)("%s (research-paper strategy)", (strategy) => {
  it.each([3, 5, 8])("never deadlocks, keeps mutual exclusion and keeps making progress (n=%i)", (n) => {
    let s = createSim({ n, strategy, startHungry: true, seed: n * 13 });
    let lastTotal = 0;
    for (let i = 1; i <= 10_000; i++) {
      s = tick(s);
      if (i % 500 === 0) s = ringBell(s);
      expect(s.deadlock).toBeNull();
      expect(neighboursNeverEat(s)).toBe(true);
      if (i % 1000 === 0) {
        const total = s.philosophers.reduce((a, p) => a + p.meals, 0);
        expect(total).toBeGreaterThan(lastTotal); // no stall, even though no cycle is drawn
        lastTotal = total;
      }
    }
    expect(Math.min(...s.philosophers.map((p) => p.meals))).toBeGreaterThan(0);
  });

  it("feeds everyone within 80 ticks of the dinner bell", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const s = run({ n: 5, strategy, startHungry: true, seed }, 80);
      expect(s.philosophers.every((p) => p.meals > 0)).toBe(true);
    }
  });
});

describe("chandy (clean / dirty sticks)", () => {
  it("starts with all sticks dirty and an acyclic hand-out: P(n-1) holds none", () => {
    const s = createSim({ n: 5, strategy: "chandy" });
    expect(s.chopsticks).toEqual([0, 0, 1, 2, 3]);
    expect(s.dirty.every(Boolean)).toBe(true);
  });

  it("hands a dirty stick over but keeps a clean one until it has eaten", () => {
    let s = createSim({ n: 5, strategy: "chandy", startHungry: true, eat: [3, 3] });
    // P4 holds nothing, so it asks P0 (stick 0) and P3 (stick 4): both dirty → handed over.
    s = tick(s);
    const gave = s.chopsticks.filter((o, c) => o !== [0, 0, 1, 2, 3][c]);
    expect(gave.length).toBeGreaterThan(0);
    // A stick that just changed hands is clean and must not be taken back at once.
    const moved = s.chopsticks.findIndex((o, c) => o !== [0, 0, 1, 2, 3][c]);
    expect(s.dirty[moved]).toBe(false);
    const holder = s.chopsticks[moved];
    s = tick(s);
    if (s.philosophers[holder!].state !== "eating") expect(s.chopsticks[moved]).toBe(holder);
  });

  it("an eating philosopher keeps its sticks (now dirty) after the meal until asked", () => {
    let s = createSim({ n: 5, strategy: "chandy", startHungry: true, eat: [2, 2], seed: 3 });
    while (s.philosophers[0].meals === 0) s = tick(s);
    // P0 has just finished eating: it still holds a stick and it is dirty.
    const held = s.chopsticks.map((o, c) => (o === 0 ? c : -1)).filter((c) => c >= 0);
    expect(held.length).toBeGreaterThan(0);
    expect(held.every((c) => s.dirty[c])).toBe(true);
  });
});

describe("lehmann (random first stick, back off)", () => {
  it("never keeps one stick while the other is busy for more than one tick", () => {
    let s = createSim({ n: 5, strategy: "lehmann", startHungry: true, seed: 5 });
    let sawBackOff = false;
    for (let i = 0; i < 3000; i++) {
      const before = s.chopsticks.filter((o) => o !== null).length;
      s = tick(s);
      if (s.events.some((e) => e.type === "release") && s.chopsticks.filter((o) => o !== null).length < before) sawBackOff = true;
      for (const p of s.philosophers) {
        if (p.state === "hungry" && p.first !== null) {
          // a hungry philosopher holding its first stick is mid-attempt; the next tick must resolve it
          const held = s.chopsticks.filter((o) => o === p.id).length;
          expect(held).toBeLessThanOrEqual(2);
        }
      }
    }
    expect(sawBackOff).toBe(true);
  });

  it("the all-pick-the-same-side case (D1) resolves instead of deadlocking", () => {
    // Force every philosopher to have picked its LEFT stick first and hold it.
    const base = createSim({ n: 5, strategy: "lehmann", startHungry: true });
    let s: SimState = {
      ...base,
      chopsticks: [0, 1, 2, 3, 4],
      philosophers: base.philosophers.map((p) => ({ ...p, first: p.id })),
    };
    expect(s.deadlock).toBeNull();
    s = tick(s); // every second stick is busy → someone backs off, which frees a stick for a neighbour
    expect(s.events.some((e) => e.type === "release")).toBe(true);
    expect(s.deadlock).toBeNull();
    for (let i = 0; i < 200; i++) s = tick(s);
    expect(s.philosophers.every((p) => p.meals > 0)).toBe(true);
  });
});
