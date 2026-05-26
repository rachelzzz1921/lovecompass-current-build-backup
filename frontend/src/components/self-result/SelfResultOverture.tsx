import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { SelfResult } from "@/data/mockResult";
import { ScoreOrb, type ScoreBreakdownItem } from "@/components/ScoreOrb";
import { StaggerTitle } from "@/components/self-result/StaggerTitle";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";

type Props = {
  result: SelfResult;
  onScrollToActOne: () => void;
  exampleSubject?: ExampleSubject;
  orbSize?: number;
};

export function SelfResultOverture({ result, onScrollToActOne, exampleSubject, orbSize = 180 }: Props) {
  const breakdown: ScoreBreakdownItem[] = result.dimensions.map((d) => ({
    key: d.key,
    label: d.label,
    value: d.value,
  }));

  return (
    <section id="overture" className="text-center min-h-[56vh] sm:min-h-[62vh] flex flex-col items-center justify-center pb-6 sm:pb-8 w-full min-w-0 scroll-mt-32">
      <motion.span
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="chip chip-violet font-mono inline-flex"
      >
        {result.archetype.badge}
      </motion.span>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.8 }}
        className="flex justify-center mt-6"
      >
        <ScoreOrb value={result.overallScore} size={orbSize} breakdown={breakdown} />
      </motion.div>

      <StaggerTitle
        text={result.archetype.name}
        className="font-display text-3xl sm:text-4xl md:text-5xl mt-5 sm:mt-6 text-gradient-violet tracking-tight px-2"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mt-2"
      >
        {result.archetype.code}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="mt-5 max-w-md mx-auto text-left rounded-xl px-4 py-3 bg-secondary/30 border-l-2 border-[oklch(0.68_0.18_285/0.55)]"
      >
        <p className="text-[14px] leading-[1.75] text-foreground/80 italic">「{result.archetype.tagline}」</p>
      </motion.div>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { delay: 1.6, duration: 0.5 },
          y: { delay: 1.8, duration: 2.2, repeat: Infinity, ease: "easeInOut" },
        }}
        onClick={onScrollToActOne}
        className="mt-10 flex flex-col items-center gap-1 text-[11px] font-mono tracking-[0.25em] text-muted-foreground hover:text-foreground transition"
      >
        <ChevronDown className="h-4 w-4" />
        探索{exampleSubject ? `${exampleSubject.name}的` : "你的"}画像
      </motion.button>
    </section>
  );
}
