/** Whether the user has verified a redemption code for this product / suite in this browser session. */
export function hasProductAccess(productId: string, suiteSlug?: string): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(`access:${productId}`) === "1") return true;
  if (suiteSlug && sessionStorage.getItem(`access:${suiteSlug}`) === "1") return true;
  return false;
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
