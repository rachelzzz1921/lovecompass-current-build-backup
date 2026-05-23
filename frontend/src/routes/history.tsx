import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Activity, Lock } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "我的画像档案 · MIRROR" },
      { name: "description", content: "你的关系画像随时间持续进化。查看历史快照与对话摘要。" },
    ],
  }),
  component: HistoryPage,
});

type Snapshot = {
  id: string;
  attemptId?: string;
  set: "SELF" | "ROS" | "MATE";
  code: string;
  date: string;
  archetype: { name: string; tagline: string; emoji: string };
  index: number;
  delta: number;
  accent: "violet" | "cyan" | "rose";
  locked?: boolean;
};

const MOCK: Snapshot[] = [
  {
    id: "snap-04",
    attemptId: "snap-04",
    set: "SELF",
    code: "SET·01 / SELF",
    date: "2026.05.21 · 22:14",
    archetype: { name: "深海回声型", tagline: "在沉默里听见对方的潮汐", emoji: "🌊" },
    index: 78,
    delta: +6,
    accent: "violet",
  },
  {
    id: "snap-03",
    attemptId: "snap-03",
    set: "SELF",
    code: "SET·01 / SELF",
    date: "2026.04.30 · 09:02",
    archetype: { name: "微光观测者", tagline: "在距离里温柔地保持靠近", emoji: "✨" },
    index: 72,
    delta: +3,
    accent: "violet",
  },
  {
    id: "snap-02",
    set: "ROS",
    code: "SET·02 / ROS",
    date: "—",
    archetype: { name: "尚未解锁", tagline: "做完这一套，我会重新认识你们", emoji: "🔒" },
    index: 0,
    delta: 0,
    accent: "cyan",
    locked: true,
  },
  {
    id: "snap-01",
    set: "MATE",
    code: "SET·03 / MATE",
    date: "—",
    archetype: { name: "尚未解锁", tagline: "三套合并后，画像才完整", emoji: "🔒" },
    index: 0,
    delta: 0,
    accent: "rose",
    locked: true,
  },
];

const ACCENT = {
  violet: { chip: "chip-violet", ring: "from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)]", text: "text-gradient-violet" },
  cyan: { chip: "chip-cyan", ring: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]", text: "text-gradient-cyan" },
  rose: { chip: "chip-violet", ring: "from-[oklch(0.72_0.18_360)] to-[oklch(0.55_0.20_355)]", text: "text-gradient-violet" },
};

function HistoryPage() {
  const unlocked = MOCK.filter((m) => !m.locked);
  const latest = unlocked[0];

  return (
    <main className="relative min-h-screen">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
        </Link>
        <span className="chip chip-cyan font-mono">PORTRAIT · LIVE</span>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-10 pb-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">MY PORTRAIT · 我的画像档案</div>
          <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
            <span className="text-gradient-violet">我的画像档案</span>
          </h1>
          <p className="mt-3 text-foreground/70 max-w-2xl">
            每一次测试与对话都会被沉淀。你的画像会随时间持续校准——这不是一次性的报告，而是一面活的镜子。
          </p>
        </motion.div>

        {/* Top stat strip */}
        {latest && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-8 bg-glass rounded-3xl p-6 md:p-7 grid md:grid-cols-3 gap-6 items-center"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{latest.archetype.emoji}</div>
              <div>
                <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">当前原型 · ARCHETYPE</div>
                <div className="font-display text-2xl mt-1 text-foreground/95">{latest.archetype.name}</div>
                <p className="text-xs text-muted-foreground mt-1 italic">「{latest.archetype.tagline}」</p>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground mb-2">关系指数 · INDEX</div>
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl text-gradient-cyan tabular-nums">{latest.index}</span>
                <span className="text-xs text-[oklch(0.78_0.15_165)] font-mono mb-1.5">▲ {latest.delta}</span>
              </div>
              <div className="mt-2 h-[3px] rounded-full bg-secondary/40 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]" style={{ width: `${latest.index}%` }} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/chat"
                search={{ attemptId: latest.attemptId ?? latest.id, analystId: "mirror" }}
                className="group flex items-center justify-between gap-2 rounded-xl px-4 py-3 border border-border/60 bg-secondary/30 hover:border-[oklch(0.68_0.18_285_/_0.55)] hover:bg-[oklch(0.50_0.20_285_/_0.08)] transition"
              >
                <span className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-[oklch(0.82_0.14_200)]" />
                  和 AI 咨询师对话
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
              </Link>
              <button
                className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 border border-border/60 bg-secondary/30 hover:border-[oklch(0.82_0.14_200_/_0.55)] transition text-sm"
              >
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[oklch(0.78_0.15_165)]" />
                  重新综合画像
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">SYNC</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-foreground/90">画像演化轨迹</h2>
            <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">{MOCK.length} ENTRIES</span>
          </div>

          <div className="relative pl-5 md:pl-7 border-l border-border/50 space-y-5">
            {MOCK.map((s, i) => {
              const a = ACCENT[s.accent];
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="relative"
                >
                  {/* Dot */}
                  <span
                    className={`absolute -left-[26px] md:-left-[34px] top-5 w-3 h-3 rounded-full bg-gradient-to-br ${a.ring} ${s.locked ? "opacity-40" : ""}`}
                  />
                  {s.locked ? (
                    <div className="bg-glass rounded-2xl p-5 opacity-70 border border-dashed border-border/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{s.archetype.emoji}</div>
                          <div>
                            <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">{s.code}</div>
                            <div className="text-foreground/85 mt-1">{s.archetype.name}</div>
                            <p className="text-xs text-muted-foreground italic mt-0.5">「{s.archetype.tagline}」</p>
                          </div>
                        </div>
                        <Link
                          to="/access"
                          search={{ product: s.set.toLowerCase() as "ros" | "mate" }}
                          className="text-xs font-mono tracking-[0.2em] flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
                        >
                          <Lock className="h-3 w-3" /> UNLOCK
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to="/result/$attemptId"
                      params={{ attemptId: s.attemptId ?? s.id }}
                      className="block group"
                    >
                      <div className="bg-glass rounded-2xl p-5 transition-all hover:translate-y-[-2px] hover:glow-violet">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{s.archetype.emoji}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`chip ${a.chip} font-mono`}>{s.code}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">{s.date}</span>
                              </div>
                              <h3 className={`font-display text-xl mt-2 ${a.text}`}>{s.archetype.name}</h3>
                              <p className="text-xs text-muted-foreground italic mt-0.5">「{s.archetype.tagline}」</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-display text-3xl text-foreground/95 tabular-nums">{s.index}</div>
                            <div className="text-[10px] font-mono text-[oklch(0.78_0.15_165)]">
                              {s.delta >= 0 ? `▲ ${s.delta}` : `▼ ${Math.abs(s.delta)}`}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            点击查看完整快照与 AI 解读
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 bg-glass-strong rounded-3xl p-7 text-center">
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">下一步 · NEXT STEP</div>
          <h3 className="font-display text-2xl mt-2 text-gradient-violet">让画像更清晰一些</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            完成 ROS / MATE 后，AI 会把三套数据合并，生成你的「终极画像」。
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/access"
              search={{ product: "ros" }}
              className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground text-sm"
            >
              解锁 ROS <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/chat"
              search={latest ? { attemptId: latest.attemptId ?? latest.id, analystId: "mirror" } : { analystId: "mirror" }}
              className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-glass border border-border/60 text-sm"
            >
              和分析师对话
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
