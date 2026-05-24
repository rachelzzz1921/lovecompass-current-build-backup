import type { ProductSet, SubmitAttemptResponse } from "@/lib/resultRoutes";

export type PendingAttemptContext = {
  promise: Promise<SubmitAttemptResponse>;
  productSet: ProductSet;
};

const SUBMIT_STASH_KEY = "analyzing:submitResult";

let pending: PendingAttemptContext | null = null;
let handlerAttached = false;

/** Register in-flight submit; analyzing page consumes it once. */
export function beginPendingAttemptSubmit(ctx: PendingAttemptContext): void {
  pending = ctx;
  handlerAttached = false;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(SUBMIT_STASH_KEY);
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

export function clearPendingAttemptSubmit(): void {
  pending = null;
  handlerAttached = false;
}

export function markPendingHandlerAttached(): boolean {
  if (handlerAttached) return false;
  handlerAttached = true;
  return true;
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
