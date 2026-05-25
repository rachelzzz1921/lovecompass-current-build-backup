import { useEffect, useRef } from "react";

type Axis = { label: string; value: number; color?: string; key?: string };

type RadarVariant = "violet" | "rose";

const VARIANT_STYLES: Record<
  RadarVariant,
  { grid: string; fill: [string, string]; stroke: string; point: string; baseline: string }
> = {
  violet: {
    grid: "rgba(180,180,220,0.13)",
    fill: ["rgba(140,120,240,0.45)", "rgba(110,200,240,0.10)"],
    stroke: "rgba(150,140,240,0.95)",
    point: "#a99cff",
    baseline: "rgba(180,180,220,0.55)",
  },
  rose: {
    grid: "rgba(244,114,182,0.14)",
    fill: ["rgba(251,113,133,0.42)", "rgba(244,114,182,0.08)"],
    stroke: "rgba(251,113,133,0.92)",
    point: "#fb7185",
    baseline: "rgba(244,114,182,0.45)",
  },
};

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  n: number,
  ang: (i: number) => number,
  values: number[],
  style: { fill?: string | CanvasGradient; stroke?: string; lineWidth?: number; dash?: number[] },
) {
  ctx.beginPath();
  values.forEach((v, i) => {
    const a = ang(i);
    const rr = (Math.max(0, Math.min(100, v)) / 100) * r;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.fill();
  }
  if (style.stroke) {
    ctx.setLineDash(style.dash ?? []);
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.lineWidth ?? 1.6;
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function RadarChart({
  data,
  baseline,
  size = 280,
  variant = "violet",
  onAxisClick,
  activeAxis,
}: {
  data: Axis[];
  baseline?: Axis[];
  size?: number;
  variant?: RadarVariant;
  onAxisClick?: (index: number) => void;
  activeAxis?: number | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const geomRef = useRef<{ cx: number; cy: number; r: number; n: number } | null>(null);

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
    geomRef.current = { cx, cy, r, n };

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

    for (let i = 0; i < n; i++) {
      const a = ang(i);
      const highlighted = activeAxis === i;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.strokeStyle = highlighted ? palette.stroke : palette.grid;
      ctx.lineWidth = highlighted ? 1.8 : 1;
      ctx.stroke();
    }

    if (baseline?.length === n) {
      drawPolygon(
        ctx,
        cx,
        cy,
        r,
        n,
        ang,
        baseline.map((b) => b.value),
        { stroke: palette.baseline, lineWidth: 1.4, dash: [5, 4] },
      );
    }

    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    grad.addColorStop(0, palette.fill[0]);
    grad.addColorStop(1, palette.fill[1]);

    drawPolygon(
      ctx,
      cx,
      cy,
      r,
      n,
      ang,
      data.map((d) => d.value),
      { fill: grad, stroke: palette.stroke, lineWidth: 1.6 },
    );

    data.forEach((d, i) => {
      const a = ang(i);
      const rr = (Math.max(0, Math.min(100, d.value)) / 100) * r;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      ctx.beginPath();
      ctx.arc(x, y, activeAxis === i ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = d.color || palette.point;
      ctx.shadowColor = d.color || palette.point;
      ctx.shadowBlur = activeAxis === i ? 14 : 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.font = "500 11px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    data.forEach((d, i) => {
      const a = ang(i);
      const x = cx + Math.cos(a) * (r + 22);
      const y = cy + Math.sin(a) * (r + 22);
      ctx.fillStyle = activeAxis === i ? "rgba(255,255,255,0.95)" : "rgba(220,220,235,0.78)";
      ctx.fillText(d.label, x, y);
    });
  }, [data, baseline, size, variant, activeAxis]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onAxisClick || !geomRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - geomRef.current.cx;
    const y = e.clientY - rect.top - geomRef.current.cy;
    const angle = Math.atan2(y, x) + Math.PI / 2;
    const normalized = angle < 0 ? angle + Math.PI * 2 : angle;
    const n = geomRef.current.n;
    const slice = (Math.PI * 2) / n;
    const index = Math.round(normalized / slice) % n;
    onAxisClick(index);
  };

  return (
    <canvas
      ref={ref}
      className={`block ${onAxisClick ? "cursor-pointer" : ""}`}
      onClick={handleClick}
      aria-label="六维雷达图"
    />
  );
}
