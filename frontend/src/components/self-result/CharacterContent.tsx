import { motion } from "framer-motion";
import { useState } from "react";
import type { CharacterReveal, MatchType } from "@/data/mockResult";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export function CharacterContent({
  character,
  matches,
}: {
  character: CharacterReveal;
  matches: MatchType[];
}) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(matches[0]?.code ?? null);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center py-5 border-b border-border/40 mb-5">
        <div className="font-mono text-[10px] tracking-[0.32em] text-muted-foreground mb-3">· 你的人格原型 ·</div>
        <div className="font-display text-4xl text-gradient-violet">{character.name}</div>
        <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground mt-2 mb-3">{character.pinyin}</div>
        <p className="text-[13px] text-foreground/70 leading-[1.85] max-w-[320px] mx-auto italic">
          「{character.archetypeLine}」
        </p>
      </div>

      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// WHY YOU ARE THEM</div>
      <h4 className="font-display text-base mt-1 mb-3 text-foreground">为什么是你</h4>
      <div className="space-y-2.5">
        {character.reasons.map((c, i) => (
          <div
            key={i}
            className={`flex gap-3 p-4 rounded-xl border ${
              c.highlight
                ? "border-[oklch(0.68_0.18_285/0.45)] bg-[oklch(0.50_0.20_285/0.08)]"
                : "border-border/50 bg-secondary/30"
            }`}
          >
            <div className="font-mono text-[11px] text-muted-foreground w-5 shrink-0 pt-0.5">0{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-foreground">{c.title}</div>
              <div className="text-[12.5px] text-foreground/70 mt-1.5 leading-[1.7]">{c.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// COMPATIBILITY</div>
        <h4 className="font-display text-base mt-1 mb-3 text-foreground">最适合你的伴侣类型</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {matches.map((m) => (
            <Collapsible
              key={m.code}
              open={expandedMatch === m.code}
              onOpenChange={(open) => setExpandedMatch(open ? m.code : null)}
            >
              <motion.div
                whileHover={{ y: -2 }}
                className={`relative rounded-xl border ${
                  m.top
                    ? "border-[oklch(0.68_0.18_285/0.6)] bg-[oklch(0.50_0.20_285/0.10)]"
                    : "border-border/60 bg-secondary/30"
                }`}
              >
                {m.top ? (
                  <span className="absolute -top-2 left-3 chip chip-violet text-[9px] py-0.5">最高匹配</span>
                ) : null}
                <CollapsibleTrigger className="w-full text-left p-4">
                  <div className="font-display text-base text-foreground">{m.name}</div>
                  <div className="text-xs text-foreground/65 mt-1 leading-snug">{m.tagline}</div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-mono text-2xl text-gradient-violet tabular-nums">{m.pct}</span>
                    <span className="text-xs text-muted-foreground">% 契合</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${expandedMatch === m.code ? "rotate-180" : ""}`}
                    />
                    相处深探
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 text-[12px] text-foreground/70 leading-relaxed border-t border-border/30 pt-3 mx-4 mb-4">
                  如果你遇见{m.name.replace(/型.*/, "型")}，{m.tagline}。这不是标准答案，而是同体系里与你节奏最同频的方向。
                </CollapsibleContent>
              </motion.div>
            </Collapsible>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
