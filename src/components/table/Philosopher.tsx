import type { Philosopher as P } from "@/engine";
import { PixelSprite } from "./PixelSprite";
import { LOOKS, palette, philosopherSprite, type Mood } from "./sprites";
import { R_SEAT, polar, seatAngle } from "./geometry";

interface Props {
  ph: P;
  n: number;
  starveAt: number;
  manual: boolean;
  inCycle: boolean;
  onClick?: (id: number) => void;
}

const BADGE: Record<Mood, string> = {
  thinking: "💭",
  hungry: "😤",
  eating: "😋",
  starving: "💀",
  full: "😌",
};

function moodOf(ph: P, starveAt: number, manual: boolean): Mood {
  if (ph.state === "eating") return "eating";
  if (ph.state === "hungry") return ph.wait >= starveAt ? "starving" : "hungry";
  return manual && ph.meals > 0 ? "full" : "thinking";
}

const SEGMENTS = 6;

export function Philosopher({ ph, n, starveAt, manual, inCycle, onClick }: Props) {
  const { x, y } = polar(seatAngle(ph.id, n), R_SEAT);
  const mood = moodOf(ph, starveAt, manual);
  const look = LOOKS[ph.id % LOOKS.length];
  const filled = ph.state === "hungry" ? Math.min(SEGMENTS, Math.ceil((ph.wait / starveAt) * SEGMENTS)) : 0;
  const clickable = manual && ph.state === "hungry" && !!onClick;
  const anim = mood === "eating" ? "bob" : mood === "hungry" || mood === "starving" ? "jitter" : "";

  return (
    <g
      transform={`translate(${x} ${y})`}
      onClick={clickable ? () => onClick!(ph.id) : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick!(ph.id);
              }
            }
          : undefined
      }
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${look.name} is ${mood}`}
      className={clickable ? "cursor-pointer outline-none" : undefined}
    >
      <title>{`P${ph.id} · ${look.name} · ${mood} · meals ${ph.meals}`}</title>

      {clickable && (
        <rect x={-34} y={-40} width={68} height={86} fill="none" stroke="#f6ecd2" strokeWidth={3} strokeDasharray="6 6" className="blink" />
      )}
      {inCycle && <rect x={-34} y={-40} width={68} height={86} fill="#ff4d6d22" stroke="#ff4d6d" strokeWidth={4} />}

      {/* hunger bar */}
      <g transform="translate(-24 -54)">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const on = i < filled;
          const color = i < 2 ? "#5ef2a8" : i < 4 ? "#ffd23f" : "#ff4d6d";
          return <rect key={i} x={i * 8} y={0} width={7} height={7} fill={on ? color : "#00000066"} stroke="#050612" strokeWidth={1} />;
        })}
      </g>

      <text x={0} y={-62} textAnchor="middle" fontSize={20}>
        {BADGE[mood]}
      </text>

      <g className={anim}>
        <PixelSprite rows={philosopherSprite(mood)} colors={palette(look, mood)} x={-24} y={-30} />
      </g>

      <text x={0} y={46} textAnchor="middle" fontSize={8} fill="#f6ecd2" style={{ fontFamily: "var(--font-press)" }}>
        {look.name}
      </text>
      {ph.meals > 0 && (
        <g transform="translate(22 -30)">
          <rect x={0} y={0} width={22} height={14} fill="#ffb347" stroke="#050612" strokeWidth={2} />
          <text x={11} y={11} textAnchor="middle" fontSize={8} fill="#050612" style={{ fontFamily: "var(--font-press)" }}>
            {ph.meals > 99 ? "99" : ph.meals}
          </text>
        </g>
      )}
    </g>
  );
}
