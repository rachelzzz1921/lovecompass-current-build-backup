import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight, Eye, EyeOff, KeyRound, Shield } from "lucide-react";
import type { CoreTrait, Dimension, RadarBaselinePoint, SelfResult } from "@/data/mockResult";
import { RadarChart } from "@/components/RadarChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BehaviorCarousel } from "@/components/self-result/BehaviorCarousel";
import { DimensionProfileCard } from "@/components/self-result/DimensionProfileCard";
import { TraitEvidenceSheet } from "@/components/self-result/TraitEvidenceSheet";

const TRAIT_ICON = {
  shield: { Icon: Shield, tint: "oklch(0.82 0.14 200)" },
  key: { Icon: KeyRound, tint: "oklch(0.78 0.15 165)" },
  eye: { Icon: EyeOff, tint: "oklch(0.82 0.14 75)" },
} as const;

type Props = {
  result: SelfResult;
  attemptId?: string;
};

export function SelfActOneMirror({ result, attemptId }: Props) {
  const [subTab, setSubTab] = useState("traits");
  const [activeAxis, setActiveAxis] = useState<number | null>(null);
  const [evidenceTrait, setEvidenceTrait] = useState<CoreTrait | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const baseline: RadarBaselinePoint[] =
    result.radarBaseline ??
    result.dimensions.map((d) => ({ key: d.key, label: d.label, value: Math.round(d.value * 0.82) }));

  const handleAxisClick = (index: number) => {
    setActiveAxis(index);
    const key = result.dimensions[index]?.key;
    if (!key) return;
    const el = cardRefs.current[key];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="act-i" className="scroll-mt-20">
      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// ACT I</div>
      <h2 className="font-display text-xl mt-1 mb-6 text-foreground">了解自己</h2>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <div className="border-b border-border/40 -mx-1 px-1 overflow-x-auto scrollbar-none">
          <TabsList className="bg-transparent p-0 h-auto gap-1">
            {[
              { v: "traits", label: "你的特质" },
              { v: "radar", label: "你的画像" },
              { v: "scenes", label: "你会怎样" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="relative rounded-none bg-transparent shadow-none px-3 py-3 text-[13px] text-muted-foreground border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[oklch(0.82_0.14_200)] data-[state=active]:border-[oklch(0.82_0.14_200)] transition-colors"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="traits" className="mt-5">
          <div className="bg-glass rounded-2xl p-6 md:p-7">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// YOUR TRAITS</div>
            <h3 className="font-display text-lg mt-1 mb-5 text-foreground">三个核心特质</h3>
            <div className="space-y-3">
              {result.coreTraits.map((t, i) => (
                <TraitCard
                  key={i}
                  trait={t}
                  index={i}
                  dimensions={result.dimensions}
                  onEvidence={setEvidenceTrait}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="radar" className="mt-5 space-y-5">
          <div className="bg-glass rounded-2xl p-6 md:p-7">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// SIX-AXIS MAP</div>
            <h3 className="font-display text-lg mt-1 text-foreground">六维画像</h3>
            <p className="text-[12px] text-muted-foreground mt-1 mb-4">
              虚线 = 该类型的平均轮廓 · 实线 = 你的实际得分 · 点击轴查看详情
            </p>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <RadarChart
                data={result.dimensions}
                baseline={baseline}
                size={280}
                onAxisClick={handleAxisClick}
                activeAxis={activeAxis}
              />
              <div className="flex-1 w-full space-y-2.5">
                {result.dimensions.map((d, i) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => handleAxisClick(i)}
                    className={`flex w-full items-center gap-2.5 text-sm text-left rounded-lg px-2 py-1.5 transition ${
                      activeAxis === i ? "bg-secondary/50" : "hover:bg-secondary/30"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-foreground/80 flex-1">{d.label}</span>
                    <span className="text-[11px] text-muted-foreground">{d.displaySummary}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-glass rounded-2xl p-6 md:p-7">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// DIMENSION PROFILES</div>
            <h3 className="font-display text-lg mt-1 mb-5 text-foreground">维度档案</h3>
            <div className="space-y-3">
              {result.dimensions.map((d) => (
                <div key={d.key} ref={(el) => { cardRefs.current[d.key] = el; }}>
                  <DimensionProfileCard
                    dimension={d}
                    attemptId={attemptId}
                    defaultOpen={activeAxis !== null && result.dimensions[activeAxis]?.key === d.key}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scenes" className="mt-5">
          <div className="bg-glass rounded-2xl p-6 md:p-7 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-[oklch(0.72_0.18_360/0.25)] to-[oklch(0.68_0.18_285/0.15)] blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// RELATIONSHIP SIMULATION</div>
              <h3 className="font-display text-lg mt-1 text-foreground">关系里的你</h3>
              <p className="text-[12px] text-foreground/60 mt-1 mb-5">三个高频场景里，你最可能呈现的样子。</p>
              <BehaviorCarousel behaviors={result.behaviors} attemptId={attemptId} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <TraitEvidenceSheet
        trait={evidenceTrait}
        open={Boolean(evidenceTrait)}
        onOpenChange={(open) => {
          if (!open) setEvidenceTrait(null);
        }}
      />
    </section>
  );
}

function TraitCard({
  trait: t,
  index: i,
  dimensions,
  onEvidence,
}: {
  trait: CoreTrait;
  index: number;
  dimensions: Dimension[];
  onEvidence: (trait: CoreTrait) => void;
}) {
  const { Icon, tint } = TRAIT_ICON[t.icon];
  const linkedDim = dimensions.find(
    (d) => t.source_dimension === d.key || t.body.includes(d.label),
  );
  const hasEvidence = Boolean(t.evidence?.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className={`relative flex gap-3.5 p-4 rounded-xl border transition-shadow hover:shadow-lg ${
        t.highlight
          ? "border-[oklch(0.68_0.18_285/0.45)] bg-[oklch(0.50_0.20_285/0.08)]"
          : "border-border/50 bg-secondary/30"
      }`}
    >
      {hasEvidence ? (
        <button
          type="button"
          onClick={() => onEvidence(t)}
          className="absolute top-3 right-3 flex items-center gap-0.5 text-[10px] font-mono tracking-[0.12em] text-muted-foreground hover:text-[oklch(0.82_0.14_200)] transition"
        >
          答题依据 <ArrowUpRight className="h-3 w-3" />
        </button>
      ) : null}
      <div
        className="shrink-0 w-9 h-9 rounded-lg grid place-items-center"
        style={{ background: `color-mix(in oklab, ${tint} 18%, transparent)` }}
      >
        <Icon className="h-4 w-4" style={{ color: tint }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-foreground">{t.title}</div>
        <div className="text-[13px] text-foreground/70 mt-1.5 leading-[1.75]">{t.body}</div>
        {linkedDim ? (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-secondary/80 overflow-hidden max-w-[140px]">
              <div
                className="h-full rounded-full"
                style={{ width: `${linkedDim.value}%`, background: linkedDim.color }}
              />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{linkedDim.key}</span>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
