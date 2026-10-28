"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMuted } from "@/hooks/useSound";

const LINKS = [
  { href: "/", label: "Levels", icon: "🕹" },
  { href: "/sandbox", label: "Sandbox", icon: "🧪" },
  { href: "/concepts", label: "Concepts", icon: "📖" },
];

export function NavBar() {
  const path = usePathname();
  const [muted, setMuted] = useMuted();

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5">
      <Link href="/" className="font-pixel text-[12px] text-noodle glow">
        🍜 PIXEL DINER
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2">
        {LINKS.map((l) => {
          const active = l.href === "/" ? path === "/" || path.startsWith("/play") : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-2 py-1 font-pixel text-[9px] sm:text-[10px] ${
                active ? "bg-ink text-edge" : "text-dim hover:text-ink"
              }`}
            >
              <span className="mr-1">{l.icon}</span>
              <span className="hidden sm:inline">{l.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMuted(!muted)}
          className="ml-1 px-2 py-1 text-xl text-dim hover:text-ink"
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          title={muted ? "Sound off" : "Sound on"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </nav>
    </header>
  );
}
