"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DiningTable } from "@/components/table/DiningTable";
import { Banner } from "@/components/hud/Banner";
import { CoffmanBadges } from "@/components/hud/CoffmanBadges";
import { StrategyCard } from "@/components/hud/StrategyCard";
import { useSimulation } from "@/hooks/useSimulation";
import { useProgress } from "@/hooks/useProgress";
import { STRATEGY_INFO, type StrategyInfo } from "@/content/concepts";
import { SURVIVE_TICKS } from "@/content/levels";
import { play } from "@/lib/sound";
import type { SimConfig } from "@/engine";
import { LevelShell, NextButton, StarRow } from "./LevelShell";

type Sid = StrategyInfo["id"];
// Card order: trap in the middle so it isn't the obvious first/last pick.
const CARDS: Sid[] = ["waiter", "naive", "hierarchy"];

const configFor = (strategy: Sid): SimConfig => ({ n: 5, strategy, startHungry: true, seed: 11 });

const PICK_LINE: Record<Sid, string> = {
  naive: "No rule change? Let's see how that goes…",
  waiter: "The waiter lets only 4 of 5 sit. Someone ALWAYS gets both sticks!",
  hierarchy: "Everyone grabs the LOWER-numbered stick first. Sartre reaches right, so the ring can't close!",
};

/** Level 3 — pick a power-up (strategy) and survive the dinner rush. */
export function Level3() {
  const [pick, setPick] = useState<Sid | null>(null);
  const ctl = useSimulation(configFor("waiter"), { baseMs: 300 });
  const { sim } = ctl;
  const { award } = useProgress();

  const starving = sim.philosophers.some((p) => p.starved);
  const lost = !!pick && (!!sim.deadlock || starving);
  const won =
    !!pick && !lost && sim.tick >= SURVIVE_TICKS && sim.philosophers.every((p) => p.meals > 0);

  useEffect(() => {
    if (won || lost) ctl.pause();
    if (won && pick) award(3, 3);
    if (won) play("win");
    if (lost && !sim.deadlock) play("lose");
  }, [won, lost]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (id: Sid) => {
    setPick(id);
    ctl.reset(configFor(id), true);
  };

  const retry = () => {
    setPick(null);
    ctl.reset(configFor("waiter"), false);
  };

  const progress = Math.min(1, sim.tick / SURVIVE_TICKS);
  const line = !pick
    ? "Dinner rush! Everyone is starving. Pick a power-up to keep the table moving."
    : won
      ? "Dinner saved! Your rule broke one of the 4 deadlock conditions."
      : lost
        ? "Dinner ruined! That rule lets the circle of waiting form. Try another card."
        : PICK_LINE[pick];

  return (
    <LevelShell
      id={3}
      line={line}
      goal={
        <div className="flex items-center gap-2" aria-label="Survival progress">
          <span className="text-xl">🛡</span>
          <div className="h-4 w-28 bg-deep sm:w-40" style={{ boxShadow: "0 0 0 3px #050612" }}>
            <div
              className="h-full transition-[width] duration-300"
              style={{ width: `${progress * 100}%`, background: lost ? "#ff4d6d" : "#5ef2a8" }}
            />
          </div>
        </div>
      }
    >
      {!pick ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-4 py-2 sm:gap-6">
          {CARDS.map((id, i) => (
            <motion.div key={id} initial={{ y: 40, rotate: (i - 1) * 6 }} animate={{ y: 0, rotate: (i - 1) * 3 }} transition={{ delay: i * 0.1 }}>
              <StrategyCard info={STRATEGY_INFO[id]} hideVerdict onClick={() => choose(id)} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <>
          <DiningTable sim={sim}>
            <Banner show={won} tone="mint" title="DINNER SAVED!" icon="🏆">
              <StarRow stars={3} />
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <button className="px-btn" style={{ "--btn": "#f6ecd2" } as React.CSSProperties} onClick={retry}>
                  ↺ Other card
                </button>
                <NextButton id={3} />
              </div>
            </Banner>
            <Banner show={lost} tone="red" title={sim.deadlock ? "DEADLOCK!" : "STARVATION!"} icon={sim.deadlock ? "🔒" : "💀"}>
              <button className="px-btn" style={{ "--btn": "#ffd23f" } as React.CSSProperties} onClick={retry}>
                ↺ Pick again
              </button>
            </Banner>
          </DiningTable>
          {won && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CoffmanBadges broken={STRATEGY_INFO[pick].breaks} />
            </motion.div>
          )}
        </>
      )}
    </LevelShell>
  );
}
