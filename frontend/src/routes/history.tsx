import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Activity,
  Lock,
  RefreshCw,
  MessageSquare,
  Layers,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { lovecompassApi, type PortraitProduct, type UserPortrait } from "@/lib/lovecompassApi";
import { formatApiErrorMessage, getApiErrorHint } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

export const Route = createFileRoute("/history")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "个人信息中心 · MIRROR" },
      { name: "description", content: "SELF / ROS / MATE 三套测评聚合为你的持续进化画像。" },
    ],
  }),
  component: HistoryPage,
});

const ACCENT = {
  self: {
    chip: "chip-violet",
    ring: "from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)]",
    text: "text-gradient-violet",
    bar: "from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]",
  },
  ros: {
    chip: "chip-cyan",
    ring: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
    text: "text-gradient-cyan",
    bar: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
  },
  mate: {
    chip: "chip-violet",
    ring: "from-[oklch(0.72_0.18_360)] to-[oklch(0.55_0.20_355)]",
    text: "text-gradient-violet",
    bar: "from-[oklch(0.72_0.18_360)] to-[oklch(0.55_0.20_355)]",
  },
} as const;

const TRAIT_ICON: Record<string, string> = {
  shield: "🛡",
  key: "🔑",
  eye: "👁",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(/\//g, ".");
}

function HistoryPage() {
  const { pending: authPending } = useRequireAuth();
  const [portrait, setPortrait] = useState<UserPortrait | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    lovecompassApi
      .getProfilePortrait()
      .then((res) => {
        if (!alive) return;
        setPortrait(res.portrait ?? null);
        setError(null);
      })
      .catch((e) => {
        if (!alive) return;
        setError(formatApiErrorMessage(e));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const self = portrait?.selfProfile;
  const primaryAttemptId =
    portrait?.primary?.attemptId ?? portrait?.stats?.boundAttemptId ?? self?.attemptId ?? null;

  const dimensionBars = useMemo(() => {
    const scores = self?.dimensionScores ?? {};
    return SELF_DIMENSIONS.map((spec) => {
      const raw = normalizeDimensionScore(spec.code, Number(scores[spec.code] ?? 0));
      return {
        code: spec.code,
        label: spec.name,
        value: raw,
        summary: scoreDisplaySummary(raw),
        color: spec.color,
      };
    });
  }, [self?.dimensionScores]);

  const errorHint = error ? getApiErrorHint(error) : null;

  if (authPending) return <AuthChecking />;

  return (
    <main className="relative min-h-screen">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
        </Link>
        <span className="chip chip-cyan font-mono">PROFILE · LIVE</span>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">
            PERSONAL CENTER · 个人信息中心
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
            <span className="text-gradient-violet">我的画像档案</span>
          </h1>
          <p className="mt-3 text-foreground/70 max-w-2xl">
            每完成一套测评，结果会自动汇入这里。SELF 打底、ROS 叠加恋情、MATE 补全择偶坐标——三套合并后，AI
            分析师才能读懂完整的你。
          </p>
        </motion.div>

        {error && (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm">
            <p className="text-destructive">{error}</p>
            {errorHint && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{errorHint}</p>
            )}
            <button
              type="button"
              className="mt-3 text-xs font-mono tracking-wider text-foreground/80 hover:text-foreground underline-offset-2 hover:underline"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              重试加载
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-8 bg-glass rounded-3xl p-6 flex items-center gap-3 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" /> 正在聚合你的画像数据…
          </div>
        )}

        {!loading && portrait && (
          <>
            <OverviewHero portrait={portrait} primaryAttemptId={primaryAttemptId} />

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              {portrait.products.map((product, i) => (
                <ProductSuiteCard key={product.id} product={product} index={i} />
              ))}
            </div>

            {self?.attemptId && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 grid lg:grid-cols-2 gap-5"
              >
                <div className="bg-glass rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
                        SELF · 六维底片
                      </div>
                      <h2 className="font-display text-xl mt-1">关系模式雷达</h2>
                    </div>
                    <span className="chip chip-violet font-mono">6D</span>
                  </div>
                  <div className="space-y-3">
                    {dimensionBars.map((dim) => (
                      <div key={dim.code}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-foreground/85">{dim.label}</span>
                          <span className="text-muted-foreground font-mono">{dim.summary}</span>
                        </div>
                        <div className="h-[4px] rounded-full bg-secondary/40 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]"
                            style={{ width: `${dim.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-glass rounded-3xl p-6">
                  <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
                    CORE TRAITS · 答题特质
                  </div>
                  <h2 className="font-display text-xl mt-1 mb-4">基于你的真实作答</h2>
                  {self.coreTraits?.length ? (
                    <div className="space-y-3">
                      {self.coreTraits.map((trait, idx) => (
                        <div
                          key={`${trait.title}-${idx}`}
                          className={`rounded-xl border px-4 py-3 ${
                            trait.highlight
                              ? "border-[oklch(0.68_0.18_285_/_0.45)] bg-[oklch(0.50_0.20_285_/_0.08)]"
                              : "border-border/50 bg-secondary/20"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span>{TRAIT_ICON[trait.icon] ?? "✦"}</span>
                            <span>{trait.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                            {trait.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      完成 SELF 测试后，这里会展示三张基于具体题目的特质卡。
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <ActivityStrip portrait={portrait} primaryAttemptId={primaryAttemptId} />

            <TimelineSection portrait={portrait} />
          </>
        )}

        {!loading && !portrait && !error && (
          <div className="mt-8 bg-glass rounded-3xl p-7 text-center">
            <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">
              EMPTY · 暂无画像
            </div>
            <h2 className="font-display text-2xl mt-2 text-gradient-violet">
              先完成第一套 SELF 测试
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              完成兑换码验证与答题后，测试结果会自动推送到个人信息中心。
            </p>
            <Link
              to="/access"
              search={{ product: "self" }}
              className="inline-flex mt-5 items-center gap-1.5 px-5 h-10 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground text-sm"
            >
              开始 SELF 测试 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function OverviewHero({
  portrait,
  primaryAttemptId,
}: {
  portrait: UserPortrait;
  primaryAttemptId: string | null;
}) {
  const { completeness, primary, selfProfile, user, stats } = portrait;
  const hasSelf = Boolean(selfProfile?.attemptId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.05 }}
      className="mt-8 bg-glass rounded-3xl p-6 md:p-7"
    >
      <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary/40" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="url(#portraitGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${completeness.percent} 100`}
              />
              <defs>
                <linearGradient id="portraitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="oklch(0.68 0.18 285)" />
                  <stop offset="100%" stopColor="oklch(0.82 0.14 200)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl tabular-nums">{completeness.percent}%</span>
              <span className="text-[9px] font-mono text-muted-foreground">完整度</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center max-w-[120px]">
            {completeness.label}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
            <UserCircle2 className="h-3.5 w-3.5" />
            {user.displayName || user.email || "你的关系画像"}
          </div>
          {hasSelf ? (
            <>
              <div className="font-display text-3xl md:text-4xl mt-2 text-foreground/95">
                {selfProfile.archetypeCode ?? primary.archetypeCode ?? "关系画像"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {selfProfile.attachmentType ? `${selfProfile.attachmentType} · ` : ""}
                {selfProfile.tagline ? `「${selfProfile.tagline}」` : "基于套一 SELF 六维模型"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {completeness.breakdown.map((item) => (
                  <span
                    key={item.productSet}
                    className={`chip font-mono text-[10px] ${item.status === "completed" ? "chip-cyan" : "opacity-50"}`}
                  >
                    {item.code.split("/").pop()?.trim()} {item.status === "completed" ? "✓" : "—"}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="font-display text-2xl mt-2 text-foreground/90">等待第一套测评</div>
              <p className="text-sm text-muted-foreground mt-1">
                完成 SELF 后，你的红楼人格原型与依恋类型会出现在这里。
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          {hasSelf && selfProfile.index != null && (
            <div className="rounded-xl border border-border/50 px-4 py-3 bg-secondary/20">
              <div className="text-[10px] font-mono text-muted-foreground">关系指数</div>
              <div className="font-display text-4xl text-gradient-cyan tabular-nums">
                {selfProfile.index}
              </div>
            </div>
          )}
          <Link
            to="/chat"
            search={
              primaryAttemptId
                ? { attemptId: primaryAttemptId, analystId: "mirror" }
                : { analystId: "mirror" }
            }
            className="group flex items-center justify-between gap-2 rounded-xl px-4 py-3 border border-border/60 bg-secondary/30 hover:border-[oklch(0.68_0.18_285_/_0.55)] transition text-sm"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[oklch(0.82_0.14_200)]" />
              和 AI 分析师对话
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
          </Link>
          {primaryAttemptId && (
            <Link
              to="/result/$attemptId"
              params={{ attemptId: primaryAttemptId }}
              className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 border border-border/60 bg-secondary/30 hover:border-[oklch(0.82_0.14_200_/_0.55)] transition text-sm"
            >
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[oklch(0.78_0.15_165)]" />
                查看完整报告
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">OPEN</span>
            </Link>
          )}
          <div className="text-[10px] font-mono text-muted-foreground px-1">
            {stats.totalAttempts} 次测评 · {stats.chatSessions} 次对话
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductSuiteCard({ product, index }: { product: PortraitProduct; index: number }) {
  const accent = ACCENT[product.id];
  const completed = product.status === "completed";
  const latest = product.latest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`bg-glass rounded-2xl p-5 h-full flex flex-col ${completed ? "" : "opacity-80 border border-dashed border-border/60"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`chip ${accent.chip} font-mono text-[10px]`}>{product.code}</span>
        {completed ? (
          <span className="text-[10px] font-mono text-[oklch(0.78_0.15_165)]">DONE</span>
        ) : (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <h3 className={`font-display text-lg mt-3 ${accent.text}`}>{product.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{product.subtitle}</p>

      {completed && latest ? (
        <div className="mt-4 flex-1">
          <div className="text-sm font-medium text-foreground/90">
            {latest.archetypeCode ?? "已完成"}
          </div>
          {latest.tagline && (
            <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">「{latest.tagline}」</p>
          )}
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>{formatDate(latest.completedAt)}</span>
            {latest.index != null && <span className="text-foreground/80">指数 {latest.index}</span>}
          </div>
          {product.attemptCount > 1 && (
            <p className="text-[10px] text-muted-foreground mt-2">共 {product.attemptCount} 次记录</p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-4 flex-1">
          {product.id === "self"
            ? "完成基础测试后，画像档案开始沉淀"
            : product.id === "ros"
              ? "需要具体恋情对象；完成后叠加在 SELF 底片上"
              : "补全择偶坐标，解锁终极人格档案"}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-border/40">
        {completed && latest?.attemptId ? (
          <Link
            to="/result/$attemptId"
            params={{ attemptId: latest.attemptId }}
            className="text-xs font-mono tracking-wider flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
          >
            查看报告 <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <Link
            to="/access"
            search={{ product: product.id }}
            className="text-xs font-mono tracking-wider flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
          >
            <Lock className="h-3 w-3" /> 解锁测试
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function ActivityStrip({
  portrait,
  primaryAttemptId,
}: {
  portrait: UserPortrait;
  primaryAttemptId: string | null;
}) {
  return (
    <div className="mt-8 bg-glass-strong rounded-3xl p-6 md:p-7">
      <div className="flex flex-col md:flex-row md:items-center gap-5 justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground flex items-center gap-2">
            <Layers className="h-3.5 w-3.5" /> 画像进化逻辑
          </div>
          <h3 className="font-display text-xl mt-2">测试完成 → 自动汇入档案 → AI 持续理解</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            每次提交测评，后端会把最新结果写入你的个人信息中心。MIRROR 分析师读取 SELF 六维 +
            对话摘要，画像完整度越高，建议越精准。
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/access"
            search={{ product: portrait.completeness.percent >= 40 ? "ros" : "self" }}
            className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground text-sm"
          >
            {portrait.completeness.percent >= 40 ? "继续 ROS" : "开始 SELF"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/chat"
            search={
              primaryAttemptId
                ? { attemptId: primaryAttemptId, analystId: "mirror" }
                : { analystId: "mirror" }
            }
            className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-glass border border-border/60 text-sm"
          >
            <MessageSquare className="h-4 w-4" /> 和分析师聊
          </Link>
        </div>
      </div>
    </div>
  );
}

function TimelineSection({ portrait }: { portrait: UserPortrait }) {
  const grouped = useMemo(() => {
    const buckets: Record<string, typeof portrait.timeline> = {
      SELF: [],
      ROS: [],
      MATE: [],
    };
    for (const item of portrait.timeline) {
      const key = item.productSet in buckets ? item.productSet : "SELF";
      buckets[key].push(item);
    }
    return (["SELF", "ROS", "MATE"] as const)
      .map((set) => ({
        set,
        items: buckets[set],
        product: portrait.products.find((p) => p.productSet === set),
      }))
      .filter((g) => g.items.length > 0 || g.product?.status === "locked");
  }, [portrait]);

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl text-foreground/90">测评记录 · 按套题分组</h2>
        <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
          {portrait.stats.totalAttempts} TOTAL
        </span>
      </div>

      <div className="space-y-10">
        {grouped.map(({ set, items, product }) => {
          const productId = (product?.id ?? set.toLowerCase()) as keyof typeof ACCENT;
          const accent = ACCENT[productId] ?? ACCENT.self;
          return (
            <div key={set}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`chip ${accent.chip} font-mono`}>{product?.code ?? set}</span>
                <span className="text-sm text-muted-foreground">{product?.title}</span>
              </div>
              {items.length === 0 ? (
                <div className="bg-glass rounded-2xl p-5 opacity-70 border border-dashed border-border/60 text-sm text-muted-foreground">
                  尚未完成此套测试
                </div>
              ) : (
                <div className="relative pl-5 md:pl-7 border-l border-border/50 space-y-4">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.attemptId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="relative"
                    >
                      <span
                        className={`absolute -left-[26px] md:-left-[34px] top-5 w-3 h-3 rounded-full bg-gradient-to-br ${accent.ring}`}
                      />
                      <Link
                        to="/result/$attemptId"
                        params={{ attemptId: item.attemptId }}
                        className="block group"
                      >
                        <div className="bg-glass rounded-2xl p-5 transition-all hover:translate-y-[-2px] hover:glow-violet">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {formatDate(item.completedAt)}
                                </span>
                                {item.suiteName && (
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    {item.suiteName}
                                  </span>
                                )}
                              </div>
                              <h3 className={`font-display text-xl mt-2 ${accent.text}`}>
                                {item.archetypeCode ?? "关系画像"}
                              </h3>
                              {item.tagline && (
                                <p className="text-xs text-muted-foreground italic mt-0.5">
                                  「{item.tagline}」
                                </p>
                              )}
                              {item.attachmentType && (
                                <p className="text-[11px] text-muted-foreground mt-1">
                                  {item.attachmentType}
                                </p>
                              )}
                            </div>
                            {item.index != null && (
                              <div className="text-right shrink-0">
                                <div className="font-display text-3xl tabular-nums">{item.index}</div>
                                <div className="text-[10px] font-mono text-muted-foreground">INDEX</div>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground">
                              点击查看完整快照与 AI 解读
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
