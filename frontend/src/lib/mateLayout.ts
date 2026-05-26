/** MATE 结果页排版 · 章节阅读流（少方框、多层次） */
export const MATE_PAGE_BG = "#0c0e11";

export const mateLayout = {
  main: "relative min-h-screen w-full min-w-0",
  header:
    "sticky top-0 z-20 flex items-center justify-between px-5 pt-5 pb-3 max-w-[480px] mx-auto w-full",
  headerFade: "linear-gradient(180deg, #0c0e11 72%, transparent)",
  /** 章节之间留白 */
  container: "max-w-[480px] mx-auto px-5 pb-32 space-y-14 w-full min-w-0",
  /** 单章内部 */
  chapter: "scroll-mt-28 space-y-6",
  chapterSub: "scroll-mt-28 space-y-4 pt-2",
  divider: "h-px bg-gradient-to-r from-transparent via-white/10 to-transparent",
  /** 正文 */
  prose: "text-[15px] sm:text-base text-white/80 leading-[1.75]",
  proseSm: "text-sm text-white/72 leading-relaxed",
  caption: "text-xs text-white/48 leading-relaxed",
  monoLabel: "text-[10px] font-mono tracking-[0.28em] text-white/38 uppercase",
  /** 仅用于需要强调的块（少用） */
  highlight: "rounded-xl bg-white/[0.03] px-4 py-3.5 border-l-2 border-sakura/60",
  rail: "border-l-2 pl-4 py-0.5",
  statRow: "flex flex-wrap gap-x-4 gap-y-3",
} as const;
