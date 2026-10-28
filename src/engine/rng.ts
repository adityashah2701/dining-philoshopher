/** mulberry32 — tiny deterministic PRNG. Returns [value in [0,1), nextState]. */
export function nextRandom(state: number): [number, number] {
  const s = (state + 0x6d2b79f5) | 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
}

/** Random integer in [min, max] inclusive. */
export function randInt(state: number, [min, max]: [number, number]): [number, number] {
  const [r, next] = nextRandom(state);
  return [min + Math.floor(r * (max - min + 1)), next];
}
