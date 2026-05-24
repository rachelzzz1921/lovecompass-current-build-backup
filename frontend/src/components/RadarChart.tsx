import { useEffect, useRef } from "react";

type Axis = { label: string; value: number; color?: string };

type RadarVariant = "violet" | "rose";

const VARIANT_STYLES: Record<
  RadarVariant,
  { grid: string; fill: [string, string]; stroke: string; point: string }
> = {
  violet: {
    grid: "rgba(180,180,220,0.13)",
    fill: ["rgba(140,120,240,0.45)", "rgba(110,200,240,0.10)"],
    stroke: "rgba(150,140,240,0.95)",
    point: "#a99cff",
  },
  rose: {
    grid: "rgba(244,114,182,0.14)",
    fill: ["rgba(251,113,133,0.42)", "rgba(244,114,182,0.08)"],
    stroke: "rgba(251,113,133,0.92)",
    point: "#fb7185",
  },
};

export function RadarChart({
  data,
  size = 280,
  variant = "violet",
}: {
  data: Axis[];
  size?: number;
  variant?: RadarVariant;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    cvs.width = size * dpr;
    cvs.height = size * dpr;
    cvs.style.width = size + "px";
    cvs.style.height = size + "px";
    const ctx = cvs.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const r = (size - 80) / 2;
    const n = data.length;
    const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const palette = VARIANT_STYLES[variant];

    // grid rings
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    for (const k of [0.25, 0.5, 0.75, 1]) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = ang(i % n);
        const x = cx + Math.cos(a) * r * k;
        const y = cy + Math.sin(a) * r * k;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // axes
    for (let i = 0; i < n; i++) {
      const a = ang(i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }

    // data polygon
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    grad.addColorStop(0, palette.fill[0]);
    grad.addColorStop(1, palette.fill[1]);

    ctx.beginPath();
    data.forEach((d, i) => {
      const a = ang(i);
      const rr = (Math.max(0, Math.min(100, d.value)) / 100) * r;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // points
    data.forEach((d, i) => {
      const a = ang(i);
      const rr = (Math.max(0, Math.min(100, d.value)) / 100) * r;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = d.color || palette.point;
      ctx.shadowColor = d.color || palette.point;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // labels
    ctx.fillStyle = "rgba(220,220,235,0.78)";
    ctx.font = "500 11px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    data.forEach((d, i) => {
      const a = ang(i);
      const x = cx + Math.cos(a) * (r + 22);
      const y = cy + Math.sin(a) * (r + 22);
      ctx.fillText(d.label, x, y);
    });
  }, [data, size, variant]);

  return <canvas ref={ref} className="block" />;
}
