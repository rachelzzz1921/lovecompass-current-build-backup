import type { ProductSet } from "@/lib/resultRoutes";

const SESSION_KEY = "analyzing:session";

export type AnalyzingSessionState = {
  attemptId: string;
  productSet: ProductSet;
  submitNext?: string | null;
  partnerRelationCode?: string | null;
  ready: boolean;
};

export function stashAnalyzingSession(state: AnalyzingSessionState): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export function peekAnalyzingSession(): AnalyzingSessionState | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnalyzingSessionState;
  } catch {
    return null;
  }
}

export function clearAnalyzingSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}
