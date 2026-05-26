/**
 * Central navigation / guard decisions for SELF · ROS · MATE flows.
 * Route components must call these helpers instead of hand-rolling redirects.
 */

import { getPartnerRelationCode, hasRedeemableSuiteAccess } from "@/lib/accessGate";
import {
  accessRedirectFromTestEntry,
  resolvePostRedeemTarget,
  type RedeemNavigateTarget,
} from "@/lib/productAccessFlow";
import {
  inferProductId,
  isLiteTierFree,
  productFlowSpec,
  resolveActiveSuiteSlug,
  type ProductId,
  type SuiteGender,
  type SuiteTier,
} from "@/lib/productRegistry";
import { isLiteSuite, isSelfLiteSuite, resolveSuiteSlugByTier } from "@/lib/suiteTier";
import { testEntryRouteId } from "@/lib/resultRoutes";
import { flowGraphFor } from "./flowGraph";
import {
  completeRedemptionSession,
  genderRequired,
  persistGenderAndSuite,
  redemptionEventFor,
  writeTier,
} from "./productSessionStore";

export type ProductFlowRoute =
  | { to: "/auth"; search: { redirect: string } }
  | {
      to: "/access";
      search: { product: ProductId; redirect?: string; tier?: SuiteTier };
    }
  | { to: "/ros/start" }
  | {
      to: "/tests/$id";
      params: { id: string };
      search?: { tier?: SuiteTier; gender?: SuiteGender };
    }
  | { to: "/tests/$id/run"; params: { id: string } };

export type FlowGuardResult =
  | { ok: true }
  | { ok: false; route: ProductFlowRoute; toast?: string };

export type TestEntryStartContext = {
  productId: ProductId;
  routeSuiteSlug: string;
  user: unknown | null;
  authLoading: boolean;
  gender: SuiteGender | null;
  suiteTier: SuiteTier;
};

export type RunPageGuardContext = {
  routeSuiteSlug: string;
  authPending: boolean;
};

export type SubmitAccessContext = {
  productId: ProductId;
  suiteSlug: string;
  routeSuiteSlug: string;
};

/** Resolve suite slug for entry / run from route + session. */
export function resolveFlowSuiteSlug(input: {
  productId: ProductId;
  routeId: string;
  gender: SuiteGender | null;
  suiteTier: SuiteTier;
}): string {
  const spec = productFlowSpec(input.productId);
  const pickedGender = spec.pickGenderOnAccess ? input.gender : null;
  if (pickedGender) {
    return resolveSuiteSlugByTier(input.productId, pickedGender, input.suiteTier);
  }
  return resolveActiveSuiteSlug({
    productId: input.productId,
    routeId: input.routeId,
    sessionSuiteSlug: typeof window !== "undefined" ? sessionStorage.getItem(`suite:${input.productId}`) : null,
  });
}

export function liteFreeForTier(productId: ProductId, tier: SuiteTier): boolean {
  return isLiteTierFree(productId, tier);
}

export function hasRunAccess(productId: ProductId, suiteSlug: string): boolean {
  return hasRedeemableSuiteAccess(productId, suiteSlug);
}

/** Homepage / product card: any gender × tier runnable? */
export function hasRunnableProductAccess(productId: ProductId): boolean {
  if (isLiteTierFree(productId, "lite")) return true;
  const genders: SuiteGender[] = ["female", "male"];
  const tiers: SuiteTier[] = ["lite", "full"];
  for (const gender of genders) {
    for (const tier of tiers) {
      const slug = resolveSuiteSlugByTier(productId, gender, tier);
      if (hasRedeemableSuiteAccess(productId, slug)) return true;
    }
  }
  return Boolean(getPartnerRelationCode() && (productId === "ros" || productId === "mate"));
}

export function productEntryPath(productId: ProductId): string {
  return flowGraphFor(productId).entryPath;
}

export function accessSearchForRun(input: {
  productId: ProductId;
  suiteSlug: string;
  redirectPath?: string;
}): ProductFlowRoute {
  const tier = isLiteSuite(input.suiteSlug) ? ("lite" as const) : ("full" as const);
  return {
    to: "/access",
    search: {
      product: input.productId,
      redirect: input.redirectPath ?? `/tests/${testEntryRouteId(input.suiteSlug)}`,
      tier,
    },
  };
}

/** Block reason for test entry CTA (null = can proceed). */
export function testEntryBlockedReason(ctx: TestEntryStartContext, runSuiteSlug: string): string | null {
  if (ctx.authLoading) return "正在确认登录状态，请稍候";
  if (!ctx.user) return "请先登录后再开始测试";
  if (genderRequired(ctx.productId) && !ctx.gender) return "请先选择「女性版」或「男性版」题库";
  const liteFree = liteFreeForTier(ctx.productId, ctx.suiteTier);
  if (!liteFree && !hasRunAccess(ctx.productId, runSuiteSlug)) {
    return "请先输入兑换码解锁本题库";
  }
  return null;
}

/** Where test entry「开始测试」should navigate. */
export function resolveTestEntryStartRoute(ctx: TestEntryStartContext): ProductFlowRoute | null {
  const spec = productFlowSpec(ctx.productId);
  const runSuiteSlug = resolveFlowSuiteSlug({
    productId: ctx.productId,
    routeId: ctx.routeSuiteSlug,
    gender: ctx.gender,
    suiteTier: ctx.suiteTier,
  });
  const blocked = testEntryBlockedReason(ctx, runSuiteSlug);

  if (blocked) {
    if (!ctx.user) {
      return { to: "/auth", search: { redirect: `/tests/${ctx.productId}` } };
    }
    if (!liteFreeForTier(ctx.productId, ctx.suiteTier) && !hasRunAccess(ctx.productId, runSuiteSlug)) {
      return {
        to: "/access",
        search: {
          product: ctx.productId,
          redirect: accessRedirectFromTestEntry(ctx.productId, runSuiteSlug),
          tier: ctx.suiteTier,
        },
      };
    }
    return null;
  }

  if (spec.redeemLanding === "ros-start") {
    return { to: "/ros/start" };
  }

  if (spec.pickGenderOnAccess && ctx.gender) {
    persistGenderAndSuite(ctx.productId, ctx.gender, ctx.suiteTier);
  } else {
    writeTier(ctx.productId, ctx.suiteTier);
  }

  return { to: "/tests/$id/run", params: { id: runSuiteSlug } };
}

/** Run page mount guard — replaces scattered useEffect redirects. */
export function guardRunPage(ctx: RunPageGuardContext): FlowGuardResult {
  if (ctx.authPending) return { ok: true };

  const productId = inferProductId(ctx.routeSuiteSlug);
  const bareProductRoute = !ctx.routeSuiteSlug.includes("_");

  if (productId === "ros" && bareProductRoute) {
    return { ok: false, route: { to: "/ros/start" } };
  }
  if ((productId === "mate" || productId === "self") && bareProductRoute) {
    return {
      ok: false,
      route: { to: "/tests/$id", params: { id: productId } },
    };
  }

  const storedSuite =
    typeof window !== "undefined" ? sessionStorage.getItem(`suite:${productId}`) : null;
  const suiteSlug = resolveActiveSuiteSlug({
    productId,
    routeId: ctx.routeSuiteSlug,
    sessionSuiteSlug: storedSuite,
  });

  if (getPartnerRelationCode()) return { ok: true };

  if (productId === "ros" && !hasRunAccess("ros", suiteSlug)) {
    return {
      ok: false,
      route: { to: "/ros/start" },
      toast: "请先完成 ROS 入门流程（兑换码 · 版本 · 阶段）",
    };
  }

  if (!hasRunAccess(productId, suiteSlug) && !isSelfLiteSuite(suiteSlug)) {
    return {
      ok: false,
      route: accessSearchForRun({
        productId,
        suiteSlug,
        redirectPath: `/tests/${productId}`,
      }),
      toast: "请先输入兑换码解锁本题库",
    };
  }

  return { ok: true };
}

/** Submit-time redemption guard. */
export function guardSubmitAccess(ctx: SubmitAccessContext): FlowGuardResult {
  const { productId, suiteSlug, routeSuiteSlug } = ctx;
  const partnerCode = getPartnerRelationCode();
  const redemptionEventId = redemptionEventFor(productId, suiteSlug);
  const selfLiteFree = isSelfLiteSuite(suiteSlug);

  if (partnerCode || redemptionEventId || selfLiteFree) {
    return { ok: true };
  }

  const hasAccess = hasRunAccess(productId, suiteSlug);
  if (hasAccess) {
    return {
      ok: false,
      route: accessSearchForRun({
        productId,
        suiteSlug,
        redirectPath: `/tests/${routeSuiteSlug}/run`,
      }),
      toast: "兑换凭证已失效，请重新验证兑换码后再提交",
    };
  }

  if (productId === "ros") {
    return {
      ok: false,
      route: { to: "/ros/start" },
      toast: "请先输入兑换码解锁本题库",
    };
  }

  return {
    ok: false,
    route: accessSearchForRun({ productId, suiteSlug }),
    toast: "请先输入兑换码解锁本题库",
  };
}

/** After API verify — persist session + navigation target. */
export function applyRedemptionAndRoute(input: {
  productId: ProductId;
  verifiedSuiteSlug: string;
  suiteTier: SuiteTier;
  redemptionEventId: string;
  pickedGender: SuiteGender | null;
  redirect?: string;
  backendRedirect?: string;
}): ProductFlowRoute {
  completeRedemptionSession({
    productId: input.productId,
    verifiedSuiteSlug: input.verifiedSuiteSlug,
    tier: input.suiteTier,
    redemptionEventId: input.redemptionEventId,
  });

  const target: RedeemNavigateTarget = resolvePostRedeemTarget({
    verifiedSuiteSlug: input.verifiedSuiteSlug,
    suiteTier: input.suiteTier,
    pickedGender: input.pickedGender,
    redirect: input.redirect,
    backendRedirect: input.backendRedirect,
  });

  return redeemTargetToRoute(target);
}

export function redeemTargetToRoute(target: RedeemNavigateTarget): ProductFlowRoute {
  if (target.kind === "run") {
    return { to: "/tests/$id/run", params: { id: target.suiteSlug } };
  }
  if (target.kind === "ros-start") {
    return { to: "/ros/start" };
  }
  return {
    to: "/tests/$id",
    params: { id: target.productId },
    search: { tier: target.tier, gender: target.gender },
  };
}

/** ROS / generic: navigate to run after unlockProductForRun. */
export function routeToRun(suiteSlug: string): ProductFlowRoute {
  return { to: "/tests/$id/run", params: { id: suiteSlug } };
}

/** Product card link from homepage. */
export function resolveProductStartLink(productId: ProductId): ProductFlowRoute {
  if (isLiteTierFree(productId, "lite") || hasRunnableProductAccess(productId)) {
    const entry = productEntryPath(productId);
    if (entry === "/ros/start") return { to: "/ros/start" };
    return { to: "/tests/$id", params: { id: productId } };
  }
  return { to: "/access", search: { product: productId } };
}

export function productStartLabelFor(productId: ProductId, tier: SuiteTier = "lite"): string {
  if (isLiteTierFree(productId, tier)) return "免费开始";
  if (hasRunnableProductAccess(productId)) return "开始测试";
  return "兑换码解锁";
}

export function productNeedsUnlock(productId: ProductId, tier: SuiteTier = "lite"): boolean {
  if (isLiteTierFree(productId, tier)) return false;
  return !hasRunnableProductAccess(productId);
}
