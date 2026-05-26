import { useState, type ReactNode } from "react";
import type { MateResult } from "@/data/mateTypes";
import { MateHoneycomb } from "@/components/mate/MateHoneycomb";
import { MateModuleAccordionPanel } from "@/components/mate/MateV4Sections";
import { mateLayout } from "@/lib/mateLayout";

export function buildMateModuleRadar(result: MateResult) {
  return result.modules
    .filter((m) => m.score != null)
    .map((m) => ({
      label: m.label.replace(/模块|资产|净值/g, "").trim() || m.code,
      value: m.score ?? 0,
    }));
}

export function MateModuleScoreStrip({ modules }: { modules: MateResult["modules"] }) {
  const scored = modules.filter((m) => m.score != null);
  if (!scored.length) return null;

  return (
    <div className="space-y-3">
      {scored.map((mod) => (
        <div key={mod.code} className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 w-9 shrink-0">{mod.code}</span>
          <span className="text-sm text-white/85 min-w-[4.5rem] shrink-0 hidden sm:block">
            {mod.label.replace(/模块|资产|净值/g, "").trim()}
          </span>
          <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sakura/70 to-violet-400/70 transition-all"
              style={{ width: `${mod.score}%` }}
            />
          </div>
          <span className="font-mono text-lg text-white tabular-nums w-10 text-right shrink-0">{mod.score}</span>
        </div>
      ))}
    </div>
  );
}

export function MateModuleRadarSection({
  result,
  label,
}: {
  result: MateResult;
  moduleRadar?: ReturnType<typeof buildMateModuleRadar>;
  label?: ReactNode;
}) {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  if (!result.modules.length) return null;

  const hasScores = result.modules.some((m) => m.score != null);

  return (
    <section id="mate-modules" className={mateLayout.chapter}>
      {label}
      <MateModuleScoreStrip modules={result.modules} />
      {hasScores ? (
        <>
          <p className={`${mateLayout.monoLabel} mt-8 mb-4`}>结构视图</p>
          <MateHoneycomb
            modules={result.modules}
            activeCode={activeCode}
            onSelect={(code) => setActiveCode((prev) => (prev === code ? null : code))}
          />
        </>
      ) : null}
      {result.moduleAccordions?.length ? (
        <div className="mt-8">
          <MateModuleAccordionPanel result={result} initialOpen={activeCode} />
        </div>
      ) : (
        <div className="mt-6 divide-y divide-white/8">
          {result.modules.map((mod) => (
            <div key={mod.code} className="py-3 flex items-center justify-between gap-3">
              <span className="text-sm text-white/85">{mod.label}</span>
              <span className="text-xs text-white/50 shrink-0">{mod.displaySummary}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
