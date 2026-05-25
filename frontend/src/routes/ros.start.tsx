import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { STAGE_OPTIONS } from "@/data/rosTypes";
import { getPartnerRelationCode, hasProductAccess } from "@/lib/accessGate";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import {
  getProductMeta,
  multiStepEntryFlow,
  stepIndexForMultiStep,
  tierMeta,
  type MultiStepEntryStepId,
  type SuiteGender,
  type SuiteTier,
} from "@/lib/productRegistry";
import {
  persistRunSessionKeys,
  resolveRelationCodeTier,
  unlockProductForRun,
  type RunUnlockMode,
} from "@/lib/productAccessFlow";
import { resetPresentationSeed } from "@/lib/shufflePresentation";
import { optionClass, productTheme } from "@/lib/productTheme";
import {
  FlowOptionCard,
  FlowStepIndicator,
  GenderSelect,
  ProductEntryHero,
  ProductFlowCard,
  ProductFlowHeader,
  ProductFlowSection,
  PrimaryFlowButton,
  RedemptionCodeInput,
  TierSelect,
} from "@/components/product-flow/ProductFlowWidgets";

const PRODUCT_ID = "ros" as const;

export const Route = createFileRoute("/ros/start")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ROS · 关系测评开始 · MIRROR" },
      { name: "description", content: "为这段关系做一次系统体检——五层结构，快速版或完整版。" },
    ],
  }),
  component: RosStartPage,
});

function RosStartPage() {
  const nav = useNavigate();
  const { pending: authPending } = useRequireAuth();
  const flow = multiStepEntryFlow(PRODUCT_ID)!;
  const meta = getProductMeta(PRODUCT_ID);
  const theme = productTheme(PRODUCT_ID);

  const [step, setStep] = useState<MultiStepEntryStepId>("unlock");
  const [hasCode, setHasCode] = useState<"yes" | "no" | null>(null);
  const [code, setCode] = useState("");
  const [gender, setGender] = useState<SuiteGender | null>(null);
  const [suiteTier, setSuiteTier] = useState<SuiteTier>(flow.defaultTier);
  const [stage, setStage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unlockAdvancing, setUnlockAdvancing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getPartnerRelationCode()) return;
    if (flow.skipUnlockStepWhenAccessGranted && hasProductAccess(PRODUCT_ID)) {
      setHasCode("no");
      setStep("setup");
    }
  }, [flow.skipUnlockStepWhenAccessGranted]);

  const advanceFromUnlock = async () => {
    if (hasCode === "yes") {
      setUnlockAdvancing(true);
      try {
        const tier = await resolveRelationCodeTier(code);
        setSuiteTier(tier);
        setStep("setup");
      } catch (e) {
        toast.error(formatApiErrorMessage(e));
      } finally {
        setUnlockAdvancing(false);
      }
      return;
    }
    setStep("setup");
  };

  const beginTest = async () => {
    if (!gender || !stage) return;
    setSubmitting(true);
    try {
      let unlock: RunUnlockMode;
      if (hasCode === "yes") {
        unlock = { kind: "partner-code", code };
      } else if (hasProductAccess(PRODUCT_ID)) {
        unlock = { kind: "cached-access" };
      } else {
        unlock = { kind: "redeem-code", code };
      }

      const suiteSlug = await unlockProductForRun({
        productId: PRODUCT_ID,
        gender,
        suiteTier,
        unlock,
      });

      persistRunSessionKeys(flow.sessionKeys, { stage, tier: suiteTier });
      resetPresentationSeed(suiteSlug);
      void nav({ to: "/tests/$id/run", params: { id: suiteSlug } });
    } catch (e) {
      toast.error(formatApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (authPending) return <AuthChecking />;

  const { unlock: unlockPanel, setup: setupPanel, stage: stagePanel } = flow.panels;
  const tierInfo = tierMeta(PRODUCT_ID, suiteTier);

  return (
    <main className="relative min-h-screen">
      <ProductFlowHeader
        theme={theme}
        productCode={meta.code}
        back={
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> 返回
          </Link>
        }
      />

      <section className="relative z-10 max-w-2xl mx-auto px-6 md:px-12 py-8 md:py-12">
        <ProductEntryHero
          theme={theme}
          productCode={meta.code}
          title={meta.subtitle}
          description={meta.description.replace(/\s*入口：\/ros\/start\s*/, "").trim()}
        />

        <FlowStepIndicator theme={theme} steps={[...flow.steps]} currentIndex={stepIndexForMultiStep(step)} />

        {step === "unlock" && (
          <motion.div key="unlock" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <ProductFlowCard theme={theme} className="space-y-6">
              <div>
                <motion.div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground mb-2">
                  {unlockPanel.sectionLabel}
                </motion.div>
                <h2 className="font-display text-2xl">{unlockPanel.heading}</h2>
                <p className="text-sm text-muted-foreground mt-2">{unlockPanel.description}</p>
              </div>

              <ProductFlowSection label="选择进入方式">
                <div className="grid grid-cols-2 gap-3">
                  <FlowOptionCard
                    theme={theme}
                    active={hasCode === "yes"}
                    onClick={() => setHasCode("yes")}
                    icon={<KeyRound className="h-5 w-5" />}
                    title={unlockPanel.partnerPath.title}
                    sub={unlockPanel.partnerPath.sub}
                  />
                  <FlowOptionCard
                    theme={theme}
                    active={hasCode === "no"}
                    onClick={() => setHasCode("no")}
                    icon={<Sparkles className="h-5 w-5" />}
                    title={unlockPanel.selfPath.title}
                    sub={unlockPanel.selfPath.sub}
                  />
                </div>
              </ProductFlowSection>

              {hasCode === "yes" ? (
                <RedemptionCodeInput
                  productId={PRODUCT_ID}
                  value={code}
                  onChange={setCode}
                  label={unlockPanel.relationCodeLabel}
                  placeholder={unlockPanel.relationCodePlaceholder}
                />
              ) : hasCode === "no" ? (
                <RedemptionCodeInput
                  productId={PRODUCT_ID}
                  value={code}
                  onChange={setCode}
                  label={unlockPanel.redeemCodeLabel}
                  placeholder={unlockPanel.redeemCodePlaceholder}
                />
              ) : null}

              <PrimaryFlowButton
                theme={theme}
                disabled={!hasCode || !code.trim() || unlockAdvancing}
                onClick={() => void advanceFromUnlock()}
              >
                {unlockAdvancing ? "验证关系码…" : "下一步"} <ArrowRight className="h-4 w-4" />
              </PrimaryFlowButton>
            </ProductFlowCard>
          </motion.div>
        )}

        {step === "setup" && (
          <motion.div key="setup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <ProductFlowCard theme={theme} className="space-y-6">
              <h2 className="font-display text-2xl">{setupPanel.heading}</h2>

              {hasCode === "yes" ? (
                <ProductFlowSection label="测试深度" hint="与 TA 保持一致，不可更改">
                  <div className="rounded-xl border border-border/60 bg-secondary/20 px-4 py-3 text-sm">
                    {tierInfo.label} · {tierInfo.questions} 题 · 约 {tierInfo.minutes} 分钟
                  </div>
                </ProductFlowSection>
              ) : (
                <ProductFlowSection label="选择测试深度" hint={tierInfo.hint}>
                  <TierSelect productId={PRODUCT_ID} value={suiteTier} onChange={setSuiteTier} />
                </ProductFlowSection>
              )}

              <ProductFlowSection
                label="选择题库版本"
                hint={gender ? `已选 · ${gender === "female" ? "女性版" : "男性版"}` : undefined}
              >
                <GenderSelect productId={PRODUCT_ID} value={gender} onChange={setGender} />
              </ProductFlowSection>

              <PrimaryFlowButton theme={theme} disabled={!gender} onClick={() => setStep("stage")}>
                下一步 <ArrowRight className="h-4 w-4" />
              </PrimaryFlowButton>
            </ProductFlowCard>
          </motion.div>
        )}

        {step === "stage" && (
          <motion.div key="stage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <ProductFlowCard theme={theme} className="space-y-6">
              <h2 className="font-display text-2xl">{stagePanel.heading}</h2>
              <ProductFlowSection label={stagePanel.sectionLabel}>
                <div className="space-y-2">
                  {STAGE_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStage(s.id)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left ${optionClass(theme, stage === s.id)}`}
                    >
                      <span className="text-sm">{s.label}</span>
                      <Heart
                        className={`h-4 w-4 ${stage === s.id ? "text-[oklch(0.78_0.16_360)]" : "text-muted-foreground/40"}`}
                      />
                    </button>
                  ))}
                </div>
              </ProductFlowSection>
              <PrimaryFlowButton
                theme={theme}
                disabled={!stage || submitting}
                onClick={() => void beginTest()}
              >
                {submitting ? "准备中…" : `开始 ${tierInfo.questions} 题`}
                <ArrowRight className="h-4 w-4" />
              </PrimaryFlowButton>
            </ProductFlowCard>
          </motion.div>
        )}
      </section>
    </main>
  );
}
