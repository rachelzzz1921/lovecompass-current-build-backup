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
  UserCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { lovecompassApi, type PortraitProduct, type UserPortrait } from "@/lib/lovecompassApi";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import { resultRouteForProductSet } from "@/lib/resultRoutes";
import { formatApiErrorMessage, getApiErrorHint } from "@/lib/apiErrors";
import { portraitHeadline, portraitIndexLabel, portraitMetaLine } from "@/lib/portraitDisplay";
import { productStartLink, productNeedsUnlock, productStartLabel, type ProductStartLink } from "@/lib/productRoutes";
import type { ProductId } from "@/lib/suiteTier";
import { productFlowSpec } from "@/lib/productRegistry";
import { productMarketing } from "@/lib/productTheme";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

export const Route = createFileRoute("/history")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "我的档案 · MIRROR" },
      { name: "description", content: "SELF / ROS / MATE 最新测评汇总为你的关系画像。" },
    ],
  }),
  component: HistoryPage,
});

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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    lovecompassApi
      .getProfilePortrait(false)
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

  const refreshPortrait = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await lovecompassApi.getProfilePortrait(true);
      setPortrait(res.portrait ?? null);
    } catch (e) {
      setError(formatApiErrorMessage(e));
    } finally {
      setRefreshing(false);
    }
  };

  const self = portrait?.selfProfile;
  const primaryAttemptId =
    portrait?.primary?.attemptId ?? portrait?.stats?.boundAttemptId ?? self?.attemptId ?? null;

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refreshPortrait()}
            disabled={loading || refreshing}
            className="text-[10px] font-mono tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            同步
          </button>
          <span className="chip chip-cyan font-mono">PROFILE · LIVE</span>
        </div>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">MY PROFILE</div>
          <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
            <span className="text-gradient-violet">我的档案</span>
          </h1>
          <p className="mt-3 text-foreground/70 max-w-2xl text-sm leading-relaxed">
            每套测评只保留<strong className="font-normal text-foreground/90">最新一次</strong>
            作为当前画像；更早的记录仍在服务器，不会丢失。详情请点进各套完整报告查看。
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
            <RefreshCw className="h-4 w-4 animate-spin" /> 正在读取你的档案…
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

            <LatestSnapshotStrip portrait={portrait} />

            <ActivityStrip portrait={portrait} primaryAttemptId={primaryAttemptId} />
          </>
        )}

        {!loading && !portrait && !error && (
          <div className="mt-8 bg-glass rounded-3xl p-7 text-center">
            <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">EMPTY</div>
            <h2 className="font-display text-2xl mt-2 text-gradient-violet">先完成第一套 SELF 测试</h2>
            <p className="text-sm text-muted-foreground mt-2">完成后会自动出现在这里。</p>
            <Link
              to="/tests/$id"
              params={{ id: "self" }}
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
          <p className="text-xs text-muted-foreground mt-2 text-center max-w-[120px]">{completeness.label}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
            <UserCircle2 className="h-3.5 w-3.5" />
            {user.displayName || user.email || "你的关系画像"}
          </div>
          {hasSelf ? (
            <>
              <div className="font-display text-3xl md:text-4xl mt-2 text-foreground/95">
                {selfProfile.attachmentType ?? primary.attachmentType ?? "关系画像"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {selfProfile.tagline ? `「${selfProfile.tagline}」` : "基于最新 SELF 测评"}
                {(selfProfile.archetypeCode ?? primary.archetypeCode) && (
                  <span className="block mt-1 text-xs font-mono tracking-wider text-muted-foreground/80">
                    红楼人格 · {selfProfile.archetypeCode ?? primary.archetypeCode}
                  </span>
                )}
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
              <p className="text-sm text-muted-foreground mt-1">完成 SELF 后，依恋类型会出现在这里。</p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          {hasSelf && selfProfile.index != null && (
            <div className="rounded-xl border border-border/50 px-4 py-3 bg-secondary/20">
              <div className="text-[10px] font-mono text-muted-foreground">关系指数</div>
              <div className="font-display text-4xl text-gradient-cyan tabular-nums">{selfProfile.index}</div>
            </div>
          )}
          <Link
            to="/chat"
            search={chatRouteSearch(primaryAttemptId)}
            className="group flex items-center justify-between gap-2 rounded-xl px-4 py-3 border border-border/60 bg-secondary/30 hover:border-[oklch(0.68_0.18_285_/_0.55)] transition text-sm"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[oklch(0.82_0.14_200)]" />
              和 AI 顾问对话
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
          </Link>
          {primaryAttemptId && (
            <Link
              {...resultRouteForProductSet(primary.productSet ?? "SELF", primaryAttemptId)}
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
            累计 {stats.totalAttempts} 次测评 · {stats.chatSessions} 次对话
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProductSuiteCard({ product, index }: { product: PortraitProduct; index: number }) {
  const accent = productMarketing(product.id as ProductId);
  const spec = productFlowSpec(product.id as ProductId);
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
        <span className={`chip ${accent.chipClass} font-mono text-[10px]`}>{product.code}</span>
        {completed ? (
          <span className="text-[10px] font-mono text-[oklch(0.78_0.15_165)]">LATEST</span>
        ) : (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <h3 className={`font-display text-lg mt-3 ${accent.titleClass}`}>{product.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{product.subtitle}</p>

      {completed && latest ? (
        <div className="mt-4 flex-1">
          <div className="text-sm font-medium text-foreground/90">{portraitHeadline(latest, product.productSet)}</div>
          {portraitMetaLine(latest, product.productSet) && (
            <p className="text-[10px] font-mono text-muted-foreground/80 mt-0.5">
              {portraitMetaLine(latest, product.productSet)}
            </p>
          )}
          {latest.tagline && (
            <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">「{latest.tagline}」</p>
          )}
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span>{formatDate(latest.completedAt)}</span>
            {latest.index != null && (
              <span className="text-foreground/80">
                {portraitIndexLabel(product.productSet)} {latest.index}
              </span>
            )}
          </div>
          {product.attemptCount > 1 && (
            <p className="text-[10px] text-muted-foreground mt-2">
              历史共 {product.attemptCount} 次 · 档案仅展示最新
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-4 flex-1">{spec.incompleteHint}</p>
      )}

      <div className="mt-4 pt-3 border-t border-border/40">
        {completed && latest?.attemptId ? (
          <Link
            {...resultRouteForProductSet(product.productSet, latest.attemptId)}
            className="text-xs font-mono tracking-wider flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
          >
            查看完整报告 <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          (() => {
            const link = productStartLink(product.id as ProductId);
            const needsUnlock = productNeedsUnlock(product.id as ProductId);
            const label = productStartLabel(product.id as ProductId, product.id === "self" ? "free" : "locked");
            return (
              <Link
                {...link}
                className="text-xs font-mono tracking-wider flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
              >
                {needsUnlock ? <Lock className="h-3 w-3" /> : null}
                {label} <ArrowRight className="h-3 w-3" />
              </Link>
            );
          })()
        )}
      </div>
    </motion.div>
  );
}

function LatestSnapshotStrip({ portrait }: { portrait: UserPortrait }) {
  const items = portrait.timeline.filter(Boolean);
  if (!items.length) return null;

  return (
    <div className="mt-8">
      <h2 className="font-display text-lg text-foreground/90 mb-4">当前生效的快照</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const productId = item.productSet.toLowerCase() as ProductId;
          const accent = productMarketing(productId);
          return (
            <Link
              key={item.attemptId}
              {...resultRouteForProductSet(item.productSet, item.attemptId)}
              className="block bg-glass rounded-2xl p-4 hover:translate-y-[-1px] transition"
            >
              <span className={`chip ${accent.chipClass} font-mono text-[10px]`}>{item.productSet}</span>
              <div className={`font-display text-base mt-2 ${accent.titleClass}`}>
                {portraitHeadline(item, item.productSet)}
              </div>
              <p className="text-[10px] font-mono text-muted-foreground mt-2">{formatDate(item.completedAt)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function portraitNextStep(
  portrait: UserPortrait,
): (ProductStartLink | { to: "/chat" }) & { label: string } {
  const byId = Object.fromEntries(portrait.products.map((p) => [p.id, p]));
  const selfDone = Boolean(byId.self?.latest?.attemptId);
  const rosDone = Boolean(byId.ros?.latest?.attemptId);
  const mateDone = Boolean(byId.mate?.latest?.attemptId);

  if (!selfDone) return { to: "/tests/$id", params: { id: "self" }, label: "开始 SELF" } as const;
  if (!rosDone) {
    const link = productStartLink("ros");
    return { ...link, label: productNeedsUnlock("ros") ? "解锁 ROS" : "继续 ROS" };
  }
  if (!mateDone) {
    const link = productStartLink("mate");
    return { ...link, label: productNeedsUnlock("mate") ? "解锁 MATE" : "继续 MATE" };
  }
  return { to: "/chat", label: "和分析师聊" };
}

function ActivityStrip({
  portrait,
  primaryAttemptId,
}: {
  portrait: UserPortrait;
  primaryAttemptId: string | null;
}) {
  const next = portraitNextStep(portrait);
  return (
    <div className="mt-8 bg-glass-strong rounded-3xl p-6 md:p-7">
      <div className="flex flex-col md:flex-row md:items-center gap-5 justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">NEXT</div>
          <h3 className="font-display text-xl mt-2">补全三套，画像更完整</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            AI 顾问读取每套<strong className="font-normal text-foreground/80">最新结果</strong>
            合并解读；不用在这里翻旧题，点进报告页即可看详情。
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            {...next}
            search={next.to === "/chat" ? chatRouteSearch(primaryAttemptId) : "search" in next ? next.search : undefined}
            className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground text-sm"
          >
            {next.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/chat"
            search={chatRouteSearch(primaryAttemptId)}
            className="inline-flex items-center gap-1.5 px-5 h-10 rounded-full bg-glass border border-border/60 text-sm"
          >
            <MessageSquare className="h-4 w-4" /> 和分析师聊
          </Link>
        </div>
      </div>
    </div>
  );
}
