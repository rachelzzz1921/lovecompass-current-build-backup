import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star, AlertCircle, Lightbulb, ArrowRight, Bot, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { RosSingleResult } from "@/data/rosTypes";
import { aiEnhancementPendingLabel, showAiEnhancementPending } from "@/lib/aiContentUx";
import { fetchAiEnhancementEnabled } from "@/lib/aiCapabilities";
import { useLongPress } from "@/hooks/useLongPress";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import {
  copyCanvasToClipboard,
  drawPrescriptionShareCard,
  downloadCanvas,
} from "@/lib/rosShareCanvas";

const INSIGHT_ICON: Record<string, { Icon: typeof Star; color: string; bg: string }> = {
  strength: { Icon: Star, color: "#a5a8ff", bg: "rgba(99,102,241,0.15)" },
  edge: { Icon: Star, color: "#a5a8ff", bg: "rgba(99,102,241,0.15)" },
  watch: { Icon: AlertCircle, color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  advice: { Icon: Lightbulb, color: "#34d399", bg: "rgba(52,211,153,0.15)" },
  action: { Icon: ArrowRight, color: "#f0a5d0", bg: "rgba(240,165,208,0.12)" },
};

function RxRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex gap-3 py-1.5">
      <div className="w-10 shrink-0 text-white/45 text-xs font-mono pt-0.5">{label}</div>
      <div className={`text-white/90 text-sm font-mono leading-relaxed ${multiline ? "whitespace-pre-line" : ""}`}>{value}</div>
    </div>
  );
}

function RosPrescriptionCard({
  result,
  exampleMode = false,
  exampleSubject,
  examplePartner,
}: {
  result: RosSingleResult;
  exampleMode?: boolean;
  exampleSubject?: ExampleSubject;
  examplePartner?: string;
}) {
  const exporting = useRef(false);

  const exportRx = async () => {
    if (exporting.current) return;
    exporting.current = true;
    try {
      const canvas = document.createElement("canvas");
      drawPrescriptionShareCard(canvas, result);
      const copied = await copyCanvasToClipboard(canvas);
      if (copied) {
        toast.success("处方签图片已复制");
      } else {
        downloadCanvas(canvas, `mirror-ros-rx-${Date.now()}.png`);
        toast.success("处方签图片已保存");
      }
    } catch {
      toast.error("导出失败");
    } finally {
      exporting.current = false;
    }
  };

  const longPress = useLongPress({ onLongPress: exportRx });
  const rxTitle =
    exampleMode && exampleSubject && examplePartner
      ? `${exampleSubject.name}与${examplePartner}的关系处方`
      : exampleMode
        ? "这段关系处方"
        : "你们的关系处方";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={exampleMode ? "关系处方签" : "关系处方签，长按导出图片"}
      className="rounded-2xl p-5 relative select-none touch-manipulation cursor-default"
      style={{ border: "1.5px dashed rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.04)" }}
      {...(exampleMode ? {} : longPress)}
    >
      {!exampleMode ? (
        <div className="absolute top-3 right-3 text-[9px] font-mono text-white/30 tracking-wide pointer-events-none">
          长按导出
        </div>
      ) : null}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-white/10">
        <div className="flex items-center gap-2">
          <div className="font-display text-2xl font-bold" style={{ color: "#a5a8ff" }}>Rx</div>
          <div className="text-xs text-white/70">{rxTitle}</div>
        </div>
        <div className="font-mono text-[10px] tracking-widest text-white/35">MIRROR · ROS</div>
      </div>
      <RxRow label="主诉" value={result.prescription?.chiefComplaint ?? "联结感"} />
      <RxRow label="建议" value={result.prescription?.rx ?? "每周一次不带手机的两小时对话"} multiline />
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-white/10">
        <span className="text-xs text-white/50 font-mono">复诊</span>
        <span className="text-sm text-white/85 font-mono">{result.prescription?.followUp ?? "三个月后"}</span>
      </div>
    </div>
  );
}

export function RosResultNext({
  result,
  attemptId,
  onShare,
  exampleMode = false,
  exampleSubject,
  examplePartner,
}: {
  result: RosSingleResult;
  attemptId: string;
  onShare: () => void;
  exampleMode?: boolean;
  exampleSubject?: ExampleSubject;
  examplePartner?: string;
}) {
  const [aiEnhanceEnabled, setAiEnhanceEnabled] = useState(false);

  useEffect(() => {
    void fetchAiEnhancementEnabled().then(setAiEnhanceEnabled);
  }, []);

  const aiPending = showAiEnhancementPending(
    result.aiContent,
    result.insights.length,
    aiEnhanceEnabled,
  );

  return (
    <section className="space-y-7">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="text-[10px] tracking-[0.3em] font-mono text-white/40">NEXT · AI 分析师摘要</div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded text-white/45 border border-white/10">BASIC</span>
          {aiPending ? (
            <span className="text-[9px] text-white/35 ml-auto animate-pulse">{aiEnhancementPendingLabel()}</span>
          ) : null}
        </div>
        <div className="space-y-4">
          {result.insights.map((it, i) => {
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}>
                  <Icon className="h-4 w-4" style={{ color: meta.color }} />
                </div>
                <div>
                  <div className="text-sm text-white font-medium">{it.title}</div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">{it.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm text-white/55 leading-relaxed mb-3 whitespace-pre-line">
          {result.prescription?.warmup}
        </p>
        <RosPrescriptionCard
          result={result}
          exampleMode={exampleMode}
          exampleSubject={exampleSubject}
          examplePartner={examplePartner}
        />
      </div>

      {!exampleMode ? (
        <>
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/chat"
          search={chatRouteSearch(attemptId)}
          className="rounded-2xl p-4 text-left hover:bg-white/[0.04] transition"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Bot className="h-5 w-5 mb-2" style={{ color: "#a5a8ff" }} />
          <div className="text-sm text-white font-medium">找 AI 分析师</div>
          <div className="text-[11px] text-white/50 mt-0.5">深聊这份报告</div>
        </Link>
        <button
          type="button"
          onClick={onShare}
          className="rounded-2xl p-4 text-left hover:bg-white/[0.04] transition"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Share2 className="h-5 w-5 mb-2" style={{ color: "#a5a8ff" }} />
          <div className="text-sm text-white font-medium">生成分享卡片</div>
          <div className="text-[11px] text-white/50 mt-0.5">保存关系画像图</div>
        </button>
      </div>
        </>
      ) : null}
    </section>
  );
}
