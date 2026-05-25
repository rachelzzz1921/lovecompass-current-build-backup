import { hasProductAccess } from "@/lib/accessGate";
import type { Product } from "@/data/products";
import {
  getProductMeta,
  isLiteTierFree,
  orderedProductIds,
  productFlowSpec,
} from "@/lib/productRegistry";
import type { ProductId, SuiteTier } from "@/lib/suiteTier";

export function productEntryPath(id: ProductId): string {
  return productFlowSpec(id).entryPath;
}

export function productStartLink(id: ProductId): { to: string; search?: { product: ProductId } } {
  if (isLiteTierFree(id, "lite") || hasProductAccess(id)) {
    return { to: productEntryPath(id) };
  }
  return { to: "/access", search: { product: id } };
}

export function productStartLabel(
  id: ProductId,
  statusOrTier: Product["status"] | SuiteTier = "lite",
): string {
  if (statusOrTier === "coming-soon") return "即将开放";
  if (statusOrTier === "lite" || statusOrTier === "full") {
    if (isLiteTierFree(id, statusOrTier)) return "免费开始";
    if (hasProductAccess(id)) return "开始测试";
    return "兑换码解锁";
  }
  const meta = getProductMeta(id);
  if (meta.status === "free") return "免费开始";
  if (hasProductAccess(id)) return "开始测试";
  return "兑换码解锁";
}

export function productNeedsUnlock(id: ProductId, tier: SuiteTier = "lite"): boolean {
  if (isLiteTierFree(id, tier)) return false;
  return !hasProductAccess(id);
}

/** 画像路径推荐顺序（SELF → ROS → MATE） */
export const PORTRAIT_SUITE_ORDER = orderedProductIds();
