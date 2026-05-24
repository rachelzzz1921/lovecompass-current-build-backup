import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Heart, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { STAGE_OPTIONS } from "@/data/rosTypes";
import { getPartnerRelationCode, hasProductAccess, markPartnerRosAccess, markProductAccess } from "@/lib/accessGate";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import {
  ROS_SUITE_SLUGS,
  setStoredRosGender,
  type RosGender,
} from "@/lib/suiteSlugs";
import { resetPresentationSeed } from "@/lib/shufflePresentation";

export const Route = createFileRoute("/ros/start")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "ROS · 关系测评开始 · MIRROR" },
      { name: "description", content: "为这段关系做一次系统体检——60 题，五个维度。" },
    ],
  }),
  component: RosStartPage,
});

function RosStartPage() {
  const nav = useNavigate();
  const { pending: authPending } = useRequireAuth();
  const [step, setStep] = useState<"code" | "gender" | "stage">("code");
  const [hasCode, setHasCode] = useState<"yes" | "no" | null>(null);
  const [code, setCode] = useState("");
  const [gender, setGender] = useState<RosGender | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (getPartnerRelationCode()) return;
    if (hasProductAccess("ros")) {
      setHasCode("no");
      setStep("gender");
    }
  }, []);

  const beginTest = async () => {
    if (!gender || !stage) return;
    setSubmitting(true);
    try {
      const suiteSlug = ROS_SUITE_SLUGS[gender];
      setStoredRosGender(gender);
      sessionStorage.setItem("ros:stageUi", stage);

      if (hasCode === "yes") {
        const partnerCode = code.trim().toUpperCase();
        await lovecompassApi.previewRelationCode(partnerCode);
        markPartnerRosAccess(partnerCode, suiteSlug);
      } else if (hasProductAccess("ros")) {
        const redemptionEventId =
          sessionStorage.getItem("redemption:ros") ||
          sessionStorage.getItem(`redemption:${suiteSlug}`);
        markProductAccess("ros", suiteSlug, redemptionEventId ?? undefined);
      } else {
        const res = await lovecompassApi.verifyRedemption({
          code: code.trim(),
          product: "ros",
          suiteSlug,
          gender,
        });
        markProductAccess("ros", res.suiteSlug || suiteSlug, res.redemptionEventId);
      }

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
    <main className="relative min-h-screen">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Link>
        <span className="chip chip-cyan font-mono">SET · 02 / ROS</span>
      </header>

      <section className="relative z-10 max-w-2xl mx-auto px-6 md:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <span className="chip chip-violet font-mono inline-flex">CHAPTER · 02</span>
          <h1 className="font-display text-4xl md:text-5xl mt-4 text-gradient-violet">你们之间，到底怎么样</h1>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            心里有一个具体的人才能作答。62 题（含 2 道校准），约 12 分钟。
            <br />
            五层结构：吸引 · 互动 · 兼容 · 走向 · 风险。
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-2 mb-10">
          <Dot active={step === "code"} done={step !== "code"} label="1 · 解锁" />
          <div className="w-8 h-px bg-border" />
          <Dot active={step === "gender"} done={step === "stage"} label="2 · 版本" />
          <div className="w-8 h-px bg-border" />
          <Dot active={step === "stage"} label="3 · 阶段" />
        </div>

        {step === "code" && (
          <motion.div key="code" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-glass-strong rounded-2xl p-7 space-y-6">
            <div>
              <div className="text-xs tracking-[0.3em] text-muted-foreground font-mono mb-3">PARTNER CODE</div>
              <h2 className="font-display text-2xl">是否有伴侣的关系码？</h2>
              <p className="text-sm text-muted-foreground mt-2">
                如果 TA 已经做过，输入 TA 的关系码可以免费开始；做完后双方都能看完整双人报告。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <OptionCard active={hasCode === "yes"} onClick={() => setHasCode("yes")}
                icon={<KeyRound className="h-5 w-5" />} title="有，TA 已经做过" sub="免费开始 · 自动配对" />
              <OptionCard active={hasCode === "no"} onClick={() => setHasCode("no")}
                icon={<Sparkles className="h-5 w-5" />} title="没有，我先做" sub="需要兑换码 · 做完可邀请 TA" />
            </div>

            {hasCode === "yes" && (
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ROS-XXXX-XXXX" className="font-mono tracking-[0.2em] h-12 text-center text-lg" />
            )}
            {hasCode === "no" && (
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="兑换码" className="font-mono tracking-[0.2em] h-12 text-center text-lg" />
            )}

            <Button disabled={!hasCode || !code.trim()} onClick={() => setStep("gender")}
              className="w-full h-12 bg-gradient-to-r from-[oklch(0.55_0.20_285)] to-[oklch(0.50_0.18_200)] text-white">
              下一步 <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === "gender" && (
          <motion.div key="gender" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-glass-strong rounded-2xl p-7 space-y-6">
            <h2 className="font-display text-2xl">选择你的作答版本</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["female", "male"] as const).map((g) => (
                <button key={g} onClick={() => setGender(g)}
                  className={`p-4 rounded-xl border text-left ${gender === g ? "border-[oklch(0.68_0.18_285_/_0.55)] bg-[oklch(0.50_0.20_285_/_0.18)]" : "border-border"}`}>
                  <div className="text-sm font-medium">{g === "female" ? "女性版" : "男性版"}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {g === "female" ? "情感感受类题干" : "行为事实类题干"}
                  </div>
                </button>
              ))}
            </div>
            <Button disabled={!gender} onClick={() => setStep("stage")}
              className="w-full h-12 bg-gradient-to-r from-[oklch(0.55_0.20_285)] to-[oklch(0.50_0.18_200)] text-white">
              下一步 <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {step === "stage" && (
          <motion.div key="stage" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-glass-strong rounded-2xl p-7 space-y-6">
            <h2 className="font-display text-2xl">你们现在处于哪个阶段？</h2>
            <div className="space-y-2">
              {STAGE_OPTIONS.map((s) => (
                <button key={s.id} onClick={() => setStage(s.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left ${stage === s.id ? "border-[oklch(0.68_0.18_285_/_0.55)] bg-[oklch(0.50_0.20_285_/_0.18)]" : "border-border"}`}>
                  <span className="text-sm">{s.label}</span>
                  <Heart className={`h-4 w-4 ${stage === s.id ? "text-[oklch(0.78_0.16_360)]" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
            <Button disabled={!stage || submitting} onClick={() => void beginTest()}
              className="w-full h-12 bg-gradient-to-r from-[oklch(0.55_0.20_285)] to-[oklch(0.50_0.18_200)] text-white">
              {submitting ? "准备中…" : "开始 62 题"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </section>
    </main>
  );
}

function Dot({ active, done, label }: { active?: boolean; done?: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-[11px] font-mono ${active ? "text-foreground" : done ? "text-[oklch(0.78_0.15_165)]" : "text-muted-foreground/60"}`}>
      <span className={`w-2 h-2 rounded-full ${active ? "bg-[oklch(0.68_0.18_285)]" : done ? "bg-[oklch(0.78_0.15_165)]" : "bg-border"}`} />
      {label}
    </div>
  );
}

function OptionCard({ active, onClick, icon, title, sub }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub: string;
}) {
  return (
    <button onClick={onClick}
      className={`text-left p-4 rounded-xl border ${active ? "border-[oklch(0.68_0.18_285_/_0.6)] bg-[oklch(0.50_0.20_285_/_0.2)]" : "border-border"}`}>
      <div className="mb-2">{icon}</div>
      <div className="text-sm font-medium">{title}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </button>
  );
}
