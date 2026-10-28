import type { SimState } from "@/engine";
import { LOOKS } from "@/components/table/sprites";

function Stat({ icon, label, value, tone }: { icon: string; label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 bg-deep px-3 py-2">
      <span className="text-[20px] text-dim">
        {icon} {label}
      </span>
      <span className="font-pixel text-[12px]" style={{ color: tone }}>
        {value}
      </span>
    </div>
  );
}

/** Live numbers + a pixel bar chart of meals per philosopher (fairness at a glance). */
export function StatsPanel({ sim }: { sim: SimState }) {
  const meals = sim.philosophers.map((p) => p.meals);
  const total = meals.reduce((a, b) => a + b, 0);
  const top = Math.max(1, ...meals);
  const maxWait = Math.max(0, ...sim.philosophers.map((p) => p.maxWait));
  const starving = sim.philosophers.filter((p) => p.state === "hungry" && p.wait >= sim.config.starveAt).length;
  const throughput = sim.tick ? ((total / sim.tick) * 100).toFixed(1) : "0.0";

  return (
    <div className="px-frame flex flex-col gap-4 p-4">
      <div className="font-pixel text-[10px] text-noodle">🍜 MEALS</div>
      <div className="flex h-28 items-end gap-2" aria-label="Meals per philosopher">
        {sim.philosophers.map((p) => (
          <div key={p.id} className="flex flex-1 flex-col items-center gap-1">
            <span className="font-pixel text-[8px]">{p.meals}</span>
            <div
              className="w-full transition-[height] duration-300"
              style={{
                height: `${(p.meals / top) * 72 + 4}px`,
                background: LOOKS[p.id % LOOKS.length].robe,
                boxShadow: "0 0 0 2px #050612",
              }}
            />
            <span className="font-pixel text-[7px] text-dim">P{p.id}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <Stat icon="⏱" label="Tick" value={sim.tick} />
        <Stat icon="⚡" label="Meals / 100 ticks" value={throughput} />
        <Stat icon="⌛" label="Longest wait" value={maxWait} tone={maxWait >= sim.config.starveAt ? "#ff4d6d" : undefined} />
        <Stat icon="💀" label="Starving now" value={starving} tone={starving ? "#ff4d6d" : "#5ef2a8"} />
        <Stat icon="🔒" label="Deadlocks" value={sim.deadlockCount} tone={sim.deadlockCount ? "#ff4d6d" : "#5ef2a8"} />
      </div>
    </div>
  );
}
