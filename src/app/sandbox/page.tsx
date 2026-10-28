"use client";

import { useState } from "react";
import { DiningTable } from "@/components/table/DiningTable";
import { Controls } from "@/components/hud/Controls";
import { StatsPanel } from "@/components/hud/StatsPanel";
import { StrategyCard } from "@/components/hud/StrategyCard";
import { Banner } from "@/components/hud/Banner";
import { STRATEGY_INFO, type StrategyInfo } from "@/content/concepts";
import { useSimulation } from "@/hooks/useSimulation";
import type { SimConfig } from "@/engine";

type Sid = StrategyInfo["id"];

export default function SandboxPage() {
  const [strategy, setStrategy] = useState<Sid>("naive");
  const [n, setN] = useState(5);
  const [seed, setSeed] = useState(7);
  const [graph, setGraph] = useState(true);

  const config: SimConfig = { n, strategy, seed };
  const ctl = useSimulation(config);
  const { sim } = ctl;

  const restart = (next: Partial<SimConfig>) => ctl.reset({ ...config, ...next }, ctl.playing);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center font-pixel text-[14px] text-noodle glow sm:text-[18px]">🧪 SANDBOX LAB</h1>

      <div className="mx-auto grid w-full max-w-2xl grid-cols-3 gap-4 px-1">
        {(Object.keys(STRATEGY_INFO) as Sid[]).map((id) => (
          <StrategyCard
            key={id}
            info={STRATEGY_INFO[id]}
            compact
            selected={strategy === id}
            onClick={() => {
              setStrategy(id);
              restart({ strategy: id });
            }}
          />
        ))}
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <DiningTable sim={sim} showGraph={graph}>
            <Banner show={!!sim.deadlock} tone="red" title="DEADLOCK!" icon="🔒">
              <div className="flex gap-4 pt-1">
                <button className="px-btn" style={{ "--btn": "#ffd23f" } as React.CSSProperties} onClick={ctl.preempt}>
                  🔨 Preempt
                </button>
                <button className="px-btn" style={{ "--btn": "#f6ecd2" } as React.CSSProperties} onClick={() => restart({})}>
                  ↺ Reset
                </button>
              </div>
            </Banner>
          </DiningTable>
          <Controls ctl={ctl} onReset={() => restart({})}>
            <button
              className="px-btn"
              style={{ "--btn": "#ff8fd1" } as React.CSSProperties}
              onClick={ctl.bell}
              title="Make every thinking philosopher hungry at once"
            >
              🔔 Bell
            </button>
          </Controls>
        </div>

        <div className="flex flex-col gap-6">
          <div className="px-frame flex flex-col gap-4 p-4">
            <label className="flex flex-col gap-3">
              <span className="flex justify-between font-pixel text-[10px]">
                <span>🧔 PHILOSOPHERS</span>
                <span className="text-noodle">{n}</span>
              </span>
              <input
                type="range"
                min={3}
                max={8}
                value={n}
                className="px-range"
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setN(v);
                  restart({ n: v });
                }}
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-[20px]">
                <input type="checkbox" checked={graph} onChange={(e) => setGraph(e.target.checked)} className="h-4 w-4 accent-amber" />
                ➰ Wait-for arrows
              </label>
              <button
                className="px-btn !px-3"
                style={{ "--btn": "#8b7cff" } as React.CSSProperties}
                title="New random seed"
                onClick={() => {
                  const s = Math.floor(Math.random() * 1e6);
                  setSeed(s);
                  restart({ seed: s });
                }}
              >
                🎲
              </button>
            </div>
          </div>
          <StatsPanel sim={sim} />
          <Legend />
        </div>
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    ["💭", "Thinking"],
    ["😤", "Hungry"],
    ["😋", "Eating"],
    ["💀", "Starving"],
    ["▬", "Hunger bar"],
    ["➰", "Waits for"],
  ];
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1 text-[19px] text-dim">
      {items.map(([i, l]) => (
        <span key={l}>
          {i} {l}
        </span>
      ))}
    </div>
  );
}
