"use client";

import { useCallback, useEffect, useState } from "react";

type Stars = Record<number, number>;
const KEY = "pd-progress";

function load(): Stars {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Best star rating per level, kept in this browser only. */
export function useProgress() {
  const [stars, setStars] = useState<Stars>({});

  useEffect(() => setStars(load()), []);

  const award = useCallback((level: number, s: number) => {
    const next = load();
    if ((next[level] ?? 0) >= s) return;
    next[level] = s;
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    setStars(next);
  }, []);

  return { stars, award };
}
