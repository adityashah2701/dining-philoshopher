"use client";

import { useEffect, useState } from "react";
import { PixelSprite } from "@/components/table/PixelSprite";

const CHEF = [
  "..WWWWWW..",
  ".WWWWWWWW.",
  ".WWWWWWWW.",
  "..KKKKKK..",
  ".SSSSSSSS.",
  ".SEESSEES.",
  ".SSSSSSSS.",
  ".SSMMMMSS.",
  "..SSSSSS..",
  ".WWWRRWWW.",
  "WWWWWWWWWW",
];
const CHEF_COLORS = { W: "#f6ecd2", K: "#8d92c4", S: "#f2c28b", E: "#14142a", M: "#5a2a1a", R: "#ff4d6d" };

/** The chef narrator, with a typewriter line. */
export function SpeechBubble({ text }: { text: string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    const id = setInterval(() => setShown((s) => (s >= text.length ? s : s + 1)), 22);
    return () => clearInterval(id);
  }, [text]);

  return (
    <div className="flex items-end gap-3">
      <svg viewBox="0 0 40 44" className="h-14 w-14 shrink-0" aria-hidden>
        <PixelSprite rows={CHEF} colors={CHEF_COLORS} px={4} />
      </svg>
      <div className="px-frame relative min-h-[56px] flex-1 px-4 py-3 text-[22px] leading-tight" style={{ background: "#f6ecd2", color: "#0e1024" }}>
        <span aria-live="polite">{text.slice(0, shown)}</span>
        <span className="blink">▌</span>
      </div>
    </div>
  );
}
