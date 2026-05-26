import { Link } from "@tanstack/react-router";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Database,
  Layers,
  MessageSquare,
  Pause,
  Play,
  Repeat,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SUITE_LABELS } from "@/data/products";
import { productEntryPath } from "@/lib/productRoutes";

type GrowthStep = {
  id: string;
  n: string;
  icon: typeof Layers;
  title: string;
  tagline: string;
  summary: string;
  layers: Array<"self" | "ros" | "mate" | "chat" | "evolve">;
  deliverables: { title: string; desc: string; accent?: "violet" | "cyan" | "rose" | "neutral" }[];
};

const ACCENT_RING: Record<string, string> = {
  violet: "from-[oklch(0.68_0.18_285)] to-[oklch(0.55_0.16_200)]",
  cyan: "from-[oklch(0.72_0.14_235)] to-[oklch(0.68_0.18_285)]",
  rose: "from-[oklch(0.72_0.18_20)] to-[oklch(0.68_0.18_285)]",
  neutral: "from-[oklch(0.55_0.12_270)] to-[oklch(0.45_0.08_270)]",
};

const STEP_TILE_HOVER =
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_-16px_oklch(0.10_0.02_270/0.45)]";

const GROWTH_STEPS: GrowthStep[] = [
  {
    id: "answer",
    n: "01",
    icon: Layers,
    title: "分层作答",
    tagline: "SELF → ROS → MATE",
    summary: "每一套题只问该问的事：SELF 画关系底片，ROS 锁定「心里那个人」，MATE 定位你在感情里的坐标。",
    layers: ["self"],
    deliverables: [
      {
        title: `${SUITE_LABELS.self.code} · 20 / 50 题`,
        desc: "六个面向：自我吸引感知、依恋焦虑、依恋回避、自我边界、情绪调节、关系投入——画出你在亲密关系里的默认配置",
        accent: "violet",
      },
      {
        title: `${SUITE_LABELS.ros.code} · 20 / 62 题`,
        desc: "五层关系结构：吸引基础、互动质量、兼容程度、关系走向、风险信号——针对心里那个具体的人",
        accent: "cyan",
      },
      {
        title: `${SUITE_LABELS.mate.code} · 20 / 80 题`,
        desc: "五个能力面（女版偏吸引力与情感价值，男版偏资源与稳定度）+ 四象限：显示度 × 现实支撑",
        accent: "rose",
      },
    ],
  },
  {
    id: "score",
    n: "02",
    icon: Zap,
    title: "算分与映射",
    tagline: "题项 → 维度 → 话术",
    summary: "后端按题库权重打分，再匹配 phrase library：每一句解读都能追溯到你的具体选项，不是星座式贴标签。",
    layers: ["self"],
    deliverables: [
      { title: "维度聚合", desc: "子题得分汇入各主维度（如依恋焦虑、吸引基础等），生成雷达与层级标签" },
      { title: "红楼人格谱系", desc: "SELF 第二幕：六维组合映射到红楼原型，与 Act I 特质卡分开呈现" },
      { title: "关系类型判定", desc: "ROS 输出关系类型名、阶段 ID（1–9）、共鸣层级与关系天气" },
    ],
  },
  {
    id: "report",
    n: "03",
    icon: Sparkles,
    title: "报告生长",
    tagline: "三幕 · 五维 · 档案",
    summary: "三套报告各自长成完整叙事——不是一张总分卡，而是能逐层展开、带证据链的结果页。",
    layers: ["self", "ros", "mate"],
    deliverables: [
      { title: "SELF 三幕", desc: "序幕 ScoreOrb → Act I 特质/雷达/场景 → Act II 红楼揭晓 → Act III 分析师洞察", accent: "violet" },
      { title: "ROS 关系页", desc: "9 阶段曲线 · 五维透视镜 · 心跳线 · 盲区 · 关系处方签", accent: "cyan" },
      { title: "MATE 市场页", desc: "五维得分 → 档案定位 → 观察预演 → 匹配温度带", accent: "rose" },
    ],
  },
  {
    id: "archive",
    n: "04",
    icon: Database,
    title: "汇入档案",
    tagline: "画像中心 · 完整度",
    summary: "每次提交写入个人信息中心：按 SELF / ROS / MATE 分组时间线，完整度环显示还缺哪一层。",
    layers: ["self", "ros", "mate"],
    deliverables: [
      { title: "跨套绑定", desc: "最新 SELF 为主画像，ROS / MATE 结果挂载同一 attempt 或独立记录" },
      { title: "完整度追踪", desc: "「我的画像」页可见三层叠加进度与下一次建议测评" },
      { title: "案例对照", desc: "红楼六人物示范档案：第三人称 SELF / ROS / MATE 完整推演", accent: "neutral" },
    ],
  },
  {
    id: "chat",
    n: "05",
    icon: MessageSquare,
    title: "顾问对话",
    tagline: "4 PERSONAS · LIVE",
    summary: "祖师爷 / 进化论 / Haven / 学者读取你的测评与摘要——从结果页某一层点「告诉 AI」，会带层级证据进对话。",
    layers: ["self", "ros", "mate", "chat"],
    deliverables: [
      { title: "画像注入", desc: "聊天自动带入 SELF 六维 + ROS/MATE 摘要，不必重头自我介绍" },
      { title: "层级追问", desc: "ROS 五维展开里的「问诊式追问」一键预填到顾问对话" },
      { title: "分诊推荐", desc: "首句意图匹配最适合的顾问风格——锋利、托底、学术或过来人" },
    ],
  },
  {
    id: "evolve",
    n: "06",
    icon: Repeat,
    title: "持续进化",
    tagline: "对话回写 · 下次更准",
    summary: "对话要点写入 portrait cache；下一次测评或聊天，系统比你想得更早接上次的语境。",
    layers: ["self", "ros", "mate", "chat", "evolve"],
    deliverables: [
      { title: "摘要回写", desc: "关键洞察沉淀进档案，不丢在聊天记录里" },
      { title: "盲区迭代", desc: "ROS 感知差、MATE 误读点会在后续对话里被温柔点破" },
      { title: "闭环建议", desc: "档案页直接推荐「继续 ROS / 解锁 MATE / 找分析师聊」", accent: "neutral" },
    ],
  },
];

const LAYER_META = {
  self: { label: "SELF", ring: "border-[oklch(0.68_0.18_285/0.55)]", glow: "oklch(0.68 0.18 285 / 0.18)", delay: 0 },
  ros: { label: "ROS", ring: "border-[oklch(0.72_0.14_235/0.55)]", glow: "oklch(0.72 0.14 235 / 0.18)", delay: 0.08 },
  mate: { label: "MATE", ring: "border-[oklch(0.72_0.18_20/0.55)]", glow: "oklch(0.72 0.18 20 / 0.18)", delay: 0.16 },
  chat: { label: "AI", ring: "border-[oklch(0.82_0.14_200/0.55)]", glow: "oklch(0.82 0.14 200 / 0.18)", delay: 0.24 },
  evolve: { label: "↻", ring: "border-[oklch(0.85_0.12_75/0.55)]", glow: "oklch(0.85 0.12 75 / 0.18)", delay: 0.32 },
} as const;

function PortraitOrb({ activeLayers }: { activeLayers: GrowthStep["layers"] }) {
  const size = 168;
  const rings = (["self", "ros", "mate", "chat", "evolve"] as const).filter((k) => activeLayers.includes(k));

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full opacity-30 blur-2xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(circle, oklch(0.68 0.18 285 / 0.25), oklch(0.72 0.14 235 / 0.15), transparent)`,
        }}
      />

      {rings.map((key, i) => {
        const inset = i * 10;
        const meta = LAYER_META[key];
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: meta.delay, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute rounded-full border flex items-center justify-center ${meta.ring}`}
            style={{
              inset,
              background: `radial-gradient(circle at 30% 30%, ${meta.glow}, transparent 70%)`,
            }}
          >
            {i === rings.length - 1 ? (
              <motion.span
                key={key}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-[10px] tracking-widest text-foreground/80"
              >
                {meta.label}
              </motion.span>
            ) : null}
          </motion.div>
        );
      })}

      <motion.div
        className="absolute inset-[38px] rounded-full grid place-items-center"
        style={{
          background: "radial-gradient(circle at 40% 35%, oklch(0.55 0.20 285 / 0.35), oklch(0.18 0.02 270 / 0.9))",
          border: "1px solid oklch(0.68 0.18 285 / 0.35)",
        }}
        animate={{ rotate: activeLayers.includes("evolve") ? 360 : 0 }}
        transition={{ duration: activeLayers.includes("evolve") ? 18 : 0, repeat: Infinity, ease: "linear" }}
      >
        <Brain className="h-8 w-8 text-[oklch(0.82_0.14_200)]" />
      </motion.div>

      {activeLayers.includes("chat") && (
        <>
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <motion.span
              key={deg}
              className="absolute w-2 h-2 rounded-full bg-[oklch(0.82_0.14_200)]"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8],
                x: Math.cos((deg * Math.PI) / 180) * 78,
                y: Math.sin((deg * Math.PI) / 180) * 78,
              }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.15 }}
              style={{ left: "50%", top: "50%", marginLeft: -4, marginTop: -4 }}
            />
          ))}
        </>
      )}
    </div>
  );
}

const SCRUBBER_MARKS = [
  { label: "作答", index: 0 },
  { label: "报告", index: 2 },
  { label: "档案", index: 3 },
  { label: "进化", index: 5 },
] as const;

function GrowthProgressSlider({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="relative pt-1">
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center py-3"
        min={0}
        max={max}
        step={1}
        value={[value]}
        onValueChange={([next]) => onChange(next ?? 0)}
        aria-label="切换画像生长步骤"
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[oklch(0.28_0.02_270/0.85)]">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] via-[oklch(0.72_0.16_235)] to-[oklch(0.82_0.14_200)] transition-[width] duration-300 ease-out" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full border-2 border-[oklch(0.88_0.10_285/0.85)] bg-[oklch(0.68_0.18_285)] shadow-[0_0_18px_oklch(0.68_0.18_285/0.55)] transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.68_0.18_285/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.12_0.018_270)]" />
      </SliderPrimitive.Root>

      <div className="relative mt-3 h-4">
        {SCRUBBER_MARKS.map((mark) => (
          <button
            key={mark.label}
            type="button"
            onClick={() => onChange(mark.index)}
            className={`absolute -translate-x-1/2 font-mono text-[9px] tracking-wider transition-colors hover:text-foreground/80 ${
              value === mark.index ? "text-[oklch(0.82_0.14_200)]" : "text-muted-foreground"
            }`}
            style={{ left: `${max === 0 ? 0 : (mark.index / max) * 100}%` }}
          >
            {mark.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PortraitGrowthShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const pausedByUser = useRef(false);
  const step = GROWTH_STEPS[activeIndex]!;

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    pausedByUser.current = true;
    setAutoPlay(false);
  }, []);

  useEffect(() => {
    if (!autoPlay || pausedByUser.current) return;
    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % GROWTH_STEPS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [autoPlay]);

  const toggleAutoPlay = () => {
    if (!autoPlay) pausedByUser.current = false;
    setAutoPlay((v) => !v);
  };

  return (
    <div className="grid w-full min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-5 md:gap-6 items-stretch">
      {/* Step rail */}
      <div className="bg-glass rounded-2xl p-4 md:p-5 flex flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
            {step.n} / 06 · {step.tagline}
          </div>
          <button
            type="button"
            onClick={toggleAutoPlay}
            className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-[oklch(0.68_0.18_285/0.5)] transition"
          >
            {autoPlay ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {autoPlay ? "暂停演示" : "自动演示"}
          </button>
        </div>

        <div className="relative flex-1">
          <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-[oklch(0.68_0.18_285/0.5)] via-border/40 to-transparent" />
          <ul className="space-y-1 relative">
            {GROWTH_STEPS.map((s, i) => {
              const active = i === activeIndex;
              const done = i < activeIndex;
              const Icon = s.icon;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    className={`w-full flex items-start gap-3 pl-1 pr-2 py-2.5 rounded-xl text-left border border-transparent ${STEP_TILE_HOVER} ${
                      active
                        ? "bg-[oklch(0.50_0.20_285/0.12)] ring-1 ring-[oklch(0.68_0.18_285/0.35)]"
                        : "hover:bg-[oklch(0.50_0.20_285/0.06)]"
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <motion.div
                        animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={{ duration: 1.6, repeat: active ? Infinity : 0 }}
                        className={`w-[30px] h-[30px] rounded-full grid place-items-center border ${
                          active
                            ? "border-[oklch(0.68_0.18_285)] bg-[oklch(0.68_0.18_285/0.2)]"
                            : done
                              ? "border-[oklch(0.82_0.14_200/0.6)] bg-[oklch(0.82_0.14_200/0.1)]"
                              : "border-border/60 bg-background/40"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${active ? "text-[oklch(0.82_0.14_200)]" : "text-muted-foreground"}`} />
                      </motion.div>
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-medium ${active ? "text-foreground" : "text-foreground/75"}`}>
                          {s.title}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">{s.n}</span>
                      </div>
                      {active ? (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-muted-foreground mt-1 leading-relaxed"
                        >
                          {s.summary}
                        </motion.p>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap gap-2">
          <Link
            to="/"
            hash="examples"
            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-border/50 hover:border-[oklch(0.68_0.18_285/0.5)] transition"
          >
            看示范档案 <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            to={productEntryPath("self")}
            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground"
          >
            从 SELF 开始 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-glass-strong rounded-2xl p-5 md:p-6 relative overflow-hidden min-h-[420px] flex flex-col">
        <div className="absolute inset-0 ring-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-[oklch(0.68_0.18_285/0.12)] blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          <PortraitOrb activeLayers={step.layers} />

          <div className="flex-1 min-w-0 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// LIVE PREVIEW</div>
                <h3 className="font-display text-xl mt-1 text-foreground">{step.title}</h3>
                <p className="text-sm text-foreground/70 mt-2 leading-relaxed">{step.summary}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {step.layers.map((layer) => (
                    <span key={layer} className="chip font-mono text-[10px] py-1">
                      {LAYER_META[layer].label}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="relative mt-6 flex-1">
          <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-3">这一步会「长」出什么</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-3 gap-2"
            >
              {step.deliverables.map((d, i) => (
                <motion.div
                  key={d.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-xl border border-border/45 bg-[oklch(0.18_0.02_270/0.55)] p-3 ${STEP_TILE_HOVER} hover:bg-[oklch(0.20_0.02_270/0.62)]`}
                >
                  <div className="text-xs font-medium text-foreground/90 mb-1">{d.title}</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{d.desc}</p>
                  {d.accent ? (
                    <div className={`mt-2 h-0.5 rounded-full bg-gradient-to-r ${ACCENT_RING[d.accent]} opacity-60`} />
                  ) : null}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scrubber */}
        <div className="relative mt-5 pt-4 border-t border-border/30">
          <GrowthProgressSlider
            value={activeIndex}
            max={GROWTH_STEPS.length - 1}
            onChange={goTo}
          />
        </div>
      </div>
    </div>
  );
}
