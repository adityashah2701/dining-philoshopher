"use client";

import { useEffect, useRef, useState } from "react";
import { DiningTable } from "@/components/table/DiningTable";
import { Banner } from "@/components/hud/Banner";
import { useSimulation } from "@/hooks/useSimulation";
import { useProgress } from "@/hooks/useProgress";
import { level1Stars } from "@/content/levels";
import { play } from "@/lib/sound";
import type { SimConfig } from "@/engine";
import { LevelShell, NextButton, StarRow } from "./LevelShell";

const CONFIG: SimConfig = { n: 5, strategy: "manual", eat: [4, 4] };

/** Level 1 — the player hands out chopsticks and discovers the rules. */
export function Level1() {
  const ctl = useSimulation(CONFIG, { autoPlay: true, baseMs: 500 });
  const { sim } = ctl;
  const { award } = useProgress();
  const [finish, setFinish] = useState<number | null>(null);
  const sawDeadlock = useRef(false);

  const fed = sim.philosophers.filter((p) => p.meals > 0).length;
  const done = fed === CONFIG.n;
  const holdingOne = sim.philosophers.some(
    (p) => p.state === "hungry" && sim.chopsticks.filter((o) => o === p.id).length === 1,
  );
  if (sim.deadlock) sawDeadlock.current = true;

  useEffect(() => {
    if (done && finish === null) {
      setFinish(sim.tick);
      ctl.pause();
      award(1, level1Stars(sim.tick));
      play("win");
    }
  }, [done, finish, sim.tick, ctl, award]);

  const line = done
    ? "Everyone ate! Notice: two neighbours can NEVER eat at the same time."
    : sim.deadlock
      ? "Uh-oh! Everyone holds ONE stick and waits forever. Tap someone to put theirs down."
      : holdingOne
        ? "One stick isn't enough. They need their neighbour's stick too!"
        : fed > 0
          ? "Nice! Sticks go back on the table after eating. Keep going!"
          : "5 philosophers, 5 chopsticks. Each needs TWO to eat. Tap a hungry one!";

  const stars = finish !== null ? level1Stars(finish) : 0;

  return (
    <LevelShell
      id={1}
      line={line}
      goal={
        <div className="flex items-center gap-1 text-2xl" aria-label={`${fed} of 5 fed`}>
          {sim.philosophers.map((p) => (
            <span key={p.id} style={{ filter: p.meals > 0 ? "none" : "grayscale(1) brightness(0.45)" }}>
              🍜
            </span>
          ))}
          <span className="ml-2 font-pixel text-[10px] text-dim">⏱{finish ?? sim.tick}</span>
        </div>
      }
    >
      <DiningTable sim={sim} onSeatClick={done ? undefined : ctl.click}>
        <Banner show={done} tone="mint" title="ALL FED!" icon="🎉">
          <StarRow stars={stars} />
          {sawDeadlock.current && <div className="text-[20px] text-amber">🏅 Bonus: you found a deadlock!</div>}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              className="px-btn"
              style={{ "--btn": "#f6ecd2" } as React.CSSProperties}
              onClick={() => {
                sawDeadlock.current = false;
                setFinish(null);
                ctl.reset(CONFIG, true);
              }}
            >
              ↺ Again
            </button>
            <NextButton id={1} />
          </div>
        </Banner>
      </DiningTable>
      <p className="text-center text-[20px] text-dim">
        👆 Tap = grab free sticks · tap again with none free = put down
      </p>
    </LevelShell>
  );
}
