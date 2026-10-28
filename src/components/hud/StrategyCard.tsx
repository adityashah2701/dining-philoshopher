import { COFFMAN, type StrategyInfo } from "@/content/concepts";

interface Props {
  info: StrategyInfo;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  hideVerdict?: boolean;
}

/** A "power-up" card for a synchronization strategy. */
export function StrategyCard({ info, selected, onClick, compact, hideVerdict }: Props) {
  const breaks = COFFMAN.find((c) => c.id === info.breaks);
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`px-frame flex w-full flex-col items-center gap-2 text-center transition-transform duration-100 hover:-translate-y-1 ${
        compact ? "px-2 py-3" : "px-3 py-5"
      }`}
      style={{
        boxShadow: selected ? `0 0 0 4px ${info.color}, 0 0 0 8px #050612, 0 0 24px ${info.color}88` : undefined,
        transform: selected ? "translateY(-4px)" : undefined,
      }}
    >
      <span className={compact ? "text-3xl" : "text-5xl"}>{info.icon}</span>
      <span className="font-pixel text-[9px] leading-relaxed" style={{ color: info.color }}>
        {info.name}
      </span>
      <span className="text-[19px] leading-none text-dim">{info.tagline}</span>
      {!hideVerdict && !compact && (
        <span className="mt-1 font-pixel text-[7px] leading-relaxed text-ink">
          {breaks ? `BREAKS ${breaks.icon} ${breaks.name.toUpperCase()}` : "BREAKS NOTHING"}
        </span>
      )}
    </button>
  );
}
