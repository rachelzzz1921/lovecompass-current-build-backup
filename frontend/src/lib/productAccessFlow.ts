import { markPartnerMateAccess, markPartnerRosAccess, markProductAccess, hasProductAccess } from "@/lib/accessGate";
import { lovecompassApi } from "@/lib/lovecompassApi";
import {
  getStoredGender,
  inferProductId,
  productFlowSpec,
  resolveSuiteSlugForTier,
  setStoredGender,
  type ProductId,
  type SuiteGender,
  type SuiteTier,
} from "@/lib/productRegistry";

const CODE_MAX = 32;

export function normalizeRedemptionCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "").slice(0, CODE_MAX);
}

/** 兑换页当前应使用的性别（按 registry 配置，而非页面内 if/else） */
export function genderForAccess(productId: ProductId, picked: SuiteGender | null): SuiteGender | null {
  const spec = productFlowSpec(productId);
  if (spec.pickGenderOnAccess) return picked;
  return getStoredGender(productId);
}

export function persistAccessGender(productId: ProductId, gender: SuiteGender | null) {
  if (!gender || !productFlowSpec(productId).pickGenderOnAccess) return;
  setStoredGender(productId, gender);
}

export function suiteSlugForRedemption(
  productId: ProductId,
  gender: SuiteGender | null,
  tier: SuiteTier,
): string {
  if (gender) return resolveSuiteSlugForTier(productId, gender, tier);
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(`suite:${productId}`) ?? "";
}

export type RedeemNavigateTarget =
  | { kind: "run"; suiteSlug: string }
  | { kind: "ros-start" }
  | { kind: "tests-entry"; productId: ProductId; tier: SuiteTier; gender?: SuiteGender };

export function resolvePostRedeemTarget(input: {
  verifiedSuiteSlug: string;
  suiteTier: SuiteTier;
  pickedGender: SuiteGender | null;
  redirect?: string;
  backendRedirect?: string;
}): RedeemNavigateTarget {
  const productId = inferProductId(input.verifiedSuiteSlug);
  const redirectPath = (input.backendRedirect ?? "").replace(/^https?:\/\/[^/]+/, "");
  const runMatch = redirectPath.match(/^\/tests\/([^/]+)\/run\/?$/);
  if (runMatch) {
    return { kind: "run", suiteSlug: runMatch[1] };
  }

  const spec = productFlowSpec(productId);
  if (spec.redeemLanding === "ros-start") {
    return { kind: "ros-start" };
  }

  if (input.redirect?.includes("/run") && input.pickedGender) {
    return {
      kind: "run",
      suiteSlug: resolveSuiteSlugForTier(productId, input.pickedGender, input.suiteTier),
    };
  }

  return {
    kind: "tests-entry",
    productId,
    tier: input.suiteTier,
    gender: input.pickedGender ?? undefined,
  };
}

/** 从测试入口页跳转到 /access 时携带的 redirect */
export function accessRedirectFromTestEntry(productId: ProductId, runSuiteSlug: string): string {
  const spec = productFlowSpec(productId);
  if (spec.redeemLanding === "ros-start") return spec.entryPath;
  if (runSuiteSlug.includes("_")) return `/tests/${runSuiteSlug}/run`;
  return `/tests/${productId}`;
}

export type RunUnlockMode =
  | { kind: "partner-code"; code: string }
  | { kind: "cached-access" }
  | { kind: "redeem-code"; code: string };

/** 从关系码预览解析发起人 tier（伴侣侧须对齐） */
export async function resolveRelationCodeTier(code: string, productId: ProductId = "ros"): Promise<SuiteTier> {
  const preview =
    productId === "mate"
      ? await lovecompassApi.previewMateRelationCode(normalizeRedemptionCode(code))
      : await lovecompassApi.previewRelationCode(normalizeRedemptionCode(code));
  if (preview.suiteTier === "lite" || preview.suiteTier === "full") return preview.suiteTier;
  if (preview.suiteSlug?.includes("_lite")) return "lite";
  return "full";
}

/** 解锁并返回 run 页用的 suiteSlug（ROS 入口 / access 共用） */
export async function unlockProductForRun(input: {
  productId: ProductId;
  gender: SuiteGender;
  suiteTier: SuiteTier;
  unlock: RunUnlockMode;
}): Promise<string> {
  const { productId, gender, unlock } = input;
  setStoredGender(productId, gender);

  if (unlock.kind === "partner-code") {
    const normalized = normalizeRedemptionCode(unlock.code);
    const preview =
      productId === "mate"
        ? await lovecompassApi.previewMateRelationCode(normalized)
        : await lovecompassApi.previewRelationCode(normalized);
    const matchedTier: SuiteTier =
      preview.suiteTier === "lite" || preview.suiteTier === "full"
        ? preview.suiteTier
        : preview.suiteSlug?.includes("_lite")
          ? "lite"
          : "full";
    const suiteSlug = resolveSuiteSlugForTier(productId, gender, matchedTier);
    if (productId === "mate") markPartnerMateAccess(normalized, suiteSlug);
    else markPartnerRosAccess(normalized, suiteSlug);
    return suiteSlug;
  }

  const { suiteTier } = input;
  const suiteSlug = resolveSuiteSlugForTier(productId, gender, suiteTier);

  if (unlock.kind === "cached-access") {
    if (!hasProductAccess(productId, suiteSlug)) {
      throw new Error("请先完成兑换码验证");
    }
    const redemptionEventId =
      sessionStorage.getItem(`redemption:${productId}`) ||
      sessionStorage.getItem(`redemption:${suiteSlug}`);
    markProductAccess(productId, suiteSlug, redemptionEventId ?? undefined);
    return suiteSlug;
  }

  const res = await lovecompassApi.verifyRedemption({
    code: unlock.code.trim(),
    product: productId,
    suiteSlug,
    gender,
  });
  markProductAccess(productId, res.suiteSlug || suiteSlug, res.redemptionEventId);
  return res.suiteSlug || suiteSlug;
}

export function persistRunSessionKeys(
  keys: { stage: string; tier: string },
  values: { stage: string; tier: SuiteTier },
) {
  sessionStorage.setItem(keys.stage, values.stage);
  sessionStorage.setItem(keys.tier, values.tier);
}
