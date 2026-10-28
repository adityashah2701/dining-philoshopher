"use client";

import { useCallback, useEffect, useMemo, useReducer } from "react";
import { createSim, manualToggle, preempt, ringBell, tick, type SimConfig, type SimState } from "@/engine";
import { play as playSfx, type Sfx } from "@/lib/sound";

export type Speed = 1 | 2 | 4;

interface State {
  sim: SimState;
  playing: boolean;
  speed: Speed;
}

type Action =
  | { type: "tick" }
  | { type: "play" }
  | { type: "pause" }
  | { type: "speed"; speed: Speed }
  | { type: "reset"; config: SimConfig; playing: boolean }
  | { type: "click"; p: number }
  | { type: "bell" }
  | { type: "preempt" };

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "tick":
      return { ...state, sim: tick(state.sim) };
    case "play":
      return { ...state, playing: true };
    case "pause":
      return { ...state, playing: false };
    case "speed":
      return { ...state, speed: a.speed };
    case "reset":
      return { ...state, sim: createSim(a.config), playing: a.playing };
    case "click":
      return { ...state, sim: manualToggle(state.sim, a.p) };
    case "bell":
      return { ...state, sim: ringBell(state.sim) };
    case "preempt":
      return { ...state, sim: preempt(state.sim) };
  }
}

const SFX_PRIORITY: [SimState["events"][number]["type"], Sfx][] = [
  ["deadlock", "deadlock"],
  ["preempt", "preempt"],
  ["eat", "eat"],
  ["grab", "grab"],
];

/** React adapter around the pure engine: owns the clock, speed and sound. */
export function useSimulation(config: SimConfig, opts: { autoPlay?: boolean; baseMs?: number } = {}) {
  const { autoPlay = false, baseMs = 450 } = opts;
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    sim: createSim(config),
    playing: autoPlay,
    speed: 1 as Speed,
  }));

  useEffect(() => {
    if (!state.playing) return;
    const id = setInterval(() => dispatch({ type: "tick" }), baseMs / state.speed);
    return () => clearInterval(id);
  }, [state.playing, state.speed, baseMs]);

  // One sound per tick: the most important thing that happened.
  useEffect(() => {
    const types = new Set(state.sim.events.map((e) => e.type));
    const hit = SFX_PRIORITY.find(([t]) => types.has(t));
    if (hit) playSfx(hit[1]);
  }, [state.sim.events]);

  const reset = useCallback(
    (next: SimConfig = config, playing = autoPlay) => dispatch({ type: "reset", config: next, playing }),
    [config, autoPlay],
  );

  const controls = useMemo(
    () => ({
      play: () => dispatch({ type: "play" }),
      pause: () => dispatch({ type: "pause" }),
      step: () => dispatch({ type: "tick" }),
      setSpeed: (speed: Speed) => dispatch({ type: "speed", speed }),
      click: (p: number) => dispatch({ type: "click", p }),
      bell: () => dispatch({ type: "bell" }),
      preempt: () => dispatch({ type: "preempt" }),
    }),
    [],
  );

  return { ...state, ...controls, reset };
}

export type SimController = ReturnType<typeof useSimulation>;
