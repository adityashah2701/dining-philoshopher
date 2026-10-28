"use client";

import { AnimatePresence, motion } from "framer-motion";

interface Props {
  show: boolean;
  tone: "red" | "mint" | "amber";
  title: string;
  icon?: string;
  children?: React.ReactNode;
}

const TONES = { red: "#ff4d6d", mint: "#5ef2a8", amber: "#ffd23f" };

/** Arcade-style banner that drops onto the table. */
export function Banner({ show, tone, title, icon, children }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: -120, scale: 0.6 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="px-frame pointer-events-auto flex max-w-[86%] flex-col items-center gap-3 px-6 py-5 text-center"
            style={{ background: "#0e1024ee", boxShadow: `0 0 0 4px ${TONES[tone]}, 0 0 0 8px #050612, 0 0 40px ${TONES[tone]}66` }}
          >
            {icon && <div className="text-4xl">{icon}</div>}
            <div className="glow font-pixel text-[15px] sm:text-[20px]" style={{ color: TONES[tone] }}>
              {title}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
