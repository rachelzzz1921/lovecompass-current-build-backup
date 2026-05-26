/**
 * Typed wrapper for browser session keys used in product entry / run flows.
 * Raw access:* writes still go through accessGate for lite/full pairing.
 */

import {
  clearProductUnlock,
  getPartnerRelationCode,
  getRedemptionEventId,
  hasProductAccess,
  hasRedeemableSuiteAccess,
  markProductAccess,
} from "@/lib/accessGate";
import {
  getStoredGender,
  productFlowSpec,
  resolveSuiteSlugForTier,
  setStoredGender,
  type ProductId,
  type SuiteGender,
  type SuiteTier,
} from "@/lib/productRegistry";

export const SESSION_KEYS = {
  partnerCode: "ros:partnerCode",
  tier: (productId: ProductId) => `${productId}:tier` as const,
  suite: (productId: ProductId) => `suite:${productId}` as const,
} as const;

export type ProductSessionSnapshot = {
  productId: ProductId;
  tier: SuiteTier;
  gender: SuiteGender | null;
  suiteSlug: string | null;
  partnerCode: string | null;
  hasRunnableAccess: boolean;
};

export function readTier(productId: ProductId): SuiteTier {
  if (typeof window === "undefined") return "full";
  const raw = sessionStorage.getItem(SESSION_KEYS.tier(productId));
  return raw === "lite" ? "lite" : "full";
}

export function writeTier(productId: ProductId, tier: SuiteTier) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEYS.tier(productId), tier);
}

export function readSuiteSlug(productId: ProductId): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEYS.suite(productId));
}

export function writeSuiteSlug(productId: ProductId, suiteSlug: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEYS.suite(productId), suiteSlug);
}

export function persistGenderAndSuite(productId: ProductId, gender: SuiteGender, tier?: SuiteTier) {
  const resolvedTier = tier ?? readTier(productId);
  setStoredGender(productId, gender);
  writeTier(productId, resolvedTier);
  writeSuiteSlug(productId, resolveSuiteSlugForTier(productId, gender, resolvedTier));
}

export function completeRedemptionSession(input: {
  productId: ProductId;
  verifiedSuiteSlug: string;
  tier: SuiteTier;
  redemptionEventId: string;
}) {
  markProductAccess(input.productId, input.verifiedSuiteSlug, input.redemptionEventId);
  writeTier(input.productId, input.tier);
  writeSuiteSlug(input.productId, input.verifiedSuiteSlug);
}

export function clearUnlock(productId: ProductId) {
  clearProductUnlock(productId);
}

export function readSession(productId: ProductId, suiteSlug: string): ProductSessionSnapshot {
  const gender = getStoredGender(productId);
  const tier = readTier(productId);
  return {
    productId,
    tier,
    gender,
    suiteSlug: readSuiteSlug(productId) ?? suiteSlug,
    partnerCode: getPartnerRelationCode(),
    hasRunnableAccess: hasRedeemableSuiteAccess(productId, suiteSlug),
  };
}

export function redemptionEventFor(productId: ProductId, suiteSlug: string): string | null {
  return getRedemptionEventId(productId, suiteSlug);
}

export function hasSlugAccess(productId: ProductId, suiteSlug: string): boolean {
  return hasProductAccess(productId, suiteSlug);
}

export function genderRequired(productId: ProductId): boolean {
  return productFlowSpec(productId).pickGenderOnAccess;
}
