import type { ProductSet, SubmitAttemptResponse } from "@/lib/resultRoutes";

export type PendingAttemptContext = {
  promise: Promise<SubmitAttemptResponse>;
  productSet: ProductSet;
  suiteSlug?: string | null;
  routeId?: string | null;
  /** Partner (ROS/MATE couple) submit — navigate to couple result after analyzing. */
  partnerRelationCode?: string | null;
};

const SUBMIT_STASH_KEY = "analyzing:submitResult";
const SUBMIT_CTX_KEY = "analyzing:submitCtx";

let pending: PendingAttemptContext | null = null;

/** Register in-flight submit; analyzing page consumes it once. */
export function beginPendingAttemptSubmit(ctx: PendingAttemptContext): void {
  pending = ctx;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SUBMIT_STASH_KEY);
    window.sessionStorage.setItem(
      SUBMIT_CTX_KEY,
      JSON.stringify({
        productSet: ctx.productSet,
        suiteSlug: ctx.suiteSlug ?? null,
        routeId: ctx.routeId ?? null,
        partnerRelationCode: ctx.partnerRelationCode ?? null,
      }),
    );
  }
  void ctx.promise.then((res) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SUBMIT_STASH_KEY, JSON.stringify(res));
  });
}

/** Peek in-flight submit (do not clear — Strict Mode may mount twice). */
export function peekPendingAttemptSubmit(): PendingAttemptContext | null {
  return pending;
}

export function peekStashedSubmitContext(): Pick<
  PendingAttemptContext,
  "productSet" | "partnerRelationCode" | "suiteSlug" | "routeId"
> | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SUBMIT_CTX_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Pick<
      PendingAttemptContext,
      "productSet" | "partnerRelationCode" | "suiteSlug" | "routeId"
    >;
  } catch {
    return null;
  }
}

export function clearPendingAttemptSubmit(): void {
  pending = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SUBMIT_CTX_KEY);
  }
}

export function hasPendingAttemptSubmit(): boolean {
  return pending !== null;
}

/** Recover submit result after refresh (pending promise is lost). */
export function takeStashedSubmitResult(): SubmitAttemptResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SUBMIT_STASH_KEY);
  window.sessionStorage.removeItem(SUBMIT_STASH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SubmitAttemptResponse;
  } catch {
    return null;
  }
}

export function clearStashedSubmitResult(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SUBMIT_STASH_KEY);
}
