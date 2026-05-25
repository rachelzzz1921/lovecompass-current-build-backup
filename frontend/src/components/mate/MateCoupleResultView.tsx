import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { MateCoupleResult } from "@/data/mateCoupleTypes";

const ROSE = {
  chip: "rgba(244,114,182,0.12)",
  chipText: "#f9a8d4",
  chipBorder: "rgba(244,114,182,0.35)",
  accent: "#fb7185",
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-mono tracking-[0.28em] text-white/45 mb-3">{children}</div>
  );
}

export function MateCoupleResultView({ result }: { result: MateCoupleResult }) {
  return (
    <main className="relative min-h-screen" style={{ background: "#100a0d" }}>
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-5 pt-5 pb-3"
        style={{ background: "linear-gradient(180deg,#100a0d 70%, transparent)" }}
      >
        <Link to="/" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">返回</span>
        </Link>
        <span
          className="chip font-mono text-[10px] tracking-[0.25em]"
          style={{ background: ROSE.chip, color: ROSE.chipText, border: `1px solid ${ROSE.chipBorder}` }}
        >
          SET · 03 / MATE · 双人
        </span>
      </header>

      <div className="max-w-[480px] mx-auto px-5 pb-24 space-y-8">
        <section>
          <SectionLabel>📍 适配坐标</SectionLabel>
          <div
            className="rounded-3xl p-6 text-center"
            style={{ background: ROSE.chip, border: `1px solid ${ROSE.chipBorder}` }}
          >
            <div className="font-display text-5xl text-white">{result.matchingScore}</div>
            <div className="text-sm mt-2" style={{ color: ROSE.chipText }}>
              {result.relationshipStatus} · 火花：{result.relationshipSpark}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {result.keywords.map((kw) => (
                <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-black/20 text-white/80">
                  #{kw}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5 text-left text-xs text-white/70">
              <div className="rounded-xl p-3 bg-black/15">
                <div className="text-white/40 mb-1">你</div>
                {result.youPosition || "—"}
              </div>
              <div className="rounded-xl p-3 bg-black/15">
                <div className="text-white/40 mb-1">TA</div>
                {result.taPosition || "—"}
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>🔬 关系拆解</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(result.analysis).map(([code, mod]) => (
              <details
                key={code}
                className="rounded-2xl p-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <summary className="cursor-pointer text-sm text-white font-medium list-none">
                  {code} · {mod.level}
                </summary>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">{mod.desc || "暂无补充说明"}</p>
              </details>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>🧩 关系画像</SectionLabel>
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div>
              <div className="text-xs text-white/45 mb-1">重叠区</div>
              <div className="text-sm text-white/85">{result.portrait.common.join(" · ") || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-white/45 mb-1">差异点</div>
              <div className="text-sm text-white/85">{result.portrait.difference.join(" · ") || "—"}</div>
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>⚠ 风险实验室</SectionLabel>
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{result.riskLab.riskName}</span>
              <span className="text-xs text-white/50">{result.riskLab.riskLevel}风险</span>
            </div>
            <div className="font-mono text-xs mt-2 text-white/70">{result.riskLab.riskVisual}</div>
            <ul className="mt-3 space-y-1 text-sm text-white/75 list-disc pl-4">
              {result.riskLab.manifest.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {result.riskLab.repair.length > 0 && (
              <p className="text-xs text-white/55 mt-3">修复建议：{result.riskLab.repair.join("；")}</p>
            )}
          </div>
        </section>

        <section>
          <SectionLabel>🔭 长期预估</SectionLabel>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl p-3 text-center bg-white/5">
              <div className="text-2xl text-white">{result.future.stableRelationshipProbability}%</div>
              <div className="text-[10px] text-white/45 mt-1">稳定关系概率</div>
            </div>
            <div className="rounded-xl p-3 text-center bg-white/5">
              <div className="text-2xl text-white">{result.future.marriageAdaptationScore}</div>
              <div className="text-[10px] text-white/45 mt-1">结婚适配度</div>
            </div>
          </div>
          <div className="space-y-3">
            {result.future.timeline.map((node) => (
              <div key={node.stage} className="border-l-2 pl-3" style={{ borderColor: ROSE.accent }}>
                <div className="text-xs font-mono text-white/45">{node.stage}</div>
                <div className="text-sm text-white/80 mt-1">{node.text}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>📋 红娘建议</SectionLabel>
          <div className="space-y-2">
            <div className="rounded-2xl px-4 py-3 text-sm text-white/85 bg-emerald-950/30 border border-emerald-900/40">
              {result.advice.goodNews}
            </div>
            <div className="rounded-2xl px-4 py-3 text-sm text-white/85 bg-amber-950/25 border border-amber-900/35">
              {result.advice.caution}
            </div>
            <div
              className="rounded-2xl px-4 py-3 text-sm text-white/90"
              style={{ background: ROSE.chip, border: `1px solid ${ROSE.chipBorder}` }}
            >
              {result.advice.oneChange}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
