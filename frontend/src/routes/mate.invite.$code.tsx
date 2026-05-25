import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { unlockProductForRun } from "@/lib/productAccessFlow";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { getProductMeta, getStoredGender, tierMeta, type SuiteGender, type SuiteTier } from "@/lib/productRegistry";
import { resetPresentationSeed } from "@/lib/shufflePresentation";
import { productTheme } from "@/lib/productTheme";
import {
  GenderSelect,
  ProductFlowCard,
  ProductFlowHeader,
  ProductFlowHero,
  ProductFlowSection,
  PrimaryFlowButton,
} from "@/components/product-flow/ProductFlowWidgets";

export const Route = createFileRoute("/mate/invite/$code")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "TA 邀请你做择偶坐标测评 · MIRROR" },
      { name: "description", content: "TA 已经做完了 MATE 择偶测评，正在等你的视角。" },
    ],
  }),
  component: MateInvitePage,
});

const PRODUCT_ID = "mate" as const;
const theme = productTheme(PRODUCT_ID);
const meta = getProductMeta(PRODUCT_ID);

function MateInvitePage() {
  const { code } = useParams({ from: "/mate/invite/$code" });
  const nav = useNavigate();
  const { pending: authPending } = useRequireAuth();
  const [gender, setGender] = useState<SuiteGender>(() => getStoredGender(PRODUCT_ID) ?? "male");
  const [suiteTier, setSuiteTier] = useState<SuiteTier>("full");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const preview = await lovecompassApi.previewMateRelationCode(code);
        if (cancelled) return;
        setSuiteTier(
          preview.suiteTier === "lite" || preview.suiteTier === "full"
            ? preview.suiteTier
            : preview.suiteSlug?.includes("_lite")
              ? "lite"
              : "full",
        );
      } catch (e) {
        if (!cancelled) toast.error(formatApiErrorMessage(e));
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const tierInfo = tierMeta(PRODUCT_ID, suiteTier);

  const start = async () => {
    setSubmitting(true);
    try {
      const suiteSlug = await unlockProductForRun({
        productId: PRODUCT_ID,
        gender,
        suiteTier,
        unlock: { kind: "partner-code", code },
      });
      resetPresentationSeed(suiteSlug);
      void nav({ to: "/tests/$id/run", params: { id: suiteSlug } });
    } catch (e) {
      toast.error(formatApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (authPending) return <AuthChecking />;

  return (
    <main className="relative min-h-screen flex flex-col">
      <ProductFlowHeader
        theme={theme}
        productCode={meta.code}
        rightLabel="INVITE · MATE"
        back={
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> 返回首页
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
            kicker="PARTNER INVITE"
            title="TA 邀请你一起看清，你们是否适合长期走下去"
            description="等你做完，你们会同时解锁 MATE 双人婚恋适配报告——这一步，你也是免费的。"
          />

          <ProductFlowCard theme={theme} className="space-y-6">
            <div className="text-center">
              <div className="text-[10px] tracking-[0.3em] text-muted-foreground font-mono mb-2">RELATION CODE</div>
              <div className={`font-mono text-2xl tracking-[0.25em] ${theme.titleGradient}`}>
                {code.toUpperCase()}
              </div>
            </div>

            <ProductFlowSection label="选择你的性别版本">
              <GenderSelect productId="mate" value={gender} onChange={setGender} />
            </ProductFlowSection>

            <div className="text-center text-xs text-muted-foreground">
              {previewLoading
                ? "正在读取 TA 的测试版本…"
                : `与 TA 对齐 · ${tierInfo.label} · ${tierInfo.questions} 题 · 约 ${tierInfo.minutes} 分钟`}
            </div>

            <PrimaryFlowButton theme={theme} onClick={() => void start()} disabled={submitting || previewLoading}>
              {submitting ? (
                <span className="flex items-center gap-2 font-mono text-sm tracking-[0.15em]">
                  <Sparkles className="h-4 w-4 animate-pulse-ring" /> 验证中…
                </span>
              ) : (
                <>
                  开始我的测评 <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </PrimaryFlowButton>
          </ProductFlowCard>
        </motion.div>
      </section>
    </main>
  );
}
