import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  ScanLine,
  Brain,
  Network,
  Sparkles,
  Heart,
  Layers,
  Check,
} from "lucide-react";

const searchSchema = z.object({
  attemptId: z.string().optional(),
  variant: z.string().optional(),
  to: z.string().optional(),
});

export const Route = createFileRoute("/analyzing")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "AI 正在分析… · MIRROR" },
      { name: "description", content: "MIRROR 正在阅读你的答题，生成属于你的画像。" },
    ],
  }),
  component: AnalyzingPage,
});

/* —— 五个阶段，每个阶段都是一句"被理解"的低语 —— */
const STAGES = [
  {
    icon: ScanLine,
    title: "正在读取你的回答",
    whisper: "把每一道题，重新听一遍。",
    detail: "PARSING · 190 SIGNALS",
    hue: 200,
    dur: 1700,
  },
  {
    icon: Network,
    title: "正在识别你的情绪节奏",
    whisper: "你在哪一题停顿过，我都记得。",
    detail: "DETECTING · EMOTIONAL RHYTHM",
    hue: 285,
    dur: 1900,
  },
  {
    icon: Brain,
    title: "正在匹配 34 个人格原型",
    whisper: "在所有可能的你之中，找最像的那一个。",
    detail: "MATCHING · 34 ARCHETYPES",
    hue: 320,
    dur: 2200,
  },
  {
    icon: Heart,
    title: "正在描绘你在关系里的样子",
    whisper: "你怎么靠近、怎么撤退、怎么爱。",
    detail: "COMPOSING · RELATIONAL PROFILE",
    hue: 360,
    dur: 2000,
  },
  {
    icon: Layers,
    title: "正在合成你的画像草稿",
    whisper: "这不是一份报告，是一面会进化的镜子。",
    detail: "RENDERING · LIVE PORTRAIT",
    hue: 255,
    dur: 1800,
  },
] as const;

/* —— 后台滚动的"被读取到的关键词"，让用户感到 AI 真的在读 —— */
const KEYWORDS = [
  "倾向独处后再沟通",
  "对沉默敏感",
  "在意被理解的瞬间",
  "回避型反应 · 中低",
  "情感深度 · 偏高",
  "冲突时倾向先冷却",
  "对承诺有耐心",
  "更看重「合适」",
  "心动触发：契合感",
  "对边界感的需求 · 明确",
  "自我表达 · 选择性开放",
  "亲密节奏 · 缓慢但稳定",
  "对失望的处理：内化",
  "对赞美 · 半信半疑",
  "理想关系：可独处的共处",
];

function AnalyzingPage() {
  const nav = useNavigate();
  const { attemptId, variant = "demo", to } = Route.useSearch();
  const { pending: authPending } = useRequireAuth();

  const [stage, setStage] = useState(0);
  const [overall, setOverall] = useState(0); // 0–100

  const total = STAGES.reduce((a, s) => a + s.dur, 0);

  /* 阶段推进 */
  useEffect(() => {
    if (stage >= STAGES.length) return;
    const t = setTimeout(() => setStage((s) => s + 1), STAGES[stage].dur);
    return () => clearTimeout(t);
  }, [stage]);

  /* 总进度（平滑） */
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const target = Math.min(100, (elapsed / total) * 100);
      setOverall(target);
      if (target < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  /* 完成 → 跳转 */
  useEffect(() => {
    if (stage < STAGES.length) return;
    const t = setTimeout(() => {
      if (attemptId) nav({ to: "/result/$attemptId", params: { attemptId } });
      else if (to) nav({ to: to as "/result/self/$variant", params: { variant } });
      else nav({ to: "/result/self/$variant", params: { variant } });
    }, 650);
    return () => clearTimeout(t);
  }, [attemptId, stage, nav, to, variant]);

  const cur = STAGES[Math.min(stage, STAGES.length - 1)];
  const done = stage >= STAGES.length;

  if (authPending) return <AuthChecking />;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-10 overflow-hidden">
      {/* 背景：呼吸光晕跟随阶段 hue */}
      <motion.div
        key={`bg-${stage}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 1.4 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(60% 50% at 50% 40%, oklch(0.55 0.22 ${cur.hue} / 0.32) 0%, transparent 70%)`,
        }}
      />

      {/* 扫描线 */}
      <motion.div
        className="absolute inset-x-0 h-[2px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, oklch(0.85 0.16 ${cur.hue}), transparent)`,
          boxShadow: `0 0 24px oklch(0.75 0.18 ${cur.hue})`,
        }}
        animate={{ top: ["8%", "92%", "8%"] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 漂浮关键词背景 */}
      <FloatingKeywords hue={cur.hue} />

      <div className="relative z-10 w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-glass-strong rounded-3xl p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 ring-grid opacity-25 pointer-events-none" />

          {/* 顶部状态 */}
          <div className="relative flex items-center justify-between mb-6">
            <span className="chip chip-violet font-mono">
              <Sparkles className="h-3 w-3" /> MIRROR · ANALYZING
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
              v0.1 · LIVE
            </span>
          </div>

          {/* 中央脉冲圆 */}
          <div className="relative h-44 flex items-center justify-center mb-2">
            {/* 三层涟漪 */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute rounded-full border"
                style={{
                  borderColor: `oklch(0.75 0.18 ${cur.hue} / 0.5)`,
                }}
                animate={{
                  width: [60, 180],
                  height: [60, 180],
                  opacity: [0.65, 0],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay: i * 0.85,
                  ease: "easeOut",
                }}
              />
            ))}
            {/* 核心 */}
            <motion.div
              key={`core-${stage}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-20 h-20 rounded-full grid place-items-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, oklch(0.85 0.16 ${cur.hue}) 0%, oklch(0.45 0.20 ${cur.hue}) 70%)`,
                boxShadow: `0 0 60px oklch(0.65 0.20 ${cur.hue} / 0.6)`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                  transition={{ duration: 0.45 }}
                >
                  {done ? (
                    <Check className="h-9 w-9 text-[oklch(0.10_0.018_270)]" />
                  ) : (
                    <cur.icon className="h-9 w-9 text-[oklch(0.10_0.018_270)]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* 当前阶段文案 */}
          <div className="relative text-center min-h-[88px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45 }}
              >
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                  {done ? "DONE · 画像草稿就绪" : cur.detail}
                </div>
                <h2 className="font-display text-2xl mt-2 text-gradient-violet leading-tight">
                  {done ? "我看见你了。" : cur.title}
                </h2>
                <p className="text-[13px] text-foreground/70 mt-2 italic">
                  {done ? "正在把这份理解，递给你。" : `「${cur.whisper}」`}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 阶段点 */}
          <div className="mt-6 flex items-center justify-between gap-2">
            {STAGES.map((s, i) => {
              const isDone = i < stage || done;
              const isCur = i === stage && !done;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.span
                    className="h-2 w-2 rounded-full"
                    animate={{
                      scale: isCur ? [1, 1.7, 1] : 1,
                      backgroundColor: isDone
                        ? `oklch(0.82 0.14 ${s.hue})`
                        : isCur
                        ? `oklch(0.75 0.18 ${s.hue})`
                        : "oklch(0.30 0.02 270)",
                    }}
                    transition={
                      isCur
                        ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.3 }
                    }
                  />
                  <span
                    className={`text-[9px] font-mono tracking-wider transition-colors ${
                      isDone || isCur ? "text-foreground/70" : "text-muted-foreground/40"
                    }`}
                  >
                    0{i + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 总进度条 */}
          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1.5">
              <span>合成进度</span>
              <span className="tabular-nums text-foreground/80">
                {Math.round(overall)}%
              </span>
            </div>
            <div className="h-[3px] rounded-full bg-secondary/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${overall}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
                style={{
                  background: `linear-gradient(90deg, oklch(0.68 0.18 285), oklch(0.82 0.14 200), oklch(0.75 0.18 ${cur.hue}))`,
                }}
              />
            </div>
          </div>

          {/* 终端式实时输出 */}
          <TerminalLog stage={stage} />
        </motion.div>

        <p className="mt-5 text-center text-[11px] font-mono tracking-[0.2em] text-muted-foreground/70">
          请稍候 · AI 正在认真理解你 · DO NOT LEAVE
        </p>
      </div>
    </main>
  );
}

/* —— 漂浮关键词 —— */
function FloatingKeywords({ hue }: { hue: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {KEYWORDS.slice(0, 9).map((k, i) => {
        const left = (i * 37) % 90 + 5;
        const delay = (i % 5) * 0.7;
        return (
          <motion.span
            key={k}
            initial={{ opacity: 0, y: 40 }}
            animate={{
              opacity: [0, 0.55, 0.55, 0],
              y: [40, -340],
            }}
            transition={{
              duration: 9 + (i % 3),
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
            className="absolute bottom-0 font-mono text-[10px] whitespace-nowrap"
            style={{
              left: `${left}%`,
              color: `oklch(0.85 0.10 ${hue} / 0.7)`,
              textShadow: `0 0 12px oklch(0.65 0.20 ${hue} / 0.5)`,
            }}
          >
            ▸ {k}
          </motion.span>
        );
      })}
    </div>
  );
}

/* —— 终端式输出：一行一行"被理解" —— */
function TerminalLog({ stage }: { stage: number }) {
  const lines = [
    "› 已读取 190 条信号",
    "› 检测到稳定的情感节奏",
    "› 匹配中：34 / 34 原型",
    "› 关系画像 · 草稿生成",
    "› 渲染完成 · 准备呈现",
  ];
  const visible = Math.min(stage + 1, lines.length);

  return (
    <div className="mt-6 rounded-xl bg-[oklch(0.10_0.018_270_/_0.6)] border border-border/40 p-3 font-mono text-[11px] leading-[1.7] min-h-[110px]">
      {lines.slice(0, visible).map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className={
            i === visible - 1
              ? "text-[oklch(0.82_0.14_200)]"
              : "text-foreground/55"
          }
        >
          {l}
          {i === visible - 1 && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-1"
            >
              ▌
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
