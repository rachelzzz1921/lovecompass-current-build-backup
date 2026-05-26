import { RadarChart } from "@/components/RadarChart";
import type { RosSingleResult } from "@/data/rosTypes";

const LAYER_LABELS: Record<string, string> = {
  at: "吸引",
  in: "互动",
  co: "兼容",
  ev: "走向",
  rk: "风险",
};

/** ROS 五维雷达：RK 越高风险越大，展示时反转以便「越大越好」的视觉一致 */
function displayScore(key: string, value: number) {
  return key === "rk" ? Math.max(0, 100 - value) : value;
}

export function RosLayerRadar({ result }: { result: RosSingleResult }) {
  const data = result.dims.map((d) => ({
    key: d.key,
    label: LAYER_LABELS[d.key] ?? d.label,
    value: displayScore(d.key, d.value),
    color: d.color,
  }));

  return (
    <div className="mb-5 rounded-2xl p-4"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-[10px] font-mono tracking-widest text-white/35 mb-3 text-center">五维雷达 · 一眼扫结构</div>
      <div className="flex justify-center">
        <RadarChart data={data} size={280} variant="violet" />
      </div>
      <p className="text-[10px] text-white/40 text-center mt-2 leading-relaxed">
        风险层已反转显示（外圈=更安全）。点开下方手风琴看答题证据。
      </p>
    </div>
  );
}
