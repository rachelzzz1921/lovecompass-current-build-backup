import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { tierMeta, type ProductId } from "@/lib/suiteTier";
import { productTheme } from "@/lib/productTheme";

type ParticipantTiers = {
  initiatorSuiteTier?: "lite" | "full" | null;
  partnerSuiteTier?: "lite" | "full" | null;
};

type Props = {
  productId: ProductId;
  participants?: ParticipantTiers | null;
  className?: string;
};

/** MATE 快速版不支持双人报告；ROS 仍显示精度提示 */
export function LiteCoupleResultNotice({ productId, participants, className = "" }: Props) {
  const initiatorLite = participants?.initiatorSuiteTier === "lite";
  const partnerLite = participants?.partnerSuiteTier === "lite";
  if (!initiatorLite && !partnerLite) return null;

  if (productId === "mate") {
    return (
      <div
        className={`rounded-xl border px-4 py-3 text-xs text-white/75 leading-relaxed ${className}`}
        style={{ borderColor: "rgba(251,113,133,0.35)", background: "rgba(251,113,133,0.08)" }}
      >
        MATE 双人匹配需双方均使用完整版测评。快速版无法生成双人报告，请升级完整版后重新配对。
      </div>
    );
  }

  const theme = productTheme(productId);
  const lite = tierMeta(productId, "lite");
  const full = tierMeta(productId, "full");

  let note = `本次双人报告基于快速版（${lite.questions} 题）生成，精度约 70–75%。`;
  if (initiatorLite && partnerLite) {
    note += " 建议双方各自升级完整版后重新配对，可提升至约 95%。";
  } else if (initiatorLite) {
    note += " 你这边是快速版，升级完整版后重新邀请 TA 可提升精度。";
  } else {
    note += " TA 使用的是快速版，你可先升级完整版再重新配对。";
  }
  note += ` 完整版 ${full.questions} 题。`;

  const upgradeTo = productId === "ros" ? "/ros/start" : `/tests/${productId}`;

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
        search={{ tier: "full" as const }}
        className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground`}
      >
        升级完整版
      </Link>
    </div>
  );
}
