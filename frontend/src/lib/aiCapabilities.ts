import { fetchWithMirrorFallback } from "@/lib/mirrorEndpoints";

type HealthConfig = {
  ok?: boolean;
  config?: {
    aiProvider?: string;
    aiEnhancementEnabled?: boolean;
  };
};

let cached: boolean | null = null;
let inflight: Promise<boolean> | null = null;

/** Whether backend may upgrade deterministic insights to Zhipu AI (from /health?config=1). */
export async function fetchAiEnhancementEnabled(): Promise<boolean> {
  if (cached !== null) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetchWithMirrorFallback("/health?config=1", { method: "GET" });
      if (!res.ok) {
        cached = false;
        return false;
      }
      const body = (await res.json()) as HealthConfig;
      cached = Boolean(body.config?.aiEnhancementEnabled);
      return cached;
    } catch {
      cached = false;
      return false;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Sync read after first fetch; defaults false until loaded. */
export function peekAiEnhancementEnabled(): boolean {
  return cached ?? false;
}

export function primeAiEnhancementEnabled(enabled: boolean): void {
  cached = enabled;
}
