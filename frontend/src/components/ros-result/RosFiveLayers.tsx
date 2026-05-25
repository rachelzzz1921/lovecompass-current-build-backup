import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { RosLayerDetail, RosSingleResult } from "@/data/rosTypes";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import { rosLayerChatPrefill, rosPartnerInvitePrefill } from "@/lib/rosLayerChatPrefill";

const LAYER_META: { key: RosSingleResult["dims"][0]["key"]; code: string; label: string }[] = [
  { key: "at", code: "AT", label: "吸引基础" },
  { key: "in", code: "IN", label: "互动质量" },
  { key: "co", code: "CO", label: "兼容程度" },
  { key: "ev", code: "EV", label: "关系走向" },
  { key: "rk", code: "RK", label: "风险信号" },
];

function healthColor(v: number, isRk = false) {
  if (isRk) {
    if (v <= 30) return "oklch(0.68 0.18 285)";
    if (v <= 50) return "oklch(0.82 0.14 75)";
    return "oklch(0.72 0.18 20)";
  }
  if (v >= 80) return "oklch(0.68 0.18 285)";
  if (v >= 65) return "oklch(0.72 0.14 235)";
  if (v >= 50) return "oklch(0.82 0.14 75)";
  return "oklch(0.72 0.18 20)";
}

function rkDots(v: number) {
  const filled = v >= 66 ? 4 : v >= 51 ? 3 : v >= 31 ? 2 : v >= 15 ? 1 : 0;
  return Array.from({ length: 5 }).map((_, i) => (i < filled ? "●" : "○")).join("");
}

function rkLabel(v: number) {
  if (v <= 30) return "低风险";
  if (v <= 50) return "留意";
  if (v <= 65) return "中等";
  return "偏高";
}

function fallbackLayerDetail(label: string, value: number): RosLayerDetail {
  return {
    displaySummary: value >= 65 ? "表现稳定" : "还在发展阶段",
    read: `${label}：基于你的作答综合评估。`,
    bright: "你愿意认真看这段关系，这本身就是投入。",
    watch: "把感受说具体，比猜更有用。",
    tags: [label],
  };
}

export function RosFiveLayers({
  result,
  attemptId,
  inviteCode,
}: {
  result: RosSingleResult;
  attemptId: string;
  inviteCode: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const valueOf = (k: string) => result.dims.find((d) => d.key === k)?.value ?? 0;

  return (
    <section>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">HOW · 五维透视镜</div>
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {LAYER_META.map((m, i) => {
          const v = valueOf(m.key);
          const isRk = m.key === "rk";
          const c = healthColor(v, isRk);
          const isOpen = open === m.key;
          const filled = Math.round(v / 10);
          const detail = result.layerDetails?.[m.key] ?? fallbackLayerDetail(m.label, v);
          const expansion = result.aiContent?.layer_expansion?.[m.key];
          const tierLabel = expansion?.tier_label || detail.displaySummary;
          const evidence = expansion?.evidence_text || detail.read;
          const probe = expansion?.probe_question || "";

          return (
            <div key={m.key} className={i > 0 ? "border-t border-white/[0.06]" : ""}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : m.key)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition"
              >
                <span className="text-[10px] font-mono text-white/35 w-6">{m.code}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white/90">{m.label}</span>
                    <span className="ml-auto text-xs font-mono tabular-nums" style={{ color: c }}>
                      {isRk ? rkLabel(v) : v}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] mt-1 tracking-tight" style={{ color: c, opacity: 0.85 }}>
                    {isRk ? rkDots(v) : Array.from({ length: 10 }).map((_, j) => (j < filled ? "█" : "░")).join("")}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-white/40 shrink-0"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-10 space-y-4">
                      <p className="text-xs text-white/65 leading-relaxed">{tierLabel}</p>

                      {expansion?.subdims?.length ? (
                        <div className="space-y-2">
                          <div className="text-[10px] font-mono text-white/35 tracking-widest">子维度</div>
                          {expansion.subdims.map((sub) => (
                            <div key={sub.key} className="flex items-center gap-2 text-[11px]">
                              <span className="w-20 shrink-0 text-white/55">{sub.label}</span>
                              <span className="font-mono tracking-tight" style={{ color: c }}>
                                {Array.from({ length: 8 }).map((_, j) =>
                                  j < Math.round(sub.score / 12.5) ? "█" : "░",
                                ).join("")}
                              </span>
                              <span className="text-white/45 tabular-nums w-6 text-right">{sub.score}</span>
                              <span className="text-white/50 flex-1 truncate">「{sub.summary}」</span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="h-px bg-white/[0.08]" />
                      <div>
                        <div className="text-[10px] font-mono text-white/35 tracking-widest mb-1.5">答题证据</div>
                        <p className="text-xs text-white/70 leading-relaxed">{evidence}</p>
                      </div>

                      {probe ? (
                        <>
                          <div className="h-px bg-white/[0.08]" />
                          <div className="rounded-xl p-3" style={{ background: "rgba(99,102,241,0.08)" }}>
                            <div className="text-[10px] font-mono text-[#a5a8ff] tracking-widest mb-1">问诊式追问</div>
                            <p className="text-sm text-white/85 leading-relaxed whitespace-pre-line">{probe}</p>
                            <Link
                              to="/chat"
                              search={chatRouteSearch(
                                attemptId,
                                undefined,
                                rosLayerChatPrefill(m.code, m.label, v, probe, evidence),
                              )}
                              className="inline-block mt-3 text-xs text-[#c2c4ff] hover:underline"
                            >
                              回忆一下，告诉 AI 分析师 →
                            </Link>
                          </div>
                        </>
                      ) : null}

                      <div className="rounded-xl p-3 border border-dashed border-white/15">
                        <div className="text-[10px] text-white/45 mb-1">如果对方来做会怎样</div>
                        <p className="text-xs text-white/60">你给{m.label}打出了 {v} 分</p>
                        <p className="text-sm text-white/75 mt-2">他/她会打几分？<span className="text-white/45"> 等待中…</span></p>
                        <Link
                          to="/chat"
                          search={chatRouteSearch(
                            attemptId,
                            undefined,
                            rosPartnerInvitePrefill(m.label, v),
                          )}
                          className="inline-block mt-2 mr-2 text-[10px] text-white/45 hover:text-white/70"
                        >
                          先跟 AI 聊聊差异 →
                        </Link>
                        <Link
                          to="/ros/invite/$code"
                          params={{ code: inviteCode }}
                          className="inline-block mt-3 text-xs px-3 py-1.5 rounded-lg text-white"
                          style={{ background: "rgba(99,102,241,0.35)" }}
                        >
                          邀请他/她来做 →
                        </Link>
                      </div>
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
