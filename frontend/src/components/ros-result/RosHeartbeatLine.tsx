import { Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { RosSingleResult } from "@/data/rosTypes";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import { rosBlindSpotChatPrefill } from "@/lib/rosLayerChatPrefill";
import {
  buildHeartbeatGeometry,
  copyCanvasToClipboard,
  drawHeartbeatShareCard,
  downloadCanvas,
} from "@/lib/rosShareCanvas";

function rkLabelShort(v: number) {
  if (v <= 30) return "低";
  if (v <= 50) return "中";
  return "高";
}

export function RosHeartbeatLine({ result }: { result: RosSingleResult }) {
  const W = 400;
  const H = 120;
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
  const [sharing, setSharing] = useState(false);

  const scoreMap = Object.fromEntries(result.dims.map((d) => [d.key, d.value]));
  const rk = result.dims.find((d) => d.key === "rk")?.value ?? 0;
  const { d, points, rkRisk } = buildHeartbeatGeometry(scoreMap, rk, W, H);

  const exportImage = async () => {
    setSharing(true);
    try {
      const canvas = document.createElement("canvas");
      drawHeartbeatShareCard(canvas, result);
      const copied = await copyCanvasToClipboard(canvas);
      if (copied) {
        toast.success("心跳线图片已复制，可直接粘贴分享");
      } else {
        downloadCanvas(canvas, `mirror-ros-heartbeat-${Date.now()}.png`);
        toast.success("心跳线图片已保存");
      }
    } catch {
      toast.error("导出失败，请重试");
    } finally {
      setSharing(false);
    }
  };

  return (
    <section ref={sectionRef}>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">SIGNAL · 这段关系的心跳</div>
      <div className="rounded-2xl p-4 relative overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <motion.svg
          viewBox={`0 0 ${W} ${H + 20}`}
          className="w-full"
          animate={inView ? { y: [0, -3, 0] } : { y: 0 }}
          transition={inView ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        >
          <defs>
            <linearGradient id="hbGrad" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#f0a5d0" />
            </linearGradient>
          </defs>
          <motion.path
            d={d}
            fill="none"
            stroke="url(#hbGrad)"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.4 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          {rkRisk && inView && (
            <motion.g
              animate={{ x: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 0.45, repeat: Infinity }}
            >
              <circle
                cx={points[4]?.x ?? W * 0.9}
                cy={points[4]?.y ?? H * 0.5}
                r={4}
                fill="#f87171"
              />
            </motion.g>
          )}
        </motion.svg>
        <div className="flex justify-between text-[10px] font-mono text-white/45 px-1 mt-1">
          {(["at", "in", "co", "ev", "rk"] as const).map((key) => {
            const code = key.toUpperCase();
            const val = key === "rk" ? rkLabelShort(rk) : scoreMap[key];
            return (
              <span key={key}>
                {code}
                <br />
                <span className="text-white/65">{val}</span>
              </span>
            );
          })}
        </div>
        <p className="text-xs text-white/55 text-center mt-3 leading-relaxed">
          每段关系都有自己的节律
          <br />
          这是你们独有的心跳
        </p>
        <button
          type="button"
          disabled={sharing}
          onClick={exportImage}
          className="mt-3 w-full h-9 rounded-lg text-xs text-white/75 flex items-center justify-center gap-1.5 hover:bg-white/[0.04] transition disabled:opacity-50"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Share2 className="h-3.5 w-3.5" />
          {sharing ? "生成中…" : "分享这张图"}
        </button>
      </div>
    </section>
  );
}

export function RosBlindSpot({
  text,
  attemptId,
  result,
}: {
  text?: string;
  attemptId: string;
  result: RosSingleResult;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const prefill = rosBlindSpotChatPrefill(result, text);
  const preview = text.length > 72 ? `${text.slice(0, 72)}…` : text;

  return (
    <div
      className="mt-4 rounded-2xl p-4"
      style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}
    >
      <div className="text-xs font-mono text-amber-200/80 mb-1">⚠ 你可能没有注意到的</div>
      <p className="text-sm text-white/80 leading-relaxed">{expanded ? text : preview}</p>
      {!expanded && text.length > 72 ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 text-xs text-amber-200/90 hover:underline"
        >
          展开全文 →
        </button>
      ) : null}
      <Link
        to="/chat"
        search={chatRouteSearch(attemptId, undefined, prefill)}
        className="inline-flex items-center gap-1 mt-3 text-xs px-3 py-1.5 rounded-lg text-amber-100/90 hover:bg-amber-500/10 transition"
        style={{ border: "1px solid rgba(251,191,36,0.3)" }}
      >
        展开了解盲区 · 告诉 AI 分析师 →
      </Link>
    </div>
  );
}
