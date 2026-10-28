import type { Metadata } from "next";
import { COFFMAN, MAPPING, STRATEGY_INFO } from "@/content/concepts";

export const metadata: Metadata = { title: "Concepts · Pixel Diner" };

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-pixel text-[11px] text-noodle sm:text-[13px]">{children}</h2>;
}

/** One-screen cheat sheet: the OS concepts behind the game. */
export default function ConceptsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12">
      <h1 className="text-center font-pixel text-[14px] text-noodle glow sm:text-[18px]">📖 CHEAT SHEET</h1>

      <section className="flex flex-col gap-5">
        <Heading>🎮 GAME → 💻 OS</Heading>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
          {MAPPING.map((m) => (
            <div key={m.thing} className="px-frame flex items-center gap-4 px-4 py-4">
              <span className="text-4xl">{m.icon}</span>
              <div className="flex flex-col gap-1">
                <span className="text-[19px] text-dim">{m.thing} =</span>
                <span className="font-pixel text-[10px] leading-relaxed text-sky sm:text-[12px]">{m.os}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <Heading>🔒 DEADLOCK NEEDS ALL 4 (COFFMAN)</Heading>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {COFFMAN.map((c, i) => (
            <div key={c.id} className="px-frame flex flex-col items-center gap-2 px-3 py-4 text-center">
              <span className="font-pixel text-[8px] text-dim">#{i + 1}</span>
              <span className="text-4xl">{c.icon}</span>
              <span className="font-pixel text-[9px] leading-relaxed text-sky sm:text-[10px]">{c.name}</span>
              <span className="text-[19px] leading-none text-dim">{c.plain}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[21px] text-amber">Remove any ONE → deadlock is impossible.</p>
      </section>

      <section className="flex flex-col gap-5">
        <Heading>🛡 THE FIXES</Heading>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(STRATEGY_INFO).map((s) => {
            const breaks = COFFMAN.find((c) => c.id === s.breaks);
            return (
              <div key={s.id} className="px-frame flex flex-col gap-4 p-4" style={{ boxShadow: `0 0 0 4px ${s.color}55, 0 0 0 8px #050612` }}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{s.icon}</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-pixel text-[10px] leading-relaxed" style={{ color: s.color }}>
                      {s.name.toUpperCase()}
                    </span>
                    <span className="text-[19px] text-dim">{s.tagline}</span>
                  </div>
                </div>
                <pre className="overflow-x-auto bg-edge p-3 text-[18px] leading-snug text-mint">{s.code}</pre>
                <div className="flex flex-col gap-1 text-[20px]">
                  <span>{s.deadlockFree ? "✅ Deadlock-free" : "❌ Can deadlock"}</span>
                  <span>{s.deadlockFree ? "⚠️ Starvation: rare, possible" : "💀 Starvation: yes"}</span>
                  <span className="text-dim">
                    {breaks ? `Breaks ${breaks.icon} ${breaks.name}` : "Breaks nothing"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-[20px] text-dim">
          🔨 Recovery (Sandbox): preempt a philosopher, which breaks 🚫 No Preemption after the fact.
        </p>
      </section>
    </div>
  );
}
