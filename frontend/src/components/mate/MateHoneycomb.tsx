import { motion } from "framer-motion";
import type { MateModule } from "@/data/mateTypes";
import { MATE_THEME } from "@/lib/mateTheme";

const POSITIONS = [
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: 2 },
  { row: 2, col: 0 },
  { row: 2, col: 2 },
];

function cellOpacity(score: number) {
  if (score >= 81) return 0.95;
  if (score >= 66) return 0.72;
  if (score >= 51) return 0.48;
  if (score >= 31) return 0.26;
  return 0.12;
}

export function MateHoneycomb({
  modules,
  activeCode,
  onSelect,
}: {
  modules: MateModule[];
  activeCode: string | null;
  onSelect: (code: string) => void;
}) {
  const items = modules.slice(0, 5);

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 max-w-[260px] sm:max-w-[280px] mx-auto py-1">
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const idx = POSITIONS.findIndex((p) => p.row === row && p.col === col);
          if (idx < 0 || !items[idx]) {
            return <div key={`${row}-${col}`} className="aspect-[1.12/1]" />;
          }
          const mod = items[idx];
          const score = mod.score ?? 50;
          const active = activeCode === mod.code;
          return (
            <motion.button
              key={mod.code}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: col * 0.05 + row * 0.06 }}
              onClick={() => onSelect(mod.code)}
              className="aspect-[1.12/1] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-1.5 sm:p-2 text-center transition"
              style={{
                background: `oklch(0.50 0.20 285 / ${cellOpacity(score)})`,
                border: active ? `2px solid ${MATE_THEME.gold}` : `1px solid ${MATE_THEME.violetBorder}`,
                boxShadow: active ? `0 0 16px ${MATE_THEME.glow}` : undefined,
              }}
            >
              <span className="text-[9px] sm:text-[10px] font-mono text-white/65">{mod.code}</span>
              <span className="text-[10px] sm:text-[11px] text-white/90 mt-0.5 leading-tight line-clamp-2">
                {mod.label.replace(/模块|资产|净值/g, "").trim()}
              </span>
            </motion.button>
          );
        }),
      )}
    </div>
  );
}
