import { RelationshipWeatherHero } from "@/components/ros-result/RelationshipWeatherHero";
import { RosStageCurve } from "@/components/ros-result/RosStageCurve";
import { REL_STAGES, type RosCoupleResult } from "@/data/rosTypes";
import { useCountUp } from "@/hooks/useCountUp";

const GAP_COLOR: Record<string, string> = {
  green: "#34d399",
  blue: "#60a5fa",
  amber: "#fbbf24",
};

export function RosCoupleOverview({ result }: { result: RosCoupleResult }) {
  const stage = REL_STAGES[result.stageId - 1];
  const youScore = result.perspectives?.you.score ?? result.resonance.score;
  const taScore = result.perspectives?.ta.score ?? result.resonance.score;
  const gap = result.perceptionGap;
  const youDisplay = useCountUp(youScore, 1200);
  const taDisplay = useCountUp(taScore, 1200);
  const fitDisplay = useCountUp(result.resonance.score, 1400);

  return (
    <section className="space-y-5">
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40">OVERVIEW · 你们现在怎么样</div>

      <RelationshipWeatherHero
        weather={result.weather}
        resonance={result.resonance.score}
        tier={result.resonance.tier}
        tierDesc={result.resonance.desc}
        stageName={stage?.name ?? "重建信任"}
      />

      <div
        className="rounded-2xl p-4 grid grid-cols-2 gap-4"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-display text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            你
          </div>
          <div className="text-[10px] font-mono text-white/40 mt-2 tracking-widest">你的视角</div>
          <div className="font-display text-3xl text-white tabular-nums mt-1">{youDisplay}</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-display text-white/90"
            style={{ background: "rgba(240,165,208,0.25)", border: "1px solid rgba(240,165,208,0.35)" }}>
            TA
          </div>
          <div className="text-[10px] font-mono text-white/40 mt-2 tracking-widest">对方视角</div>
          <div className="font-display text-3xl text-white tabular-nums mt-1">{taDisplay}</div>
        </div>
      </div>

      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
      >
        <div className="text-[10px] font-mono text-white/40 tracking-widest">双人契合指数</div>
        <div className="font-display text-[42px] text-white tabular-nums leading-none mt-1">{fitDisplay}</div>
        <div className="text-sm mt-1" style={{ color: "#a5a8ff" }}>{result.resonance.tier}</div>
        {result.resonance.desc ? (
          <p className="text-xs text-white/55 mt-1">{result.resonance.desc}</p>
        ) : null}
      </div>

      {gap ? (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${GAP_COLOR[gap.color] ?? "#60a5fa"}33`,
          }}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-white/45">感知差值</span>
            <span className="font-display text-xl tabular-nums" style={{ color: GAP_COLOR[gap.color] }}>
              {gap.value}
            </span>
            <span className="text-xs ml-auto" style={{ color: GAP_COLOR[gap.color] }}>
              {gap.label}
            </span>
          </div>
          <p className="text-sm text-white/70 mt-2 leading-relaxed">{gap.message}</p>
        </div>
      ) : null}

      <div className="flex items-baseline justify-between px-1">
        <div className="font-display text-xl text-white">{result.type.name}</div>
        <div className="text-xs text-white/50">
          {result.stageId} {stage?.name ?? "重建信任"}
        </div>
      </div>

      <RosStageCurve currentId={result.stageId} />
    </section>
  );
}
