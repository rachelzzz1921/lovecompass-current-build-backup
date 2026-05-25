/** Whether the user has verified a redemption code for this product / suite in this browser session. */
export function hasProductAccess(productId: string, suiteSlug?: string): boolean {
  if (typeof window === "undefined") return false;
  if (suiteSlug?.includes("self") && suiteSlug.includes("_lite")) return true;
  if (sessionStorage.getItem(`access:${productId}`) === "1") return true;
  if (suiteSlug && sessionStorage.getItem(`access:${suiteSlug}`) === "1") return true;
  return false;
}

const PRODUCT_SLUGS: Record<string, string[]> = {
  self: ["s01_self_female", "s01_self_male", "s01_self_female_lite", "s01_self_male_lite"],
  ros: ["s02_ros_female", "s02_ros_male", "s02_ros_female_lite", "s02_ros_male_lite"],
  mate: ["s03_mate_female", "s03_mate_male", "s03_mate_female_lite", "s03_mate_male_lite"],
};

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
  sessionStorage.setItem(`access:${productId}`, "1");
  sessionStorage.setItem(`access:${suiteSlug}`, "1");
  sessionStorage.setItem(`suite:${productId}`, suiteSlug);
  if (redemptionEventId) {
    sessionStorage.setItem(`redemption:${suiteSlug}`, redemptionEventId);
    sessionStorage.setItem(`redemption:${productId}`, redemptionEventId);
  }
}

const PARTNER_CODE_KEY = "ros:partnerCode";

export function markPartnerMateAccess(partnerCode: string, suiteSlug: string) {
  sessionStorage.setItem(`access:mate`, "1");
  sessionStorage.setItem(`access:${suiteSlug}`, "1");
  sessionStorage.setItem(`suite:mate`, suiteSlug);
  sessionStorage.setItem(PARTNER_CODE_KEY, partnerCode.trim().toUpperCase());
}

/** @deprecated use markPartnerRosAccess / markPartnerMateAccess */
export function markPartnerRosAccess(partnerCode: string, suiteSlug: string) {
  sessionStorage.setItem(`access:ros`, "1");
  sessionStorage.setItem(`access:${suiteSlug}`, "1");
  sessionStorage.setItem(`suite:ros`, suiteSlug);
  sessionStorage.setItem(PARTNER_CODE_KEY, partnerCode.trim().toUpperCase());
}

export function getPartnerRelationCode(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PARTNER_CODE_KEY);
}

export function clearPartnerRelationCode() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PARTNER_CODE_KEY);
}
