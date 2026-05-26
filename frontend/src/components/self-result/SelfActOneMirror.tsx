import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowUpRight, ArrowRight, Eye, EyeOff, KeyRound, Shield } from "lucide-react";
import type { CoreTrait, Dimension, RadarBaselinePoint, SelfResult } from "@/data/mockResult";
import { RadarChart } from "@/components/RadarChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BehaviorCarousel } from "@/components/self-result/BehaviorCarousel";
import { DimensionProfileCard } from "@/components/self-result/DimensionProfileCard";
import { TraitEvidenceSheet } from "@/components/self-result/TraitEvidenceSheet";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import { subjectPossessive, subjectPronoun } from "@/lib/exampleSubjectCopy";
import { useContainerWidth } from "@/hooks/use-container-width";

const TRAIT_ICON = {
  shield: { Icon: Shield, tint: "oklch(0.82 0.14 200)" },
  key: { Icon: KeyRound, tint: "oklch(0.78 0.15 165)" },
  eye: { Icon: EyeOff, tint: "oklch(0.82 0.14 75)" },
} as const;

type Props = {
  result: SelfResult;
  attemptId?: string;
  exampleSubject?: ExampleSubject;
};

export function SelfActOneMirror({ result, attemptId, exampleSubject }: Props) {
  const [subTab, setSubTab] = useState("traits");
  const [activeAxis, setActiveAxis] = useState<number | null>(null);
  const [evidenceTrait, setEvidenceTrait] = useState<CoreTrait | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const radarWrapRef = useRef<HTMLDivElement>(null);
  const radarSize = useContainerWidth(radarWrapRef, 300);

  const possessive = exampleSubject ? subjectPossessive(exampleSubject) : "你的";
  const pronoun = exampleSubject ? subjectPronoun(exampleSubject) : "你";
  const name = exampleSubject?.name;

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

  const subTabs = [
    { v: "traits", step: 1, label: `${possessive}特质`, hint: "三个核心侧写" },
    { v: "radar", step: 2, label: `${possessive}画像`, hint: "六维雷达" },
    { v: "scenes", step: 3, label: `${pronoun}会怎样`, hint: "关系场景" },
  ] as const;

  return (
    <section id="act-i" className="scroll-mt-32 pb-4 w-full min-w-0">
      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// ACT I</div>
      <h2 className="font-display text-xl mt-1 mb-2 text-foreground">
        {exampleSubject ? `若 ${name} 来做测评` : "了解自己"}
      </h2>
      <p className="text-[12px] text-muted-foreground mb-6 max-w-md">
        特质 · 六维 · 场景 —— 三层都是{exampleSubject ? `${name} 的` : "你的"}测评数据，不是文学对照。
      </p>

      <Tabs value={subTab} onValueChange={setSubTab}>
        {exampleSubject ? (
          <div className="mb-4 rounded-xl border border-[oklch(0.68_0.18_285/0.28)] bg-[oklch(0.50_0.20_285/0.06)] p-3 sm:p-4">
            <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground mb-2.5">
              // ACT I · 建议顺序
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1">
              {subTabs.map((t, index) => {
                const active = subTab === t.v;
                return (
                  <div key={t.v} className="flex items-center gap-1 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setSubTab(t.v)}
                      className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                        active
                          ? "border-[oklch(0.82_0.14_200/0.45)] bg-[oklch(0.50_0.16_200/0.12)]"
                          : "border-border/40 bg-background/20 hover:border-border/60"
                      }`}
                    >
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px] ${
                          active
                            ? "bg-[oklch(0.82_0.14_200)] text-primary-foreground"
                            : "bg-secondary/70 text-muted-foreground"
                        }`}
                      >
                        {t.step}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] text-foreground/90 truncate">{t.label}</span>
                        <span className="block text-[10px] text-muted-foreground truncate">{t.hint}</span>
                      </span>
                    </button>
                    {index < subTabs.length - 1 ? (
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/45 hidden sm:block" aria-hidden />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="border-b border-border/40 -mx-1 px-1 overflow-x-auto scrollbar-none">
          <TabsList className="bg-transparent p-0 h-auto gap-1">
            {subTabs.map((t) => (
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
          <div className="bg-glass rounded-2xl p-4 sm:p-6 md:p-7 min-w-0">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// PROFILE TRAITS</div>
            <h3 className="font-display text-lg mt-1 mb-5 text-foreground">
              {exampleSubject ? `${name} 的三个核心特质` : "三个核心特质"}
            </h3>
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
          <div className="bg-glass rounded-2xl p-4 sm:p-6 md:p-7 min-w-0">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// SIX-AXIS MAP</div>
            <h3 className="font-display text-lg mt-1 text-foreground">六维画像</h3>
            <p className="text-[12px] text-muted-foreground mt-1 mb-4 leading-relaxed">
              虚线 = 该类型的平均轮廓 · 实线 = {exampleSubject ? `${name} 的` : "你的"}实际得分 · 点击轴查看详情
            </p>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-5 lg:gap-6 min-w-0">
              <div ref={radarWrapRef} className="w-full max-w-[320px] mx-auto lg:mx-0 shrink-0">
                {radarSize >= 260 ? (
                  <RadarChart
                    data={result.dimensions}
                    baseline={baseline}
                    size={radarSize}
                    onAxisClick={handleAxisClick}
                    activeAxis={activeAxis}
                  />
                ) : null}
              </div>
              <div className="flex-1 w-full min-w-0 space-y-2">
                {result.dimensions.map((d, i) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => handleAxisClick(i)}
                    className={`flex w-full min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:gap-2.5 text-sm text-left rounded-lg px-2 py-2 transition ${
                      activeAxis === i ? "bg-secondary/50" : "hover:bg-secondary/30"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 min-w-0 sm:flex-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-foreground/80">{d.label}</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-relaxed sm:max-w-[52%] sm:text-right">
                      {d.displaySummary}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-glass rounded-2xl p-4 sm:p-6 md:p-7 min-w-0">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// DIMENSION PROFILES</div>
            <h3 className="font-display text-lg mt-1 mb-5 text-foreground">维度档案</h3>
            <div className="space-y-3">
              {result.dimensions.map((d) => (
                <div key={d.key} ref={(el) => { cardRefs.current[d.key] = el; }}>
                  <DimensionProfileCard
                    dimension={d}
                    attemptId={attemptId}
                    exampleSubject={exampleSubject}
                    defaultOpen={activeAxis !== null && result.dimensions[activeAxis]?.key === d.key}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scenes" className="mt-5">
          <div className="bg-glass rounded-2xl p-4 sm:p-6 md:p-7 relative overflow-hidden min-w-0">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-[oklch(0.72_0.18_360/0.25)] to-[oklch(0.68_0.18_285/0.15)] blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// RELATIONSHIP SIMULATION</div>
              <h3 className="font-display text-lg mt-1 text-foreground">
                {exampleSubject ? `关系里的 ${name}` : "关系里的你"}
              </h3>
              <p className="text-[12px] text-foreground/60 mt-1 mb-5">
                三个高频场景里，{pronoun}最可能呈现的样子。
              </p>
              <BehaviorCarousel behaviors={result.behaviors} attemptId={attemptId} exampleMode={Boolean(exampleSubject)} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-10 pt-8 border-t border-dashed border-border/45">
        <p className="text-center font-mono text-[10px] tracking-[0.34em] text-muted-foreground/75">
          ACT I · 数据画像 · 完
        </p>
      </div>

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
            <span className="text-[10px] text-muted-foreground">{linkedDim.label}</span>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
