import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { inferSuiteTier, tierMeta, type ProductId } from "@/lib/suiteTier";
import { productTheme } from "@/lib/productTheme";

type Props = {
  productId: ProductId;
  suiteSlug: string | null | undefined;
  accuracyNote?: string | null;
  className?: string;
};

/** 快速版结果页顶部轻量提示 —— 完整升级 CTA 见 SuiteUpgradeBanner */
export function LiteResultNotice({ productId, suiteSlug, accuracyNote, className = "" }: Props) {
  if (!suiteSlug || inferSuiteTier(suiteSlug) !== "lite") return null;

  const theme = productTheme(productId);
  const lite = tierMeta(productId, "lite");
  const full = tierMeta(productId, "full");
  const note =
    accuracyNote ||
    `快速版 ${lite.questions} 题，结果精度约 70–75%；完整版 ${full.questions} 题可提升至约 95%。`;

  const upgradeTo = productId === "ros" ? "/ros/start" : `/tests/${productId}`;
  const upgradeSearch =
    productId === "self" || productId === "mate"
      ? { tier: "full" as const }
      : { tier: "full" as const };

  return (
    <div
      className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 ${className}`}
      style={{
        borderColor: "rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <Sparkles className={`h-4 w-4 shrink-0 mt-0.5 ${theme.iconColor}`} />
        <p className="text-xs text-white/70 leading-relaxed">{note}</p>
      </div>
      <Link
        to={upgradeTo}
        search={upgradeSearch}
        className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground`}
      >
        升级完整版
      </Link>
    </div>
  );
}
