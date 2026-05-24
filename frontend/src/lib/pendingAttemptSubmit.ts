import type { ProductSet, SubmitAttemptResponse } from "@/lib/resultRoutes";

export type PendingAttemptContext = {
  promise: Promise<SubmitAttemptResponse>;
  productSet: ProductSet;
};

let pending: PendingAttemptContext | null = null;

/** Register in-flight submit; analyzing page consumes it once. */
export function beginPendingAttemptSubmit(ctx: PendingAttemptContext): void {
  pending = ctx;
}

export function takePendingAttemptSubmit(): PendingAttemptContext | null {
  const ctx = pending;
  pending = null;
  return ctx;
}

export function hasPendingAttemptSubmit(): boolean {
  return pending !== null;
}
