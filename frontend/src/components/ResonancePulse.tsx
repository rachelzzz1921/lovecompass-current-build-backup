import { motion } from "framer-motion";

/**
 * 共鸣脉搏图 —— 类心电图，体现关系当前的"心跳节奏"
 * score 越高 -> 波形越规律饱满；越低 -> 越平缓零散
 */
export function ResonancePulse({ score = 75 }: { score?: number }) {
  const amp = Math.max(8, (score / 100) * 28); // amplitude
  const w = 360;
  const h = 80;
  const midY = h / 2;

  // build classic ECG-ish path
  const segments = 4;
  const segW = w / segments;
  let d = `M 0 ${midY}`;
  for (let i = 0; i < segments; i++) {
    const x0 = i * segW;
    d += ` L ${x0 + segW * 0.2} ${midY}`;
    d += ` L ${x0 + segW * 0.3} ${midY - amp * 0.35}`;
    d += ` L ${x0 + segW * 0.38} ${midY + amp * 0.9}`;
    d += ` L ${x0 + segW * 0.46} ${midY - amp * 1.2}`;
    d += ` L ${x0 + segW * 0.55} ${midY + amp * 0.2}`;
    d += ` L ${x0 + segW} ${midY}`;
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[80px]">
        <defs>
          <linearGradient id="pulseStroke" x1="0%" x2="100%">
            <stop offset="0%" stopColor="oklch(0.82 0.14 200 / 0.2)" />
            <stop offset="50%" stopColor="oklch(0.78 0.20 320)" />
            <stop offset="100%" stopColor="oklch(0.82 0.14 200 / 0.2)" />
          </linearGradient>
        </defs>

        {/* grid */}
        {[0.25, 0.5, 0.75].map((y) => (
          <line key={y} x1={0} x2={w} y1={h * y} y2={h * y} stroke="oklch(0.55 0.04 270 / 0.1)" />
        ))}

        {/* baseline */}
        <line x1={0} x2={w} y1={midY} y2={midY} stroke="oklch(0.55 0.04 270 / 0.2)" strokeDasharray="2 4" />

        {/* pulse path */}
        <motion.path
          d={d}
          fill="none"
          stroke="url(#pulseStroke)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* moving dot */}
        <motion.circle
          r={3.5}
          fill="oklch(0.95 0.10 320)"
          initial={{ cx: 0, cy: midY }}
          animate={{ cx: w }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          style={{ filter: "drop-shadow(0 0 4px oklch(0.78 0.20 320))" }}
        >
          <animate attributeName="cy" values={`${midY};${midY - amp};${midY + amp};${midY}`} dur="0.6s" repeatCount="indefinite" />
        </motion.circle>
      </svg>
    </div>
  );
}
