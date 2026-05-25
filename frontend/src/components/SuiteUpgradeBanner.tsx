import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowRight, ChevronDown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fullSuiteSlugFrom,
  inferSuiteTier,
  tierMeta,
  UPGRADE_STEPS,
  type ProductId,
} from "@/lib/suiteTier";
import { hasProductAccess } from "@/lib/accessGate";
import { inferGenderFromSuiteSlug } from "@/lib/resultRoutes";
import { productTheme } from "@/lib/productTheme";

type Props = {
  productId: ProductId;
  suiteSlug: string;
  attemptId?: string;
  className?: string;
};

export function SuiteUpgradeBanner({ productId, suiteSlug, attemptId, className = "" }: Props) {
  const tier = inferSuiteTier(suiteSlug);
  const [expanded, setExpanded] = useState(false);

  if (tier !== "lite") return null;

  const fullSlug = fullSuiteSlugFrom(suiteSlug);
  const meta = tierMeta(productId, "full");
  const liteMeta = tierMeta(productId, "lite");
  const gender = inferGenderFromSuiteSlug(suiteSlug);
  const hasFullAccess = hasProductAccess(productId, fullSlug);
  const steps = UPGRADE_STEPS[productId];
  const theme = productTheme(productId);

  const upgradeTo = productId === "ros" ? "/ros/start" : `/tests/${productId}`;
  const upgradeSearch =
    productId === "self" || productId === "mate"
      ? { tier: "full" as const, gender: gender ?? undefined }
      : { tier: "full" as const };

  return (
    <div className={`mt-10 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex-1 divider-line" />
        <span className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">
          升级完整版 · GO DEEPER
        </span>
        <div className="flex-1 divider-line" />
      </div>

      <motion.div
        layout
        className="relative bg-glass-strong rounded-2xl p-5 md:p-6 overflow-hidden ring-1 ring-[oklch(0.82_0.14_200/0.25)]"
      >
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-gradient-to-br from-[oklch(0.82_0.14_200/0.35)] to-[oklch(0.68_0.18_285/0.2)] blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-10 h-10 rounded-xl bg-[oklch(0.82_0.14_200_/_0.15)] grid place-items-center text-[oklch(0.82_0.14_200)]">
              <Zap className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                {liteMeta.label} · {liteMeta.questions} 题已完成
              </div>
              <div className="font-display text-lg mt-1 text-foreground">
                想要更准确的分析？试试 {meta.label}
              </div>
              <p className="text-[13px] text-foreground/65 mt-1.5 leading-relaxed">
                结果类型与完整版相同，但完整版 {meta.questions} 题可将精度从约 70% 提升至约 95%。
                {attemptId ? " 你已做的快速版答案会保留，升级后只需补充剩余题目。" : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl border border-border/50 bg-secondary/20 px-3 py-2.5">
              <div className="font-mono text-[10px] text-muted-foreground">当前 · 快速版</div>
              <div className="text-sm font-medium mt-0.5">{liteMeta.questions} 题 · ~70%</div>
            </div>
            <div className="rounded-xl border border-[oklch(0.82_0.14_200/0.45)] bg-[oklch(0.82_0.14_200/0.08)] px-3 py-2.5">
              <div className="font-mono text-[10px] text-[oklch(0.82_0.14_200)]">完整版</div>
              <div className="text-sm font-medium mt-0.5">{meta.questions} 题 · ~95%</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center justify-between w-full text-left text-sm text-muted-foreground hover:text-foreground transition rounded-lg px-1 py-1"
          >
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> 完整版多覆盖什么？
            </span>
            <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {steps.map((step, i) => (
                  <li
                    key={step.title}
                    className="flex gap-3 rounded-xl border border-border/40 bg-secondary/15 px-3.5 py-3"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-foreground/90">{step.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.detail}</div>
                    </div>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            {hasFullAccess ? (
              <Button asChild className={`rounded-full h-11 flex-1 bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground`}>
                <Link to={upgradeTo} search={upgradeSearch}>
                  开始完整版 <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : productId === "self" ? (
              <Button asChild className={`rounded-full h-11 flex-1 bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground`}>
                <Link to={upgradeTo} search={upgradeSearch}>
                  解锁完整版 <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild className={`rounded-full h-11 flex-1 bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground`}>
                <Link to="/access" search={{ product: productId, redirect: upgradeTo, tier: "full" }}>
                  兑换码解锁完整版 <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="rounded-full h-11 border-border/60 bg-glass shrink-0">
              <Link to={upgradeTo} search={{ tier: "lite", gender: gender ?? undefined }}>
                再做一次快速版
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
