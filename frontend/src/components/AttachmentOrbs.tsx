import { motion } from "framer-motion";

/**
 * 依恋碰撞可视化 —— 两颗有引力的星体在轨道中互动
 * 左：你 · 右：TA · 中间能量带 = 碰撞强度
 */
export function AttachmentOrbs({
  youLabel = "焦虑型",
  taLabel = "回避型",
}: {
  youLabel?: string;
  taLabel?: string;
}) {
  return (
    <div className="relative w-full h-[180px] overflow-hidden rounded-xl">
      {/* orbit */}
      <svg viewBox="0 0 400 180" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="youOrb" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.85 0.18 285)" />
            <stop offset="60%" stopColor="oklch(0.55 0.20 285)" />
            <stop offset="100%" stopColor="oklch(0.30 0.10 285 / 0)" />
          </radialGradient>
          <radialGradient id="taOrb" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.85 0.18 360)" />
            <stop offset="60%" stopColor="oklch(0.55 0.20 355)" />
            <stop offset="100%" stopColor="oklch(0.30 0.10 360 / 0)" />
          </radialGradient>
          <linearGradient id="energyBand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.68 0.18 285 / 0.7)" />
            <stop offset="50%" stopColor="oklch(0.95 0.10 320 / 0.9)" />
            <stop offset="100%" stopColor="oklch(0.72 0.18 360 / 0.7)" />
          </linearGradient>
        </defs>

        {/* orbit ring */}
        <ellipse
          cx={200} cy={90} rx={140} ry={42}
          fill="none"
          stroke="oklch(0.55 0.04 270 / 0.18)"
          strokeDasharray="3 5"
        />

        {/* energy band pulsing in middle */}
        <motion.rect
          x={140} y={84} width={120} height={12} rx={6}
          fill="url(#energyBand)"
          initial={{ opacity: 0.4, scaleX: 0.85 }}
          animate={{ opacity: [0.4, 0.85, 0.4], scaleX: [0.85, 1.05, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "200px 90px" }}
        />

        {/* you orb (left, drifts toward center) */}
        <motion.g
          animate={{ x: [0, 14, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx={88} cy={90} r={46} fill="url(#youOrb)" opacity={0.55} />
          <circle cx={88} cy={90} r={22} fill="oklch(0.68 0.18 285)" />
          <text x={88} y={94} textAnchor="middle" fontSize={11} fill="oklch(0.98 0.01 260)" fontWeight={600}>
            你
          </text>
        </motion.g>

        {/* ta orb (right, drifts away) */}
        <motion.g
          animate={{ x: [0, -10, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        >
          <circle cx={312} cy={90} r={46} fill="url(#taOrb)" opacity={0.55} />
          <circle cx={312} cy={90} r={22} fill="oklch(0.62 0.18 355)" />
          <text x={312} y={94} textAnchor="middle" fontSize={11} fill="oklch(0.98 0.01 260)" fontWeight={600}>
            TA
          </text>
        </motion.g>

        {/* spark particles */}
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            cx={200} cy={90} r={2}
            fill="oklch(0.95 0.10 320)"
            initial={{ opacity: 0 }}
            animate={{
              cx: [200, 200 + (i % 2 ? 40 : -40)],
              cy: [90, 90 + (i < 2 ? -22 : 22)],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: i * 0.45,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>

      {/* labels under orbs */}
      <div className="absolute left-0 right-0 bottom-2 flex justify-between px-6 text-[10px] font-mono">
        <span className="text-[oklch(0.85_0.10_285)]">{youLabel}</span>
        <span className="text-muted-foreground">追 ⇌ 逃</span>
        <span className="text-[oklch(0.85_0.10_360)]">{taLabel}</span>
      </div>
    </div>
  );
}
