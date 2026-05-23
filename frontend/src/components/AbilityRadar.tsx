import { motion } from "framer-motion";

type Axis = { key: string; label: string; value: number };

// 五维"能力倾向"展示（不展示原始维度名称，转译为体面描述）
export function AbilityRadar({ data }: { data: Axis[] }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 110;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, v: number) => {
    const a = angle(i);
    const rr = (Math.max(0, Math.min(100, v)) / 100) * r;
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as const;
  };
  const ringR = [0.25, 0.5, 0.75, 1].map((k) => r * k);
  const poly = data.map((d, i) => pt(i, d.value).join(",")).join(" ");
  return (
    <svg width={size} height={size}>
      {ringR.map((rr, idx) => (
        <circle key={idx} cx={cx} cy={cy} r={rr} fill="none" stroke="oklch(0.40 0.020 340 / 0.18)" />
      ))}
      {data.map((d, i) => {
        const [x, y] = pt(i, 100);
        return <line key={d.key} x1={cx} y1={cy} x2={x} y2={y} stroke="oklch(0.40 0.020 340 / 0.18)" />;
      })}
      <motion.polygon
        points={poly}
        fill="oklch(0.78 0.14 350 / 0.18)"
        stroke="oklch(0.78 0.14 350)"
        strokeWidth={1.5}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      />
      {data.map((d, i) => {
        const a = angle(i);
        const x = cx + Math.cos(a) * (r + 18);
        const y = cy + Math.sin(a) * (r + 18);
        return (
          <text key={d.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="oklch(0.96 0.012 340)" fontSize="11" fontFamily="Karla, sans-serif">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
