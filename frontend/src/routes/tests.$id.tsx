import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/data/products";
import { getStoredSelfGender, setStoredSelfGender, SELF_SUITE_SLUGS, type SelfGender } from "@/lib/suiteSlugs";
import { ArrowLeft, ArrowRight, Clock, Layers, Sparkles, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/tests/$id")({
  component: TestEntry,
});

const ACCENT = {
  violet: { text: "text-gradient-violet", ring: "from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)]", chip: "chip-violet" },
  cyan: { text: "text-gradient-cyan", ring: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]", chip: "chip-cyan" },
  rose: { text: "text-gradient-violet", ring: "from-[oklch(0.72_0.18_360)] to-[oklch(0.55_0.20_355)]", chip: "chip-violet" },
} as const;

function TestEntry() {
  const { id } = useParams({ from: "/tests/$id" });
  const nav = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname.endsWith("/run")) return <Outlet />;
  const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
  const routeSuiteSlug = id;
  const a = ACCENT[product.accent];

  const isFree = product.status === "free";
  const hasAccess = typeof window !== "undefined" && (sessionStorage.getItem(`access:${routeSuiteSlug}`) === "1" || sessionStorage.getItem(`access:${product.id}`) === "1");
  const isSelfProduct = product.id === "self";
  const [selfGender, setSelfGender] = useState<SelfGender | null>(() => getStoredSelfGender());

  const runSuiteSlug =
    isSelfProduct && selfGender ? SELF_SUITE_SLUGS[selfGender] : routeSuiteSlug;

  const start = () => {
    if (isSelfProduct && !selfGender) return;
    if (isFree || hasAccess) {
      if (isSelfProduct && selfGender) {
        setStoredSelfGender(selfGender);
      }
      nav({ to: "/tests/$id/run", params: { id: runSuiteSlug } });
    } else {
      nav({ to: "/access", search: { product: product.id, redirect: `/tests/${runSuiteSlug}/run` } });
    }
  };

  return (
    <main className="relative min-h-screen">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
        </Link>
        <span className={`chip ${a.chip} font-mono`}>{product.code}</span>
      </header>

      <section className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 pt-14 pb-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">{product.badge}</div>
          <h1 className="font-display text-4xl md:text-[52px] mt-3 leading-[1.05] tracking-tight">
            <span className={a.text}>{product.title}</span>
          </h1>
          <p className="mt-4 text-lg text-foreground/80">{product.subtitle}</p>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl leading-relaxed">{product.description}</p>

          {/* Spec strip */}
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

        {/* Dimensions preview */}
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

        {/* Flow */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mt-6 grid md:grid-cols-3 gap-3"
        >
          {[
            { n: "01", t: "作答", d: "情境式选题，跟着直觉走" },
            { n: "02", t: "匹配", d: "AI 把答案翻译成画像指纹" },
            { n: "03", t: "解读", d: "生成可视化报告与对话入口" },
          ].map((s) => (
            <div key={s.n} className="bg-glass rounded-2xl p-5">
              <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">{s.n}</div>
              <div className="font-display text-lg mt-1">{s.t}</div>
              <p className="text-xs text-muted-foreground mt-1.5">{s.d}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-8 bg-glass-strong rounded-3xl p-7 flex flex-col md:flex-row items-center justify-between gap-5"
        >
          <div className="flex items-center gap-3">
            {isFree ? (
              <span className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.16_200_/_0.18)] grid place-items-center text-[oklch(0.82_0.14_200)]">
                <Sparkles className="h-5 w-5" />
              </span>
            ) : (
              <span className="w-10 h-10 rounded-xl bg-[oklch(0.50_0.20_285_/_0.18)] grid place-items-center text-[oklch(0.82_0.10_285)]">
                <Lock className="h-5 w-5" />
              </span>
            )}
            <div>
              <div className="font-display text-lg text-foreground/95">
                {isFree ? "免费开始" : hasAccess ? "已解锁，可直接开始" : "需要兑换码解锁"}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3 w-3" /> 答题过程不被记录任何外泄信息
              </div>
            </div>
          </div>
          {isSelfProduct && (
            <div className="mt-6 flex flex-col gap-2">
              <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">选择题库版本</div>
              <div className="flex gap-2">
                {(["female", "male"] as const).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => setSelfGender(gender)}
                    className={`flex-1 h-11 rounded-full border text-sm transition ${
                      selfGender === gender
                        ? "border-accent bg-accent/15 text-foreground"
                        : "border-border/60 bg-glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {gender === "female" ? "女性版 · 50 题" : "男性版 · 50 题"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 w-full md:w-auto">
            {!isFree && !hasAccess && (
              <Link
                to="/access"
                search={{ product: product.id }}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-5 h-11 rounded-full border border-border/60 bg-glass text-sm hover:bg-secondary/40"
              >
                <Lock className="h-4 w-4" /> 输入兑换码
              </Link>
            )}
            <button
              onClick={start}
              disabled={isSelfProduct && !selfGender}
              className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-6 h-11 rounded-full text-sm font-medium bg-gradient-to-r ${a.ring} text-primary-foreground hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isFree || hasAccess ? "开始测试" : "去解锁"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
