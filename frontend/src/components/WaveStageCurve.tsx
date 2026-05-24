import { motion } from "framer-motion";
import { REL_STAGES } from "@/data/rosTypes";

/**
 * 山路徒步式九节点曲线 —— 起点红旗，终点靶心
 * 模拟真实亲密关系的起伏路径：相遇 → 高峰 → 低谷 → 重建 → 并肩
 * Y 值越小越靠上（视觉高度越高）
 */
const Y = [70, 30, 52, 44, 78, 92, 55, 28, 10];

export function WaveStageCurve({ activeStage }: { activeStage: number }) {
  const w = 760;
  const h = 220;
  const padX = 44;
  const padTop = 24;
  const padBottom = 30;
  const usableH = h - padTop - padBottom;
  const step = (w - padX * 2) / (Y.length - 1);

  const points = Y.map((y, i) => ({
    x: padX + i * step,
    y: padTop + (y / 100) * usableH,
    stage: REL_STAGES[i],
  }));

  // 平滑贝塞尔
  const path = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + p.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
  }, "");

  const activeIdx = Math.max(0, Math.min(8, activeStage - 1));
  const active = points[activeIdx];
  const start = points[0];
  const end = points[points.length - 1];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h + 50}`} className="w-full min-w-[680px]">
        <defs>
          <linearGradient id="waveStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.82 0.14 200)" />
            <stop offset="50%" stopColor="oklch(0.68 0.18 285)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 360)" />
          </linearGradient>
          <linearGradient id="waveFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.68 0.18 285 / 0.32)" />
            <stop offset="100%" stopColor="oklch(0.68 0.18 285 / 0)" />
          </linearGradient>
          <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.78 0.20 30 / 0.9)" />
            <stop offset="100%" stopColor="oklch(0.78 0.20 30 / 0)" />
          </radialGradient>
          <radialGradient id="flagGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.72 0.20 30 / 0.7)" />
            <stop offset="100%" stopColor="oklch(0.72 0.20 30 / 0)" />
          </radialGradient>
        </defs>

        {/* horizon line */}
        <line
          x1={padX} x2={w - padX}
          y1={h - padBottom + 4} y2={h - padBottom + 4}
          stroke="oklch(0.55 0.020 270 / 0.22)" strokeDasharray="3 6"
        />

        {/* fill under curve */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          d={`${path} L ${w - padX} ${h - padBottom + 4} L ${padX} ${h - padBottom + 4} Z`}
          fill="url(#waveFill)"
        />

        {/* main path */}
        <motion.path
          d={path}
          fill="none"
          stroke="url(#waveStroke)"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* START · flag glow */}
        <circle cx={start.x} cy={start.y} r={22} fill="url(#flagGlow)" />
        <motion.g
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* flag pole */}
          <line
            x1={start.x} y1={start.y}
            x2={start.x} y2={start.y - 22}
            stroke="oklch(0.95 0.005 260)" strokeWidth={1.5}
          />
          {/* flag */}
          <path
            d={`M ${start.x} ${start.y - 22} L ${start.x + 14} ${start.y - 18} L ${start.x} ${start.y - 14} Z`}
            fill="oklch(0.68 0.22 25)"
            stroke="oklch(0.78 0.20 30)"
            strokeWidth={0.6}
          />
        </motion.g>

        {/* END · target */}
        <circle cx={end.x} cy={end.y} r={26} fill="url(#targetGlow)" />
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6, type: "spring" }}
          style={{ transformOrigin: `${end.x}px ${end.y}px` }}
        >
          <circle cx={end.x} cy={end.y} r={11} fill="none" stroke="oklch(0.85 0.18 30)" strokeWidth={1.5} />
          <circle cx={end.x} cy={end.y} r={7} fill="none" stroke="oklch(0.85 0.18 30)" strokeWidth={1.2} />
          <circle cx={end.x} cy={end.y} r={3} fill="oklch(0.85 0.18 30)" />
        </motion.g>

        {/* nodes */}
        {points.map((p, i) => {
          const isActive = i + 1 === activeStage;
          const isFirst = i === 0;
          const isLast = i === points.length - 1;
          const passed = i + 1 < activeStage;
          return (
            <g key={i}>
              {!isFirst && !isLast && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 6.5 : 3.4}
                  fill={
                    isActive
                      ? "oklch(0.97 0.005 260)"
                      : passed
                      ? "oklch(0.78 0.16 360 / 0.85)"
                      : "oklch(0.68 0.18 285 / 0.78)"
                  }
                  stroke={isActive ? "oklch(0.68 0.18 285)" : "transparent"}
                  strokeWidth={isActive ? 2.4 : 0}
                />
              )}
              {isActive && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={13}
                  fill="none"
                  stroke="oklch(0.68 0.18 285 / 0.55)"
                  strokeWidth={1.5}
                  initial={{ scale: 0.6, opacity: 0.9 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ duration: 1.9, repeat: Infinity }}
                  style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                />
              )}
              {/* label above node (alternates) */}
              <text
                x={p.x}
                y={p.y - 16}
                fontSize={11.5}
                textAnchor="middle"
                fill={
                  isActive
                    ? "oklch(0.97 0.005 260)"
                    : passed
                    ? "oklch(0.85 0.10 360)"
                    : "oklch(0.75 0.04 270)"
                }
                fontWeight={isActive ? 600 : 500}
              >
                {p.stage.name}
              </text>
              {/* tiny stage index at bottom */}
              <text
                x={p.x}
                y={h - padBottom + 22}
                fontSize={9}
                textAnchor="middle"
                fill={isActive ? "oklch(0.88 0.10 285)" : "oklch(0.50 0.02 270 / 0.7)"}
                className="font-mono"
              >
                {String(i + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })}

        {/* "你在这里" callout */}
        <motion.g
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <line
            x1={active.x} y1={active.y - 30}
            x2={active.x} y2={active.y - 10}
            stroke="oklch(0.68 0.18 285 / 0.7)" strokeWidth={1} strokeDasharray="2 3"
          />
          <rect
            x={active.x - 38}
            y={active.y - 52}
            width={76}
            height={22}
            rx={11}
            fill="oklch(0.16 0.020 270 / 0.96)"
            stroke="oklch(0.68 0.18 285 / 0.7)"
          />
          <text
            x={active.x}
            y={active.y - 37}
            fontSize={10}
            textAnchor="middle"
            fill="oklch(0.97 0.005 260)"
            className="font-mono"
          >
            你在这里
          </text>
        </motion.g>

        {/* start/end labels */}
        <text x={start.x - 4} y={h - padBottom + 22} fontSize={9} textAnchor="end" fill="oklch(0.72 0.18 30)" className="font-mono">
          START
        </text>
        <text x={end.x + 4} y={h - padBottom + 22} fontSize={9} textAnchor="start" fill="oklch(0.85 0.18 30)" className="font-mono">
          GOAL
        </text>
      </svg>
    </div>
  );
}
