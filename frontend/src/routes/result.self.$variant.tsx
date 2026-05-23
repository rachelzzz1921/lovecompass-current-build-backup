import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { MOCK_SELF_RESULT } from "@/data/mockResult";
import { RadarChart } from "@/components/RadarChart";
import { DimensionBars } from "@/components/DimensionBars";
import { ScoreOrb } from "@/components/ScoreOrb";
import { CountUp } from "@/components/CountUp";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Lock, MessageCircle, Share2, Sparkles, TrendingUp, AlertCircle,
  Heart, Compass, Eye, Flame, Swords, Shield, KeyRound, EyeOff, X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/result/self/$variant")({
  head: () => ({ meta: [
    { title: "你的关系画像 · MIRROR" },
    { name: "description", content: "MIRROR 为你生成的自我关系模式画像。" },
  ] }),
  component: SelfResultPage,
});

const INSIGHT_ICON = {
  strength: { icon: TrendingUp, color: "text-[oklch(0.78_0.15_165)]", bg: "bg-[oklch(0.50_0.18_165/0.15)]" },
  watch: { icon: AlertCircle, color: "text-[oklch(0.82_0.14_75)]", bg: "bg-[oklch(0.55_0.18_75/0.15)]" },
  match: { icon: Heart, color: "text-[oklch(0.72_0.18_360)]", bg: "bg-[oklch(0.55_0.20_355/0.15)]" },
  growth: { icon: Compass, color: "text-[oklch(0.82_0.14_200)]", bg: "bg-[oklch(0.55_0.16_200/0.15)]" },
} as const;

const TRAIT_ICON = {
  shield: { Icon: Shield, tint: "oklch(0.82 0.14 200)" },
  key: { Icon: KeyRound, tint: "oklch(0.78 0.15 165)" },
  eye: { Icon: EyeOff, tint: "oklch(0.82 0.14 75)" },
} as const;

function SelfResultPage() {
  useParams({ from: "/result/self/$variant" });
  const nav = useNavigate();
  const r = MOCK_SELF_RESULT;
  const [tab, setTab] = useState("traits");
  const [revealed, setRevealed] = useState(false);
  const [overlay, setOverlay] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`我的关系画像：${r.archetype.name} —— ${r.archetype.tagline}\n${typeof window !== "undefined" ? window.location.href : ""}`);
      toast.success("已复制到剪贴板");
    } catch { toast.error("复制失败"); }
  };

  const openReveal = () => setOverlay(true);
  const closeReveal = () => {
    setOverlay(false);
    if (!revealed) setRevealed(true);
  };

  return (
    <main className="relative min-h-screen">
      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Link>
        <div className="flex items-center gap-3">
          <span className="chip chip-cyan font-mono">SET · 01 / SELF</span>
          <span className="chip font-mono hidden md:inline-flex">PROFILE · v1.0</span>
        </div>
      </header>

      <section className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-10">
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="chip chip-violet font-mono inline-flex"
          >
            {r.archetype.badge}
          </motion.span>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.15 }}
            className="flex justify-center mt-6">
            <ScoreOrb value={r.overallScore} size={180} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-display text-4xl md:text-5xl mt-6 text-gradient-violet tracking-tight"
          >
            {r.archetype.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            className="font-mono text-[11px] tracking-[0.3em] text-muted-foreground mt-2"
          >
            {r.archetype.code}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-5 max-w-md mx-auto text-left rounded-xl px-4 py-3 bg-secondary/30 border-l-2 border-[oklch(0.68_0.18_285/0.55)]"
          >
            <p className="text-[14px] leading-[1.75] text-foreground/80 italic">「{r.archetype.tagline}」</p>
          </motion.div>
        </motion.div>

        {/* TABS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-10"
        >
          <Tabs value={tab} onValueChange={setTab}>
            <div className="border-b border-border/40 -mx-2 px-2 overflow-x-auto scrollbar-none">
              <TabsList className="bg-transparent p-0 h-auto gap-1">
                {[
                  { v: "traits", label: "核心特质" },
                  { v: "radar", label: "六维画像" },
                  { v: "scenes", label: "行为模拟" },
                  { v: "character", label: "红楼人格" },
                  { v: "insight", label: "AI 洞察" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="relative rounded-none bg-transparent shadow-none px-3 py-3 text-[13px] text-muted-foreground border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[oklch(0.82_0.14_200)] data-[state=active]:border-[oklch(0.82_0.14_200)] transition-colors"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* 核心特质 */}
            <TabsContent value="traits" className="mt-5">
              <div className="bg-glass rounded-2xl p-6 md:p-7">
                <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// CORE TRAITS</div>
                <h3 className="font-display text-lg mt-1 mb-5 text-foreground">你的三个核心特质</h3>
                <div className="space-y-3">
                  {r.coreTraits.map((t, i) => {
                    const { Icon, tint } = TRAIT_ICON[t.icon];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        className={`flex gap-3.5 p-4 rounded-xl border transition-shadow hover:shadow-lg ${
                          t.highlight
                            ? "border-[oklch(0.68_0.18_285/0.45)] bg-[oklch(0.50_0.20_285/0.08)]"
                            : "border-border/50 bg-secondary/30"
                        }`}
                        style={t.highlight ? { boxShadow: `0 0 0 0 ${tint}` } : undefined}
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 220, damping: 14, delay: i * 0.1 + 0.15 }}
                          className="shrink-0 w-9 h-9 rounded-lg grid place-items-center"
                          style={{ background: `color-mix(in oklab, ${tint} 18%, transparent)` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: tint }} />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-medium text-foreground">{t.title}</div>
                          <div className="text-[13px] text-foreground/70 mt-1.5 leading-[1.75]">{t.body}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* 六维画像 */}
            <TabsContent value="radar" className="mt-5 space-y-5">
              <div className="bg-glass rounded-2xl p-6 md:p-7">
                <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// SIX-AXIS MAP</div>
                <h3 className="font-display text-lg mt-1 text-foreground">六维画像</h3>
                <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
                  <div className="shrink-0"><RadarChart data={r.dimensions} size={280} /></div>
                  <div className="flex-1 w-full space-y-2.5">
                    {r.dimensions.map((d, i) => (
                      <motion.div
                        key={d.key}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45, delay: 0.05 * i }}
                        className="flex items-center gap-2.5 text-sm"
                      >
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ background: d.color, boxShadow: `0 0 8px ${d.color}` }}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 2.4, delay: 0.6 + i * 0.15, repeat: Infinity, repeatDelay: 3 }}
                        />
                        <span className="text-foreground/80 flex-1">{d.label}</span>
                        <CountUp to={d.value} duration={1.2} className="font-mono tabular-nums text-foreground/90" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-glass rounded-2xl p-6 md:p-7">
                <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// DIMENSION DETAIL</div>
                <h3 className="font-display text-lg mt-1 mb-5 text-foreground">维度详情</h3>
                <DimensionBars data={r.dimensions} />
              </div>
            </TabsContent>

            {/* 行为模拟 */}
            <TabsContent value="scenes" className="mt-5">
              <div className="bg-glass rounded-2xl p-6 md:p-7 relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-[oklch(0.72_0.18_360/0.25)] to-[oklch(0.68_0.18_285/0.15)] blur-3xl pointer-events-none" />
                <div className="relative">
                  <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// RELATIONSHIP SIMULATION</div>
                  <h3 className="font-display text-lg mt-1 text-foreground">关系里的你 · 行为模拟</h3>
                  <p className="text-[12px] text-foreground/60 mt-1 mb-5">三个高频场景里，你最可能呈现的样子。</p>
                  <div className="space-y-3">
                    {r.behaviors.map((b, i) => {
                      const icons = [Eye, Swords, Flame];
                      const tints = ["oklch(0.82 0.14 200)", "oklch(0.82 0.14 75)", "oklch(0.72 0.18 360)"];
                      const Icon = icons[i];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, delay: i * 0.1 }}
                          className="flex gap-4 p-4 rounded-xl bg-secondary/40 border border-border/40"
                        >
                          <div
                            className="shrink-0 w-10 h-10 rounded-xl grid place-items-center"
                            style={{ background: `color-mix(in oklab, ${tints[i]} 20%, transparent)` }}
                          >
                            <Icon className="h-5 w-5" style={{ color: tints[i] }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">
                              0{i + 1} · {b.scene}
                            </span>
                            <div className="text-[14px] font-medium text-foreground mt-1">{b.title}</div>
                            <div className="text-[13px] text-foreground/70 mt-1.5 leading-[1.7]">{b.body}</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="mt-5 text-center font-mono text-[10px] tracking-[0.3em] text-muted-foreground/70">
                    「太像我了」← 这正是 MIRROR 想做到的事
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 红楼人格 */}
            <TabsContent value="character" className="mt-5">
              <div className="bg-glass rounded-2xl p-6 md:p-7 relative overflow-hidden">
                <div className="absolute inset-0 ring-grid opacity-20 pointer-events-none" />
                <div className="relative">
                  <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// CHARACTER REVEAL</div>
                  <h3 className="font-display text-lg mt-1 text-foreground">你的红楼人格</h3>

                  {!revealed ? (
                    <div className="mt-6 text-center py-6">
                      <p className="text-[13px] text-foreground/65 leading-[1.85] mb-6">
                        根据你的六维画像和行为模拟，<br/>系统已匹配你在红楼梦中的对应人格。
                      </p>
                      <Button
                        onClick={openReveal}
                        className="rounded-full h-11 px-6 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90"
                      >
                        <Sparkles className="mr-2 h-4 w-4" /> 揭晓我的红楼人格
                      </Button>
                    </div>
                  ) : (
                    <CharacterContent character={r.character} matches={r.matches} />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* AI 洞察 */}
            <TabsContent value="insight" className="mt-5">
              <div className="bg-glass rounded-2xl p-6 md:p-7">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// AI INSIGHT</div>
                    <h3 className="font-display text-lg mt-1 text-foreground">AI 分析师摘要</h3>
                  </div>
                  <span className="chip chip-violet font-mono"><Sparkles className="h-2.5 w-2.5" /> BASIC</span>
                </div>
                <div className="space-y-2.5">
                  {r.insights.map((ins, i) => {
                    const cfg = INSIGHT_ICON[ins.kind];
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}
                        className="flex gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border/40">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-medium text-foreground">{ins.title}</div>
                          <div className="text-[13px] text-foreground/70 mt-1 leading-relaxed">{ins.body}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* LOCKED / UPSELL */}
        <div className="mt-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 divider-line" />
            <span className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">解锁更深层 · UNLOCK DEEPER</span>
            <div className="flex-1 divider-line" />
          </div>

          {r.lockedTeasers.map((t) => (
            <div key={t.id}
              className="relative bg-glass-strong rounded-2xl p-5 md:p-6 overflow-hidden group">
              <div className="absolute inset-0 ring-grid opacity-20" />
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-[oklch(0.68_0.18_285/0.4)] to-[oklch(0.82_0.14_200/0.2)] blur-3xl" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">LOCKED</span>
                  </div>
                  <div className="font-display text-lg mt-1.5 text-foreground">{t.title}</div>
                  <div className="text-[13px] text-foreground/65 mt-1 leading-relaxed">{t.hint}</div>
                </div>
                <Button variant="outline" disabled className="rounded-full border-border/60 bg-secondary/30 text-muted-foreground shrink-0">
                  即将开放
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA ROW */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => toast.info("AI 分析师对话即将上线")}
            className="rounded-xl h-12 bg-glass border-border/60 text-foreground">
            <MessageCircle className="mr-2 h-4 w-4" /> 找 AI 分析师聊聊
          </Button>
          <Button onClick={share}
            className="rounded-xl h-12 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90 font-medium">
            <Share2 className="mr-2 h-4 w-4" /> 生成分享卡片
          </Button>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => nav({ to: "/" })} className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground hover:text-foreground transition">
            ← 返回首页
          </button>
        </div>
      </section>

      {/* REVEAL OVERLAY */}
      <AnimatePresence>
        {overlay && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 py-10"
            style={{ background: "color-mix(in oklab, oklch(0.10 0.018 270) 96%, transparent)" }}
          >
            {/* ambient gradient backdrop */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                background:
                  "radial-gradient(circle at 50% 38%, oklch(0.50 0.20 285 / 0.35), transparent 55%), radial-gradient(circle at 50% 62%, oklch(0.45 0.15 200 / 0.25), transparent 60%)",
              }}
            />
            {/* floating sparkles */}
            {Array.from({ length: 14 }).map((_, i) => {
              const angle = (i / 14) * Math.PI * 2;
              const dist = 120 + (i % 3) * 40;
              const x = Math.cos(angle) * dist;
              const y = Math.sin(angle) * dist;
              return (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full pointer-events-none"
                  style={{ background: "oklch(0.85 0.14 200)", boxShadow: "0 0 8px oklch(0.85 0.14 200)" }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{ x, y, opacity: [0, 1, 0.6, 0], scale: [0, 1, 1, 0] }}
                  transition={{ duration: 2.4, delay: 0.3 + i * 0.05, ease: "easeOut", repeat: Infinity, repeatDelay: 1.5 }}
                />
              );
            })}

            <button
              onClick={closeReveal}
              className="absolute top-5 right-5 w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground transition z-10"
              aria-label="close"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[130px] h-[130px] rounded-full grid place-items-center mb-6"
              style={{
                background: "radial-gradient(circle, oklch(0.68 0.18 285 / 0.30), transparent 70%)",
              }}
            >
              {/* expanding rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: "oklch(0.78 0.16 285 / 0.45)" }}
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 2.4, delay: i * 0.7, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl relative"
              >
                {r.character.emoji}
              </motion.div>
            </motion.div>

            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground mb-2">· 根据你的完整画像 ·</div>
            <div className="text-[13px] text-foreground/65 tracking-wider mb-3">在红楼梦的世界里，你是</div>

            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.55 }}
              className="font-display text-5xl md:text-6xl text-gradient-violet tracking-tight"
            >
              {r.character.name}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="font-mono text-[10px] tracking-[0.32em] text-muted-foreground mt-3 mb-4"
            >
              {r.character.pinyin}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-[14px] text-foreground/75 leading-[1.95] text-center max-w-[280px] whitespace-pre-line mb-8"
            >
              {r.character.quote}
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05 }}
              onClick={closeReveal}
              className="px-6 py-3 rounded-xl text-[13px] tracking-wider text-[oklch(0.82_0.14_200)] border border-[oklch(0.82_0.14_200/0.35)] bg-[oklch(0.50_0.16_200/0.10)] hover:bg-[oklch(0.50_0.16_200/0.16)] transition"
            >
              查看详细解读 →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function CharacterContent({
  character,
  matches,
}: { character: typeof MOCK_SELF_RESULT.character; matches: typeof MOCK_SELF_RESULT.matches }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center py-5 border-b border-border/40 mb-5">
        <div className="font-mono text-[10px] tracking-[0.32em] text-muted-foreground mb-3">· 你的人格原型 ·</div>
        <div className="font-display text-4xl text-gradient-violet">{character.name}</div>
        <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground mt-2 mb-3">{character.pinyin}</div>
        <p className="text-[13px] text-foreground/70 leading-[1.85] max-w-[280px] mx-auto italic">「{character.archetypeLine}」</p>
      </div>

      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// WHY YOU ARE HER</div>
      <h4 className="font-display text-base mt-1 mb-3 text-foreground">你和她，为什么这么像</h4>
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
        <h4 className="font-display text-base mt-1 mb-3 text-foreground">最匹配的对象类型</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {matches.map((m) => (
            <motion.div key={m.code} whileHover={{ y: -3 }}
              className={`relative rounded-xl p-4 border ${m.top ? "border-[oklch(0.68_0.18_285/0.6)] bg-[oklch(0.50_0.20_285/0.10)]" : "border-border/60 bg-secondary/30"}`}>
              {m.top && <span className="absolute -top-2 left-3 chip chip-violet text-[9px] py-0.5">最高匹配</span>}
              <div className="font-mono text-[10px] text-muted-foreground">{m.code}</div>
              <div className="font-display text-base mt-1.5 text-foreground">{m.name}</div>
              <div className="text-xs text-foreground/65 mt-1 leading-snug">{m.tagline}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-2xl text-gradient-violet tabular-nums">{m.pct}</span>
                <span className="text-xs text-muted-foreground">% 契合</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
