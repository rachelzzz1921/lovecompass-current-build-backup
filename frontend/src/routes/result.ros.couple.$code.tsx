import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Share2, Sparkles, Heart, Activity, Quote, MessageSquare,
  TrendingUp, Flame, Snowflake, ArrowRight, Check, X, Zap, Clock, Compass,
  Pencil, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { REL_STAGES, type TimelinePoint, type Milestone, type RosCoupleResult } from "@/data/rosTypes";
import { DualRadar } from "@/components/DualRadar";
import { WaveStageCurve } from "@/components/WaveStageCurve";
import { WeatherBadge } from "@/components/WeatherBadge";
import { PrescriptionCard } from "@/components/PrescriptionCard";
import { CountUp } from "@/components/CountUp";
import { AttachmentOrbs } from "@/components/AttachmentOrbs";
import { ResonancePulse } from "@/components/ResonancePulse";
import { StoryEditor } from "@/components/StoryEditor";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { mapApiCouplePayload } from "@/lib/mapRosResult";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

export const Route = createFileRoute("/result/ros/couple/$code")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "你们的双人报告 · MIRROR" },
      { name: "description", content: "ROS 双人报告 · 共鸣指数、感知差值、依恋碰撞、AI 处方签。" },
    ],
  }),
  component: CouplePage,
});

type TabId = "overview" | "stage" | "dual" | "attach" | "action";
const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "总览" },
  { id: "stage", label: "阶段" },
  { id: "dual", label: "双维对比" },
  { id: "attach", label: "依恋碰撞" },
  { id: "action", label: "行动处方" },
];

function CouplePage() {
  const { code } = useParams({ from: "/result/ros/couple/$code" });
  const { pending: authPending } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitingPartner, setWaitingPartner] = useState(false);
  const [r, setR] = useState<RosCoupleResult | null>(null);
  const [tab, setTab] = useState<TabId>("overview");

  useEffect(() => {
    if (authPending) return;
    let cancelled = false;
    setLoading(true);
    lovecompassApi
      .getRosCoupleReport(code)
      .then((res) => {
        if (cancelled) return;
        setR(mapApiCouplePayload(res.couple));
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = formatApiErrorMessage(e);
        if (/等待伴侣|409/.test(msg)) {
          setWaitingPartner(true);
          setError(null);
        } else {
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authPending, code]);

  if (authPending || loading) return <AuthChecking />;
  if (waitingPartner) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-6" style={{ background: "#0c0e11" }}>
        <div className="max-w-md text-center space-y-4">
          <Heart className="h-10 w-10 mx-auto text-[#a5a8ff]" />
          <h1 className="font-display text-2xl text-white">等待 TA 完成测评</h1>
          <p className="text-sm text-white/65 leading-relaxed">
            你的部分已经就绪。双人报告会在 TA 用关系码 <span className="font-mono text-[#c2c4ff]">{code}</span> 完成 ROS 60 题后自动解锁。
          </p>
          <Link to="/ros/invite/$code" params={{ code }}>
            <Button className="rounded-full mt-2">查看邀请页</Button>
          </Link>
          <div>
            <Link to="/" className="text-xs text-white/45 hover:text-white/70">返回首页</Link>
          </div>
        </div>
      </main>
    );
  }
  if (error || !r) {
    return (
      <ApiErrorPanel title="双人报告加载失败" message={error ?? "尚未解锁"} backTo={{ to: "/", label: "返回首页" }} />
    );
  }

  const stage = REL_STAGES[r.stageId - 1];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `MIRROR · 我们的共鸣指数 ${r.resonance.score} · ${r.resonance.tier}\n${r.shareLine}`
      );
      toast.success("已复制金句到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <main className="relative min-h-screen">
      {/* NAV */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Link>
        <div className="flex items-center gap-3">
          <span className="chip chip-cyan font-mono">SET · 02 / COUPLE</span>
          <span className="chip font-mono hidden md:inline-flex">{code}</span>
        </div>
      </header>

      <section className="relative z-10 max-w-3xl mx-auto px-5 md:px-12 py-8">
        {/* HERO · 共鸣指数（始终顶部固定锚） */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-center pb-6">
          <span className="chip chip-violet font-mono inline-flex">
            <Sparkles className="h-3 w-3" /> DUAL REPORT · UNLOCKED
          </span>
          <div className="mt-5 inline-flex flex-col items-center">
            <div className="text-[10px] tracking-[0.3em] text-muted-foreground font-mono">RESONANCE INDEX</div>
            <div className="relative flex items-end gap-1 mt-1.5">
              <CountUp to={r.resonance.score} duration={1.6}
                className="font-display text-[72px] md:text-[88px] leading-none tracking-tight text-gradient-violet tabular-nums" />
              <span className="text-muted-foreground text-2xl mb-2.5">/100</span>
            </div>
            <div className="mt-1 font-display text-xl md:text-2xl text-gradient-cyan">{r.resonance.tier}</div>
            <p className="text-xs md:text-sm text-foreground/75 mt-2 max-w-md">{r.resonance.desc}</p>
          </div>
        </motion.div>

        {/* TAB BAR */}
        <div className="sticky top-0 z-20 -mx-5 md:mx-0 px-5 md:px-0 backdrop-blur-xl bg-background/70 border-b border-border/40">
          <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative shrink-0 px-4 py-3 text-[13px] font-medium transition whitespace-nowrap ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
                  }`}
                >
                  {t.label}
                  {active && (
                    <motion.div
                      layoutId="rosTabUnderline"
                      className="absolute left-2 right-2 -bottom-px h-[2px] rounded-full"
                      style={{ background: "linear-gradient(90deg, oklch(0.68 0.18 285), oklch(0.82 0.14 200))" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* PANELS */}
        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {tab === "overview" && <PanelOverview r={r} />}
              {tab === "stage" && <PanelStage r={r} code={code} stageName={stage.name} stageCaption={stage.caption} />}
              {tab === "dual" && <PanelDual r={r} />}
              {tab === "attach" && <PanelAttach r={r} />}
              {tab === "action" && <PanelAction r={r} code={code} onShare={share} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM CTA — 固定底部双按钮 */}
        <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-border/40">
          <Link to="/chat" className="w-full">
            <Button variant="outline" className="w-full h-11 border-border/60 bg-glass">
              <MessageSquare className="h-4 w-4 mr-2" /> 找 AI 聊聊
            </Button>
          </Link>
          <Button onClick={share}
            className="w-full h-11 bg-gradient-to-r from-[oklch(0.55_0.20_285)] to-[oklch(0.50_0.18_200)] text-white hover:opacity-90">
            <Share2 className="h-4 w-4 mr-2" /> 生成分享卡
          </Button>
        </div>
      </section>
    </main>
  );
}

/* ───────────────────────── PANELS ───────────────────────── */

function SecLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] tracking-[0.3em] text-muted-foreground font-mono">{children}</div>;
}
function SecTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg mt-1 mb-4 text-foreground/95">{children}</h3>;
}

function InsightCard({
  title, loading, text, trendLabel, accent = "violet", onRetry,
}: {
  title: string;
  loading: boolean;
  text: string | null;
  trendLabel?: string | null;
  accent?: "violet" | "rose";
  onRetry: () => void;
}) {
  const bg = accent === "rose"
    ? "linear-gradient(135deg, oklch(0.55 0.20 355 / 0.18), oklch(0.55 0.20 30 / 0.14) 60%, oklch(0.50 0.20 285 / 0.14))"
    : "linear-gradient(135deg, oklch(0.55 0.20 285 / 0.18), oklch(0.50 0.18 200 / 0.14) 60%, oklch(0.55 0.20 355 / 0.14))";
  const border = accent === "rose" ? "oklch(0.78 0.18 355 / 0.4)" : "oklch(0.68 0.18 285 / 0.4)";
  const glow = accent === "rose" ? "oklch(0.78 0.18 355 / 0.35)" : "oklch(0.68 0.18 285 / 0.35)";
  const labelColor = accent === "rose" ? "oklch(0.85 0.14 355)" : "oklch(0.85 0.10 320)";
  const dotColor = accent === "rose" ? "oklch(0.82 0.16 355)" : "oklch(0.82 0.14 320)";

  return (
    <AnimatePresence>
      {(loading || text) && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl p-5 border overflow-hidden"
          style={{ background: bg, borderColor: border }}
        >
          <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full"
            style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }} />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono"
                style={{ color: labelColor }}>
                <Sparkles className="h-3 w-3" /> {title}
              </div>
              {trendLabel && !loading && (
                <span className="text-[10px] font-mono text-[oklch(0.85_0.10_200)] inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {trendLabel}
                </span>
              )}
            </div>
            {loading ? (
              <div className="flex items-center gap-2 py-2">
                {[0, 0.2, 0.4].map((d) => (
                  <motion.span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: dotColor }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: d }}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">AI 正在读你们的故事…</span>
              </div>
            ) : (
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{text}</p>
            )}
            {!loading && text && (
              <button onClick={onRetry}
                className="mt-3 text-[10px] tracking-[0.2em] font-mono text-muted-foreground hover:text-foreground transition">
                ↻ 重新分析
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



/* —— 总览：关键词云 + 天气/类型 + 高光与阴影 + 脉搏 —— */
function PanelOverview({ r }: { r: RosCoupleResult }) {
  return (
    <div className="space-y-5">
      <SecLabel>// SNAPSHOT</SecLabel>
      <SecTitle>这段关系此刻的样子</SecTitle>

      {/* 关键词云 */}
      <div className="bg-glass rounded-2xl p-5">
        <SecLabel>关 系 关 键 词</SecLabel>
        <div className="flex flex-wrap gap-2 mt-3">
          {r.keywords.map((k, i) => (
            <motion.span
              key={k}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              className="px-3 py-1.5 rounded-full text-sm font-display"
              style={{
                background: i % 2
                  ? "linear-gradient(135deg, oklch(0.50 0.20 285 / 0.25), oklch(0.50 0.18 200 / 0.25))"
                  : "linear-gradient(135deg, oklch(0.55 0.20 355 / 0.22), oklch(0.50 0.20 285 / 0.22))",
                border: "1px solid oklch(0.68 0.18 285 / 0.3)",
              }}
            >
              {k}
            </motion.span>
          ))}
        </div>
      </div>

      {/* 天气 + 类型 */}
      <div className="grid grid-cols-2 gap-3">
        <WeatherBadge icon={r.weather.icon} label={r.weather.label} sub={r.weather.sub} />
        <div className="bg-glass rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "radial-gradient(circle, oklch(0.55 0.20 355 / 0.4), transparent 70%)" }}>
            <Heart className="h-6 w-6 text-[oklch(0.82_0.16_355)]" fill="currentColor" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.3em] text-muted-foreground font-mono">关系类型</div>
            <div className="font-display text-base text-gradient-violet truncate">{r.type.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.type.one_liner}</div>
          </div>
        </div>
      </div>

      {/* 高光 / 阴影 */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 border" style={{
          background: "linear-gradient(135deg, oklch(0.82 0.14 75 / 0.15), transparent)",
          borderColor: "oklch(0.82 0.14 75 / 0.35)",
        }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono text-[oklch(0.85_0.12_75)]">
            <Sparkles className="h-3 w-3" /> GLOW · 高光
          </div>
          <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{r.highlights.glow}</p>
        </div>
        <div className="rounded-2xl p-4 border" style={{
          background: "linear-gradient(135deg, oklch(0.50 0.18 270 / 0.15), transparent)",
          borderColor: "oklch(0.50 0.18 270 / 0.35)",
        }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono text-[oklch(0.78_0.10_270)]">
            <Snowflake className="h-3 w-3" /> SHADOW · 待修复
          </div>
          <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{r.highlights.shadow}</p>
        </div>
      </div>

      {/* 脉搏 */}
      <div className="bg-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <SecLabel>RESONANCE · PULSE</SecLabel>
          <span className="text-[10px] tracking-[0.2em] text-[oklch(0.85_0.10_320)] font-mono">LIVE</span>
        </div>
        <ResonancePulse score={r.resonance.score} />
        <p className="text-xs text-foreground/70 mt-2 leading-relaxed">
          脉搏反映你们当前的"心跳节奏"——越稳定饱满，关系越有韧性。
        </p>
      </div>
    </div>
  );
}

/* —— 阶段：山路 + 三月情绪曲线 + 里程碑 + 下一阶段触发（可编辑） —— */
function PanelStage({ r, code, stageName, stageCaption }: {
  r: RosCoupleResult; code: string; stageName: string; stageCaption: string;
}) {
  const storageKey = `ros-story-${code}`;
  const [timeline, setTimeline] = useState<TimelinePoint[]>(r.timeline);
  const [milestones, setMilestones] = useState<Milestone[]>(r.milestones);
  const [editorOpen, setEditorOpen] = useState(false);
  const [edited, setEdited] = useState(false);

  // AI 小分析状态
  const [curveInsight, setCurveInsight] = useState<string | null>(null);
  const [milestoneInsight, setMilestoneInsight] = useState<string | null>(null);
  const [trendLabel, setTrendLabel] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          timeline: TimelinePoint[];
          milestones: Milestone[];
          curveInsight?: string;
          milestoneInsight?: string;
          trend?: string;
        };
        if (saved.timeline?.length) setTimeline(saved.timeline);
        if (saved.milestones?.length) setMilestones(saved.milestones);
        if (saved.curveInsight) setCurveInsight(saved.curveInsight);
        if (saved.milestoneInsight) setMilestoneInsight(saved.milestoneInsight);
        if (saved.trend) setTrendLabel(saved.trend);
        setEdited(true);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const runAnalysis = async (t: TimelinePoint[], m: Milestone[]) => {
    setInsightLoading(true);
    setCurveInsight(null);
    setMilestoneInsight(null);
    try {
      const res = await lovecompassApi.analyzeRosStory({
        timeline: t.map((p) => ({ label: p.label, value: p.value, note: p.note ?? null })),
        milestones: m,
        stageName,
      });
      setCurveInsight(res.curveInsight);
      setMilestoneInsight(res.milestoneInsight);
      setTrendLabel(res.trend.label);
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            timeline: t,
            milestones: m,
            curveInsight: res.curveInsight,
            milestoneInsight: res.milestoneInsight,
            trend: res.trend.label,
          }),
        );
      } catch {
        /* ignore */
      }
    } catch (e) {
      console.error(e);
      toast.error("AI 小分析暂时没生成出来，稍后再试");
    } finally {
      setInsightLoading(false);
    }
  };

  const save = (t: TimelinePoint[], m: Milestone[]) => {
    setTimeline(t);
    setMilestones(m);
    setEdited(true);
    try { localStorage.setItem(storageKey, JSON.stringify({ timeline: t, milestones: m })); } catch {/* ignore */}
    toast.success("已生成你们专属的可视化");
    void runAnalysis(t, m);
  };

  const reset = () => {
    setTimeline(r.timeline);
    setMilestones(r.milestones);
    setEdited(false);
    setCurveInsight(null);
    setMilestoneInsight(null);
    setTrendLabel(null);
    try { localStorage.removeItem(storageKey); } catch {/* ignore */}
    toast.success("已恢复示例数据");
  };

  const max = Math.max(...timeline.map((p) => p.value), 1);
  const min = Math.min(...timeline.map((p) => p.value), 0);
  const norm = (v: number) => 8 + ((v - min) / Math.max(1, max - min)) * 56;

  return (
    <div className="space-y-5">
      <SecLabel>// SHARED STAGE</SecLabel>
      <SecTitle>
        你们正在 · <span className="text-gradient-cyan">{stageName}</span>
      </SecTitle>
      <p className="text-xs text-muted-foreground -mt-3">{stageCaption}</p>

      <div className="bg-glass rounded-2xl p-4 md:p-6">
        <WaveStageCurve activeStage={r.stageId} />
      </div>

      {/* 编辑入口 */}
      <div className="rounded-2xl p-4 border flex items-center justify-between gap-3"
        style={{
          background: "linear-gradient(135deg, oklch(0.55 0.20 285 / 0.12), oklch(0.50 0.18 200 / 0.12))",
          borderColor: "oklch(0.68 0.18 285 / 0.3)",
        }}>
        <div className="min-w-0">
          <div className="text-[10px] tracking-[0.3em] font-mono text-[oklch(0.82_0.14_200)]">
            YOUR STORY · 自 定 义
          </div>
          <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
            {edited ? "正在显示你填写的故事线" : "用你们真实的节点替换示例，自动生成专属可视化"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {edited && (
            <button onClick={reset}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition"
              title="恢复示例">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <Button onClick={() => setEditorOpen(true)} size="sm"
            className="h-8 bg-gradient-to-r from-[oklch(0.55_0.20_285)] to-[oklch(0.50_0.18_200)] text-white">
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> {edited ? "继续编辑" : "我来填"}
          </Button>
        </div>
      </div>

      {/* 三月情绪曲线 */}
      <div className="bg-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <SecLabel>近 三 月 · 情 绪 曲 线</SecLabel>
          <span className="text-[10px] font-mono text-[oklch(0.85_0.10_200)] inline-flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> {edited ? "你的曲线" : "回暖中"}
          </span>
        </div>
        {timeline.length === 0 ? (
          <p className="text-xs text-muted-foreground py-8 text-center">还没有节点，点击上方"我来填"开始</p>
        ) : (
          <>
            <div className="relative h-24 mt-3 flex items-end justify-between gap-1">
              {timeline.map((p, i) => {
                const h = norm(p.value);
                const isLast = i === timeline.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}px` }}
                      transition={{ delay: 0.08 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="w-full max-w-[28px] rounded-t-md relative"
                      style={{
                        background: isLast
                          ? "linear-gradient(180deg, oklch(0.82 0.16 320), oklch(0.50 0.20 285))"
                          : "linear-gradient(180deg, oklch(0.68 0.10 270 / 0.6), oklch(0.40 0.08 270 / 0.6))",
                        boxShadow: isLast ? "0 0 18px -2px oklch(0.68 0.18 285)" : undefined,
                      }}
                    />
                    <div className="text-[9px] text-muted-foreground font-mono whitespace-nowrap truncate max-w-[60px]">{p.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              {timeline.filter((p) => p.note).map((p, i) => (
                <span key={`${p.label}-${i}`}>· {p.label} {p.note}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* AI 曲线速读 */}
      <InsightCard
        title="AI · 曲 线 速 读"
        loading={insightLoading}
        text={curveInsight}
        trendLabel={trendLabel}
        onRetry={() => runAnalysis(timeline, milestones)}
      />


      <div className="bg-glass rounded-2xl p-5">
        <SecLabel>关 系 里 程 碑</SecLabel>
        {milestones.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">还没有里程碑，点击上方"我来填"开始</p>
        ) : (
          <div className="mt-4 relative pl-5">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border/60" />
            {milestones.map((m, i) => {
              const Icon = m.tone === "spark" ? Flame : m.tone === "cool" ? Snowflake : Heart;
              const color = m.tone === "spark"
                ? "oklch(0.78 0.16 30)"
                : m.tone === "cool"
                  ? "oklch(0.75 0.10 230)"
                  : "oklch(0.82 0.14 355)";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.4 }}
                  className="relative pb-4 last:pb-0"
                >
                  <span className="absolute -left-[14px] top-1.5 w-2.5 h-2.5 rounded-full"
                    style={{ background: color, boxShadow: `0 0 10px -1px ${color}` }} />
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                    <span className="text-[10px] font-mono text-muted-foreground">{m.when}</span>
                  </div>
                  <div className="text-sm text-foreground/90 mt-0.5">{m.title || <span className="text-muted-foreground italic">（未填写）</span>}</div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI 里程碑速读 */}
      <InsightCard
        title="AI · 里 程 碑 速 读"
        loading={insightLoading}
        text={milestoneInsight}
        accent="rose"
        onRetry={() => runAnalysis(timeline, milestones)}
      />



      {/* 下一阶段触发信号 */}
      <div className="rounded-2xl p-5 border" style={{
        background: "linear-gradient(135deg, oklch(0.50 0.18 200 / 0.18), oklch(0.50 0.20 285 / 0.18))",
        borderColor: "oklch(0.68 0.18 285 / 0.35)",
      }}>
        <div className="flex items-center gap-1.5">
          <Compass className="h-4 w-4 text-[oklch(0.82_0.14_200)]" />
          <SecLabel>NEXT · 下 一 阶 段 触 发</SecLabel>
        </div>
        <p className="text-sm text-foreground/85 mt-2 leading-relaxed">{r.nextSignal}</p>
      </div>

      <StoryEditor
        open={editorOpen}
        initialTimeline={timeline}
        initialMilestones={milestones}
        onClose={() => setEditorOpen(false)}
        onSave={save}
      />
    </div>
  );
}

/* —— 双维对比：雷达 + 一致/差异 + 优势/盲点 —— */
function PanelDual({ r }: { r: RosCoupleResult }) {
  return (
    <div className="space-y-5">
      <SecLabel>// DUAL RADAR</SecLabel>
      <SecTitle>你们各自看到的样子</SecTitle>

      <div className="bg-glass rounded-2xl p-5">
        <DualRadar data={r.dims.map(d => ({ label: d.label, you: d.you, ta: d.ta }))} size={280} />
        <div className="flex justify-center gap-5 mt-3 text-xs">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[rgba(168,156,255,0.95)]" /> 你的视角
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[rgba(255,140,180,0.95)]" /> TA 的视角
          </span>
        </div>
      </div>

      {/* 一致 vs 差距 双卡 */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 border" style={{
          background: "linear-gradient(135deg, oklch(0.78 0.15 165 / 0.15), transparent)",
          borderColor: "oklch(0.78 0.15 165 / 0.35)",
        }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono text-[oklch(0.82_0.14_165)]">
            <Check className="h-3 w-3" /> 最 一 致
          </div>
          <div className="font-display text-base mt-2 text-foreground">{r.consensus.dimLabel}</div>
          <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">{r.consensus.body}</p>
        </div>
        <div className="rounded-2xl p-4 border" style={{
          background: "linear-gradient(135deg, oklch(0.82 0.14 75 / 0.15), transparent)",
          borderColor: "oklch(0.82 0.14 75 / 0.35)",
        }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono text-[oklch(0.85_0.12_75)]">
            <Activity className="h-3 w-3" /> 感 知 差 距
          </div>
          <div className="font-display text-base mt-2 text-foreground">{r.gap.dimLabel}</div>
          <p className="text-xs text-foreground/80 mt-1.5 whitespace-pre-line leading-relaxed">{r.gap.body}</p>
        </div>
      </div>

      {/* 维度差值 */}
      <div className="bg-glass rounded-2xl p-5 space-y-3.5">
        <SecLabel>逐 维 对 比</SecLabel>
        {r.dims.map((d) => {
          const diff = d.you - d.ta;
          const big = Math.abs(diff) > 15;
          return (
            <div key={d.key}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-foreground/85">{d.label}</span>
                <span className={`font-mono ${big ? "text-[oklch(0.82_0.14_75)]" : "text-muted-foreground"}`}>
                  {diff > 0 ? "+" : ""}{diff}
                </span>
              </div>
              <div className="relative h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${d.you}%` }} viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-0 left-0 h-full" style={{ background: "rgba(168,156,255,0.85)" }} />
              </div>
              <div className="relative h-1.5 rounded-full bg-secondary/60 overflow-hidden mt-1">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${d.ta}%` }} viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-0 left-0 h-full" style={{ background: "rgba(255,140,180,0.85)" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 优势 vs 盲点 */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-glass rounded-2xl p-5">
          <SecLabel>你 们 的 优 势</SecLabel>
          <ul className="mt-3 space-y-2.5">
            {r.strengths.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground/85 leading-relaxed">
                <WhoTag who={s.who} />
                <span className="min-w-0 flex-1">{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-glass rounded-2xl p-5">
          <SecLabel>各 自 的 盲 点</SecLabel>
          <ul className="mt-3 space-y-2.5">
            {r.blindspots.map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground/85 leading-relaxed">
                <WhoTag who={s.who} />
                <span className="min-w-0 flex-1">{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WhoTag({ who }: { who: "you" | "ta" | "both" }) {
  const map = {
    you: { label: "你", color: "rgba(168,156,255,0.95)" },
    ta: { label: "TA", color: "rgba(255,140,180,0.95)" },
    both: { label: "双方", color: "oklch(0.82 0.14 165)" },
  } as const;
  const m = map[who];
  return (
    <span className="shrink-0 mt-[3px] inline-flex items-center justify-center min-w-[30px] h-[18px] px-1.5 rounded text-[10px] font-mono"
      style={{ background: `color-mix(in oklab, ${m.color} 18%, transparent)`, color: m.color, border: `1px solid color-mix(in oklab, ${m.color} 40%, transparent)` }}>
      {m.label}
    </span>
  );
}

/* —— 依恋碰撞：双星 + 各自触发 + 追逃循环 + 破解 —— */
function PanelAttach({ r }: { r: RosCoupleResult }) {
  return (
    <div className="space-y-5">
      <SecLabel>// ATTACHMENT COLLISION</SecLabel>
      <SecTitle>你们之间的化学反应</SecTitle>

      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, oklch(0.50 0.20 285 / 0.18), oklch(0.18 0.020 270 / 0.7))",
          border: "1px solid oklch(0.68 0.18 285 / 0.35)",
        }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[oklch(0.50_0.20_285_/_0.25)] border border-[oklch(0.68_0.18_285_/_0.5)]">
            {r.collision.combo}
          </span>
        </div>
        <h4 className="font-display text-2xl text-gradient-violet">{r.collision.name}</h4>

        <div className="mt-4">
          <AttachmentOrbs
            youLabel={r.collision.combo.split("×")[0]?.trim() || "你"}
            taLabel={r.collision.combo.split("×")[1]?.trim() || "TA"}
          />
        </div>

        <p className="text-sm text-foreground/85 mt-4 leading-relaxed">{r.collision.body}</p>
      </div>

      {/* 各自的触发器 */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 border bg-glass" style={{ borderColor: "rgba(168,156,255,0.35)" }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono" style={{ color: "rgba(168,156,255,0.95)" }}>
            <Zap className="h-3 w-3" /> 你 的 触 发 器
          </div>
          <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{r.triggers.you}</p>
        </div>
        <div className="rounded-2xl p-4 border bg-glass" style={{ borderColor: "rgba(255,140,180,0.35)" }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono" style={{ color: "rgba(255,140,180,0.95)" }}>
            <Zap className="h-3 w-3" /> TA 的 触 发 器
          </div>
          <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{r.triggers.ta}</p>
        </div>
      </div>

      {/* 追逃循环 */}
      <div className="bg-glass rounded-2xl p-5">
        <SecLabel>追 逃 循 环 · 看 见 它 才 能 跳 出 它</SecLabel>
        <div className="mt-4 space-y-2">
          {r.loop.map((step, i) => {
            const isYou = step.actor === "you";
            const color = isYou ? "rgba(168,156,255,0.95)" : "rgba(255,140,180,0.95)";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isYou ? -10 : 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className={`flex items-start gap-2.5 ${isYou ? "" : "flex-row-reverse text-right"}`}
              >
                <span className="shrink-0 mt-[2px] inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-mono"
                  style={{ background: `color-mix(in oklab, ${color} 20%, transparent)`, color, border: `1px solid color-mix(in oklab, ${color} 40%, transparent)` }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono" style={{ color }}>{isYou ? "你" : "TA"}</div>
                  <div className="text-sm text-foreground/90 mt-0.5 leading-relaxed">{step.action}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl p-4 border" style={{
          background: "linear-gradient(135deg, oklch(0.82 0.14 165 / 0.15), transparent)",
          borderColor: "oklch(0.78 0.15 165 / 0.4)",
        }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono text-[oklch(0.82_0.14_165)]">
            <ArrowRight className="h-3 w-3" /> BRIDGE · 破 解
          </div>
          <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{r.bridge}</p>
        </div>

        <p className="text-[10px] text-muted-foreground mt-3">* 基于双方都完成了套一 · SELF 测试</p>
      </div>
    </div>
  );
}

/* —— 行动处方：时间梯度 + Do/Don't + Rx —— */
function PanelAction({ r, code, onShare }: {
  r: RosCoupleResult; code: string; onShare: () => void;
}) {
  return (
    <div className="space-y-5">
      <SecLabel>// ACTION · ROADMAP</SecLabel>
      <SecTitle>从今晚到三个月的具体行动</SecTitle>

      {/* 时间梯度 */}
      <div className="bg-glass rounded-2xl p-5">
        <div className="relative pl-5">
          <div className="absolute left-1.5 top-2 bottom-2 w-px"
            style={{ background: "linear-gradient(180deg, oklch(0.82 0.16 320), oklch(0.50 0.18 200))" }} />
          {r.horizons.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
              className="relative pb-5 last:pb-0"
            >
              <span className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full"
                style={{ background: "oklch(0.68 0.18 285)", boxShadow: "0 0 10px -1px oklch(0.68 0.18 285)" }} />
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-[oklch(0.82_0.14_200)]" />
                <span className="text-[10px] font-mono tracking-[0.2em] text-[oklch(0.85_0.10_200)]">{h.when}</span>
              </div>
              <div className="font-display text-base text-foreground mt-0.5">{h.title}</div>
              <p className="text-xs text-foreground/70 mt-1 leading-relaxed">{h.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Do / Don't */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 border" style={{
          background: "linear-gradient(135deg, oklch(0.78 0.15 165 / 0.15), transparent)",
          borderColor: "oklch(0.78 0.15 165 / 0.35)",
        }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono text-[oklch(0.82_0.14_165)]">
            <Check className="h-3 w-3" /> DO · 多 做
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {r.doDont.do.map((d) => (
              <li key={d} className="text-sm text-foreground/85 flex gap-2">
                <span className="text-[oklch(0.82_0.14_165)]">+</span>{d}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl p-4 border" style={{
          background: "linear-gradient(135deg, oklch(0.65 0.20 25 / 0.12), transparent)",
          borderColor: "oklch(0.65 0.20 25 / 0.35)",
        }}>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] font-mono text-[oklch(0.78_0.16_25)]">
            <X className="h-3 w-3" /> DON'T · 少 做
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {r.doDont.dont.map((d) => (
              <li key={d} className="text-sm text-foreground/85 flex gap-2">
                <span className="text-[oklch(0.78_0.16_25)]">−</span>{d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* AI · 三件事 */}
      <div className="space-y-2.5">
        <SecLabel>// AI · 给 你 们 的 三 件 事</SecLabel>
        {r.advice.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 * i, duration: 0.4 }}
            className="bg-glass rounded-xl p-4 flex gap-3"
          >
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[oklch(0.50_0.20_285_/_0.2)] font-display text-sm text-[oklch(0.88_0.10_285)]">
              {i + 1}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-[14px]">{a.title}</div>
              <div className="text-xs text-foreground/70 mt-1 leading-relaxed">{a.body}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 处方签 */}
      <div className="pt-1">
        <SecLabel>// PRESCRIPTION</SecLabel>
        <div className="mt-3">
          <PrescriptionCard data={r.prescription} />
        </div>
      </div>

      {/* 分享卡：仅金句，去掉重复的共鸣分数 */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, oklch(0.55 0.20 355 / 0.3), oklch(0.50 0.20 285 / 0.3))",
          border: "1px solid oklch(0.78 0.16 360 / 0.35)",
        }}>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.16 200 / 0.35), transparent 70%)" }} />
        <Quote className="h-5 w-5 text-foreground/40" />
        <p className="font-display text-lg md:text-xl mt-2 text-foreground leading-snug">"{r.shareLine}"</p>
        <div className="mt-4 flex items-end justify-between">
          <div className="text-[10px] tracking-[0.3em] text-muted-foreground font-mono">
            MIRROR · ROS · {code}
          </div>
          <Button size="sm" onClick={onShare} className="bg-foreground/90 text-background hover:bg-foreground">
            <Share2 className="h-3.5 w-3.5 mr-1.5" /> 分享
          </Button>
        </div>
      </div>
    </div>
  );
}
