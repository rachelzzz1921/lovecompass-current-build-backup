import { peekAiEnhancementEnabled } from "@/lib/aiCapabilities";

export type AiContentUx = {
  mode?: string;
  status?: string;
} | null | undefined;

/** Show a subtle "AI upgrading" pulse only when backend can actually enhance insights. */
export function showAiEnhancementPending(
  ai: AiContentUx,
  insightCount = 0,
  aiEnhancementEnabled = peekAiEnhancementEnabled(),
): boolean {
  if (!aiEnhancementEnabled) return false;
  if (!ai || ai.mode === "ai" || ai.mode === "cached") return false;
  if (insightCount <= 0) return false;
  return ai.mode === "deterministic";
}

export function aiEnhancementPendingLabel(): string {
  return "AI 增强版生成中…";
}
