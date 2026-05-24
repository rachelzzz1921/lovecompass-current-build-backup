import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { hasProductAccess, clearProductUnlock } from "@/lib/accessGate";
import { findProductByRouteId, inferGenderFromSuiteSlug, testEntryRouteId } from "@/lib/resultRoutes";
import { HintButton } from "@/components/HintButton";
import {
  getStoredMateGender,
  getStoredSelfGender,
  MATE_SUITE_SLUGS,
  setStoredMateGender,
  setStoredSelfGender,
  SELF_SUITE_SLUGS,
  type MateGender,
  type SelfGender,
} from "@/lib/suiteSlugs";
import { resetPresentationSeed } from "@/lib/shufflePresentation";
import { ArrowLeft, ArrowRight, Clock, Layers, Sparkles, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/tests/$id")({
  component: TestEntry,
});

const ACCENT = {
  violet: { text: "text-gradient-violet", ring: "from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)]", chip: "chip-violet" },
  cyan: { text: "text-gradient-cyan", ring: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]", chip: "chip-cyan" },
  rose: {
    text: "text-transparent bg-clip-text bg-gradient-to-r from-[#f9a8d4] to-[#fb7185]",
    ring: "from-[#f472b6] to-[#fb7185]",
    chip: "font-mono text-[10px] tracking-[0.25em]",
  },
} as const;

function TestEntry() {
  const { id } = useParams({ from: "/tests/$id" });
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname.endsWith("/run")) return <Outlet />;
  const routeSuiteSlug = id;
  const product = findProductByRouteId(routeSuiteSlug);
  const productId = testEntryRouteId(routeSuiteSlug);
  const a = ACCENT[product.accent];

  const isSelfProduct = productId === "self";
  const isMateProduct = productId === "mate";
  const slugGender = inferGenderFromSuiteSlug(routeSuiteSlug);
  const [selfGender, setSelfGender] = useState<SelfGender | null>(() => slugGender ?? getStoredSelfGender());
  const [mateGender, setMateGender] = useState<MateGender | null>(() => slugGender ?? getStoredMateGender());

  const runSuiteSlug =
    isSelfProduct && selfGender
      ? SELF_SUITE_SLUGS[selfGender]
      : isMateProduct && mateGender
        ? MATE_SUITE_SLUGS[mateGender]
        : routeSuiteSlug;
  const hasAccess = hasProductAccess(product.id, runSuiteSlug);

  const returnPath = `/tests/${productId}`;

  const startBlockedReason = (): string | null => {
    if (authLoading) return "正在确认登录状态，请稍候";
    if (!user) return "请先登录后再开始测试";
    if (isSelfProduct && !selfGender) return "请先选择「女性版」或「男性版」题库";
    if (isMateProduct && !mateGender) return "请先选择「女性版」或「男性版」题库";
    if (!hasAccess) return "请先输入兑换码解锁本题库";
    return null;
  };

  const start = () => {
    const blocked = startBlockedReason();
    if (blocked) {
      if (!user) {
        nav({ to: "/auth", search: { redirect: returnPath } });
        return;
      }
      if (!hasAccess) {
        nav({
          to: "/access",
          search: {
            product: productId,
            redirect:
              productId === "ros"
                ? "/ros/start"
                : runSuiteSlug && runSuiteSlug.includes("_")
                  ? `/tests/${runSuiteSlug}/run`
                  : `/tests/${productId}`,
          },
        });
      }
      return;
    }

    if (productId === "ros") {
      nav({ to: "/ros/start" });
      return;
    }

    if (isSelfProduct && selfGender) {
      setStoredSelfGender(selfGender);
    }
    if (isMateProduct && mateGender) {
      setStoredMateGender(mateGender);
    }
    resetPresentationSeed(runSuiteSlug);
    nav({ to: "/tests/$id/run", params: { id: runSuiteSlug } });
  };

  const blockedReason = startBlockedReason();

  return (
    <main className="relative min-h-screen">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
        </Link>
        <span className={`chip ${a.chip} font-mono`} style={productId === "mate" ? { background: "rgba(244,114,182,0.12)", color: "#f9a8d4", border: "1px solid rgba(244,114,182,0.35)" } : undefined}>{product.code}</span>
      </header>

      <section className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 pt-14 pb-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">{product.badge}</div>
          <h1 className="font-display text-4xl md:text-[52px] mt-3 leading-[1.05] tracking-tight">
            <span className={a.text}>{product.title}</span>
          </h1>
          <p className="mt-4 text-lg text-foreground/80">{product.subtitle}</p>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">{product.description}</p>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="chip font-mono">
              <Clock className="h-3 w-3" /> {product.duration}
            </span>
            <span className="chip font-mono">
              <Layers className="h-3 w-3" /> {product.questionCount}
            </span>
            <span className="chip font-mono">
              <Sparkles className="h-3 w-3" /> AI · 个性化解读
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mt-10 bg-glass rounded-3xl p-7"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">PROFILE AXES</div>
              <h2 className="font-display text-xl mt-1">这一套会画出哪些维度</h2>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{product.dimensions.length} AXES</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {product.dimensions.map((d, i) => (
              <div
                key={d}
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border/60 bg-secondary/25"
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${a.ring}`} />
                <span className="text-[11px] font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm text-foreground/90">{d}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[11px] text-muted-foreground leading-relaxed">
            * 题目本身不会直接暴露所属维度。系统会在你作答的过程中悄悄构建画像——不让你被打分，但每一题都在被听见。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-6 grid md:grid-cols-3 gap-3"
        >
          {[
            { n: "01", t: "兑换", d: "输入兑换码解锁题库" },
            { n: "02", t: "作答", d: "情境式选题，跟着直觉走" },
            { n: "03", t: "解读", d: "生成可视化报告与对话入口" },
          ].map((s) => (
            <div key={s.n} className="bg-glass rounded-2xl p-5">
              <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">{s.n}</div>
              <div className="font-display text-lg mt-1">{s.t}</div>
              <p className="text-xs text-muted-foreground mt-1.5">{s.d}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-8 bg-glass-strong rounded-3xl p-6 md:p-7 space-y-6"
        >
          {/* 状态行 */}
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-[oklch(0.50_0.20_285_/_0.18)] grid place-items-center text-[oklch(0.82_0.10_285)]">
              {hasAccess ? <Sparkles className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <div className="font-display text-lg text-foreground/95">
                {hasAccess ? "已解锁，可以开始" : "需要兑换码解锁"}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                {user ? "已登录" : "开始之前请先登录"} · 答题过程不外泄
              </div>
            </div>
          </div>

          {/* 版本选择 — 全宽独立区块 */}
          {(isSelfProduct || isMateProduct) && (
            <div className="rounded-2xl border border-border/50 bg-secondary/20 p-4 md:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
                  选择题库版本
                </div>
                {(isSelfProduct ? selfGender : mateGender) && (
                  <span className="text-[10px] font-mono text-foreground/70">
                    已选 · {(isSelfProduct ? selfGender : mateGender) === "female" ? "女性版" : "男性版"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(["female", "male"] as const).map((gender) => {
                  const selected = isSelfProduct ? selfGender === gender : mateGender === gender;
                  const count = isMateProduct ? "80 题" : "50 题";
                  return (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => {
                      const current = isSelfProduct ? selfGender : mateGender;
                      if (current && current !== gender) {
                        clearProductUnlock(product.id);
                      }
                      if (isSelfProduct) setSelfGender(gender);
                      else setMateGender(gender);
                    }}
                    className={`h-11 rounded-xl border text-sm font-medium transition ${
                      selected
                        ? "border-[oklch(0.68_0.18_285_/_0.7)] bg-[oklch(0.50_0.20_285_/_0.12)] text-foreground shadow-[0_0_0_1px_oklch(0.68_0.18_285_/_0.25)]"
                        : "border-border/60 bg-glass text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    {gender === "female" ? `女性版 · ${count}` : `男性版 · ${count}`}
                  </button>
                  );
                })}
              </div>
              {!(isSelfProduct ? selfGender : mateGender) && (
                <p className="text-[11px] text-muted-foreground text-center">
                  请先选择版本，再输入兑换码或开始测试
                </p>
              )}
            </div>
          )}

          {/* 操作按钮 — 全宽对齐 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {!hasAccess && (
              <Link
                to="/access"
                search={{
                  product: productId,
                  redirect:
                    productId === "ros"
                      ? "/ros/start"
                      : runSuiteSlug && runSuiteSlug.includes("_")
                        ? `/tests/${runSuiteSlug}/run`
                        : `/tests/${productId}`,
                }}
                className="inline-flex items-center justify-center gap-1.5 h-11 rounded-full border border-border/60 bg-glass text-sm hover:bg-secondary/40 transition"
              >
                <Lock className="h-4 w-4" /> 输入兑换码
              </Link>
            )}
            <HintButton
              onClick={start}
              blocked={Boolean(blockedReason)}
              blockedHint={blockedReason ?? undefined}
              runWhenBlocked
              className={`inline-flex items-center justify-center gap-1.5 h-11 rounded-full text-sm font-medium bg-gradient-to-r ${a.ring} text-primary-foreground hover:opacity-95 ${hasAccess ? "sm:col-span-2" : ""}`}
            >
              {hasAccess ? "开始测试" : "去解锁"} <ArrowRight className="h-4 w-4" />
            </HintButton>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
