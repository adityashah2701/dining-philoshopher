"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMuted } from "@/hooks/useSound";
import { useProgress } from "@/hooks/useProgress";

const LINKS = [
  { href: "/", label: "Levels", icon: "🕹" },
  { href: "/sandbox", label: "Sandbox", icon: "🧪" },
  { href: "/concepts", label: "Concepts", icon: "📖" },
];

export function NavBar() {
  const path = usePathname();
  const [muted, setMuted] = useMuted();
  const { totalStars } = useProgress();

  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:py-5">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-pixel text-[12px] text-noodle glow transition-transform hover:scale-105 sm:text-[14px]">
          🍜 PIXEL DINER
        </Link>
        {totalStars > 0 && (
          <span className="hidden items-center gap-1 rounded bg-deep px-2 py-0.5 font-pixel text-[9px] text-amber sm:inline-flex">
            ⭐ {totalStars}/9
          </span>
        )}
      </div>

      <nav className="flex items-center gap-1 sm:gap-2">
        {LINKS.map((l) => {
          const active = l.href === "/" ? path === "/" || path.startsWith("/play") : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded px-2.5 py-1.5 font-pixel text-[9px] transition-colors sm:text-[10px] ${
                active ? "bg-ink text-edge shadow-sm" : "text-dim hover:text-ink hover:bg-edge/40"
              }`}
            >
              <span className="mr-1">{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMuted(!muted)}
          className="ml-1 rounded px-2.5 py-1 text-lg text-dim transition-colors hover:bg-edge/40 hover:text-ink"
          aria-label={muted ? "Unmute sound" : "Mute sound"}
          title={muted ? "Sound off" : "Sound on"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </nav>
    </header>
  );
}
