import { polar, seatAngle } from "./geometry";

interface Props {
  edges: [number, number][];
  cycle: number[] | null;
  n: number;
}

/** Wait-for graph: arrow p → q means "p is waiting for something q holds". */
export function WaitForArrows({ edges, cycle, n }: Props) {
  const inCycle = new Set(cycle ?? []);
  return (
    <g>
      <defs>
        <marker id="arrow-red" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#ff4d6d" />
        </marker>
        <marker id="arrow-amber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#ffd23f" />
        </marker>
      </defs>
      {edges.map(([p, q]) => {
        const a = seatAngle(p, n);
        const b = seatAngle(q, n);
        const from = polar(a, 158);
        const to = polar(b, 158);
        // Bend the curve toward the table centre.
        let mid = (a + b) / 2;
        if (Math.abs(a - b) > 180) mid += 180;
        const ctrl = polar(mid, 110);
        const hot = inCycle.has(p) && inCycle.has(q);
        return (
          <path
            key={`${p}-${q}`}
            d={`M${from.x} ${from.y} Q${ctrl.x} ${ctrl.y} ${to.x} ${to.y}`}
            fill="none"
            stroke={hot ? "#ff4d6d" : "#ffd23f"}
            strokeWidth={hot ? 5 : 3}
            strokeDasharray="10 6"
            markerEnd={`url(#${hot ? "arrow-red" : "arrow-amber"})`}
            className="marching"
          />
        );
      })}
    </g>
  );
}
