import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { HintButton } from "@/components/HintButton";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Sparkles, ShieldCheck, Mail } from "lucide-react";
import { markProductAccess } from "@/lib/accessGate";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { resetPresentationSeed } from "@/lib/shufflePresentation";
import {
  genderForAccess,
  persistAccessGender,
  resolvePostRedeemTarget,
  suiteSlugForRedemption,
} from "@/lib/productAccessFlow";
import {
  getProductMeta,
  getStoredGender,
  productFlowSpec,
  type ProductId,
  type SuiteGender,
} from "@/lib/productRegistry";
import { tierMeta, type SuiteTier } from "@/lib/suiteTier";
import { normalizeRedemptionCode } from "@/lib/productAccessFlow";
import { getApiErrorHint } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { productTheme } from "@/lib/productTheme";
import {
  GenderSelect,
  ProductFlowCard,
  ProductFlowHeader,
  ProductFlowHero,
  ProductFlowSection,
  RedemptionCodeInput,
  TierSelect,
} from "@/components/product-flow/ProductFlowWidgets";

const SearchSchema = z.object({
  product: z.enum(["self", "ros", "mate"]).optional(),
  redirect: z.string().optional(),
  tier: z.enum(["lite", "full"]).optional(),
});

export const Route = createFileRoute("/access")({
  validateSearch: (s) => SearchSchema.parse(s),
  ssr: false,
  head: () => ({
    meta: [
      { title: "兑换码验证 · MIRROR" },
      { name: "description", content: "输入兑换码解锁你的 MIRROR 测试与 AI 分析师。" },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const search = useSearch({ from: "/access" });
  const nav = useNavigate();
  const { pending: authPending } = useRequireAuth();
  const productId: ProductId = search.product ?? "self";
  const spec = productFlowSpec(productId);
  const product = getProductMeta(productId);
  const theme = productTheme(productId);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [suiteTier, setSuiteTier] = useState<SuiteTier>(() => search.tier ?? "full");
  const [gender, setGender] = useState<SuiteGender | null>(() =>
    spec.pickGenderOnAccess ? getStoredGender(productId) : null,
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pickedGender = genderForAccess(productId, gender);
  const tierInfo = tierMeta(productId, suiteTier);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const verify = async () => {
    const normalized = normalizeRedemptionCode(code);
    if (normalized.length < 4) {
      toast.error("请输入完整的兑换码");
      return;
    }
    if (spec.pickGenderOnAccess && !pickedGender) {
      toast.error("请先选择「女性版」或「男性版」题库");
      return;
    }
    setVerifying(true);
    try {
      persistAccessGender(productId, pickedGender);
      const suiteSlug = suiteSlugForRedemption(productId, pickedGender, suiteTier);
      const res = await lovecompassApi.verifyRedemption({
        code: normalized,
        product: productId,
        suiteSlug,
        gender: pickedGender ?? undefined,
      });
      const verifiedSuiteSlug = res.suiteSlug ?? suiteSlug;
      markProductAccess(productId, verifiedSuiteSlug, res.redemptionEventId);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`${productId}:tier`, suiteTier);
      }
      toast.success("解锁成功");

      const target = resolvePostRedeemTarget({
        verifiedSuiteSlug,
        suiteTier,
        pickedGender,
        redirect: search.redirect,
        backendRedirect: res.redirect,
      });

      if (target.kind === "run") {
        resetPresentationSeed(target.suiteSlug);
        nav({ to: "/tests/$id/run", params: { id: target.suiteSlug } });
        return;
      }
      if (target.kind === "ros-start") {
        nav({ to: "/ros/start" });
        return;
      }
      nav({
        to: "/tests/$id",
        params: { id: target.productId },
        search: { tier: target.tier, gender: target.gender },
      });
    } catch (e) {
      const msg = (e as Error).message || "兑换码无效或已被使用";
      toast.error(msg, { description: getApiErrorHint(msg) ?? undefined });
      setCode("");
      inputRef.current?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const filled = normalizeRedemptionCode(code).length;

  if (authPending) return <AuthChecking />;

  return (
    <main className="relative min-h-screen flex flex-col">
      <ProductFlowHeader
        theme={theme}
        productCode={product.code}
        back={
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
          </Link>
        }
      />

      <section className="relative z-10 flex-1 flex items-center justify-center px-5 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          <ProductFlowHero
            theme={theme}
            kicker="ACCESS GATE"
            tierLabel={`${tierInfo.label} · ${tierInfo.questions} 题`}
            title="输入你的兑换码"
            description={`兑换码用于解锁 ${product.title}（${tierInfo.label}）。验证通过后会绑定测试套件，并保留本次兑换事件用于答题提交。`}
          />

          <ProductFlowCard theme={theme} className="space-y-6">
            {spec.pickTierOnAccess ? (
              <ProductFlowSection label="选择测试深度" hint={tierInfo.hint}>
                <TierSelect productId={productId} value={suiteTier} onChange={setSuiteTier} />
              </ProductFlowSection>
            ) : null}

            {spec.pickGenderOnAccess ? (
              <ProductFlowSection
                label="选择题库版本"
                hint={pickedGender ? `已选 · ${pickedGender === "female" ? "女性版" : "男性版"}` : undefined}
              >
                <GenderSelect productId={productId} value={gender} onChange={setGender} />
              </ProductFlowSection>
            ) : null}

            <RedemptionCodeInput
              ref={inputRef}
              productId={productId}
              value={code}
              onChange={setCode}
              onSubmit={() => void verify()}
              disabled={verifying}
            />

            <HintButton
              onClick={verify}
              blocked={verifying || filled < 4}
              blockedHint={filled < 4 ? "请输入至少 4 位兑换码后再验证" : undefined}
              className={`w-full h-12 rounded-full bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground hover:opacity-95 disabled:opacity-40 inline-flex items-center justify-center`}
            >
              {verifying ? (
                <span className="flex items-center gap-2 font-mono text-sm tracking-[0.2em]">
                  <Sparkles className="h-4 w-4 animate-pulse-ring" /> VERIFYING…
                </span>
              ) : (
                <>
                  <KeyRound className="mr-1.5 h-4 w-4" /> 验证并解锁
                </>
              )}
            </HintButton>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-secondary/30 rounded-xl border border-border/50 p-3">
                <motion.div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span className="font-mono tracking-[0.2em]">SECURE</span>
                </motion.div>
                <p className="text-foreground/80 leading-relaxed">
                  兑换码在后端真库校验，一次兑换关联本次作答记录。
                </p>
              </div>
              <div className="bg-secondary/30 rounded-xl border border-border/50 p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Mail className="h-3 w-3" />
                  <span className="font-mono tracking-[0.2em]">NO CODE?</span>
                </div>
                <p className="text-foreground/80 leading-relaxed">联系顾问获取，或加入候补名单等待开放。</p>
              </div>
            </div>
          </ProductFlowCard>
        </motion.div>
      </section>
    </main>
  );
}
