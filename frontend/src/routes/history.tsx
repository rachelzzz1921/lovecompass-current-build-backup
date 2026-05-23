import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Activity, Lock, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PRODUCTS } from "@/data/products";
import { lovecompassApi, type AttemptHistoryItem } from "@/lib/lovecompassApi";
import { formatApiErrorMessage, getApiErrorHint } from "@/lib/apiErrors";

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
  status?: string | null;
};

const ACCENT = {
  violet: {
    chip: "chip-violet",
    ring: "from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)]",
    text: "text-gradient-violet",
  },
  cyan: {
    chip: "chip-cyan",
    ring: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
    text: "text-gradient-cyan",
  },
  rose: {
    chip: "chip-violet",
    ring: "from-[oklch(0.72_0.18_360)] to-[oklch(0.55_0.20_355)]",
    text: "text-gradient-violet",
  },
};

const PRODUCT_BY_SET = {
  SELF: PRODUCTS.find((p) => p.id === "self"),
  ROS: PRODUCTS.find((p) => p.id === "ros"),
  MATE: PRODUCTS.find((p) => p.id === "mate"),
};

function resolveSet(attempt: AttemptHistoryItem): Snapshot["set"] {
  const raw =
    `${attempt.test_id ?? ""} ${attempt.suite_slug ?? ""} ${attempt.suite_name ?? ""}`.toLowerCase();
  if (raw.includes("ros")) return "ROS";
  if (raw.includes("mate")) return "MATE";
  return "SELF";
}

function getString(
  payload: Record<string, unknown> | null | undefined,
  keys: string[],
  fallback: string,
) {
  for (const key of keys) {
    const value = payload?.[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return fallback;
}

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

function toSnapshot(
  attempt: AttemptHistoryItem,
  index: number,
  all: AttemptHistoryItem[],
): Snapshot {
  const set = resolveSet(attempt);
  const product = PRODUCT_BY_SET[set];
  const payload = attempt.result_payload;
  const archetypeProfile =
    payload?.archetype_profile && typeof payload.archetype_profile === "object"
      ? (payload.archetype_profile as Record<string, unknown>)
      : null;
  const name =
    getString(archetypeProfile, ["title", "name", "display_name"], "") ||
    getString(payload, ["archetype_name", "archetypeName", "title"], "") ||
    attempt.archetype_code ||
    "关系画像";
  const tagline =
    getString(archetypeProfile, ["tagline", "summary", "subtitle"], "") ||
    getString(payload, ["archetype_tagline", "tagline", "summary"], "点击查看完整快照与 AI 解读");
  const currentIndex = Math.round(Number(attempt.ros_index ?? 0));
  const previousSameSet = all.slice(index + 1).find((item) => resolveSet(item) === set);
  const previousIndex = previousSameSet
    ? Math.round(Number(previousSameSet.ros_index ?? 0))
    : currentIndex;

  return {
    id: attempt.id,
    attemptId: attempt.id,
    set,
    code: product?.code ?? `SET · ${set}`,
    date: formatDate(attempt.completed_at ?? attempt.created_at),
    archetype: { name, tagline, emoji: set === "SELF" ? "✦" : set === "ROS" ? "◌" : "◇" },
    index: Math.max(0, Math.min(100, currentIndex || 0)),
    delta: currentIndex - previousIndex,
    accent: product?.accent ?? "violet",
    status: attempt.status,
  };
}

function lockedSnapshot(set: Snapshot["set"]): Snapshot {
  const product = PRODUCT_BY_SET[set];
  return {
    id: `locked-${set.toLowerCase()}`,
    set,
    code: product?.code ?? `SET · ${set}`,
    date: "—",
    archetype: {
      name: "尚未解锁",
      tagline:
        set === "SELF" ? "完成基础测试后，画像档案会开始沉淀" : "做完这一套，我会重新认识你们",
      emoji: "□",
    },
    index: 0,
    delta: 0,
    accent: product?.accent ?? "violet",
    locked: true,
  };
}

function HistoryPage() {
  const [attempts, setAttempts] = useState<AttemptHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    lovecompassApi
      .getAttemptHistory(20)
      .then((res) => {
        if (!alive) return;
        setAttempts(res.attempts ?? []);
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

  const snapshots = useMemo(() => {
    const real = attempts.map(toSnapshot);
    const existing = new Set(real.map((s) => s.set));
    const locked = (["SELF", "ROS", "MATE"] as const)
      .filter((set) => !existing.has(set))
      .map(lockedSnapshot);
    return [...real, ...locked];
  }, [attempts]);

  const unlocked = snapshots.filter((m) => !m.locked);
  const latest = unlocked[0];
  const errorHint = error ? getApiErrorHint(error) : null;

  return (
    <main className="relative min-h-screen">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
        </Link>
        <span className="chip chip-cyan font-mono">PORTRAIT · LIVE</span>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pt-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">
            MY PORTRAIT · 我的画像档案
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">
            <span className="text-gradient-violet">我的画像档案</span>
          </h1>
          <p className="mt-3 text-foreground/70 max-w-2xl">
            每一次测试与对话都会被沉淀。你的画像会随时间持续校准——这不是一次性的报告，而是一面活的镜子。
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
            <RefreshCw className="h-4 w-4 animate-spin" /> 正在读取真实画像档案…
          </div>
        )}

        {!loading && latest && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-8 bg-glass rounded-3xl p-6 md:p-7 grid md:grid-cols-3 gap-6 items-center"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{latest.archetype.emoji}</div>
              <div>
                <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
                  当前原型 · ARCHETYPE
                </div>
                <div className="font-display text-2xl mt-1 text-foreground/95">
                  {latest.archetype.name}
                </div>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  「{latest.archetype.tagline}」
                </p>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground mb-2">
                关系指数 · INDEX
              </div>
              <div className="flex items-end gap-3">
                <span className="font-display text-5xl text-gradient-cyan tabular-nums">
                  {latest.index}
                </span>
                <span className="text-xs text-[oklch(0.78_0.15_165)] font-mono mb-1.5">
                  {latest.delta >= 0 ? "▲" : "▼"} {Math.abs(latest.delta)}
                </span>
              </div>
              <div className="mt-2 h-[3px] rounded-full bg-secondary/40 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]"
                  style={{ width: `${latest.index}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/chat"
                search={{ attemptId: latest.attemptId ?? latest.id, analystId: "mirror" }}
                className="group flex items-center justify-between gap-2 rounded-xl px-4 py-3 border border-border/60 bg-secondary/30 hover:border-[oklch(0.68_0.18_285_/_0.55)] hover:bg-[oklch(0.50_0.20_285_/_0.08)] transition"
              >
                <span className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-[oklch(0.82_0.14_200)]" />和 AI 咨询师对话
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition" />
              </Link>
              <Link
                to="/result/$attemptId"
                params={{ attemptId: latest.attemptId ?? latest.id }}
                className="flex items-center justify-between gap-2 rounded-xl px-4 py-3 border border-border/60 bg-secondary/30 hover:border-[oklch(0.82_0.14_200_/_0.55)] transition text-sm"
              >
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[oklch(0.78_0.15_165)]" />
                  查看最新完整报告
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">OPEN</span>
              </Link>
            </div>
          </motion.div>
        )}

        {!loading && !latest && (
          <div className="mt-8 bg-glass rounded-3xl p-7 text-center">
            <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">
              EMPTY · 暂无画像
            </div>
            <h2 className="font-display text-2xl mt-2 text-gradient-violet">
              先完成第一套 SELF 测试
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              完成兑换码验证与答题后，真实画像记录会自动出现在这里。
            </p>
          </div>
        )}

        <div className="mt-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl text-foreground/90">画像演化轨迹</h2>
            <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
              {snapshots.length} ENTRIES
            </span>
          </div>

          <div className="relative pl-5 md:pl-7 border-l border-border/50 space-y-5">
            {snapshots.map((s, i) => {
              const a = ACCENT[s.accent];
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  className="relative"
                >
                  <span
                    className={`absolute -left-[26px] md:-left-[34px] top-5 w-3 h-3 rounded-full bg-gradient-to-br ${a.ring} ${s.locked ? "opacity-40" : ""}`}
                  />
                  {s.locked ? (
                    <div className="bg-glass rounded-2xl p-5 opacity-70 border border-dashed border-border/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{s.archetype.emoji}</div>
                          <div>
                            <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
                              {s.code}
                            </div>
                            <div className="text-foreground/85 mt-1">{s.archetype.name}</div>
                            <p className="text-xs text-muted-foreground italic mt-0.5">
                              「{s.archetype.tagline}」
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/access"
                          search={{ product: s.set.toLowerCase() as "ros" | "mate" | "self" }}
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
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`chip ${a.chip} font-mono`}>{s.code}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {s.date}
                                </span>
                                {s.status && (
                                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                    {s.status}
                                  </span>
                                )}
                              </div>
                              <h3 className={`font-display text-xl mt-2 ${a.text}`}>
                                {s.archetype.name}
                              </h3>
                              <p className="text-xs text-muted-foreground italic mt-0.5">
                                「{s.archetype.tagline}」
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-display text-3xl text-foreground/95 tabular-nums">
                              {s.index}
                            </div>
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
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">
            下一步 · NEXT STEP
          </div>
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
              search={
                latest
                  ? { attemptId: latest.attemptId ?? latest.id, analystId: "mirror" }
                  : { analystId: "mirror" }
              }
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
