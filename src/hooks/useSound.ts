"use client";

import { useEffect, useState } from "react";
import { isMuted, onMuteChange, setMuted } from "@/lib/sound";

export function useMuted() {
  const [muted, setState] = useState(false);
  useEffect(() => {
    setState(isMuted());
    const off = onMuteChange(setState);
    return () => {
      off();
    };
  }, []);
  return [muted, setMuted] as const;
}
