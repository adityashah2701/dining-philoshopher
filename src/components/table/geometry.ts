export const VIEW = 480;
export const C = VIEW / 2;

export const R_SEAT = 192;
export const R_HELD = 146;
export const R_TABLE = 136;
export const R_BOWL = 94;
export const R_FREE_STICK = 96;

export const seatAngle = (i: number, n: number) => -90 + (i * 360) / n;
/** Chopstick i is P(i)'s left stick, shared with P(i-1): it lies between them. */
export const stickAngle = (i: number, n: number) => seatAngle(i, n) - 180 / n;

export function polar(deg: number, r: number) {
  const a = (deg * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}

/** Rows of rects approximating a filled circle on an 8px grid. */
export function pixelCircle(r: number, step = 8) {
  const rows: { x: number; y: number; w: number }[] = [];
  for (let y = -r; y < r; y += step) {
    const mid = y + step / 2;
    const half = Math.round(Math.sqrt(Math.max(0, r * r - mid * mid)) / step) * step;
    if (half > 0) rows.push({ x: C - half, y: C + y, w: half * 2 });
  }
  return rows;
}
