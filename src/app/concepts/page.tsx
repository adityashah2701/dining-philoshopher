import type { Metadata } from "next";
import { COFFMAN, MAPPING, STRATEGY_INFO } from "@/content/concepts";

export const metadata: Metadata = { title: "Concepts · Pixel Diner" };

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-pixel text-[11px] text-noodle sm:text-[13px]">{children}</h2>;
}

// concepts sheet
export default function ConceptsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-pixel text-[14px] text-noodle glow sm:text-[18px]">📖 CONCEPTS & CHEATSHEET</h1>
        <p className="font-pixel text-[9px] text-dim">
          How the 8-bit Dining Philosophers problem maps directly to real-world Operating Systems & Concurrency.
        </p>
      </div>

      <section className="flex flex-col gap-5">
        <Heading>🎮 GAME → 💻 OS MAPPING</Heading>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {MAPPING.map((m) => (
            <div key={m.thing} className="px-frame flex items-center gap-4 px-4 py-3">
              <span className="text-4xl">{m.icon}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[18px] text-dim">{m.thing} =</span>
                <span className="font-pixel text-[10px] leading-relaxed text-sky sm:text-[11px]">{m.os}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <Heading>🔒 THE 4 COFFMAN CONDITIONS FOR DEADLOCK</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {COFFMAN.map((c, i) => (
            <div key={c.id} className="px-frame flex flex-col items-center gap-2 px-3 py-4 text-center">
              <span className="font-pixel text-[8px] text-dim">CONDITION #{i + 1}</span>
              <span className="text-4xl">{c.icon}</span>
              <span className="font-pixel text-[9px] leading-relaxed text-sky sm:text-[10px]">{c.name}</span>
              <span className="text-[18px] leading-tight text-dim">{c.plain}</span>
            </div>
          ))}
        </div>
        <div className="rounded border border-amber/40 bg-amber/10 p-3 text-center text-[19px] text-amber">
          ⚡ <strong>Deadlock Theorem:</strong> Deadlock requires <em>all four</em> conditions simultaneously. Break any ONE condition, and deadlock is mathematically impossible!
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <Heading>🛡 THE 5 CONCURRENCY ALGORITHMS</Heading>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(STRATEGY_INFO).map((s) => {
            const breaks = COFFMAN.find((c) => c.id === s.breaks);
            return (
              <div
                key={s.id}
                className="px-frame flex flex-col justify-between gap-4 p-4"
                style={{ boxShadow: `0 0 0 3px ${s.color}55, 0 0 0 6px #050612` }}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{s.icon}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-pixel text-[10px] leading-relaxed" style={{ color: s.color }}>
                        {s.name.toUpperCase()}
                      </span>
                      <span className="text-[17px] text-dim">{s.tagline}</span>
                    </div>
                  </div>
                  <pre className="overflow-x-auto rounded bg-edge p-3 font-mono text-[14px] leading-snug text-mint">
                    {s.code}
                  </pre>
                </div>

                <div className="flex flex-col gap-1 border-t border-edge/60 pt-3 text-[17px]">
                  <span className="font-pixel text-[9px]">{s.deadlockFree ? "✅ Deadlock-Free" : "❌ Vulnerable to Deadlock"}</span>
                  <span className="text-dim">{s.starvation ?? (s.deadlockFree ? "⚠️ Starvation: rare, possible" : "💀 Starvation: yes")}</span>
                  <span className="text-sky font-pixel text-[8px]">
                    {breaks ? `Breaks ${breaks.icon} ${breaks.name}` : "Breaks: None (Circular wait occurs)"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-frame flex flex-col gap-3 p-5">
        <Heading>🌐 REAL-WORLD SYSTEMS PARALLELS</Heading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-[17px] text-dim">
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[9px] text-noodle">🗄 Database Transactions</span>
            <span>Prevent deadlocks by imposing global lexicographical key order on SQL row locks (Resource Hierarchy).</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[9px] text-noodle">🧵 Thread Pools & Semaphores</span>
            <span>Limit concurrent resource acquisition with counting semaphores like Java&apos;s Semaphore ($N-1$ Waiter).</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[9px] text-noodle">📡 Network Backoff & CSMA/CD</span>
            <span>Resolve collision symmetry in Ethernet networks with randomized backoff delays (Lehmann-Rabin coin flip).</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-pixel text-[9px] text-noodle">🖧 Distributed Token Rings</span>
            <span>Decentralized systems exchange priority tokens without central coordinators (Chandy-Misra clean/dirty sticks).</span>
          </div>
        </div>
      </section>
    </div>
  );
}
