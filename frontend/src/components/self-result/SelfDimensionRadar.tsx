import { RadarChart } from "@/components/RadarChart";
import type { Dimension, RadarBaselinePoint } from "@/data/mockResult";

type Props = {
  dimensions: Dimension[];
  baseline?: RadarBaselinePoint[];
  subjectLabel?: string;
};

/** 套一六维：纯雷达可视化，不含文案列表与跳转。 */
export function SelfDimensionRadar({ dimensions, baseline, subjectLabel }: Props) {
  const resolvedBaseline: RadarBaselinePoint[] =
    baseline ??
    dimensions.map((d) => ({ key: d.key, label: d.label, value: Math.round(d.value * 0.82) }));

  return (
    <div className="flex flex-col items-center min-w-0">
      <div className="w-full flex justify-center overflow-x-auto">
        <RadarChart data={dimensions} baseline={resolvedBaseline} size={300} variant="violet" />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-mono">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-5 border-t border-dashed border-foreground/45" />
          同类型平均
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-5 border-t-2 border-[oklch(0.82_0.14_200)]" />
          {subjectLabel ?? "你的"}得分
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-2 w-full max-w-lg">
        {dimensions.map((d) => (
          <div
            key={d.key}
            className="rounded-lg border border-border/40 bg-secondary/20 px-2 py-2 text-center min-w-0"
            title={d.label}
          >
            <div
              className="mx-auto mb-1.5 h-1 rounded-full overflow-hidden bg-secondary/60"
              aria-hidden
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.max(4, d.value)}%`, background: d.color }}
              />
            </div>
            <div className="text-[11px] font-mono tabular-nums text-foreground/90">{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
