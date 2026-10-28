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

/** Level 2 — watch the naive rule walk straight into a deadlock. */
export function Level2() {
  const ctl = useSimulation(CONFIG, { baseMs: 800 });
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
    const t = setTimeout(() => setPhase("explain"), 2200);
    return () => clearTimeout(t);
  }, [phase]);

  const line = {
    intro: "New house rule: everyone grabs their LEFT stick first, then the right. Fair, right?",
    running: "Everyone is hungry at the same moment… watch the LEFT hands…",
    banner: "…",
    explain: "Each holds one stick and waits for a neighbour. Nobody lets go. FOREVER. That's a DEADLOCK.",
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
              className="px-btn text-[13px]"
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

      {phase === "explain" && sim.deadlock && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          <CycleChain cycle={sim.deadlock} />
          <div className="flex flex-col gap-3">
            <div className="text-center font-pixel text-[10px] text-amber">ALL 4 HAPPEN AT ONCE → DEADLOCK</div>
            <CoffmanBadges glow="circular" />
            <div className="text-center text-[20px] text-dim">Break ANY one of them, and dinner is saved.</div>
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

/** "PLATO → KANT → … → PLATO" as pixel chips: the circular wait, spelled out. */
function CycleChain({ cycle }: { cycle: number[] }) {
  const ring = [...cycle, cycle[0]];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" aria-label="Wait-for cycle">
      {ring.map((p, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.12 }}
          className="flex items-center gap-2"
        >
          <span
            className="px-2 py-1 font-pixel text-[9px] text-edge"
            style={{ background: LOOKS[p % LOOKS.length].robe, boxShadow: "0 0 0 3px #050612" }}
          >
            {LOOKS[p % LOOKS.length].name}
          </span>
          {i < ring.length - 1 && <span className="text-blood">➜</span>}
        </motion.span>
      ))}
    </div>
  );
}
