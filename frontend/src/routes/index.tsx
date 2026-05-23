import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, type Product } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HintButton } from "@/components/HintButton";
import { Lock, ArrowRight, Sparkles, MessageSquare, Brain, Layers, Repeat, Heart, AlertTriangle, MessageCircle, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "MIRROR · AI 关系画像系统" },
    { name: "description", content: "多套测评 · 一份持续更新的人格档案。AI 关系分析师为你生成可对话、可深挖的关系画像。" },
    { property: "og:title", content: "MIRROR · AI 关系画像系统" },
    { property: "og:description", content: "多套测评 · 一份持续更新的人格档案。" },
  ] }),
  component: Home,
});

const ACCENT: Record<Product["accent"], { ring: string; text: string; glow: string; chip: string }> = {
  violet: { ring: "from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)]", text: "text-gradient-violet", glow: "hover:glow-violet", chip: "chip-violet" },
  cyan: { ring: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]", text: "text-gradient-cyan", glow: "hover:glow-cyan", chip: "chip-cyan" },
  rose: { ring: "from-[oklch(0.72_0.18_360)] to-[oklch(0.55_0.20_355)]", text: "text-gradient-violet", glow: "hover:glow-violet", chip: "chip-violet" },
};

function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative min-h-screen">
      {/* Top bar */}
      <header className="relative z-30 flex items-center justify-between px-5 md:px-12 pt-5 md:pt-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] flex items-center justify-center text-[oklch(0.12_0.018_270)] font-bold text-sm">M</div>
          <span className="font-display tracking-wide text-foreground/95">MIRROR<span className="text-muted-foreground/60 ml-1">/v1</span></span>
        </Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm">
          <span className="chip chip-violet">SYSTEM · ONLINE</span>
          <Link to="/chat" className="text-foreground/80 hover:text-foreground transition inline-flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" /> AI 咨询
          </Link>
          {user ? (
            <>
              <Link to="/history" className="text-foreground/80 hover:text-foreground transition">我的档案</Link>
              <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground hover:text-foreground transition">退出</button>
            </>
          ) : (
            <Link to="/auth" className="text-accent hover:opacity-80 transition">登录</Link>
          )}
        </nav>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="菜单"
          className="md:hidden w-9 h-9 rounded-lg bg-glass border border-border/60 grid place-items-center"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {/* Mobile menu sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed top-[68px] left-4 right-4 z-30 bg-glass-strong rounded-2xl border border-border/60 p-4 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1 text-sm">
              <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-[oklch(0.50_0.20_285/0.1)]">
                <MessageSquare className="h-4 w-4" /> AI 咨询
              </Link>
              {user ? (
                <>
                  <Link to="/history" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg hover:bg-[oklch(0.50_0.20_285/0.1)]">我的档案</Link>
                  <button onClick={() => { supabase.auth.signOut(); setMenuOpen(false); }} className="text-left px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-[oklch(0.50_0.20_285/0.1)]">退出</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-accent hover:bg-[oklch(0.50_0.20_285/0.1)]">登录</Link>
              )}
              <div className="my-1 h-px bg-border/50" />
              {[
                { id: "products", label: "测评库" },
                { id: "examples", label: "看示例" },
                { id: "how", label: "运作方式" },
                { id: "analyst", label: "AI 分析师" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setMenuOpen(false); setTimeout(() => scrollToId(s.id), 120); }}
                  className="text-left px-3 py-2.5 rounded-lg text-foreground/80 hover:bg-[oklch(0.50_0.20_285/0.1)]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky section index (appears after hero) */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-20 max-w-[94vw]"
          >
            <div className="bg-glass-strong border border-border/60 rounded-full px-2 py-1.5 backdrop-blur-xl flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              {[
                { id: "products", label: "测试" },
                { id: "examples", label: "示例" },
                { id: "how", label: "原理" },
                { id: "analyst", label: "分析师" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToId(s.id)}
                  className="px-3 py-1 text-[12px] rounded-full text-foreground/75 hover:text-foreground hover:bg-[oklch(0.50_0.20_285/0.15)] transition whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating sticky CTA */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            onClick={() => scrollToId("products")}
            className="fixed bottom-5 right-4 md:bottom-7 md:right-7 z-30 inline-flex items-center gap-2 rounded-full pl-5 pr-4 h-12 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground font-medium shadow-[0_8px_30px_-4px_oklch(0.55_0.20_285/0.55)] hover:opacity-95"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
          >
            <Sparkles className="h-4 w-4" />
            开始第一套测试
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>


      {/* Hero */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="chip chip-cyan font-mono">AI · INTIMACY · LIVE PROFILE</span>
          <h1 className="font-display text-5xl md:text-7xl mt-7 leading-[1.02] tracking-tight">
            <span className="text-gradient-violet">一面会进化的</span>
            <br />
            <span className="text-foreground/90">关系镜子</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-foreground/70 leading-relaxed">
            多套测评 · 一份持续更新的人格档案。每一次对话,AI 都在重新理解你——
            <br className="hidden md:block" />
            直到这份画像比你自己更先一步看见你。
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Button
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90 px-7 h-11 rounded-full font-medium"
            >
              开始第一套测试 <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => nav({ to: user ? "/history" : "/auth" })}
              className="rounded-full h-11 px-6 border-border/60 bg-glass">
              {user ? "查看我的档案" : "登录"}
            </Button>
          </div>

          {/* spec strip */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground font-mono">
            <span>·  3 套测试</span>
            <span>·  190 道题</span>
            <span>·  画像实时进化</span>
            <span>·  AI 分析师对话</span>
          </div>
        </motion.div>

        {/* RESULT PREVIEW */}
        <ResultPreview />
      </section>

      {/* EXAMPLE PROFILES */}
      <ExampleProfiles />


      {/* Products */}
      <section id="products" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 scroll-mt-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-xs tracking-[0.35em] text-muted-foreground">// PRODUCTS</div>
            <h2 className="font-display text-3xl md:text-4xl mt-2 text-foreground">三层递进的画像系统</h2>
          </div>
          <span className="hidden md:inline-flex chip font-mono">SELF → ROS → MATE</span>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PRODUCTS.map((p, i) => {
            const a = ACCENT[p.accent];
            const isComingSoon = p.status === "coming-soon";
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <div className={`relative bg-glass rounded-2xl p-6 h-full overflow-hidden group transition-all duration-500 hover:-translate-y-1 ${a.glow}`}>
                  {/* corner accent */}
                  <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${a.ring} opacity-20 blur-2xl`} />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{p.code}</span>
                      <span className={`chip font-mono text-[10px]`}>
                        {!isComingSoon && <Lock className="h-2.5 w-2.5" />}
                        {p.badge}
                      </span>
                    </div>

                    <h3 className={`font-display text-2xl mt-6 ${a.text}`}>{p.title}</h3>
                    <p className="text-sm text-foreground/75 mt-1.5">{p.subtitle}</p>

                    <p className="text-[13px] text-foreground/65 leading-relaxed mt-4 min-h-[78px]">
                      {p.description}
                    </p>

                    <div className="divider-line my-5" />

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {p.dimensions.slice(0, 4).map((d) => (
                        <span key={d} className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-foreground/60">
                          {d}
                        </span>
                      ))}
                      {p.dimensions.length > 4 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 text-muted-foreground">+{p.dimensions.length - 4}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mb-5">
                      <span>{p.duration}</span>
                      <span>{p.questionCount}</span>
                    </div>

                    <HintButton
                      onClick={() => nav({ to: "/tests/$id", params: { id: p.id } })}
                      blocked={isComingSoon}
                      blockedHint="该测试尚未开放，请关注后续更新"
                      className="w-full inline-flex items-center justify-center bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90 rounded-xl h-10 font-medium text-sm"
                    >
                      {isComingSoon ? (
                        <>
                          <Lock className="mr-1.5 h-3.5 w-3.5" />
                          即将开放
                        </>
                      ) : (
                        <>
                          兑换后开始 <ArrowRight className="ml-1 h-4 w-4" />
                        </>
                      )}
                    </HintButton>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16 scroll-mt-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-xs tracking-[0.35em] text-muted-foreground">// HOW IT WORKS</div>
            <h2 className="font-display text-3xl md:text-4xl mt-2 text-foreground">画像是如何"长出来"的</h2>
          </div>
          <span className="hidden md:inline-flex chip font-mono">4 STEPS · LIVE LOOP</span>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { n: "01", icon: Layers, title: "做测试", desc: "从 SELF 起步，逐步完成 ROS 与 MATE。" },
            { n: "02", icon: Brain, title: "AI 解读", desc: "后台匹配 34 个人格原型，生成画像草稿。" },
            { n: "03", icon: MessageSquare, title: "与分析师对话", desc: "选择咨询师，把画像变成可问、可深挖的对话。" },
            { n: "04", icon: Repeat, title: "画像进化", desc: "每次对话回写摘要，下一次它比你想得更早。" },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bg-glass rounded-2xl p-5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <s.icon className="h-5 w-5 text-[oklch(0.82_0.14_200)]" />
                <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{s.n}</span>
              </div>
              <h3 className="font-display text-lg mt-4 text-foreground/95">{s.title}</h3>
              <p className="text-[12.5px] text-foreground/65 leading-relaxed mt-1.5">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Analyst / Chat CTA */}
      <section id="analyst" className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-16 scroll-mt-20">
        <div className="bg-glass-strong rounded-3xl p-8 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 ring-grid opacity-30 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-[oklch(0.50_0.20_285)] to-[oklch(0.82_0.14_200)] opacity-20 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] flex items-center justify-center shrink-0">
              <Sparkles className="h-7 w-7 text-[oklch(0.10_0.018_270)]" />
            </div>
            <div className="flex-1">
              <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// YOUR AI ANALYST</div>
              <h3 className="font-display text-2xl md:text-3xl mt-1.5 text-gradient-violet">MIRROR · 关系镜像分析师</h3>
              <p className="mt-3 text-sm text-foreground/75 leading-relaxed max-w-2xl">
                我读取你完成的所有测评 + 每次对话的摘要，在后台持续更新你的"人格档案"。
                每次你回来，我比上次更懂你一点——这是一份会进化的镜子，不是一次性的报告。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip chip-violet font-mono">MIRROR · ONLINE</span>
                <span className="chip font-mono opacity-70">EMBER · SOON</span>
                <span className="chip font-mono opacity-70">ATLAS · SOON</span>
              </div>
            </div>
            <Button
              onClick={() => nav({ to: "/chat" })}
              className="rounded-full h-11 px-6 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90"
            >
              开始对话 <MessageSquare className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-12 text-center font-mono text-[10px] tracking-[0.4em] text-muted-foreground">
        © MIRROR · A LIVE RELATIONSHIP PROFILE
      </footer>
    </main>
  );
}

/* ---------------- Result Preview Card ---------------- */

const PREVIEW_ITEMS = [
  { icon: Brain, label: "人格模式", sub: "Personality Pattern" },
  { icon: Heart, label: "关系风格", sub: "Relationship Style" },
  { icon: Sparkles, label: "匹配洞察", sub: "Compatibility Insights" },
  { icon: MessageCircle, label: "沟通倾向", sub: "Communication Tendencies" },
  { icon: AlertTriangle, label: "认知盲区", sub: "Blind Spots" },
];

function ResultPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="mt-14 max-w-2xl mx-auto text-left"
    >
      {/* Includes list */}
      <div className="bg-glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// YOUR RESULT INCLUDES</div>
            <h3 className="font-display text-xl mt-1.5 text-foreground">做完，你会拿到这些</h3>
          </div>
          <span className="chip chip-cyan font-mono">5 LAYERS</span>
        </div>
        <ul className="space-y-2.5">
          {PREVIEW_ITEMS.map((it, i) => (
            <motion.li
              key={it.label}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[oklch(0.50_0.20_285/0.07)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.50_0.20_285/0.4)] to-[oklch(0.55_0.16_200/0.3)] grid place-items-center shrink-0">
                <it.icon className="h-4 w-4 text-[oklch(0.90_0.06_240)]" />
              </div>
              <div className="flex-1 flex items-baseline justify-between gap-3">
                <span className="text-[14px] text-foreground/90">{it.label}</span>
                <span className="text-[11px] text-muted-foreground">{it.sub}</span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

    </motion.div>
  );
}

/* ---------------- Example Profiles (horizontal scroll) ---------------- */

const SAMPLES = [
  { code: "SELF-04", name: "深度连接探索者", en: "Deep Connection Explorer", tag: "情感深度型", hue: 285, depth: 86, comm: 64, line: "稳定 · 好奇 · 忠诚" },
  { code: "SELF-08", name: "独立思辨者", en: "Independent Thinker", tag: "独立思辨型", hue: 200, depth: 58, comm: 72, line: "自主 · 敏锐 · 冷静" },
  { code: "SELF-12", name: "温暖连接者", en: "Warm Connector", tag: "温暖连接型", hue: 30, depth: 78, comm: 88, line: "开放 · 慷慨 · 在场" },
  { code: "SELF-17", name: "好奇浪漫派", en: "Curious Romantic", tag: "好奇浪漫派", hue: 360, depth: 82, comm: 70, line: "俏皮 · 温柔 · 探索" },
];

function ExampleProfiles() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) => scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <section id="examples" className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-4 pb-8 scroll-mt-20">
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// EXAMPLES</div>
          <h2 className="font-display text-2xl md:text-3xl mt-2 text-foreground">
            看看别人的画像 <span className="text-muted-foreground/60">→</span>
          </h2>
          <p className="text-[13px] text-foreground/65 mt-1.5">我会是哪一种？滑动看几个示例。</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scrollBy(-340)}
            className="w-9 h-9 rounded-full bg-glass border border-border/60 grid place-items-center hover:border-[oklch(0.68_0.18_285/0.7)] transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(340)}
            className="w-9 h-9 rounded-full bg-glass border border-border/60 grid place-items-center hover:border-[oklch(0.68_0.18_285/0.7)] transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 md:-mx-12 md:px-12 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {SAMPLES.map((s, i) => (
          <motion.div
            key={s.code}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="snap-start shrink-0 w-[300px] md:w-[320px] bg-glass rounded-2xl p-5 relative overflow-hidden hover:-translate-y-1 transition-transform"
          >
            <div
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-50"
              style={{ background: `oklch(0.55 0.20 ${s.hue} / 0.5)` }}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground">{s.code}</span>
                <span className="chip font-mono text-[9px]">EXAMPLE</span>
              </div>
              <h4 className="font-display text-lg mt-3 text-foreground leading-tight">{s.name}</h4>
              <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">{s.en}</div>
              <div className="text-[12px] text-foreground/65 mt-1">{s.tag}</div>

              <div className="mt-4 space-y-2.5">
                {[
                  { l: "情感深度", v: s.depth },
                  { l: "沟通能力", v: s.comm },
                ].map((b) => (
                  <div key={b.l}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-foreground/70">{b.l}</span>
                      <span className="font-mono text-foreground/85 tabular-nums">{b.v}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-secondary/50 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${b.v}%`,
                          background: `linear-gradient(90deg, oklch(0.68 0.18 ${s.hue}) 0%, oklch(0.82 0.14 ${(s.hue + 285) % 360}) 100%)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 border-t border-border/40 font-mono text-[10px] tracking-[0.2em] text-muted-foreground/80">
                {s.line}
              </div>
            </div>
          </motion.div>
        ))}
        {/* tail spacer */}
        <div className="shrink-0 w-4" />
      </div>
    </section>
  );
}
