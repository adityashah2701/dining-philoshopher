import { memo } from "react";

interface Props {
  rows: string[];
  colors: Record<string, string>;
  px?: number;
  x?: number;
  y?: number;
}

/** Renders a char-grid sprite as SVG rects, merging horizontal runs. */
export const PixelSprite = memo(function PixelSprite({ rows, colors, px = 4, x = 0, y = 0 }: Props) {
  const rects: React.ReactElement[] = [];
  rows.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      let end = c + 1;
      while (end < row.length && row[end] === ch) end++;
      if (ch !== "." && colors[ch]) {
        rects.push(
          <rect key={`${r}-${c}`} x={x + c * px} y={y + r * px} width={(end - c) * px} height={px} fill={colors[ch]} />,
        );
      }
      c = end;
    }
  });
  return <g className="pixelated">{rects}</g>;
});
