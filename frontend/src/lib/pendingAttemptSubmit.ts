import type { ProductSet, SubmitAttemptResponse } from "@/lib/resultRoutes";

export type PendingAttemptContext = {
  promise: Promise<SubmitAttemptResponse>;
  productSet: ProductSet;
};

const SUBMIT_STASH_KEY = "analyzing:submitResult";

let pending: PendingAttemptContext | null = null;

/** Register in-flight submit; analyzing page consumes it once. */
export function beginPendingAttemptSubmit(ctx: PendingAttemptContext): void {
  pending = ctx;
  void ctx.promise.then((res) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(SUBMIT_STASH_KEY, JSON.stringify(res));
  });
}

export function takePendingAttemptSubmit(): PendingAttemptContext | null {
  const ctx = pending;
  pending = null;
  return ctx;
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
