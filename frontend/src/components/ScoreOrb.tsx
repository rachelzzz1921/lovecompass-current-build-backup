import { motion } from "framer-motion";
import { CountUp } from "@/components/CountUp";

export function ScoreOrb({ value, label = "OVERALL INDEX", size = 220 }: { value: number; label?: string; size?: number }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - 28) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* outer halo */}
      <div className="absolute inset-0 rounded-full animate-pulse-ring"
        style={{ background: "radial-gradient(circle, oklch(0.68 0.18 285 / 0.35), transparent 60%)" }} />
      {/* rotating shimmer arc */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, oklch(0.82 0.14 200 / 0.55) 30deg, transparent 90deg, transparent 360deg)",
          mask: "radial-gradient(circle, transparent 60%, black 62%, black 72%, transparent 74%)",
          WebkitMask:
            "radial-gradient(circle, transparent 60%, black 62%, black 72%, transparent 74%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      />
      <svg width={size} height={size} className="-rotate-90 relative">
        <defs>
          <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.82 0.14 200)" />
            <stop offset="50%" stopColor="oklch(0.68 0.18 285)" />
            <stop offset="100%" stopColor="oklch(0.72 0.18 360)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="oklch(0.30 0.020 270 / 0.6)" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#orbGrad)" strokeWidth={6} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp to={v} duration={1.6} className="font-display text-6xl tracking-tight text-gradient-violet tabular-nums" />
        <div className="text-[10px] tracking-[0.35em] text-muted-foreground mt-1 font-mono">{label}</div>
      </div>
    </div>
  );
}
