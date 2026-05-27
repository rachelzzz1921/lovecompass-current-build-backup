import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { MateCoupleBadge, MateCoupleResult } from "@/data/mateCoupleTypes";
import { LiteCoupleResultNotice } from "@/components/LiteCoupleResultNotice";

const ROSE = {
  chip: "rgba(244,114,182,0.12)",
  chipText: "#f9a8d4",
  chipBorder: "rgba(244,114,182,0.35)",
  accent: "#534AB7",
  accentAlt: "#1D9E75",
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-mono tracking-[0.28em] text-white/45 mb-3 uppercase">{children}</div>
  );
}

function badgeClass(badge: MateCoupleBadge): string {
  if (badge === "alert") return "bg-[#FCEBEB] text-[#A32D2D]";
  if (badge === "warn") return "bg-[#FAEEDA] text-[#854F0B]";
  return "bg-[#EAF3DE] text-[#3B6D11]";
}

function statusClass(badge: MateCoupleBadge): string {
  if (badge === "alert") return "text-[#A32D2D]";
  if (badge === "warn") return "text-[#854F0B]";
  return "text-[#3B6D11]";
}

function RhythmBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, score))}%`, background: color }} />
    </div>
  );
}

export function MateCoupleResultView({ result }: { result: MateCoupleResult }) {
  const { verdict, dealItems, scoreScope, relationshipModules } = result;
  const scoreLabel = scoreScope?.shortLabel ?? scoreScope?.label ?? "配对适配";

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
        <LiteCoupleResultNotice productId="mate" participants={result.participants} />

        <section
          className="rounded-2xl p-5 flex gap-5 items-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="text-center shrink-0 w-[60px]">
            <div className="font-display text-[42px] leading-none text-white">{verdict.score}</div>
            <div className="text-[9px] tracking-[0.08em] uppercase text-white/40 mt-1">{scoreLabel}</div>
          </div>
          <div className="w-px self-stretch bg-white/10" />
          <div className="min-w-0">
            {scoreScope?.hint ? (
              <p className="text-[10px] text-white/45 leading-relaxed mb-2">{scoreScope.hint}</p>
            ) : null}
            <div className="text-[11px] font-medium mb-1" style={{ color: ROSE.accent }}>
              {verdict.oneliner}
            </div>
            <div className="text-[15px] font-medium text-white mb-1">{verdict.title}</div>
            <p className="text-xs text-white/65 leading-relaxed">{verdict.desc}</p>
            {verdict.texture ? (
              <p className="text-xs text-white/55 mt-2 leading-relaxed italic">{verdict.texture}</p>
            ) : null}
          </div>
        </section>

        {relationshipModules.length > 0 ? (
          <section>
            <SectionLabel>六维拆解</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {relationshipModules.map((mod) => (
                <div
                  key={mod.code}
                  className="rounded-xl px-3 py-2 text-xs border border-white/10 bg-white/[0.03]"
                >
                  <span className="font-mono text-[10px] text-white/40">{mod.code}</span>
                  <span className="text-white/75 ml-2">{mod.dimension}</span>
                  <span className="text-white/55 ml-2">
                    {mod.pending || mod.score == null ? "待评估" : `${Math.round(mod.score)} · ${mod.level}`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!result.supplementComplete ? (
          <section
            className="rounded-2xl px-4 py-3 text-xs text-white/70"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            双方完成「双人补充题」后，条件对比与必聊议题会更完整。
            {!result.youSupplementComplete ? " 你这边尚未完成补充题。" : ""}
            {!result.taSupplementComplete ? " TA 尚未完成补充题。" : ""}
          </section>
        ) : null}

        {result.conditionTable.length > 0 ? (
          <section>
            <SectionLabel>现实条件对比</SectionLabel>
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left border-collapse min-w-[340px]">
                <thead>
                  <tr className="text-[10px] text-white/40 border-b border-white/10">
                    <th className="py-2 px-3 font-normal w-[28%]" />
                    <th className="py-2 px-3 font-normal text-center">他</th>
                    <th className="py-2 px-3 font-normal text-center">她</th>
                    <th className="py-2 px-3 font-normal text-center w-[22%]">差距</th>
                  </tr>
                </thead>
                <tbody>
                  {result.conditionTable.map((row) => (
                    <tr key={row.field} className="border-b border-white/8 text-xs text-white/85">
                      <td className="py-2 px-3 text-white/55">
                        {row.label}
                        <span className="block text-[10px] text-white/35 mt-0.5">{row.source}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {row.male_value}
                        {row.male_sub ? <span className="block text-[10px] text-white/35">{row.male_sub}</span> : null}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {row.female_value}
                        {row.female_sub ? (
                          <span className="block text-[10px] text-white/35">{row.female_sub}</span>
                        ) : null}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${badgeClass(row.badge)}`}>
                          {row.badge_label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {(dealItems.highlight.length > 0 || dealItems.dim.length > 0) && (
          <section>
            <SectionLabel>相亲必聊议题</SectionLabel>
            <div className="space-y-3">
              {dealItems.highlight.length > 0 ? (
                <>
                  <div className="text-[9px] tracking-[0.1em] uppercase text-white/40">需要谈的</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dealItems.highlight.map((item) => (
                      <div
                        key={item.field}
                        className="rounded-xl p-3 border border-[#EF9F27]/60 bg-white/[0.03]"
                      >
                        <div className="text-[10px] text-white/40 mb-1">
                          {item.label} · {item.source}
                        </div>
                        <div className="text-xs text-white flex flex-wrap items-baseline gap-1">
                          <span className="font-medium">{item.male_text}</span>
                          <span className="text-white/35 text-[9px]">vs</span>
                          <span className="text-white/75">{item.female_text}</span>
                        </div>
                        <div className={`text-[10px] mt-1 ${statusClass(item.badge)}`}>{item.status_text}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}

              {dealItems.dim.length > 0 ? (
                <>
                  <div className="text-[9px] tracking-[0.1em] uppercase text-white/40 mt-2">已对齐的</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dealItems.dim.map((item) => (
                      <div key={item.field} className="rounded-xl p-3 border border-white/10 bg-white/[0.02] opacity-55">
                        <div className="text-[10px] text-white/40 mb-1">
                          {item.label} · {item.source}
                        </div>
                        <div className="text-xs text-white flex flex-wrap items-baseline gap-1">
                          <span className="font-medium">{item.male_text}</span>
                          <span className="text-white/35 text-[9px]">vs</span>
                          <span className="text-white/75">{item.female_text}</span>
                        </div>
                        <div className={`text-[10px] mt-1 ${statusClass(item.badge)}`}>{item.status_text}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </section>
        )}

        {result.rhythm.length > 0 ? (
          <section>
            <SectionLabel>性格与节奏</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.rhythm.map((row) => (
                <div key={row.label} className="rounded-xl p-3 border border-white/10 bg-white/[0.03]">
                  <div className="text-[10px] text-white/40 mb-2">{row.label}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] text-white/55 w-4">他</span>
                    <RhythmBar score={row.male_score} color={ROSE.accent} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] text-white/55 w-4">她</span>
                    <RhythmBar score={row.female_score} color={ROSE.accentAlt} />
                  </div>
                  <p className="text-[10px] text-white/45 leading-relaxed">{row.note}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {result.attention.length > 0 ? (
          <section>
            <SectionLabel>需要关注的地方</SectionLabel>
            <div className="space-y-2">
              {result.attention.map((item) => (
                <div
                  key={item.id ?? item.title}
                  className="grid grid-cols-[26px_1fr] gap-2 rounded-xl p-3 border border-white/10 bg-white/[0.03]"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      item.icon === "ok" ? "bg-[#EAF3DE] text-[#3B6D11]" : "bg-[#FAEEDA] text-[#854F0B]"
                    }`}
                  >
                    {item.icon === "ok" ? "✓" : "!"}
                  </div>
                  <div>
                    <div className="text-sm text-white/90 font-medium">
                      {item.title}
                      {item.source ? <span className="text-[10px] text-white/35 font-normal"> · {item.source}</span> : null}
                    </div>
                    <p className="text-xs text-white/55 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section
          className="rounded-xl p-4 text-xs text-white/70 leading-relaxed"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <strong className="text-white/90 font-medium">红娘结论：</strong>
          {result.conclusion.summary}
          {result.conclusion.items.length > 0 ? (
            <div className="mt-3 space-y-2">
              {result.conclusion.items.map((item) => (
                <div key={item.field} className="flex gap-2 items-start">
                  <span className="w-1 h-1 rounded-full bg-[#854F0B] mt-2 shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          ) : null}
          {result.conclusion.action_item ? (
            <p className="mt-3 text-white/85 font-medium">{result.conclusion.action_item}</p>
          ) : result.conclusion.ai_pending ? (
            <p className="mt-3 text-white/40 italic">个性化建议生成中…</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
