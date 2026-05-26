import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useState } from "react";
import type { Dimension } from "@/data/mockResult";
import { SELF_DIMENSION_BY_CODE, type SelfDimensionCode } from "@/data/selfSuiteSpec";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import { subjectLabel, subjectPossessive, subjectPronoun } from "@/lib/exampleSubjectCopy";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Props = {
  dimension: Dimension;
  attemptId?: string;
  defaultOpen?: boolean;
  exampleSubject?: ExampleSubject;
};

function positionLabels(code: string): { low: string; high: string } {
  const spec = SELF_DIMENSION_BY_CODE[code as SelfDimensionCode];
  if (!spec) return { low: "偏低", high: "偏高" };
  if (code === "SA2") return { low: "低焦虑", high: "高焦虑" };
  if (code === "SA3") return { low: "低回避", high: "高回避" };
  if (spec.scoreDirection === "reverse") return { low: "更开放", high: "更保守" };
  return { low: "还在展开", high: "更成熟" };
}

export function DimensionProfileCard({ dimension: d, attemptId, defaultOpen, exampleSubject }: Props) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const labels = positionLabels(d.key);
  const possessive = exampleSubject ? subjectPossessive(exampleSubject) : "你的";
  const pronoun = exampleSubject ? subjectPronoun(exampleSubject) : "你";
  const name = exampleSubject ? subjectLabel(exampleSubject) : null;
  const chatPrefill = `我想聊聊我的「${d.label}」维度。测试显示：${d.displaySummary ?? "这一维值得被看见"}。`;
  const coreQuestion = d.coreQuestion ?? "这一维在关系里的位置";
  const positionCaption = exampleSubject ? `${name} 在这一维上的位置` : `${possessive}在这段旅途里的位置`;
  const logicLead = exampleSubject
    ? `这一维要回答：${coreQuestion}`
    : `这一维要回答：${coreQuestion}`;
  const logicTail = exampleSubject
    ? `推演显示，${pronoun}在这一维是「${d.displaySummary}」—— 描述性语言，不是定论。`
    : `${possessive}当前表现是「${d.displaySummary}」—— 这是描述性语言，不是定论。`;

  return (
    <motion.div
      id={`dim-${d.key}`}
      layout
      className="rounded-xl border border-border/50 bg-secondary/25 p-4 scroll-mt-24 min-w-0"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 min-w-0">
        <div className="min-w-0">
          <div className="text-[15px] font-medium text-foreground">{d.label}</div>
        </div>
        <span className="text-[11px] text-muted-foreground leading-relaxed sm:text-right sm:max-w-[11rem]">
          {d.displaySummary}
        </span>
      </div>

      <div className="mt-4 min-w-0">
        <div className="text-[11px] text-muted-foreground mb-2">{positionCaption}</div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] text-muted-foreground font-mono min-w-0">
          <span className="w-10 sm:w-14 text-right shrink-0 leading-tight">{labels.low}</span>
          <div className="flex-1 h-2 rounded-full bg-secondary/80 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${d.value}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${d.color}, color-mix(in oklab, ${d.color} 70%, white))`,
                boxShadow: `0 0 10px -2px ${d.color}`,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-background"
              style={{ left: `calc(${d.value}% - 5px)`, background: d.color }}
            />
          </div>
          <span className="w-10 sm:w-14 shrink-0 leading-tight">{labels.high}</span>
        </div>
      </div>

      {d.coreQuestion || d.profileNote || d.detail ? (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
          <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition w-full">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            底层逻辑{exampleSubject ? "" : `：${coreQuestion}`}
          </CollapsibleTrigger>
          <CollapsibleContent className="text-[12px] text-foreground/65 mt-2 leading-relaxed pl-5 space-y-2">
            {d.detail ? (
              <p className="text-foreground/75 leading-[1.75]">{d.detail}</p>
            ) : null}
            {d.profileNote ? (
              <p className="text-foreground/75 leading-[1.75]">{d.profileNote}</p>
            ) : null}
            <p>
              {logicLead}。{logicTail}
            </p>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      {attemptId && !exampleSubject ? (
        <Link
          to="/chat"
          search={chatRouteSearch(attemptId, undefined, chatPrefill)}
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-[oklch(0.82_0.14_200)] hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          这个维度跟我聊聊
        </Link>
      ) : null}
    </motion.div>
  );
}
