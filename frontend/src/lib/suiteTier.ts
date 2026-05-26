/**
 * 套题 tier / slug 工具 —— 元数据见 `productRegistry`。
 */
export type { ProductId, SuiteTier, UpgradeStep } from "@/lib/productRegistry";
export {
  MATE_LITE_SLUGS,
  MATE_SUITE_SLUGS,
  ROS_LITE_SLUGS,
  ROS_SUITE_SLUGS,
  SELF_LITE_SLUGS,
  SELF_SUITE_SLUGS,
  UPGRADE_STEPS,
  inferProductId,
  isLiteTierFree,
  liteAnswersStorageKey,
  resolveSuiteSlugForTier,
  tierMeta,
  upgradeStepsFor,
} from "@/lib/productRegistry";

import { inferProductId, isLiteTierFree, liteAnswersStorageKey, resolveSuiteSlugForTier } from "@/lib/productRegistry";
import type { MateGender, RosGender, SelfGender } from "@/lib/suiteSlugs";

export function inferSuiteTier(slug: string | null | undefined): "lite" | "full" {
  return slug?.includes("_lite") ? "lite" : "full";
}

export function fullSuiteSlugFrom(slug: string): string {
  return slug.replace("_lite", "");
}

export function liteSuiteSlugFrom(slug: string): string {
  if (slug.includes("_lite")) return slug;
  return `${slug}_lite`;
}

export function isSelfLiteSuite(slug: string | null | undefined): boolean {
  return Boolean(slug?.includes("self") && slug.includes("_lite"));
}

export function isLiteSuite(slug: string | null | undefined): boolean {
  return Boolean(slug?.includes("_lite"));
}

export function resolveSuiteSlugByTier(
  productId: "self" | "ros" | "mate",
  gender: SelfGender | RosGender | MateGender,
  tier: "lite" | "full",
): string {
  return resolveSuiteSlugForTier(productId, gender, tier);
}

export function stashLiteAnswers(suiteSlug: string, answers: Record<string, unknown>) {
  if (typeof window === "undefined" || !isLiteSuite(suiteSlug)) return;
  const productId = inferProductId(suiteSlug);
  sessionStorage.setItem(
    liteAnswersStorageKey(productId, suiteSlug),
    JSON.stringify({ savedAt: Date.now(), answers }),
  );
}

export function readStashedLiteAnswers(suiteSlug: string): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const productId = inferProductId(suiteSlug);
  const raw = sessionStorage.getItem(liteAnswersStorageKey(productId, suiteSlug));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { answers?: Record<string, unknown> };
    return parsed.answers ?? null;
  } catch {
    return null;
  }
}

/** 完整版开跑时，按 externalId 匹配快速版已答题目 */
export function mergeLiteAnswersForFullSuite<
  TQuestion extends { id: string; externalId: string },
  TPayload,
>(
  questions: TQuestion[],
  fullSuiteSlug: string,
  isAnswered: (question: TQuestion, payload: TPayload | undefined) => boolean,
): { answers: Record<string, TPayload>; count: number } {
  if (isLiteSuite(fullSuiteSlug)) return { answers: {}, count: 0 };
  const stashed = readStashedLiteAnswers(liteSuiteSlugFrom(fullSuiteSlug));
  if (!stashed) return { answers: {}, count: 0 };

  const answers: Record<string, TPayload> = {};
  let count = 0;
  for (const question of questions) {
    const raw = stashed[question.externalId];
    if (!raw || typeof raw !== "object") continue;
    const payload = raw as TPayload;
    if (!isAnswered(question, payload)) continue;
    answers[question.id] = payload;
    count += 1;
  }
  return { answers, count };
}
