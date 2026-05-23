import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Eye,
  Sparkles,
  Smile,
  Frown,
  Meh,
  HeartCrack,
  Heart,
  Flame,
  CloudRain,
  Wind,
  GripVertical,
  Check,
  Sun,
  Moon,
  Image as ImageIcon,
  Zap,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/showcase/questions")({
  component: Showcase,
});

const TYPES = [
  { id: "choice", label: "单选 · 文案型", desc: "A/B/C/D 经典四选一，附加副标签" },
  { id: "scale", label: "标度 · 强度型", desc: "从左到右的渐进强度，可视化梯度" },
  { id: "slider", label: "滑杆 · 连续型", desc: "0–100 连续值 + 实时语义提示" },
  { id: "mood", label: "情绪 · 图标格", desc: "8 宫格情绪表情，直觉点选" },
  { id: "rank", label: "排序 · 拖拽型", desc: "拖动重新排列优先级" },
  { id: "binary", label: "二元 · 对峙型", desc: "两端对立选项，左右分屏" },
  { id: "card", label: "卡片 · 场景型", desc: "图像卡片，沉浸式情境选择" },
  { id: "scenario", label: "剧本 · 长场景", desc: "带场景描写的长文题" },
] as const;

type TypeId = (typeof TYPES)[number]["id"];

function Showcase() {
  const [active, setActive] = useState<TypeId>("choice");
  const nav = useNavigate();

  // Demo progress state — shared between every question type
  const total = 12;
  const [idx, setIdx] = useState(2); // 第 3 题
  const pct = Math.round(((idx + 1) / total) * 100);

  // Auto-advance handler exposed to demo components
  const handleAnswered = () => {
    if (idx < total - 1) setTimeout(() => setIdx((i) => i + 1), 380);
  };

  const goPrev = () => setIdx((i) => Math.max(0, i - 1));
  const goNext = () => setIdx((i) => Math.min(total - 1, i + 1));
  const autoGenerate = () => {
    toast.success("AI 正在基于已答题目生成画像…");
    setTimeout(() => nav({ to: "/analyzing", search: { variant: "demo" } }), 350);
  };

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-6 pb-24">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 返回
          </Link>
          <span className="chip chip-violet font-mono">QUESTION · SHOWCASE</span>
          <button
            onClick={autoGenerate}
            className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-[oklch(0.10_0.018_270)] text-[11px] font-medium hover:opacity-90 transition"
          >
            <Wand2 className="h-3.5 w-3.5" /> 自动生成结果
          </button>
        </div>

        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-gradient-violet">
            答题界面 · 形态库
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            题目多元丰富 · 不同题型对应不同呈现样式。后端按 type 字段返回，前端自动适配。
          </p>
        </header>

        {/* Type tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
          {TYPES.map((t) => {
            const on = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  on
                    ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet"
                    : "border-border/60 bg-glass hover:border-[oklch(0.68_0.18_285_/_0.5)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
                    {t.id.toUpperCase()}
                  </span>
                  {on && <Check className="h-3.5 w-3.5 text-[oklch(0.82_0.14_200)]" />}
                </div>
                <div className="text-sm font-medium text-foreground/95">{t.label}</div>
                <div className="text-[11px] text-muted-foreground/80 mt-0.5">{t.desc}</div>
              </button>
            );
          })}
        </div>

        <QFrame
          idx={idx}
          total={total}
          pct={pct}
          onPrev={goPrev}
          onNext={goNext}
          onAutoGenerate={autoGenerate}
          isLast={idx === total - 1}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {active === "choice" && <DemoChoice onAnswered={handleAnswered} />}
              {active === "scale" && <DemoScale onAnswered={handleAnswered} />}
              {active === "slider" && <DemoSlider />}
              {active === "mood" && <DemoMood onAnswered={handleAnswered} />}
              {active === "rank" && <DemoRank />}
              {active === "binary" && <DemoBinary onAnswered={handleAnswered} />}
              {active === "card" && <DemoCard onAnswered={handleAnswered} />}
              {active === "scenario" && <DemoScenario onAnswered={handleAnswered} />}
            </motion.div>
          </AnimatePresence>
        </QFrame>
      </div>
    </main>
  );
}

/* ---------- Shared frame with progress + nav ---------- */

function QFrame({
  children,
  idx,
  total,
  pct,
  onPrev,
  onNext,
  onAutoGenerate,
  isLast,
}: {
  children: React.ReactNode;
  idx: number;
  total: number;
  pct: number;
  onPrev: () => void;
  onNext: () => void;
  onAutoGenerate: () => void;
  isLast: boolean;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* progress strip */}
      <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-2">
        <span>
          第 <span className="text-foreground/90 tabular-nums">{idx + 1}</span> 题 · 共 {total} 题
        </span>
        <span className="flex items-center gap-3">
          <span className="text-foreground/85 tabular-nums">{pct}%</span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> 03:55
          </span>
        </span>
      </div>
      <div className="relative h-[3px] rounded-full bg-secondary/50 overflow-hidden mb-3">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {/* dots */}
      <div className="flex gap-1 justify-center mb-5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-[5px] rounded-full transition-all duration-300 ${
              i < idx
                ? "w-1.5 bg-[oklch(0.68_0.18_285_/_0.7)]"
                : i === idx
                ? "w-5 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]"
                : "w-1.5 bg-border/70"
            }`}
          />
        ))}
      </div>

      <div className="bg-glass rounded-2xl p-6 md:p-7">{children}</div>

      {/* Nav row */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          disabled={idx === 0}
          onClick={onPrev}
          className="rounded-xl border-border/60 bg-glass disabled:opacity-30"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> 上一题
        </Button>

        <button
          onClick={onAutoGenerate}
          className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition"
        >
          <Wand2 className="h-3 w-3" /> AUTO · GENERATE
        </button>

        {isLast ? (
          <Button
            onClick={onAutoGenerate}
            className="rounded-xl bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground"
          >
            生成画像 <Sparkles className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="rounded-xl bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground"
          >
            下一题 <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function QHead({ tag, text, sub }: { tag: string; text: string; sub?: string }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[11px] text-muted-foreground">Q03</span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 flex items-center gap-1">
          <Eye className="h-3 w-3" /> {tag}
        </span>
      </div>
      <h2 className="font-display text-[22px] md:text-[26px] leading-snug text-foreground/95">
        {text}
      </h2>
      {sub && (
        <div className="mt-3 text-[13px] text-muted-foreground border-l-2 border-[oklch(0.68_0.18_285_/_0.6)] pl-3 py-1">
          {sub}
        </div>
      )}
    </>
  );
}

/* ---------- 1. Choice ---------- */

function DemoChoice({ onAnswered }: { onAnswered: () => void }) {
  const [sel, setSel] = useState(1);
  const opts = [
    { t: "主动找对方和解，不想让冷战持续", s: "倾向于主动修复" },
    { t: "给彼此一点时间冷静，再慢慢聊", s: "需要缓冲空间" },
    { t: "等对方先开口，自己开不了那个口", s: "被动等待型" },
    { t: "觉得算了，争这个没意义", s: "回避冲突型" },
  ];
  return (
    <>
      <QHead tag="跟着直觉走" text="你和伴侣吵架后，你最自然的反应是？" sub="假设你们因为一件小事争吵，气氛有点僵。" />
      <div className="mt-6 space-y-2.5">
        {opts.map((o, i) => {
          const on = sel === i;
          return (
            <button
              key={i}
              onClick={() => { setSel(i); onAnswered(); }}
              className={`group w-full text-left flex items-start gap-3.5 p-3.5 rounded-xl border transition-all ${
                on
                  ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet"
                  : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"
              }`}
            >
              <span
                className={`shrink-0 w-6 h-6 rounded-md grid place-items-center text-[11px] font-mono ${
                  on
                    ? "bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)] text-[oklch(0.10_0.018_270)]"
                    : "border border-border/70 text-muted-foreground"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <div className="flex-1">
                <div className="text-[14px] text-foreground/95">{o.t}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{o.s}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- 2. Scale ---------- */

function DemoScale({ onAnswered }: { onAnswered: () => void }) {
  const [sel, setSel] = useState<number | null>(2);
  const opts = ["完全可以", "可以但会想念", "会有点不安", "希望对方别这样说"];
  return (
    <>
      <QHead tag="边界感知" text="看到「我需要一点独处时间」这句话，你的舒服程度？" />
      <div className="mt-6 space-y-2">
        {opts.map((o, i) => {
          const on = sel === i;
          const w = 24 + ((i + 1) / opts.length) * 64;
          return (
            <button
              key={i}
              onClick={() => { setSel(i); onAnswered(); }}
              className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                on
                  ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet"
                  : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"
              }`}
            >
              <span className="font-mono text-[11px] text-muted-foreground w-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-[14px] text-foreground/90">{o}</span>
              <span
                className="h-1.5 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] transition-all"
                style={{ width: `${w}px`, opacity: on ? 1 : 0.45 }}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- 3. Slider ---------- */

function DemoSlider() {
  const [v, setV] = useState(62);
  const hints = ["完全憋在心里", "偶尔暗示一下", "看情况再说", "通常会说出来", "总是直接表达"];
  const hint = hints[Math.min(4, Math.floor(v / 20))];
  return (
    <>
      <QHead tag="情绪表达" text="当你对伴侣感到失望时，你有多愿意直接说出来？" />
      <div className="mt-7">
        <div className="flex justify-between text-[11px] text-muted-foreground mb-2 font-mono">
          <span>完全憋着不说</span>
          <span>会直接表达</span>
        </div>
        <div className="text-center">
          <div className="font-display text-5xl text-gradient-violet tabular-nums">{v}</div>
          <div className="text-xs text-muted-foreground mt-1 h-4">{hint}</div>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={v}
          onChange={(e) => setV(parseInt(e.target.value))}
          className="w-full mt-5 accent-[oklch(0.68_0.18_285)]"
        />
        <div className="flex justify-between mt-2">
          {[0, 25, 50, 75, 100].map((t) => (
            <span key={t} className="text-[10px] font-mono text-muted-foreground/70">
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- 4. Mood grid ---------- */

function DemoMood({ onAnswered }: { onAnswered: () => void }) {
  const [sel, setSel] = useState(0);
  const moods = [
    { i: Smile, l: "完全支持" },
    { i: Meh, l: "有点失落" },
    { i: Frown, l: "很不安" },
    { i: Wind, l: "无所谓" },
    { i: Heart, l: "反而羡慕" },
    { i: HeartCrack, l: "感觉被推开" },
    { i: CloudRain, l: "开始担心" },
    { i: Flame, l: "趁机做自己" },
  ];
  return (
    <>
      <QHead
        tag="独立倾向"
        text="伴侣突然说要一个人出去旅行一周，你的第一反应更接近？"
        sub="不是吵架，就是他/她想要独处时间。"
      />
      <div className="mt-6 grid grid-cols-4 gap-2.5">
        {moods.map((m, i) => {
          const on = sel === i;
          const Icon = m.i;
          return (
            <button
              key={i}
              onClick={() => { setSel(i); onAnswered(); }}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                on
                  ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet"
                  : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"
              }`}
            >
              <Icon
                className={`h-6 w-6 ${
                  on ? "text-[oklch(0.82_0.14_200)]" : "text-foreground/70"
                }`}
              />
              <span className="text-[11px] text-foreground/85">{m.l}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- 5. Rank ---------- */

function DemoRank() {
  const [items, setItems] = useState([
    "遇事第一时间分享",
    "每天有固定联系",
    "给对方足够的私人空间",
    "保持各自的兴趣爱好",
  ]);
  return (
    <>
      <QHead tag="优先级 · 拖动排序" text="在一段关系里，以下事情对你的重要程度（拖动重排）。" />
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="mt-6 space-y-2">
        {items.map((it, idx) => (
          <Reorder.Item
            key={it}
            value={it}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-[oklch(0.50_0.20_285_/_0.06)] cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="w-6 h-6 rounded-md grid place-items-center text-[11px] font-mono bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)] text-[oklch(0.10_0.018_270)]">
              {idx + 1}
            </span>
            <span className="text-[14px] text-foreground/90">{it}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </>
  );
}

/* ---------- 6. Binary ---------- */

function DemoBinary({ onAnswered }: { onAnswered: () => void }) {
  const [sel, setSel] = useState<"L" | "R" | null>(null);
  const choices = {
    L: { icon: Moon, title: "安静待在家", sub: "充电、独处、不被打扰", color: "oklch(0.68_0.18_285)" },
    R: { icon: Sun, title: "出门 social", sub: "见人、热闹、被氛围点亮", color: "oklch(0.82_0.14_200)" },
  };
  return (
    <>
      <QHead tag="对峙 · 二选一" text="一个空闲的周末，你心里更想要的是？" />
      <div className="mt-7 grid grid-cols-2 gap-3 md:gap-4">
        {(["L", "R"] as const).map((k) => {
          const c = choices[k];
          const on = sel === k;
          const Icon = c.icon;
          return (
            <button
              key={k}
              onClick={() => { setSel(k); onAnswered(); }}
              className={`relative overflow-hidden rounded-2xl border p-5 md:p-6 text-left transition-all ${
                on
                  ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet"
                  : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"
              }`}
            >
              <div
                className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-40"
                style={{ background: c.color }}
              />
              <Icon className="h-7 w-7 mb-3" style={{ color: c.color }} />
              <div className="font-display text-lg text-foreground/95">{c.title}</div>
              <div className="text-[12px] text-muted-foreground mt-1">{c.sub}</div>
            </button>
          );
        })}
      </div>
      <div className="text-center mt-3 text-[11px] font-mono text-muted-foreground/70">
        {sel ? `已选 · ${choices[sel].title}` : "点选其一"}
      </div>
    </>
  );
}

/* ---------- 7. Card / image ---------- */

function DemoCard({ onAnswered }: { onAnswered: () => void }) {
  const [sel, setSel] = useState(1);
  const cards = [
    { t: "深夜街道", s: "对方在路灯下递来一杯热饮", hue: 285 },
    { t: "清晨厨房", s: "醒来时对方已经在做早餐", hue: 200 },
    { t: "雨天窗边", s: "什么都不说，靠着就好", hue: 320 },
    { t: "山顶日落", s: "一起看完整片天色变化", hue: 30 },
  ];
  return (
    <>
      <QHead tag="心动场景" text="下面哪个画面，最让你心头一动？" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        {cards.map((c, i) => {
          const on = sel === i;
          return (
            <button
              key={i}
              onClick={() => { setSel(i); onAnswered(); }}
              className={`relative aspect-[4/3] rounded-2xl overflow-hidden border text-left transition-all ${
                on
                  ? "border-[oklch(0.68_0.18_285_/_0.75)] glow-violet"
                  : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"
              }`}
              style={{
                background: `radial-gradient(120% 90% at 30% 20%, oklch(0.55 0.18 ${c.hue} / 0.6), oklch(0.15 0.04 ${c.hue} / 0.9))`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.02_270_/_0.85)] via-transparent to-transparent" />
              <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-mono text-foreground/70 bg-[oklch(0.10_0.018_270_/_0.5)] px-2 py-0.5 rounded-full backdrop-blur">
                <ImageIcon className="h-3 w-3" /> 0{i + 1}
              </div>
              {on && (
                <div className="absolute top-2 right-2 h-6 w-6 grid place-items-center rounded-full bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]">
                  <Check className="h-3.5 w-3.5 text-[oklch(0.10_0.018_270)]" />
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="font-display text-base text-foreground">{c.t}</div>
                <div className="text-[11px] text-foreground/75 mt-0.5">{c.s}</div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ---------- 8. Scenario long-form ---------- */

function DemoScenario({ onAnswered }: { onAnswered: () => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const opts = [
    "立刻回消息，把事情说清楚",
    "先深呼吸，半小时后再回",
    "等对方再发一句来确认",
    "把手机放远一点，今晚不处理",
  ];
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[11px] text-muted-foreground">Q03 · SCENE</span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-[oklch(0.82_0.14_200)] flex items-center gap-1">
          <Zap className="h-3 w-3" /> 沉浸式
        </span>
      </div>

      <div className="rounded-xl border border-[oklch(0.68_0.18_285_/_0.35)] bg-[oklch(0.50_0.20_285_/_0.06)] p-4 md:p-5 mb-5">
        <div className="text-[11px] font-mono text-[oklch(0.82_0.14_200)] tracking-[0.2em] mb-2">
          SCENE · 23:47
        </div>
        <p className="text-[14px] leading-[1.75] text-foreground/90">
          你刚加完班回到家，手机里躺着对方两小时前的消息：
          <span className="text-foreground"> "你今天是不是有点不一样" </span>
          。没有上下文，没有表情。屋子很静，窗外有车声经过。
        </p>
        <p className="text-[13px] text-muted-foreground mt-3 leading-[1.7]">
          下一步，你最可能做的是——
        </p>
      </div>

      <h2 className="font-display text-[20px] md:text-[22px] text-foreground/95 mb-4">
        你的下一步动作？
      </h2>

      <div className="space-y-2">
        {opts.map((o, i) => {
          const on = sel === i;
          return (
            <button
              key={i}
              onClick={() => { setSel(i); onAnswered(); }}
              className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                on
                  ? "border-[oklch(0.68_0.18_285_/_0.75)] bg-[oklch(0.50_0.20_285_/_0.14)] glow-violet"
                  : "border-border/70 hover:border-[oklch(0.68_0.18_285_/_0.55)]"
              }`}
            >
              <span
                className={`shrink-0 h-5 w-5 rounded-full border-2 grid place-items-center ${
                  on ? "border-[oklch(0.82_0.14_200)]" : "border-border"
                }`}
              >
                {on && <span className="h-2 w-2 rounded-full bg-[oklch(0.82_0.14_200)]" />}
              </span>
              <span className="text-[14px] text-foreground/90">{o}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-mono text-muted-foreground/70">
        <Sparkles className="h-3 w-3" /> 这道题会同时影响 3 个维度
      </div>
    </>
  );
}
