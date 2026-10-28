import { LOOKS } from "./sprites";
import { R_FREE_STICK, R_HELD, polar, seatAngle, stickAngle } from "./geometry";

interface Props {
  id: number;
  n: number;
  owner: number | null;
}

/** A chopstick slides from the table into its owner's hand (CSS stepped transition = pixel motion). */
export function Chopstick({ id, n, owner }: Props) {
  let angle: number;
  let r: number;
  if (owner === null) {
    angle = stickAngle(id, n);
    r = R_FREE_STICK;
  } else {
    // Stick i is on P(i)'s counter-clockwise side and P(i-1)'s clockwise side.
    const side = owner === id ? -1 : 1;
    angle = seatAngle(owner, n) + side * Math.min(16, 150 / n);
    r = R_HELD;
  }
  const { x, y } = polar(angle, r);
  const glow = owner !== null ? LOOKS[owner % LOOKS.length].robe : null;
  const tilt = owner !== null ? (owner === id ? -12 : 12) : 0;

  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${angle - 90 + tilt}deg)`,
        transition: "transform 320ms steps(5)",
      }}
    >
      <title>{`Chopstick C${id}${owner !== null ? ` · held by P${owner}` : " · free"}`}</title>
      {glow && <rect x={-7} y={-28} width={14} height={56} fill={glow} opacity={0.55} />}
      <rect x={-4} y={-24} width={8} height={48} fill="#050612" />
      <rect x={-2} y={-22} width={4} height={44} fill="#c07a3e" />
      <rect x={-2} y={-22} width={2} height={44} fill="#e3a46a" />
      <rect x={-2} y={10} width={4} height={12} fill="#7a4520" />
    </g>
  );
}
