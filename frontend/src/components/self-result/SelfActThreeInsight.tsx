import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle, Heart, Compass, Loader2 } from "lucide-react";
import type { Insight, SelfResult } from "@/data/mockResult";
import { GrowthTimeMachine } from "@/components/self-result/GrowthTimeMachine";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import { Button } from "@/components/ui/button";

const INSIGHT_ICON = {
  strength: { icon: TrendingUp, color: "text-[oklch(0.78_0.15_165)]", bg: "bg-[oklch(0.50_0.18_165/0.15)]" },
  watch: { icon: AlertCircle, color: "text-[oklch(0.82_0.14_75)]", bg: "bg-[oklch(0.55_0.18_75/0.15)]" },
  match: { icon: Heart, color: "text-[oklch(0.72_0.18_360)]", bg: "bg-[oklch(0.55_0.20_355/0.15)]" },
  growth: { icon: Compass, color: "text-[oklch(0.82_0.14_200)]", bg: "bg-[oklch(0.55_0.16_200/0.15)]" },
} as const;

type Props = {
  result: SelfResult;
  attemptId?: string;
  reportMarkdown?: string;
  reportLoading?: boolean;
  reportError?: string | null;
  showDeepReport?: boolean;
  exampleSubject?: ExampleSubject;
  onRequestDeepReport?: () => void;
  deepReportRequesting?: boolean;
};

export function SelfActThreeInsight({
  result,
  attemptId,
  reportMarkdown,
  reportLoading = false,
  reportError = null,
  showDeepReport = true,
  exampleSubject,
  onRequestDeepReport,
  deepReportRequesting = false,
}: Props) {
  return (
    <section id="act-iii" className="scroll-mt-32 mt-12 md:mt-16 w-full min-w-0">
      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// ACT III</div>
      <h2 className="font-display text-xl mt-1 mb-6 text-foreground">看见方向</h2>

      <div className="bg-glass rounded-2xl p-4 sm:p-6 md:p-7 min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5 min-w-0">
          <div className="min-w-0">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// AI ANALYST SUMMARY</div>
            <h3 className="font-display text-lg mt-1 text-foreground">
              {exampleSubject ? `${exampleSubject.name} · 分析师摘要` : "AI 分析师摘要"}
            </h3>
          </div>
          <span className="chip chip-violet font-mono shrink-0 self-start">
            <Sparkles className="h-2.5 w-2.5" />{" "}
            {exampleSubject ? "EXAMPLE" : reportMarkdown ? "FULL" : result.aiContent?.mode === "ai" ? "AI" : "BASIC"}
          </span>
        </div>

        {reportLoading ? (
          <div className="mb-4 rounded-xl border border-[oklch(0.82_0.14_200/0.25)] bg-[oklch(0.50_0.16_200/0.08)] px-4 py-3 text-sm text-foreground/75 animate-pulse">
            分析师正在整理你的报告…
          </div>
        ) : null}
        {reportError ? (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-foreground/75">
            深度报告暂未生成：{reportError}
          </div>
        ) : null}

        <div className="space-y-2.5">
          {result.insights.map((ins, i) => (
            <InsightCard key={ins.kind} insight={ins} index={i} />
          ))}
        </div>

        {showDeepReport && reportMarkdown ? (
          <article className="mt-6 pt-6 border-t border-border/40 prose prose-invert max-w-none prose-headings:font-display prose-headings:text-gradient-violet prose-p:text-foreground/85 prose-li:text-foreground/85">
            <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
          </article>
        ) : showDeepReport && !exampleSubject && !reportMarkdown && !reportLoading ? (
          <div className="mt-6 pt-6 border-t border-border/40 text-center">
            <p className="text-[13px] text-muted-foreground mb-3">完整深度报告可在后台继续生成</p>
            {onRequestDeepReport ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deepReportRequesting}
                onClick={onRequestDeepReport}
                className="rounded-full chip-violet font-mono text-[10px] tracking-wide"
              >
                {deepReportRequesting ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> 正在生成…
                  </>
                ) : (
                  <>解锁完整深度报告 →</>
                )}
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 chip chip-violet font-mono text-[10px]">
                解锁完整深度报告 →
              </span>
            )}
          </div>
        ) : null}

        {exampleSubject ? null : <GrowthTimeMachine result={result} attemptId={attemptId} />}
      </div>
    </section>
  );
}

function InsightCard({ insight: ins, index: i }: { insight: Insight; index: number }) {
  const cfg = INSIGHT_ICON[ins.kind];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.06 * i }}
      className="flex gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border/40"
    >
      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-medium text-foreground">{ins.title}</div>
        <div className="text-[13px] text-foreground/70 mt-1 leading-relaxed">{ins.body}</div>
      </div>
    </motion.div>
  );
}
