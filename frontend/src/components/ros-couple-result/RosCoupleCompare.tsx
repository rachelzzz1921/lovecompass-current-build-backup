import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import type { RosCoupleResult } from "@/data/rosTypes";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import { rosCoupleGapChatPrefill } from "@/lib/rosLayerChatPrefill";

const LAYERS: { key: RosCoupleResult["dims"][0]["key"]; code: string }[] = [
  { key: "at", code: "AT" },
  { key: "in", code: "IN" },
  { key: "co", code: "CO" },
  { key: "ev", code: "EV" },
  { key: "rk", code: "RK" },
];

const DOT_COLOR: Record<string, string> = {
  green: "#34d399",
  blue: "#60a5fa",
  amber: "#fbbf24",
};

function rkLabel(v: number) {
  if (v <= 30) return "低";
  if (v <= 50) return "中低";
  return "中";
}

function renderDots(n: number, color: string) {
  return Array.from({ length: 3 })
    .map((_, i) => (
      <span key={i} style={{ color: i < n ? color : "rgba(255,255,255,0.15)" }}>
        ●
      </span>
    ));
}

export function RosCoupleCompare({
  result,
  initiatorAttemptId,
}: {
  result: RosCoupleResult;
  initiatorAttemptId?: string;
}) {
  const maxGapKey = useMemo(() => {
    let best = "ev";
    let bestGap = 0;
    for (const l of LAYERS) {
      const g = result.layerCompare?.[l.key]?.gap ?? 0;
      if (g > bestGap) {
        bestGap = g;
        best = l.key;
      }
    }
    return best;
  }, [result.layerCompare]);

  const [open, setOpen] = useState<string | null>(() => {
    let best = "ev";
    let bestGap = 0;
    for (const l of LAYERS) {
      const g = result.layerCompare?.[l.key]?.gap ?? 0;
      if (g > bestGap) {
        bestGap = g;
        best = l.key;
      }
    }
    return bestGap >= 10 ? best : null;
  });

  return (
    <section>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">COMPARE · 你们各自看到了什么</div>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2 text-[9px] font-mono text-white/35 border-b border-white/[0.06]">
          <span />
          <span className="w-8 text-center">你</span>
          <span className="w-8 text-center">对方</span>
          <span className="w-10 text-center">差值</span>
        </div>

        {LAYERS.map((l, i) => {
          const dim = result.dims.find((d) => d.key === l.key);
          const cmp = result.layerCompare?.[l.key];
          const isRk = l.key === "rk";
          const isOpen = open === l.key;
          const isMaxGap = l.key === maxGapKey && (cmp?.gap ?? 0) >= 10;
          const dotColor = DOT_COLOR[cmp?.diff_color ?? "blue"] ?? "#60a5fa";

          return (
            <div
              key={l.key}
              className={i > 0 ? "border-t border-white/[0.06]" : ""}
              style={isMaxGap ? { background: "rgba(251,191,36,0.04)" } : undefined}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : l.key)}
                className="w-full flex items-center gap-2 p-4 text-left hover:bg-white/[0.02] transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-white/50 w-6 shrink-0">{i + 1}</span>
                    <span className="text-sm text-white/90">{dim?.label ?? cmp?.label}</span>
                    {isMaxGap ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded text-amber-200/80 bg-amber-500/10">
                        差距最大
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="w-8 text-center text-xs font-mono tabular-nums text-white/75 shrink-0">
                  {isRk ? rkLabel(dim?.you ?? 0) : dim?.you}
                </span>
                <span className="w-8 text-center text-xs font-mono tabular-nums text-white/55 shrink-0">
                  {isRk ? rkLabel(dim?.ta ?? 0) : dim?.ta}
                </span>
                <span className="w-10 flex justify-center gap-0.5 text-[10px] shrink-0">
                  {isRk ? "─" : renderDots(cmp?.diff_dots ?? 1, dotColor)}
                </span>
                <ChevronDown
                  className="h-4 w-4 text-white/40 shrink-0"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && cmp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-white/[0.04] pt-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl p-3" style={{ background: "rgba(99,102,241,0.08)" }}>
                          <div className="text-[10px] font-mono text-[#a5a8ff] mb-1">
                            你的视角（{isRk ? rkLabel(dim?.you ?? 0) : dim?.you}）
                          </div>
                          <p className="text-sm text-white/85">{cmp.you_perspective}</p>
                        </div>
                        <div className="rounded-xl p-3" style={{ background: "rgba(240,165,208,0.06)" }}>
                          <div className="text-[10px] font-mono text-[#f0a5d0] mb-1">
                            对方的视角（{isRk ? rkLabel(dim?.ta ?? 0) : dim?.ta}）
                          </div>
                          <p className="text-sm text-white/85">{cmp.ta_perspective}</p>
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-mono text-white/35 tracking-widest mb-1">差距解读</div>
                        <p className="text-sm text-white/75 leading-relaxed">{cmp.gap_text}</p>
                      </div>

                      {cmp.probe_question ? (
                        <div className="rounded-xl p-3" style={{ border: "1px dashed rgba(255,255,255,0.12)" }}>
                          <div className="text-[10px] font-mono text-white/35 mb-1">追问</div>
                          <p className="text-sm text-white/70 italic">「{cmp.probe_question}」</p>
                          {initiatorAttemptId ? (
                            <Link
                              to="/chat"
                              search={chatRouteSearch(
                                initiatorAttemptId,
                                undefined,
                                rosCoupleGapChatPrefill(cmp.label, cmp.gap, cmp.gap_text, cmp.probe_question),
                              )}
                              className="inline-block mt-2 text-xs text-[#c2c4ff] hover:underline"
                            >
                              告诉 AI 分析师 →
                            </Link>
                          ) : null}
                        </div>
                      ) : null}

                      {(cmp.you_evidence || cmp.ta_evidence) ? (
                        <div className="space-y-2 text-xs text-white/65 leading-relaxed">
                          {cmp.you_evidence ? <p>{cmp.you_evidence}</p> : null}
                          {cmp.ta_evidence ? <p>{cmp.ta_evidence}</p> : null}
                        </div>
                      ) : null}

                      {(cmp.you_highlight || cmp.ta_highlight) ? (
                        <div className="space-y-2 text-xs text-white/60">
                          {cmp.you_highlight ? <p>你：{cmp.you_highlight}</p> : null}
                          {cmp.ta_highlight ? <p>对方：{cmp.ta_highlight}</p> : null}
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
