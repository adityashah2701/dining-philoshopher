/** Tiny 8-bit sound effects with WebAudio square waves. No audio files. */

export type Sfx = "grab" | "eat" | "deadlock" | "win" | "click" | "preempt" | "lose";

const TUNES: Record<Sfx, [freq: number, dur: number][]> = {
  click: [[660, 0.04]],
  grab: [[520, 0.05]],
  eat: [
    [784, 0.06],
    [1046, 0.08],
  ],
  preempt: [
    [300, 0.06],
    [600, 0.08],
  ],
  deadlock: [
    [392, 0.15],
    [311, 0.15],
    [233, 0.35],
  ],
  lose: [
    [330, 0.15],
    [220, 0.3],
  ],
  win: [
    [523, 0.1],
    [659, 0.1],
    [784, 0.1],
    [1046, 0.3],
  ],
};

let ctx: AudioContext | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

if (typeof window !== "undefined") {
  try {
    muted = localStorage.getItem("pd-muted") === "1";
  } catch {}
}

export function isMuted() {
  return muted;
}

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem("pd-muted", m ? "1" : "0");
  } catch {}
  listeners.forEach((l) => l(m));
}

export function onMuteChange(l: (m: boolean) => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function play(kind: Sfx) {
  if (muted || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime;
    for (const [freq, dur] of TUNES[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {}
}
