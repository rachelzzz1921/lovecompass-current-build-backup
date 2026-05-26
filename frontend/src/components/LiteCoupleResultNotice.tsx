import { Link } from "@tanstack/react-router";
import {
  coupleReportAccessRoute,
  coupleReportUnavailableCopy,
  coupleReportUpgradeBullets,
  coupleReportUpgradeRoute,
  type CoupleProductId,
} from "@/lib/coupleReport";
import { tierMeta } from "@/lib/suiteTier";
import { productTheme } from "@/lib/productTheme";

type ParticipantTiers = {
  initiatorSuiteTier?: "lite" | "full" | null;
  partnerSuiteTier?: "lite" | "full" | null;
};

type Props = {
  productId: CoupleProductId;
  participants?: ParticipantTiers | null;
  className?: string;
};

/** 双人报告页：任一方为快速版时提示升级 */
export function LiteCoupleResultNotice({ productId, participants, className = "" }: Props) {
  const initiatorLite = participants?.initiatorSuiteTier === "lite";
  const partnerLite = participants?.partnerSuiteTier === "lite";
  if (!initiatorLite && !partnerLite) return null;

  const theme = productTheme(productId);
  const upgrade = coupleReportUpgradeRoute(productId);
  const access = coupleReportAccessRoute(productId);
  const lite = tierMeta(productId, "lite");
  const full = tierMeta(productId, "full");
  const topBullet = coupleReportUpgradeBullets(productId)[0];

  return (
    <div
      className={`rounded-xl border px-4 py-4 space-y-3 ${className}`}
      style={{
        borderColor: productId === "mate" ? "rgba(251,113,133,0.35)" : "rgba(255,255,255,0.1)",
        background: productId === "mate" ? "rgba(251,113,133,0.08)" : "rgba(255,255,255,0.04)",
      }}
    >
      <p className="text-xs text-white/75 leading-relaxed">{coupleReportUnavailableCopy(productId)}</p>
      {topBullet ? (
        <p className="text-[11px] text-white/55 leading-relaxed">
          完整版可解锁：{topBullet.title} — {topBullet.detail}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 text-center text-[11px]">
        <div className="rounded-lg border border-white/10 px-2 py-2 text-white/55">
          快速版 · {lite.questions} 题
        </div>
        <div className="rounded-lg border border-white/15 px-2 py-2 text-white/80">
          完整版 · {full.questions} 题 · 可合测
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          to={upgrade.to}
          search={upgrade.search}
          className={`inline-flex items-center justify-center px-3 py-2 rounded-full text-xs font-medium bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground`}
        >
          升级完整版
        </Link>
        <Link
          to={access.to}
          search={access.search}
          className="inline-flex items-center justify-center px-3 py-2 rounded-full text-xs text-white/75 border border-white/15"
        >
          兑换码解锁
        </Link>
      </div>
    </div>
  );
}
