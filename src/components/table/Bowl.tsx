import { PixelSprite } from "./PixelSprite";
import { R_BOWL, polar, seatAngle } from "./geometry";

const BOWL = ["..NNNN..", ".NnNNnN.", "WWWWWWWW", "DDDDDDDD", ".WWWWWW.", "..WWWW.."];
const EMPTY = ["........", "........", "WWWWWWWW", "DDDDDDDD", ".WWWWWW.", "..WWWW.."];
const COLORS = { N: "#ffb347", n: "#ffd98a", W: "#f6ecd2", D: "#4cc9f0" };

export function Bowl({ id, n, eating, empty }: { id: number; n: number; eating: boolean; empty?: boolean }) {
  const { x, y } = polar(seatAngle(id, n), R_BOWL);
  return (
    <g transform={`translate(${x - 16} ${y - 12})`}>
      <PixelSprite rows={empty ? EMPTY : BOWL} colors={COLORS} />
      {eating && (
        <g className="float" fill="#f6ecd2aa">
          <rect x={6} y={-12} width={4} height={8} />
          <rect x={14} y={-18} width={4} height={10} />
          <rect x={22} y={-12} width={4} height={8} />
        </g>
      )}
    </g>
  );
}
