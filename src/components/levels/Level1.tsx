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

// level 1
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
      ? "Uh-oh! Everyone holds ONE stick and waits forever. Tap someone to put theirs down, or press Reset."
      : holdingOne
        ? "One stick isn't enough. They need their neighbour's stick too!"
        : fed > 0
          ? "Nice! Sticks go back on the table after eating. Keep going!"
          : "5 philosophers, 5 chopsticks. Each needs TWO to eat. Tap a hungry one!";

  const stars = finish !== null ? level1Stars(finish) : 0;

  const resetLevel = () => {
    sawDeadlock.current = false;
    setFinish(null);
    ctl.reset(CONFIG, true);
  };

  return (
    <LevelShell
      id={1}
      line={line}
      goal={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-2xl" aria-label={`${fed} of 5 fed`}>
            {sim.philosophers.map((p) => (
              <span key={p.id} style={{ filter: p.meals > 0 ? "none" : "grayscale(1) brightness(0.45)" }}>
                🍜
              </span>
            ))}
          </div>
          <span className="font-pixel text-[10px] text-dim">⏱{finish ?? sim.tick}</span>
          {!done && (
            <button
              onClick={resetLevel}
              className="ml-1 rounded bg-edge/60 px-2 py-1 font-pixel text-[8px] text-dim hover:text-noodle"
              title="Restart Level 1"
            >
              ↺
            </button>
          )}
        </div>
      }
    >
      <DiningTable sim={sim} onSeatClick={done ? undefined : ctl.click}>
        <Banner show={done} tone="mint" title="ALL FED!" icon="🎉">
          <StarRow stars={stars} />
          {sawDeadlock.current && <div className="text-[20px] text-amber">🏅 Bonus: you discovered a deadlock!</div>}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              className="px-btn"
              style={{ "--btn": "#f6ecd2" } as React.CSSProperties}
              onClick={resetLevel}
            >
              ↺ Replay
            </button>
            <NextButton id={1} />
          </div>
        </Banner>
      </DiningTable>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-[20px] text-noodle font-pixel">
          👆 Tap seat to grab sticks · Tap again to release
        </p>
        <p className="text-[17px] text-dim">
          Goal: Feed all 5 philosophers as fast as possible without deadlocking the table!
        </p>
      </div>
    </LevelShell>
  );
}
