import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { CountUp } from "@/components/CountUp";

export type ScoreBreakdownItem = { key: string; label: string; value: number };

export function ScoreOrb({
  value,
  label = "OVERALL INDEX",
  size = 220,
  breakdown,
}: {
  value: number;
  label?: string;
  size?: number;
  breakdown?: ScoreBreakdownItem[];
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - 28) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const onPointerDown = useCallback(() => {
    if (!breakdown?.length) return;
    clearTimer();
    timerRef.current = window.setTimeout(() => setShowBreakdown(true), 600);
  }, [breakdown]);

  const onPointerUp = useCallback(() => {
    clearTimer();
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full animate-pulse-ring"
        style={{ background: "radial-gradient(circle, oklch(0.68 0.18 285 / 0.35), transparent 60%)" }}
      />
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="oklch(0.30 0.020 270 / 0.6)" strokeWidth={6} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#orbGrad)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center select-none touch-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <CountUp to={v} duration={1.6} className="font-display text-6xl tracking-tight text-gradient-violet tabular-nums" />
        <div className="text-[10px] tracking-[0.35em] text-muted-foreground mt-1 font-mono">{label}</div>
      </div>

      {showBreakdown && breakdown?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute left-1/2 top-full z-20 mt-3 w-56 -translate-x-1/2 rounded-xl border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur-md"
        >
          <div className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground mb-2">分数构成</div>
          <div className="space-y-1.5">
            {breakdown.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="text-foreground/75 truncate">{item.label}</span>
                <span className="font-mono tabular-nums text-foreground/90">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-2 w-full text-[10px] text-muted-foreground hover:text-foreground"
            onClick={() => setShowBreakdown(false)}
          >
            收起
          </button>
        </motion.div>
      ) : null}
    </div>
  );
}
