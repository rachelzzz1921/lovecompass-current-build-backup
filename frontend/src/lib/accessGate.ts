/** Whether the user has verified a redemption code for this product / suite in this browser session. */

const PRODUCT_SLUGS: Record<string, string[]> = {
  self: ["s01_self_female", "s01_self_male", "s01_self_female_lite", "s01_self_male_lite"],
  ros: ["s02_ros_female", "s02_ros_male", "s02_ros_female_lite", "s02_ros_male_lite"],
  mate: ["s03_mate_female", "s03_mate_male", "s03_mate_female_lite", "s03_mate_male_lite"],
};

/** Lite ↔ full slug pair for the same product + gender. */
export function compatibleSuiteSlugs(suiteSlug: string): string[] {
  if (suiteSlug.includes("_lite")) {
    return [suiteSlug, suiteSlug.replace("_lite", "")];
  }
  return [suiteSlug, `${suiteSlug}_lite`];
}

export function hasProductAccess(productId: string, suiteSlug?: string): boolean {
  if (typeof window === "undefined") return false;
  if (suiteSlug?.includes("self") && suiteSlug.includes("_lite")) return true;
  if (suiteSlug) {
    for (const slug of compatibleSuiteSlugs(suiteSlug)) {
      if (sessionStorage.getItem(`access:${slug}`) === "1") return true;
    }
    return false;
  }
  for (const slug of PRODUCT_SLUGS[productId] ?? []) {
    if (sessionStorage.getItem(`access:${slug}`) === "1") return true;
  }
  return sessionStorage.getItem(`access:${productId}`) === "1";
}

/** Clear unlock state when switching gender or re-verifying a different suite. */
export function clearProductUnlock(productId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(`access:${productId}`);
  sessionStorage.removeItem(`redemption:${productId}`);
  sessionStorage.removeItem(`suite:${productId}`);
  for (const slug of PRODUCT_SLUGS[productId] ?? []) {
    sessionStorage.removeItem(`access:${slug}`);
    sessionStorage.removeItem(`redemption:${slug}`);
  }
}

export function markProductAccess(productId: string, suiteSlug: string, redemptionEventId?: string) {
  sessionStorage.setItem(`suite:${productId}`, suiteSlug);
  for (const slug of compatibleSuiteSlugs(suiteSlug)) {
    sessionStorage.setItem(`access:${slug}`, "1");
    if (redemptionEventId) {
      sessionStorage.setItem(`redemption:${slug}`, redemptionEventId);
    }
  }
  if (redemptionEventId) {
    sessionStorage.setItem(`redemption:${productId}`, redemptionEventId);
  }
  sessionStorage.setItem(`access:${productId}`, "1");
}

const PARTNER_CODE_KEY = "ros:partnerCode";

export function markPartnerMateAccess(partnerCode: string, suiteSlug: string) {
  sessionStorage.setItem(`suite:mate`, suiteSlug);
  sessionStorage.setItem(PARTNER_CODE_KEY, partnerCode.trim().toUpperCase());
  for (const slug of compatibleSuiteSlugs(suiteSlug)) {
    sessionStorage.setItem(`access:${slug}`, "1");
  }
  sessionStorage.setItem(`access:mate`, "1");
}

/** @deprecated use markPartnerRosAccess / markPartnerMateAccess */
export function markPartnerRosAccess(partnerCode: string, suiteSlug: string) {
  sessionStorage.setItem(`suite:ros`, suiteSlug);
  sessionStorage.setItem(PARTNER_CODE_KEY, partnerCode.trim().toUpperCase());
  for (const slug of compatibleSuiteSlugs(suiteSlug)) {
    sessionStorage.setItem(`access:${slug}`, "1");
  }
  sessionStorage.setItem(`access:ros`, "1");
}

export function getPartnerRelationCode(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PARTNER_CODE_KEY);
}

export function clearPartnerRelationCode() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PARTNER_CODE_KEY);
}

export function getRedemptionEventId(productId: string, suiteSlug?: string): string | null {
  if (typeof window === "undefined") return null;
  if (suiteSlug) {
    for (const slug of compatibleSuiteSlugs(suiteSlug)) {
      const perSuite = sessionStorage.getItem(`redemption:${slug}`);
      if (perSuite) return perSuite;
    }
  }
  return sessionStorage.getItem(`redemption:${productId}`);
}

/** 付费套题答题：须同时有 slug 解锁与兑换事件（套一 lite 免费；伴侣关系码免兑换）。 */
export function hasRedeemableSuiteAccess(productId: string, suiteSlug: string): boolean {
  if (typeof window === "undefined") return false;
  if (productId === "self" && suiteSlug.includes("_lite")) return true;
  if ((productId === "ros" || productId === "mate") && getPartnerRelationCode()) return true;
  return hasProductAccess(productId, suiteSlug) && Boolean(getRedemptionEventId(productId, suiteSlug));
}

/** @deprecated use hasRedeemableSuiteAccess */
export function hasRosRunAccess(suiteSlug: string): boolean {
  return hasRedeemableSuiteAccess("ros", suiteSlug);
}
