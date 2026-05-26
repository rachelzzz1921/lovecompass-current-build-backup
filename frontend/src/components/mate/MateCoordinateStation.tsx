import { motion } from "framer-motion";
import type { MateMarketCoordinate } from "@/data/mateTypes";
import { mateLayout } from "@/lib/mateLayout";
import { MATE_THEME as T } from "@/lib/mateTheme";

const ZONE_LABELS = [
  { x: 75, y: 25, text: "全能区" },
  { x: 25, y: 25, text: "稳健区" },
  { x: 75, y: 75, text: "窗口期" },
  { x: 25, y: 75, text: "待开发区" },
];

export function MateCoordinateStation({ coord }: { coord: MateMarketCoordinate }) {
  const px = 10 + (coord.axisX / 100) * 80;
  const py = 90 - (coord.axisY / 100) * 80;
  const valuation = Math.max(35, Math.min(92, (coord.axisX + coord.axisY) / 2));

  return (
    <div className="space-y-8">
      <div className="relative aspect-square w-full max-w-[260px] mx-auto">
        <div className="absolute inset-x-[6%] top-[10%] text-center text-[10px] text-white/40">
          高{coord.verticalLabel.replace(/^高/, "")}
        </div>
        <div className="absolute inset-x-[6%] bottom-[6%] text-center text-[10px] text-white/40">
          低{coord.verticalLabel.replace(/^高/, "")}
        </div>
        <div className="absolute left-[2%] top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-white/40 whitespace-nowrap">
          偏低调
        </div>
        <div className="absolute right-[2%] top-1/2 -translate-y-1/2 rotate-90 text-[10px] text-white/40 whitespace-nowrap">
          偏亮眼
        </div>

        <div className="absolute inset-[12%] border border-white/[0.06] rounded-lg" />
        <div className="absolute left-1/2 top-[12%] bottom-[12%] w-px -translate-x-1/2 bg-white/8" />
        <div className="absolute top-1/2 left-[12%] right-[12%] h-px -translate-y-1/2 bg-white/8" />

        {ZONE_LABELS.map((z) => (
          <span
            key={z.text}
            className="absolute text-[9px] font-mono text-white/22 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
          >
            {z.text}
          </span>
        ))}

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${px}%`, top: `${py}%` }}
        >
          <motion.span
            className="absolute rounded-full border border-sakura/50"
            style={{ width: 36, height: 36 }}
            animate={{ scale: [1, 1.65], opacity: [0.4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
          />
          <span className="relative w-3 h-3 rounded-full bg-sakura shadow-[0_0_12px_oklch(0.72_0.18_360/0.5)]" />
        </div>
      </div>

      <dl className="space-y-4">
        {[
          { label: "第一印象", value: coord.summary.firstImpression },
          { label: "长期价值", value: coord.summary.longTerm },
          { label: "留存率", value: coord.summary.retention },
        ].map((row) => (
          <div key={row.label} className="grid grid-cols-[4.5rem_1fr] gap-3 items-start">
            <dt className={mateLayout.caption}>{row.label}</dt>
            <dd className={mateLayout.proseSm}>{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline gap-2">
          <span className={mateLayout.caption}>市场估值</span>
          <span className="text-xs text-white/45">{Math.round(valuation)}%</span>
        </div>
        <div className="h-1 rounded-full bg-white/8 overflow-hidden max-w-xs">
          <div
            className="h-full rounded-full"
            style={{ width: `${valuation}%`, background: `linear-gradient(90deg, ${T.violet}, ${T.gold})` }}
          />
        </div>
        <p className={mateLayout.proseSm}>{coord.insight}</p>
      </div>
    </div>
  );
}
