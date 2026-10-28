"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useMemo } from "react";
import { waitForEdges, type SimState } from "@/engine";
import { Philosopher } from "./Philosopher";
import { Chopstick } from "./Chopstick";
import { Bowl } from "./Bowl";
import { WaitForArrows } from "./WaitForArrows";
import { PixelSprite } from "./PixelSprite";
import { C, R_TABLE, VIEW, pixelCircle } from "./geometry";

interface Props {
  sim: SimState;
  onSeatClick?: (id: number) => void;
  showGraph?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const POT = ["..SSSSSS..", ".KKKKKKKK.", "KkKKKKKKkK", "KKNNNNNNKK", "KKKKKKKKKK", ".KKKKKKKK.", "..KKKKKK.."];
const POT_COLORS = { K: "#2b2f55", k: "#4a5190", N: "#ffb347", S: "#f6ecd2aa" };

const OUTER = pixelCircle(R_TABLE + 8);
const TOP = pixelCircle(R_TABLE);
const INNER = pixelCircle(R_TABLE - 24);

export function DiningTable({ sim, onSeatClick, showGraph = false, children, className = "" }: Props) {
  const { n, starveAt, strategy } = sim.config;
  const manual = strategy === "manual";
  const locked = !!sim.deadlock;
  const shake = useAnimationControls();

  useEffect(() => {
    if (sim.events.some((e) => e.type === "deadlock")) {
      shake.start({ x: [0, -10, 10, -8, 8, -4, 0], transition: { duration: 0.45 } });
    }
  }, [sim.events, shake]);

  const edges = useMemo(() => (showGraph || locked ? waitForEdges(sim) : []), [sim, showGraph, locked]);
  const cycle = new Set(sim.deadlock ?? []);

  return (
    <motion.div animate={shake} className={`relative mx-auto aspect-square w-full max-w-[560px] ${className}`}>
      <svg viewBox={`-40 -50 ${VIEW + 80} ${VIEW + 90}`} className="h-full w-full overflow-visible" role="img" aria-label="Dining table">
        {/* table */}
        <g className="pixelated">
          {OUTER.map((r) => (
            <rect key={`o${r.y}`} x={r.x} y={r.y} width={r.w} height={8} fill="#050612" />
          ))}
          {TOP.map((r) => (
            <rect
              key={`t${r.y}`}
              x={r.x}
              y={r.y}
              width={r.w}
              height={8}
              fill={locked ? "#5c1a2b" : "#7a4520"}
              style={{ transition: "fill 300ms steps(3)" }}
            />
          ))}
          {INNER.map((r) => (
            <rect
              key={`i${r.y}`}
              x={r.x}
              y={r.y}
              width={r.w}
              height={8}
              fill={locked ? "#7a2238" : "#95562a"}
              style={{ transition: "fill 300ms steps(3)" }}
            />
          ))}
        </g>

        {/* centre: noodle pot, or a padlock when deadlocked */}
        {locked ? (
          <text x={C} y={C + 18} textAnchor="middle" fontSize={52} className="blink">
            🔒
          </text>
        ) : (
          <PixelSprite rows={POT} colors={POT_COLORS} px={6} x={C - 30} y={C - 21} />
        )}

        {sim.philosophers.map((ph) => (
          <Bowl key={ph.id} id={ph.id} n={n} eating={ph.state === "eating"} empty={manual && ph.meals > 0} />
        ))}

        {edges.length > 0 && <WaitForArrows edges={edges} cycle={sim.deadlock} n={n} />}

        {sim.chopsticks.map((owner, i) => (
          <Chopstick key={i} id={i} n={n} owner={owner} dirty={sim.config.strategy === "chandy" && sim.dirty[i]} />
        ))}

        {sim.philosophers.map((ph) => (
          <Philosopher
            key={ph.id}
            ph={ph}
            n={n}
            starveAt={starveAt}
            manual={manual}
            inCycle={cycle.has(ph.id)}
            onClick={onSeatClick}
          />
        ))}
      </svg>
      {children}
    </motion.div>
  );
}
