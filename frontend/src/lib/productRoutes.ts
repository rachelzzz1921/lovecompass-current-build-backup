import { hasProductAccess, hasRedeemableSuiteAccess } from "@/lib/accessGate";
import type { Product } from "@/data/products";
import {
  getProductMeta,
  orderedProductIds,
  productFlowSpec,
} from "@/lib/productRegistry";
import type { ProductId, SuiteTier } from "@/lib/suiteTier";
import {
  hasRunnableProductAccess,
  productNeedsUnlock as engineProductNeedsUnlock,
  productStartLabelFor,
  resolveProductStartLink,
} from "@/lib/productFlow";

export function productEntryPath(id: ProductId): string {
  return productFlowSpec(id).entryPath;
}

export type ProductStartLink =
  | { to: "/tests/$id"; params: { id: ProductId } }
  | { to: "/access"; search: { product: ProductId; redirect?: string; tier?: SuiteTier } }
  | { to: "/ros/start" };

export function productStartLink(id: ProductId): ProductStartLink {
  const route = resolveProductStartLink(id);
  if (route.to === "/access") {
    return { to: "/access", search: route.search };
  }
  if (route.to === "/ros/start") {
    return { to: "/ros/start" };
  }
  return { to: "/tests/$id", params: { id } };
}

export function productStartLabel(
  id: ProductId,
  statusOrTier: Product["status"] | SuiteTier = "lite",
): string {
  if (statusOrTier === "coming-soon") return "即将开放";
  if (statusOrTier === "lite" || statusOrTier === "full") {
    return productStartLabelFor(id, statusOrTier);
  }
  const meta = getProductMeta(id);
  if (meta.status === "free") return "免费开始";
  return productStartLabelFor(id, "lite");
}

export function productNeedsUnlock(id: ProductId, tier: SuiteTier = "lite"): boolean {
  return engineProductNeedsUnlock(id, tier);
}

export { hasRunnableProductAccess, hasRedeemableSuiteAccess, hasProductAccess };

/** 画像路径推荐顺序（SELF → ROS → MATE） */
export const PORTRAIT_SUITE_ORDER = orderedProductIds();
