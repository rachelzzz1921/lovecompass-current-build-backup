/** Prefetch result API payloads during /analyzing so result routes render instantly. */

const PREFIX = "result:prefetch:";

export type MateSinglePrefetch = {
  kind: "mate-single";
  attemptId: string;
  data: {
    single: Record<string, unknown>;
    relationCode?: string;
    coupleUnlocked?: boolean;
    suiteSlug?: string;
  };
};

export type RosSinglePrefetch = {
  kind: "ros-single";
  attemptId: string;
  data: {
    single: Record<string, unknown>;
    relationCode?: string;
    coupleUnlocked?: boolean;
    suiteSlug?: string;
    suiteTier?: "lite" | "full";
  };
};

export type SelfAttemptPrefetch = {
  kind: "self-attempt";
  attemptId: string;
  data: Record<string, unknown>;
};

export type MateCouplePrefetch = {
  kind: "mate-couple";
  code: string;
  data: Record<string, unknown>;
};

export type RosCouplePrefetch = {
  kind: "ros-couple";
  code: string;
  data: Record<string, unknown>;
};

export type ResultPrefetchEntry =
  | MateSinglePrefetch
  | RosSinglePrefetch
  | SelfAttemptPrefetch
  | MateCouplePrefetch
  | RosCouplePrefetch;

function storageKey(key: string): string {
  return `${PREFIX}${key}`;
}

export function stashResultPrefetch(key: string, entry: ResultPrefetchEntry): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(storageKey(key), JSON.stringify(entry));
}

export function peekResultPrefetch(key: string): ResultPrefetchEntry | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(storageKey(key));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ResultPrefetchEntry;
  } catch {
    return null;
  }
}

/** Read once — result page consumes prefetch after analyzing handoff. */
export function takeResultPrefetch(key: string): ResultPrefetchEntry | null {
  const entry = peekResultPrefetch(key);
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(storageKey(key));
  }
  return entry;
}

export function clearResultPrefetch(key: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey(key));
}
