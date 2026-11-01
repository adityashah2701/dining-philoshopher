"use client";

import Link from "next/link";
import { LEVELS } from "@/content/levels";
import { SpeechBubble } from "@/components/hud/SpeechBubble";

interface Props {
  id: number;
  line: string;
  // goal progress
  goal: React.ReactNode;
  children: React.ReactNode;
}

// level shell
export function LevelShell({ id, line, goal, children }: Props) {
  const lvl = LEVELS[id - 1];
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="px-frame flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center rounded bg-deep px-2 py-1 font-pixel text-[8px] text-dim transition-colors hover:text-noodle hover:bg-edge"
            title="Back to level map"
          >
            ← MAP
          </Link>
          <span className="text-3xl">{lvl.icon}</span>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-dim">
                LEVEL {id} OF {LEVELS.length}
              </span>
              <span className="rounded bg-edge/60 px-1.5 py-0.5 font-pixel text-[7px] text-sky">
                {lvl.verb.toUpperCase()}
              </span>
            </div>
            <span className="font-pixel text-[11px] text-noodle sm:text-[13px]">{lvl.title.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">{goal}</div>
      </div>
      <SpeechBubble text={line} />
      {children}
    </div>
  );
}

export function StarRow({ stars, size = "text-3xl" }: { stars: number; size?: string }) {
  return (
    <div className={`flex gap-1 ${size}`} aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} style={{ filter: i <= stars ? "none" : "grayscale(1) brightness(0.4)" }}>
          ⭐
        </span>
      ))}
    </div>
  );
}

export function NextButton({ id }: { id: number }) {
  const next = id < LEVELS.length ? `/play/${id + 1}` : "/sandbox";
  return (
    <Link href={next} className="px-btn inline-block" style={{ "--btn": "#5ef2a8" } as React.CSSProperties}>
      {id < LEVELS.length ? `Next: Level ${id + 1} ▶` : "Open Sandbox 🧪"}
    </Link>
  );
}
