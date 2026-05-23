import { motion } from "framer-motion";

type Props = { value: number; label?: string; size?: number };

export function ScoreRing({ value, label = "关系展望", size = 200 }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - 24) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.88 0.06 350)" />
            <stop offset="55%" stopColor="oklch(0.78 0.14 350)" />
            <stop offset="100%" stopColor="oklch(0.85 0.15 85)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.30 0.015 320 / 0.4)" strokeWidth={10} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-5xl text-gradient-sakura">{v}</div>
        <div className="text-xs tracking-[0.3em] text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}
