"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DiningTable } from "@/components/table/DiningTable";
import { Banner } from "@/components/hud/Banner";
import { StrategyCard } from "@/components/hud/StrategyCard";
import { useSimulation } from "@/hooks/useSimulation";
import { useProgress } from "@/hooks/useProgress";
import { STRATEGY_INFO, type StrategyInfo } from "@/content/concepts";
import { SURVIVE_TICKS } from "@/content/levels";
import { play } from "@/lib/sound";
import type { SimConfig } from "@/engine";
import { LevelShell, NextButton, StarRow } from "./LevelShell";

type Sid = StrategyInfo["id"];
// card order
const BASIC_CARDS: Sid[] = ["waiter", "naive", "hierarchy"];
const ALL_CARDS: Sid[] = ["naive", "hierarchy", "waiter", "chandy", "lehmann"];

const configFor = (strategy: Sid): SimConfig => ({ n: 5, strategy, startHungry: true, seed: 11 });

const PICK_LINE: Record<Sid, string> = {
  naive: "No rule change? Everyone grabs left first… let's see how long that lasts!",
  waiter: "The Waiter permits at most 4 to sit! By pigeonhole principle, someone ALWAYS gets both sticks.",
  hierarchy: "Numbered Sticks: lower number first! The circle cannot close because the last philosopher grabs opposite!",
  chandy: "Chandy-Misra: Dirty sticks are yielded on request, clean sticks are retained until eaten!",
  lehmann: "Lehmann-Rabin: Flip a coin for the first stick, and back off immediately if the second is occupied!",
};

// level 3
export function Level3() {
  const [pick, setPick] = useState<Sid | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    ? "Dinner rush! Everyone is starving. Pick a power-up strategy to keep the table flowing smoothly."
    : won
      ? "Dinner saved! Your rule defeated one of the 4 deadlock conditions. Table never locked!"
      : lost
        ? "Dinner ruined! That rule allowed a cycle of waiting to form. Try another strategy."
        : PICK_LINE[pick];

  const cardsToDisplay = showAdvanced ? ALL_CARDS : BASIC_CARDS;

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
          <span className="font-pixel text-[9px] text-dim">{Math.round(progress * 100)}%</span>
        </div>
      }
    >
      {!pick ? (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="rounded bg-deep px-3 py-1 font-pixel text-[9px] text-sky hover:text-noodle"
            >
              {showAdvanced ? "◀ Show 3 Classic Cards" : "✨ Show All 5 Strategies"}
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid gap-4 py-2 sm:gap-6 ${
              showAdvanced ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {cardsToDisplay.map((id, i) => (
              <motion.div
                key={id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <StrategyCard info={STRATEGY_INFO[id]} hideVerdict onClick={() => choose(id)} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <>
          <DiningTable sim={sim}>
            <Banner show={won} tone="mint" title="DINNER SAVED!" icon="🏆">
              <StarRow stars={3} />
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <button className="px-btn" style={{ "--btn": "#f6ecd2" } as React.CSSProperties} onClick={retry}>
                  ↺ Other strategy
                </button>
                <NextButton id={3} />
              </div>
            </Banner>
            <Banner
              show={lost}
              tone="red"
              title={sim.deadlock ? "DEADLOCK!" : "STARVATION!"}
              icon={sim.deadlock ? "🔒" : "💀"}
            >
              <div className="text-[19px] text-noodle font-pixel">The table stalled!</div>
              <div className="pt-2">
                <button className="px-btn" style={{ "--btn": "#f6ecd2" } as React.CSSProperties} onClick={retry}>
                  ↺ Try another card
                </button>
              </div>
            </Banner>
          </DiningTable>
          <div className="flex flex-wrap items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2 font-pixel text-[10px]">
              <span className="text-dim">ACTIVE STRATEGY:</span>
              <span className="text-noodle">{STRATEGY_INFO[pick].name}</span>
            </div>
            <button
              onClick={retry}
              className="rounded bg-deep px-3 py-1 font-pixel text-[9px] text-dim hover:text-noodle"
            >
              ↺ Change Strategy
            </button>
          </div>
        </>
      )}
    </LevelShell>
  );
}
