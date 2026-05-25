import { motion, useInView } from "framer-motion";
import { Share2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { RosCoupleResult } from "@/data/rosTypes";
import {
  buildHeartbeatGeometry,
  copyCanvasToClipboard,
  drawDualHeartbeatShareCard,
  downloadCanvas,
} from "@/lib/rosShareCanvas";

function rkHeartbeatScore(v: number) {
  return Math.max(0, Math.min(100, 100 - v));
}

function rkLabelShort(v: number) {
  if (v <= 30) return "低";
  if (v <= 50) return "中";
  return "高";
}

export function RosCoupleHeartbeat({ result }: { result: RosCoupleResult }) {
  const W = 400;
  const H = 100;
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
  const [sharing, setSharing] = useState(false);

  const { youMap, taMap, maxGapKey } = useMemo(() => {
    const you: Record<string, number> = {};
    const ta: Record<string, number> = {};
    let maxGap = 0;
    let maxKey = "ev";
    for (const d of result.dims) {
      you[d.key] = d.key === "rk" ? rkHeartbeatScore(d.you) : d.you;
      ta[d.key] = d.key === "rk" ? rkHeartbeatScore(d.ta) : d.ta;
      if (d.key !== "rk") {
        const g = Math.abs(d.you - d.ta);
        if (g > maxGap) {
          maxGap = g;
          maxKey = d.key;
        }
      }
    }
    return { youMap: you, taMap: ta, maxGapKey: maxKey };
  }, [result.dims]);

  const youRk = result.dims.find((d) => d.key === "rk")?.you ?? 0;
  const taRk = result.dims.find((d) => d.key === "rk")?.ta ?? 0;
  const youGeo = buildHeartbeatGeometry(youMap, youRk, W, H);
  const taGeo = buildHeartbeatGeometry(taMap, taRk, W, H);
  const rkRisk = youRk > 60 || taRk > 60;

  const maxIdx = ["at", "in", "co", "ev", "rk"].indexOf(maxGapKey);

  const exportImage = async () => {
    setSharing(true);
    try {
      const canvas = document.createElement("canvas");
      drawDualHeartbeatShareCard(canvas, result);
      const copied = await copyCanvasToClipboard(canvas);
      if (copied) {
        toast.success("双人心跳图已复制");
      } else {
        downloadCanvas(canvas, `mirror-ros-couple-heartbeat-${Date.now()}.png`);
        toast.success("双人心跳图已保存");
      }
    } catch {
      toast.error("导出失败");
    } finally {
      setSharing(false);
    }
  };

  return (
    <section ref={sectionRef}>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">SIGNAL · 你们各自看到的心跳</div>
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="text-[10px] font-mono text-[#a5a8ff] mb-2">你的心跳（实线）</div>
        <motion.svg
          viewBox={`0 0 ${W} ${H + 16}`}
          className="w-full"
          animate={inView ? { y: [0, -2, 0] } : {}}
          transition={inView ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" } : {}}
        >
          <defs>
            <linearGradient id="coupleHbYou" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a5a8ff" />
            </linearGradient>
          </defs>
          <motion.path
            d={youGeo.d}
            fill="none"
            stroke="url(#coupleHbYou)"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.2 }}
          />
          {maxIdx >= 0 && inView ? (
            <motion.rect
              x={(maxIdx / 4) * W * 0.8 + W * 0.05}
              y={0}
              width={W * 0.18}
              height={H}
              fill="rgba(251,191,36,0.08)"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ) : null}
        </motion.svg>

        <div className="text-[10px] font-mono text-[#f0a5d0] mt-3 mb-2">对方的心跳（虚线）</div>
        <motion.svg
          viewBox={`0 0 ${W} ${H + 16}`}
          className="w-full"
          animate={inView ? { y: [0, 2, 0] } : {}}
          transition={inView ? { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 } : {}}
        >
          <motion.path
            d={taGeo.d}
            fill="none"
            stroke="#f0a5d0"
            strokeWidth={2}
            strokeDasharray="6 4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={inView ? { pathLength: 1, opacity: 0.85 } : {}}
            transition={{ duration: 1.4, delay: 0.2 }}
          />
          {rkRisk && inView ? (
            <motion.g animate={{ x: [-1, 1, -1] }} transition={{ duration: 0.5, repeat: Infinity }}>
              <circle cx={youGeo.points[4]?.x ?? W * 0.9} cy={youGeo.points[4]?.y ?? H * 0.5} r={3} fill="#f87171" />
            </motion.g>
          ) : null}
        </motion.svg>

        <div className="flex justify-between text-[10px] font-mono text-white/45 px-1 mt-2">
          {(["at", "in", "co", "ev", "rk"] as const).map((key) => {
            const dim = result.dims.find((d) => d.key === key);
            return (
              <span key={key} className={key === maxGapKey ? "text-amber-300/90" : ""}>
                {key.toUpperCase()}
                <br />
                <span className="text-white/60">
                  {key === "rk"
                    ? `${rkLabelShort(dim?.you ?? 0)}/${rkLabelShort(dim?.ta ?? 0)}`
                    : `${dim?.you}/${dim?.ta}`}
                </span>
              </span>
            );
          })}
        </div>

        <p className="text-xs text-white/55 text-center mt-3 leading-relaxed">
          你们的心跳不完全一样——
          <br />
          没有两段关系的心跳是相同的
        </p>

        <button
          type="button"
          disabled={sharing}
          onClick={exportImage}
          className="mt-3 w-full h-9 rounded-lg text-xs text-white/75 flex items-center justify-center gap-1.5 hover:bg-white/[0.04] transition disabled:opacity-50"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Share2 className="h-3.5 w-3.5" />
          {sharing ? "生成中…" : "分享双人心跳图"}
        </button>
      </div>
    </section>
  );
}
