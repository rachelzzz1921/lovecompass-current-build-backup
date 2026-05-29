import type { ProductId } from "@/lib/productRegistry";
import { inferSuiteTier, tierMeta, type SuiteTier } from "@/lib/suiteTier";

export type CoupleProductId = Extract<ProductId, "ros" | "mate">;

export type UpgradeBullet = { title: string; detail: string };

export const LITE_COUPLE_BLOCKED_MESSAGE =
  "快速版不支持双人匹配，请使用完整版测评后再邀请 TA。";

/** slug / payload tier / 关系码 综合判断版本（避免 suiteSlug 未加载时误判为 lite）。 */
export function resolveSuiteTier(
  suiteSlug: string | null | undefined,
  suiteTier?: SuiteTier | null,
): SuiteTier | null {
  if (suiteTier === "lite" || suiteTier === "full") return suiteTier;
  if (!suiteSlug) return null;
  return inferSuiteTier(suiteSlug);
}

/** 套二 ROS / 套三 MATE：仅完整版支持合测生成双人报告。 */
export function coupleReportEligible(
  _productId: CoupleProductId,
  suiteSlug: string | null | undefined,
  suiteTier?: SuiteTier | null,
  relationCode?: string | null,
): boolean {
  const tier = resolveSuiteTier(suiteSlug, suiteTier);
  if (tier === "lite") return false;
  if (tier === "full") return true;
  if (relationCode?.trim()) return true;
  return false;
}

/** 仅在已确认快速版时展示「升级完整版 / 双人不可用」引导。 */
export function showCoupleReportUpgradeNotice(
  suiteSlug: string | null | undefined,
  suiteTier?: SuiteTier | null,
): boolean {
  return resolveSuiteTier(suiteSlug, suiteTier) === "lite";
}

export function coupleReportUnavailableCopy(productId: CoupleProductId): string {
  if (productId === "mate") {
    return "MATE 双人婚恋适配需双方均使用完整版测评。快速版无法合测生成双人报告，请升级完整版后再邀请 TA。";
  }
  return "ROS 快速版仅提供单边关系画像，不支持合测生成双人报告。升级完整版后可邀请 TA，解锁感知差与碰撞分析。";
}

/** 双人报告不可用时的升级卖点（结果页 / 邀请页复用） */
export function coupleReportUpgradeBullets(productId: CoupleProductId): UpgradeBullet[] {
  const full = tierMeta(productId, "full");
  const lite = tierMeta(productId, "lite");
  const accuracy = `快速版 ${lite.questions} 题约 70% 精度 → 完整版 ${full.questions} 题约 95%`;

  if (productId === "mate") {
    return [
      { title: "双人婚恋适配", detail: "完整版作答 + 13 道补充题后，可邀请 TA 解锁 P1–P6 对比与红娘建议。" },
      { title: "四象限坐标更稳", detail: "80 题覆盖吸引力、现实支撑与风险净值，减少「牌面模糊」。" },
      { title: "精度升级", detail: accuracy },
    ];
  }
  return [
    { title: "双人合测报告", detail: "邀请 TA 免费作答，解锁感知差、依恋碰撞与共同行动建议。" },
    { title: "五层关系处方", detail: "62 题深挖冲突模式、修复节奏与 9 阶段定位。" },
    { title: "精度升级", detail: accuracy },
  ];
}

export function liteResultUpgradeTeaser(productId: CoupleProductId): string {
  const full = tierMeta(productId, "full");
  return `完整版 ${full.questions} 题可将结果精度从约 70% 提升至约 95%。`;
}

export function isLiteCoupleBlockedMessage(message: string): boolean {
  return /快速版|完整版测评|LITE_COUPLE|403/.test(message);
}

export function assertPartnerCodeNotLite(suiteTier: SuiteTier | undefined): void {
  if (suiteTier === "lite") {
    throw new Error(LITE_COUPLE_BLOCKED_MESSAGE);
  }
}

export function coupleReportUpgradeRoute(productId: CoupleProductId) {
  if (productId === "ros") {
    return { to: "/ros/start" as const, search: { tier: "full" as const } };
  }
  return { to: "/tests/mate" as const, search: { tier: "full" as const } };
}

export function coupleReportAccessRoute(productId: CoupleProductId) {
  const entry = coupleReportUpgradeRoute(productId);
  return {
    to: "/access" as const,
    search: {
      product: productId,
      tier: "full" as const,
      redirect: entry.to,
    },
  };
}

/** @deprecated Lite tier 不再展示双人相关提示；保留供 ROS 旧调用方兼容。 */
export function tierSelectCoupleHint(_productId: CoupleProductId, tier: "lite" | "full"): string | null {
  return null;
}
