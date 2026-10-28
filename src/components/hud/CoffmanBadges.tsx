"use client";

import { motion } from "framer-motion";
import { COFFMAN, type CoffmanId } from "@/content/concepts";

/** The four Coffman conditions. `broken` is crossed out, `glow` is highlighted. */
export function CoffmanBadges({ glow, broken }: { glow?: CoffmanId | null; broken?: CoffmanId | null }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {COFFMAN.map((c, i) => {
        const isGlow = glow === c.id;
        const isBroken = broken === c.id;
        return (
          <motion.div
            key={c.id}
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15 * i, type: "spring", stiffness: 400, damping: 14 }}
            className="px-frame relative flex flex-col items-center gap-2 px-2 py-3 text-center"
            style={{
              background: isGlow ? "#3a1426" : isBroken ? "#123a2c" : undefined,
              boxShadow: isGlow ? "0 0 0 4px #ff4d6d, 0 0 24px #ff4d6d88" : isBroken ? "0 0 0 4px #5ef2a8" : undefined,
            }}
          >
            <div className="text-3xl">{c.icon}</div>
            <div className="font-pixel text-[9px] leading-relaxed text-sky">{c.name}</div>
            <div className="text-[18px] leading-none text-dim">{c.plain}</div>
            {isBroken && (
              <div className="absolute -right-2 -top-3 rotate-12 bg-mint px-1 font-pixel text-[8px] text-edge">BROKEN</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
