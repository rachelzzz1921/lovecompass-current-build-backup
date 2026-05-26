import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, AlertCircle, Lightbulb, ArrowRight, Bot, Share2 } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import type { RosCoupleResult } from "@/data/rosTypes";
import { useLongPress } from "@/hooks/useLongPress";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import {
  copyCanvasToClipboard,
  drawCouplePrescriptionShareCard,
  downloadCanvas,
} from "@/lib/rosShareCanvas";

const INSIGHT_ICON: Record<string, { Icon: typeof Star; color: string; bg: string }> = {
  strength: { Icon: Star, color: "#a5a8ff", bg: "rgba(99,102,241,0.15)" },
  watch: { Icon: AlertCircle, color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  advice: { Icon: Lightbulb, color: "#34d399", bg: "rgba(52,211,153,0.15)" },
  action: { Icon: ArrowRight, color: "#f0a5d0", bg: "rgba(240,165,208,0.12)" },
};

function RxRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1.5">
      <div className="w-10 shrink-0 text-white/45 text-xs font-mono pt-0.5">{label}</div>
      <div className="text-white/90 text-sm font-mono leading-relaxed whitespace-pre-line">{value}</div>
    </div>
  );
}

function CouplePrescriptionCard({ result }: { result: RosCoupleResult }) {
  const exporting = useRef(false);

  const exportRx = async () => {
    if (exporting.current) return;
    exporting.current = true;
    try {
      const canvas = document.createElement("canvas");
      drawCouplePrescriptionShareCard(canvas, result);
      const copied = await copyCanvasToClipboard(canvas);
      toast.success(copied ? "处方签已复制" : "处方签已保存");
      if (!copied) downloadCanvas(canvas, `mirror-ros-couple-rx-${Date.now()}.png`);
    } catch {
      toast.error("导出失败");
    } finally {
      exporting.current = false;
    }
  };

  const longPress = useLongPress({ onLongPress: exportRx });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="双人关系处方签，长按导出"
      className="rounded-2xl p-5 relative select-none touch-manipulation"
      style={{ border: "1.5px dashed rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.04)" }}
      {...longPress}
    >
      <div className="absolute top-3 right-3 text-[9px] font-mono text-white/30">长按导出</div>
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-dashed border-white/10">
        <div className="font-display text-2xl font-bold" style={{ color: "#a5a8ff" }}>Rx</div>
        <div className="text-xs text-white/70">你们的关系处方</div>
      </div>
      <RxRow label="主诉" value={result.prescription.chiefComplaint} />
      <RxRow label="建议" value={result.prescription.rx} />
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-white/10">
        <span className="text-xs text-white/50 font-mono">复诊</span>
        <span className="text-sm text-white/85 font-mono">{result.prescription.followUp}</span>
      </div>
    </div>
  );
}

export function RosCoupleNext({
  result,
  initiatorAttemptId,
  onShare,
}: {
  result: RosCoupleResult;
  initiatorAttemptId?: string;
  onShare: () => void;
}) {
  const insights = result.insights ?? [];
  const aiPending = result.ai_content?.mode === "deterministic";

  return (
    <section className="space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-[10px] tracking-[0.3em] font-mono text-white/40">NEXT · AI 分析师摘要</div>
          {aiPending ? (
            <span className="text-[9px] text-white/35 ml-auto animate-pulse">分析师正在整理…</span>
          ) : null}
        </div>

        {result.shareLine ? (
          <div
            className="rounded-2xl p-4 mb-5 text-center"
            style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.22)" }}
          >
            <div className="text-[10px] font-mono tracking-widest text-[#a5a8ff] mb-2">一句话 · 你们的关系</div>
            <p className="text-sm text-white/90 leading-relaxed italic">「{result.shareLine}」</p>
          </div>
        ) : null}

        {result.highlights?.glow || result.highlights?.shadow ? (
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {result.highlights.glow ? (
              <div className="rounded-xl p-3" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <div className="text-[10px] font-mono text-[#a5a8ff] mb-1">高光</div>
                <p className="text-xs text-white/75 leading-relaxed">{result.highlights.glow}</p>
              </div>
            ) : null}
            {result.highlights.shadow ? (
              <div className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" }}>
                <div className="text-[10px] font-mono text-amber-200/80 mb-1">阴影</div>
                <p className="text-xs text-white/75 leading-relaxed">{result.highlights.shadow}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {result.bridge ? (
          <p className="text-sm text-white/60 leading-relaxed mb-5 px-1 border-l-2 border-[#6366f1]/50 pl-3">
            {result.bridge}
          </p>
        ) : null}

        <div className="space-y-4">
          {insights.map((it, i) => {
            const meta = INSIGHT_ICON[it.kind] ?? INSIGHT_ICON.strength;
            const Icon = meta.Icon;
            return (
              <motion.div
                key={`${it.kind}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
                >
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <div>
                  <div className="text-sm text-white font-medium">{it.title}</div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed whitespace-pre-line">{it.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm text-white/55 leading-relaxed mb-3 whitespace-pre-line">
          {result.prescription.warmup}
        </p>
        <CouplePrescriptionCard result={result} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {initiatorAttemptId ? (
          <Link
            to="/chat"
            search={chatRouteSearch(initiatorAttemptId)}
            className="rounded-2xl p-4 text-left hover:bg-white/[0.04] transition"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Bot className="h-5 w-5 mb-2" style={{ color: "#a5a8ff" }} />
            <div className="text-sm text-white font-medium">找 AI 分析师</div>
            <div className="text-[11px] text-white/50 mt-0.5">深聊双人报告</div>
          </Link>
        ) : (
          <Link
            to="/chat"
            className="rounded-2xl p-4 text-left hover:bg-white/[0.04] transition"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Bot className="h-5 w-5 mb-2" style={{ color: "#a5a8ff" }} />
            <div className="text-sm text-white font-medium">找 AI 分析师</div>
            <div className="text-[11px] text-white/50 mt-0.5">深聊双人报告</div>
          </Link>
        )}
        <button
          type="button"
          onClick={onShare}
          className="rounded-2xl p-4 text-left hover:bg-white/[0.04] transition"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Share2 className="h-5 w-5 mb-2" style={{ color: "#a5a8ff" }} />
          <div className="text-sm text-white font-medium">分享双人报告</div>
          <div className="text-[11px] text-white/50 mt-0.5">保存契合指数卡片</div>
        </button>
      </div>
    </section>
  );
}
