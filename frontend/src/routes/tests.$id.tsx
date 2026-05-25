import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouterState, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { hasProductAccess, clearProductUnlock } from "@/lib/accessGate";
import { findProductByRouteId, inferGenderFromSuiteSlug, testEntryRouteId } from "@/lib/resultRoutes";
import { HintButton } from "@/components/HintButton";
import { accessRedirectFromTestEntry } from "@/lib/productAccessFlow";
import {
  getStoredGender,
  isLiteTierFree,
  productFlowSpec,
  setStoredGender,
  type ProductId,
  type SuiteGender,
} from "@/lib/productRegistry";
import { resolveSuiteSlugByTier, tierMeta, type SuiteTier } from "@/lib/suiteTier";
import { resetPresentationSeed } from "@/lib/shufflePresentation";
import { productTheme } from "@/lib/productTheme";
import {
  GenderSelect,
  ProductFlowCard,
  ProductFlowHeader,
  ProductFlowSection,
  TierSelect,
  UnlockStatusRow,
} from "@/components/product-flow/ProductFlowWidgets";
import { ArrowLeft, ArrowRight, Clock, Layers, Sparkles, Lock } from "lucide-react";

const SearchSchema = z.object({
  tier: z.enum(["lite", "full"]).optional(),
  gender: z.enum(["female", "male"]).optional(),
});

export const Route = createFileRoute("/tests/$id")({
  validateSearch: (s) => SearchSchema.parse(s),
  component: TestEntry,
});

function TestEntry() {
  const { id } = useParams({ from: "/tests/$id" });
  const search = useSearch({ from: "/tests/$id" });
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname.endsWith("/run")) return <Outlet />;
  const routeSuiteSlug = id;
  const product = findProductByRouteId(routeSuiteSlug);
  const productId = testEntryRouteId(routeSuiteSlug) as ProductId;
  const spec = productFlowSpec(productId);
  const theme = productTheme(productId);

  const slugGender = inferGenderFromSuiteSlug(routeSuiteSlug);
  const [gender, setGender] = useState<SuiteGender | null>(
    () => search.gender ?? slugGender ?? getStoredGender(productId),
  );
  const [suiteTier, setSuiteTier] = useState<SuiteTier>(() => search.tier ?? "lite");

  const pickedGender = spec.pickGenderOnAccess ? gender : null;
  const runSuiteSlug = pickedGender
    ? resolveSuiteSlugByTier(productId, pickedGender, suiteTier)
    : routeSuiteSlug;
  const tierInfo = tierMeta(productId, suiteTier);
  const liteFree = isLiteTierFree(productId, suiteTier);
  const hasAccess = liteFree || hasProductAccess(product.id, runSuiteSlug);

  const returnPath = `/tests/${productId}`;

  const startBlockedReason = (): string | null => {
    if (authLoading) return "正在确认登录状态，请稍候";
    if (!user) return "请先登录后再开始测试";
    if (spec.pickGenderOnAccess && !gender) return "请先选择「女性版」或「男性版」题库";
    if (!liteFree && !hasAccess) return "请先输入兑换码解锁本题库";
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
            redirect: accessRedirectFromTestEntry(productId, runSuiteSlug),
            tier: suiteTier,
          },
        });
      }
      return;
    }

    if (spec.redeemLanding === "ros-start") {
      nav({ to: spec.entryPath });
      return;
    }

    if (pickedGender) {
      setStoredGender(productId, pickedGender);
      sessionStorage.setItem(`suite:${productId}`, runSuiteSlug);
    }
    sessionStorage.setItem(`${productId}:tier`, suiteTier);
    resetPresentationSeed(runSuiteSlug);
    nav({ to: "/tests/$id/run", params: { id: runSuiteSlug } });
  };

  const blockedReason = startBlockedReason();

  return (
    <main className="relative min-h-screen">
      <ProductFlowHeader
        theme={theme}
        productCode={product.code}
        back={
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
          </Link>
        }
      />

      <section className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 pt-14 pb-20">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">{product.badge}</div>
          <h1 className="font-display text-4xl md:text-[52px] mt-3 leading-[1.05] tracking-tight">
            <span className={theme.titleGradient}>{product.title}</span>
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
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${theme.ringGradient}`} />
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
        >
        <ProductFlowCard theme={theme} className="mt-8 space-y-6">
          <UnlockStatusRow
            productId={productId}
            unlocked={hasAccess}
            freeTier={liteFree}
            tierLabel={tierInfo.label}
            questionCount={tierInfo.questions}
            loginLabel={user ? "已登录" : "开始之前请先登录"}
          />

          {spec.pickGenderOnAccess && (
            <ProductFlowSection label="选择测试深度" hint={tierInfo.hint}>
              <TierSelect
                productId={productId}
                value={suiteTier}
                onChange={(tier) => {
                  if (suiteTier !== tier) clearProductUnlock(product.id);
                  setSuiteTier(tier);
                }}
              />
            </ProductFlowSection>
          )}

          {spec.pickGenderOnAccess && (
            <ProductFlowSection
              label="选择题库性别版本"
              hint={pickedGender ? `已选 · ${pickedGender === "female" ? "女性版" : "男性版"}` : undefined}
            >
              <GenderSelect
                productId={productId}
                value={gender}
                onChange={(next) => {
                  if (gender && gender !== next) clearProductUnlock(product.id);
                  setGender(next);
                }}
              />
              {!pickedGender && (
                <p className="text-[11px] text-muted-foreground text-center">请先选择性别版本，再开始测试</p>
              )}
            </ProductFlowSection>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {!hasAccess && !liteFree && (
              <Link
                to="/access"
                search={{
                  product: productId,
                  redirect: accessRedirectFromTestEntry(productId, runSuiteSlug),
                  tier: suiteTier,
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
              className={`inline-flex items-center justify-center gap-1.5 h-11 rounded-full text-sm font-medium bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground hover:opacity-95 ${hasAccess || liteFree ? "sm:col-span-2" : ""}`}
            >
              {liteFree || hasAccess ? "开始测试" : "去解锁"} <ArrowRight className="h-4 w-4" />
            </HintButton>
          </div>
        </ProductFlowCard>
        </motion.div>
      </section>
    </main>
  );
}
