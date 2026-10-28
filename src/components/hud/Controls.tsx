"use client";

import type { SimController, Speed } from "@/hooks/useSimulation";

const SPEEDS: Speed[] = [1, 2, 4];

export function Controls({ ctl, onReset, children }: { ctl: SimController; onReset: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <button
        className="px-btn min-w-[96px]"
        style={{ "--btn": ctl.playing ? "#ffd23f" : "#5ef2a8" } as React.CSSProperties}
        onClick={ctl.playing ? ctl.pause : ctl.play}
      >
        {ctl.playing ? "❚❚ Pause" : "▶ Play"}
      </button>
      <button className="px-btn" style={{ "--btn": "#8d92c4" } as React.CSSProperties} onClick={ctl.step} disabled={ctl.playing} title="Advance one tick">
        ▸| Step
      </button>
      <div className="flex gap-3" role="group" aria-label="Speed">
        {SPEEDS.map((s) => (
          <button
            key={s}
            className="px-btn !px-3"
            style={{ "--btn": ctl.speed === s ? "#ffb347" : "#3a4180", color: ctl.speed === s ? undefined : "#f6ecd2" } as React.CSSProperties}
            aria-pressed={ctl.speed === s}
            onClick={() => ctl.setSpeed(s)}
          >
            x{s}
          </button>
        ))}
      </div>
      <button className="px-btn" style={{ "--btn": "#f6ecd2" } as React.CSSProperties} onClick={onReset} title="Reset">
        ↺
      </button>
      {children}
    </div>
  );
}
