import { useEffect, useMemo, useRef } from "react";

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

function chartMetrics(size: number) {
  const plotSize = Math.round(size);
  const cx = plotSize / 2;
  const cy = plotSize / 2;
  const labelMargin = 120;
  const r = Math.max(56, (plotSize - labelMargin) / 2);
  const labelR = r + 22;
  return { plotSize, cx, cy, r, labelR };
}

export function RadarChart({
  data,
  baseline,
  size = 300,
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
  const geomRef = useRef<{ cx: number; cy: number; r: number; n: number; size: number } | null>(null);
  const plotSize = Math.max(260, Math.round(size));
  const { cx, cy, r, labelR } = chartMetrics(plotSize);
  const n = data.length;

  const labelPositions = useMemo(() => {
    if (!n) return [];
    return data.map((d, i) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return {
        key: d.key ?? d.label,
        label: d.label,
        x: cx + Math.cos(a) * labelR,
        y: cy + Math.sin(a) * labelR,
        active: activeAxis === i,
      };
    });
  }, [activeAxis, cx, cy, data, labelR, n]);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs || !n) return;

    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    const backing = plotSize * dpr;
    cvs.width = backing;
    cvs.height = backing;
    cvs.style.width = `${plotSize}px`;
    cvs.style.height = `${plotSize}px`;

    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, plotSize, plotSize);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
    const palette = VARIANT_STYLES[variant];
    geomRef.current = { cx, cy, r, n, size: plotSize };

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
      ctx.lineWidth = highlighted ? 1.75 : 1;
      ctx.stroke();
    }

    if (baseline?.length === n) {
      drawPolygon(ctx, cx, cy, r, n, ang, baseline.map((b) => b.value), {
        stroke: palette.baseline,
        lineWidth: 1.4,
        dash: [5, 4],
      });
    }

    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    grad.addColorStop(0, palette.fill[0]);
    grad.addColorStop(1, palette.fill[1]);

    drawPolygon(ctx, cx, cy, r, n, ang, data.map((d) => d.value), {
      fill: grad,
      stroke: palette.stroke,
      lineWidth: 1.75,
    });

    data.forEach((d, i) => {
      const a = ang(i);
      const rr = (Math.max(0, Math.min(100, d.value)) / 100) * r;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      const radius = activeAxis === i ? 5 : 4;
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.fillStyle = `${d.color || palette.point}33`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = d.color || palette.point;
      ctx.fill();
    });
  }, [activeAxis, baseline, cx, cy, data, n, plotSize, r, variant]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onAxisClick || !geomRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = geomRef.current.size / rect.width;
    const x = (e.clientX - rect.left) * scale - geomRef.current.cx;
    const y = (e.clientY - rect.top) * scale - geomRef.current.cy;
    const angle = Math.atan2(y, x) + Math.PI / 2;
    const normalized = angle < 0 ? angle + Math.PI * 2 : angle;
    const slice = (Math.PI * 2) / geomRef.current.n;
    const index = Math.round(normalized / slice) % geomRef.current.n;
    onAxisClick(index);
  };

  return (
    <div className="relative shrink-0" style={{ width: plotSize, height: plotSize }}>
      <canvas
        ref={ref}
        className={onAxisClick ? "cursor-pointer" : undefined}
        onClick={handleClick}
        aria-label="六维雷达图"
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {labelPositions.map((item) => (
          <span
            key={item.key}
            className={`absolute whitespace-nowrap text-center text-[10px] sm:text-[11px] leading-none -translate-x-1/2 -translate-y-1/2 ${
              item.active ? "text-foreground font-medium" : "text-foreground/75"
            }`}
            style={{ left: item.x, top: item.y }}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
