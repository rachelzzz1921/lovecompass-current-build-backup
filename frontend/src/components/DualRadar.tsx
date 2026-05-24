import { useEffect, useRef } from "react";

type Axis = { label: string; you: number; ta: number };

export function DualRadar({ data, size = 300 }: { data: Axis[]; size?: number }) {
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
    const r = (size - 90) / 2;
    const n = data.length;
    const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

    // grid
    ctx.strokeStyle = "rgba(180,180,220,0.13)";
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
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }

    function poly(values: number[], stroke: string, fill: string) {
      ctx.beginPath();
      values.forEach((v, i) => {
        const a = ang(i);
        const rr = (Math.max(0, Math.min(100, v)) / 100) * r;
        const x = cx + Math.cos(a) * rr;
        const y = cy + Math.sin(a) * rr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.8;
      ctx.stroke();
    }

    // 你的 - violet
    poly(
      data.map((d) => d.you),
      "rgba(168,156,255,0.95)",
      "rgba(140,120,240,0.28)"
    );
    // TA - rose/cyan
    poly(
      data.map((d) => d.ta),
      "rgba(255,140,180,0.95)",
      "rgba(255,140,180,0.18)"
    );

    // labels
    ctx.fillStyle = "rgba(220,220,235,0.82)";
    ctx.font = "500 11px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    data.forEach((d, i) => {
      const a = ang(i);
      const x = cx + Math.cos(a) * (r + 26);
      const y = cy + Math.sin(a) * (r + 26);
      ctx.fillText(d.label, x, y);
    });
  }, [data, size]);

  return <canvas ref={ref} className="block mx-auto" />;
}
