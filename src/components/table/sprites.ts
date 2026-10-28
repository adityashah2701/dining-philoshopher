/** Pixel-art data. Each char is one pixel; "." is transparent. */

export type Mood = "thinking" | "hungry" | "eating" | "starving" | "full";

const HEAD = [
  "....HHHH....",
  "..HHHHHHHH..",
  ".HHHHHHHHHH.",
  ".HSSSSSSSSH.",
];
const BODY = [
  "..BBBBBBBB..",
  "...BBBBBB...",
  "..RRRBBRRR..",
  ".RRRRRRRRRR.",
  "RRRRRRRRRRRR",
  "RRRRRRRRRRRR",
];

const FACES: Record<Mood, string[]> = {
  thinking: [".SSSSSSSSSS.", ".SSEESSEESS.", ".SSSSSSSSSS.", ".SSSBBBBSSS.", "..BBBBBBBB.."],
  full: [".SSEESSEESS.", ".SSSSSSSSSS.", ".SSSSSSSSSS.", ".SSSBBBBSSS.", "..BBBBBBBB.."],
  eating: [".SSEESSEESS.", ".SSSSSSSSSS.", ".SSSSSSSSSS.", ".SSSMMMMSSS.", "..BBBNNBBB.."],
  hungry: [".SEESSSSEES.", ".SSEESSEESS.", ".SSSSSSSSSS.", ".SSSMMMMSSS.", "..BBBBBBBB.."],
  starving: [".SSSSSSSSSS.", ".SESESSESES.", ".SSESSSSESS.", ".SSSMMMMSSS.", "..BBBBBBBB.."],
};

export function philosopherSprite(mood: Mood): string[] {
  return [...HEAD, ...FACES[mood], ...BODY];
}

export interface Look {
  name: string;
  robe: string;
  hair: string;
  beard: string;
}

export const LOOKS: Look[] = [
  { name: "PLATO", robe: "#8b7cff", hair: "#e9e6f5", beard: "#e9e6f5" },
  { name: "KANT", robe: "#4cc9f0", hair: "#d9d9d9", beard: "#f2c28b" },
  { name: "HUME", robe: "#ff4d6d", hair: "#6b4226", beard: "#f2c28b" },
  { name: "LAOZI", robe: "#5ef2a8", hair: "#cfcfcf", beard: "#ffffff" },
  { name: "SARTRE", robe: "#ffd23f", hair: "#2b2b3a", beard: "#f2c28b" },
  { name: "HYPATIA", robe: "#ff8fd1", hair: "#3a2416", beard: "#f2c28b" },
  { name: "KONFUZI", robe: "#ffb347", hair: "#1e1e1e", beard: "#1e1e1e" },
  { name: "NIETZ", robe: "#7bdff2", hair: "#5a3a22", beard: "#5a3a22" },
];

export function palette(look: Look, mood: Mood): Record<string, string> {
  const starving = mood === "starving";
  return {
    H: starving ? "#7d8199" : look.hair,
    S: starving ? "#a4a9c4" : "#f2c28b",
    E: "#14142a",
    B: starving ? "#7d8199" : look.beard,
    R: starving ? "#4a4f70" : look.robe,
    M: "#c2304a",
    N: "#ffb347",
  };
}
