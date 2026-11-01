"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DiningTable } from "@/components/table/DiningTable";
import { LOOKS } from "@/components/table/sprites";
import { Banner } from "@/components/hud/Banner";
import { CoffmanBadges } from "@/components/hud/CoffmanBadges";
import { useSimulation } from "@/hooks/useSimulation";
import { useProgress } from "@/hooks/useProgress";
import type { SimConfig } from "@/engine";
import { LevelShell, NextButton } from "./LevelShell";

const CONFIG: SimConfig = { n: 5, strategy: "naive", startHungry: true, starveAt: 14 };

// level 2
export function Level2() {
  const ctl = useSimulation(CONFIG, { baseMs: 700 });
  const { sim } = ctl;
  const { award } = useProgress();
  const [phase, setPhase] = useState<"intro" | "running" | "banner" | "explain">("intro");

  useEffect(() => {
    if (phase === "running" && sim.deadlock) {
      setPhase("banner");
      award(2, 3);
    }
  }, [phase, sim.deadlock, award]);

  useEffect(() => {
    if (phase !== "banner") return;
    const t = setTimeout(() => setPhase("explain"), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  const line = {
    intro: "House rule: Everyone grabs their LEFT stick first, then waits for the right. Seems fair, right?",
    running: "Everyone is hungry at once… watch as every philosopher grabs their left stick…",
    banner: "…",
    explain: "Each holds one stick and waits for a neighbour. Nobody lets go. FOREVER. That is a DEADLOCK.",
  }[phase];

  return (
    <LevelShell
      id={2}
      line={line}
      goal={<span className="font-pixel text-[10px] text-dim">⏱{sim.tick}</span>}
    >
      <DiningTable sim={sim} showGraph={phase !== "intro"}>
        <Banner show={phase === "banner"} tone="red" title="DEADLOCK!" icon="🔒" />
        {phase === "intro" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <button
              className="px-btn text-[13px] animate-pulse"
              style={{ "--btn": "#ff8fd1" } as React.CSSProperties}
              onClick={() => {
                setPhase("running");
                ctl.play();
              }}
            >
              🔔 Ring the dinner bell
            </button>
          </div>
        )}
      </DiningTable>

      {phase === "running" && !sim.deadlock && (
        <div className="flex justify-center gap-3">
          <button
            className="px-btn !px-3"
            style={{ "--btn": ctl.playing ? "#ffd23f" : "#5ef2a8" } as React.CSSProperties}
            onClick={ctl.playing ? ctl.pause : ctl.play}
          >
            {ctl.playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <button
            className="px-btn !px-3"
            style={{ "--btn": "#8d92c4" } as React.CSSProperties}
            onClick={ctl.step}
            disabled={ctl.playing}
          >
            ▸| Step
          </button>
        </div>
      )}

      {phase === "explain" && sim.deadlock && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          <CycleChain cycle={sim.deadlock} />
          <div className="flex flex-col gap-3 rounded-lg border border-edge/60 bg-edge/20 p-4">
            <div className="text-center font-pixel text-[11px] text-amber">ALL 4 COFFMAN CONDITIONS COINCIDED:</div>
            <CoffmanBadges glow="circular" />
            <div className="text-center text-[19px] text-noodle font-pixel">
              Break ANY ONE of these 4 conditions → Deadlock is impossible!
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              className="px-btn"
              style={{ "--btn": "#f6ecd2" } as React.CSSProperties}
              onClick={() => {
                setPhase("intro");
                ctl.reset(CONFIG, false);
              }}
            >
              ↺ Replay
            </button>
            <NextButton id={2} />
          </div>
        </motion.div>
      )}
    </LevelShell>
  );
}

// cycle chain
function CycleChain({ cycle }: { cycle: number[] }) {
  const ring = [...cycle, cycle[0]];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Wait-for cycle">
      {ring.map((p, i) => (
        <motion.span
          key={`${p}-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 * i }}
          className="flex items-center gap-2"
        >
          <span className="px-frame flex items-center gap-1.5 px-3 py-1 font-pixel text-[10px] text-amber">
            <span>{LOOKS[p].name}</span>
          </span>
          {i < ring.length - 1 && <span className="text-dim">→</span>}
        </motion.span>
      ))}
    </div>
  );
}
