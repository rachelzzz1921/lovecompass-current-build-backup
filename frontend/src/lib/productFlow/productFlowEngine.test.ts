import { describe, expect, it } from "vitest";
import { PRODUCT_FLOW_GRAPHS } from "./flowGraph";
import {
  guardRunPage,
  guardSubmitAccess,
  liteFreeForTier,
  redeemTargetToRoute,
  resolveProductStartLink,
  testEntryBlockedReason,
} from "./productFlowEngine";

describe("productFlowEngine", () => {
  it("SELF lite is free", () => {
    expect(liteFreeForTier("self", "lite")).toBe(true);
    expect(liteFreeForTier("mate", "lite")).toBe(false);
  });

  it("bare ros run slug redirects to ros/start", () => {
    const guard = guardRunPage({ routeSuiteSlug: "ros", authPending: false });
    expect(guard.ok).toBe(false);
    if (!guard.ok) expect(guard.route).toEqual({ to: "/ros/start" });
  });

  it("bare mate run slug redirects to tests entry", () => {
    const guard = guardRunPage({ routeSuiteSlug: "mate", authPending: false });
    expect(guard.ok).toBe(false);
    if (!guard.ok) {
      expect(guard.route).toEqual({ to: "/tests/$id", params: { id: "mate" } });
    }
  });

  it("blocks test entry when gender missing for self", () => {
    const reason = testEntryBlockedReason(
      {
        productId: "self",
        routeSuiteSlug: "self",
        user: { id: "u1" },
        authLoading: false,
        gender: null,
        suiteTier: "lite",
      },
      "s01_self_female_lite",
    );
    expect(reason).toMatch(/女性版/);
  });

  it("redeem target run maps to run route", () => {
    expect(redeemTargetToRoute({ kind: "run", suiteSlug: "s03_mate_female" })).toEqual({
      to: "/tests/$id/run",
      params: { id: "s03_mate_female" },
    });
  });

  it("ros homepage link goes to ros/start when unlocked", () => {
    // Without session, only self lite is free — ros should go to access
    expect(resolveProductStartLink("ros")).toEqual({
      to: "/access",
      search: { product: "ros" },
    });
  });

  it("flow graphs cover all three products", () => {
    expect(Object.keys(PRODUCT_FLOW_GRAPHS).sort()).toEqual(["mate", "ros", "self"]);
    expect(PRODUCT_FLOW_GRAPHS.ros.steps.some((s) => s.id === "rosStage")).toBe(true);
    expect(PRODUCT_FLOW_GRAPHS.self.steps.some((s) => s.id === "entry")).toBe(true);
  });

  it("submit guard requires redemption without partner code", () => {
    const guard = guardSubmitAccess({
      productId: "mate",
      suiteSlug: "s03_mate_female",
      routeSuiteSlug: "s03_mate_female",
    });
    expect(guard.ok).toBe(false);
  });
});
