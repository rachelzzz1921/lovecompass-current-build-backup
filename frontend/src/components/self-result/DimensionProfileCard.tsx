import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Dimension } from "@/data/mockResult";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import { subjectLabel } from "@/lib/exampleSubjectCopy";
import { positionLabelsForDimension } from "@/lib/selfDimensionLogic";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Props = {
  dimension: Dimension;
  exampleSubject?: ExampleSubject;
};

export function DimensionProfileCard({ dimension: d, exampleSubject }: Props) {
  const [open, setOpen] = useState(false);
  const labels = positionLabelsForDimension(d.key);
  const name = exampleSubject ? subjectLabel(exampleSubject) : null;
  const logic = d.underlyingLogic;
  const headline = d.detail ?? logic?.headline;
  const positionCaption = exampleSubject ? `${name} 在这一维上的位置` : "你在这段旅途里的位置";
  const hasLogic = Boolean(
    logic?.measure || logic?.interpretation || logic?.inRelationship || logic?.growthHint,
  );

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
        <span className="text-[11px] text-muted-foreground leading-relaxed sm:text-right sm:max-w-[11rem] shrink-0">
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

      {headline ? (
        <p className="mt-4 text-[13px] leading-[1.75] text-foreground/80 italic border-l-2 border-border/50 pl-3">
          「{headline}」
        </p>
      ) : null}

      {hasLogic ? (
        <Collapsible open={open} onOpenChange={setOpen} className="mt-3">
          <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition w-full">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            底层逻辑
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 pl-5 space-y-3 text-[12px] leading-[1.75] text-foreground/70">
            {logic?.measure ? (
              <div>
                <div className="text-[10px] font-mono tracking-wider text-muted-foreground mb-1">测的是什么</div>
                <p>{logic.measure}</p>
              </div>
            ) : null}
            {logic?.interpretation ? (
              <div>
                <div className="text-[10px] font-mono tracking-wider text-muted-foreground mb-1">你的位置</div>
                <p>{logic.interpretation}</p>
              </div>
            ) : null}
            {logic?.inRelationship ? (
              <div>
                <div className="text-[10px] font-mono tracking-wider text-muted-foreground mb-1">在关系里</div>
                <p>{logic.inRelationship}</p>
              </div>
            ) : null}
            {logic?.growthHint ? (
              <div className="rounded-lg border border-[oklch(0.82_0.14_200/0.22)] bg-[oklch(0.50_0.16_200/0.06)] px-3 py-2.5 text-foreground/75">
                <div className="text-[10px] font-mono tracking-wider text-[oklch(0.82_0.14_200)] mb-1">可以试着</div>
                <p>{logic.growthHint}</p>
              </div>
            ) : null}
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </motion.div>
  );
}
