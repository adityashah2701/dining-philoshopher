"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DiningTable } from "@/components/table/DiningTable";
import { StarRow } from "@/components/levels/LevelShell";
import { useSimulation } from "@/hooks/useSimulation";
import { useProgress } from "@/hooks/useProgress";
import { LEVELS } from "@/content/levels";

const ATTRACT = { n: 5, strategy: "waiter", seed: 3 } as const;

export default function Home() {
  const { sim } = useSimulation(ATTRACT, { autoPlay: true, baseMs: 500 });
  const { stars } = useProgress();

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Title */}
      <section className="flex flex-col items-center gap-5 pt-4 text-center">
        <motion.h1
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="glow font-pixel text-[30px] leading-tight text-noodle sm:text-[52px]"
        >
          PIXEL
          <br />
          DINER
        </motion.h1>
        <p className="font-pixel text-[9px] leading-relaxed text-sky sm:text-[11px]">THE DINING PHILOSOPHERS PROBLEM</p>
        <Equation />
      </section>

      <div className="relative w-full max-w-[420px]">
        <DiningTable sim={sim} />
      </div>

      <Link
        href="/play/1"
        className="blink glow font-pixel text-[14px] text-ink sm:text-[16px]"
        aria-label="Press start: play level 1"
      >
        ▶ PRESS START
      </Link>

      {/* Level map */}
      <section className="flex w-full flex-col items-center gap-6">
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {LEVELS.map((l, i) => (
            <motion.div key={l.id} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 * i }}>
              <Link href={`/play/${l.id}`} className="px-frame group flex h-full flex-col items-center gap-3 px-4 py-6 text-center hover:-translate-y-1">
                <span className="font-pixel text-[9px] text-dim">LEVEL {l.id}</span>
                <span className="text-5xl transition-transform group-hover:scale-110">{l.icon}</span>
                <span className="font-pixel text-[10px] leading-relaxed text-noodle">{l.title.toUpperCase()}</span>
                <span className="bg-deep px-2 py-1 font-pixel text-[8px] text-sky">{l.verb}</span>
                <StarRow stars={stars[l.id] ?? 0} size="text-xl" />
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="grid w-full max-w-4xl grid-cols-2 gap-6">
          <Link href="/sandbox" className="px-frame flex items-center justify-center gap-3 px-4 py-5 hover:-translate-y-1">
            <span className="text-3xl">🧪</span>
            <span className="font-pixel text-[10px] text-mint">SANDBOX</span>
          </Link>
          <Link href="/concepts" className="px-frame flex items-center justify-center gap-3 px-4 py-5 hover:-translate-y-1">
            <span className="text-3xl">📖</span>
            <span className="font-pixel text-[10px] text-violet">CONCEPTS</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

/** The whole problem as a picture: 5 people, 5 sticks, each needs 2. */
function Equation() {
  const chip = "px-frame flex items-center gap-2 px-3 py-2 text-[22px]";
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <span className={chip}>5 × 🧔</span>
      <span className={chip}>5 × 🥢</span>
      <span className={chip}>
        🍜 = 🥢🥢
      </span>
      <span className="font-pixel text-[14px] text-blood">?!</span>
    </div>
  );
}
