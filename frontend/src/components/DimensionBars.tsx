import { motion } from "framer-motion";

type Dim = { key: string; label: string; value: number; color: string };

export function DimensionBars({ data }: { data: Dim[] }) {
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.key} className="flex items-center gap-3">
          <div className="w-20 text-xs text-muted-foreground text-right tabular-nums">{d.label}</div>
          <div className="flex-1 h-2 rounded-full bg-secondary/60 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${d.value}%` }}
              transition={{ duration: 1.1, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${d.color}, ${d.color} 60%, color-mix(in oklab, ${d.color} 60%, white))`,
                boxShadow: `0 0 12px -2px ${d.color}`,
              }}
            />
          </div>
          <div className="font-mono text-xs text-foreground/85 w-9 text-right tabular-nums">{d.value}</div>
        </div>
      ))}
    </div>
  );
}
