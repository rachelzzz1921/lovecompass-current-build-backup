import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, EyeOff, KeyRound, Shield } from "lucide-react";
import type { CoreTrait, Dimension, SelfResult } from "@/data/mockResult";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BehaviorCarousel } from "@/components/self-result/BehaviorCarousel";
import { DimensionProfileCard } from "@/components/self-result/DimensionProfileCard";
import { SelfDimensionRadar } from "@/components/self-result/SelfDimensionRadar";
import { TraitEvidenceSheet } from "@/components/self-result/TraitEvidenceSheet";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import { subjectPossessive, subjectPronoun } from "@/lib/exampleSubjectCopy";

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
  const [evidenceTrait, setEvidenceTrait] = useState<CoreTrait | null>(null);

  const possessive = exampleSubject ? subjectPossessive(exampleSubject) : "你的";
  const pronoun = exampleSubject ? subjectPronoun(exampleSubject) : "你";
  const name = exampleSubject?.name;

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

        <TabsContent value="radar" className="mt-5">
          <div className="bg-glass rounded-2xl p-4 sm:p-6 md:p-7 min-w-0">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// SIX-AXIS MAP</div>
            <h3 className="font-display text-lg mt-1 text-foreground">六维画像</h3>
            <p className="text-[12px] text-muted-foreground mt-1 mb-5 leading-relaxed max-w-md mx-auto text-center lg:mx-0 lg:text-left">
              外圈六轴为关系六维；实线为{exampleSubject ? `${name} 的` : "你的"}得分，虚线为同依恋类型的平均轮廓。
            </p>
            <SelfDimensionRadar
              dimensions={result.dimensions}
              baseline={result.radarBaseline}
              subjectLabel={exampleSubject ? `${name} 的` : undefined}
            />

            <div className="mt-8 pt-6 border-t border-border/40">
              <h4 className="font-display text-base text-foreground mb-1">各维位置</h4>
              <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
                横轴为得分区间；右侧短句是当前区间的描述，不是定论。
              </p>
              <div className="space-y-3">
                {result.dimensions.map((d) => (
                  <DimensionProfileCard key={d.key} dimension={d} exampleSubject={exampleSubject} />
                ))}
              </div>
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
