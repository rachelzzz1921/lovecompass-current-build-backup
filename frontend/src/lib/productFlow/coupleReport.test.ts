import { describe, expect, it } from "vitest";
import {
  coupleReportEligible,
  coupleReportUnavailableCopy,
  coupleReportUpgradeBullets,
  tierSelectCoupleHint,
} from "@/lib/coupleReport";

describe("coupleReport", () => {
  it("allows full tier only", () => {
    expect(coupleReportEligible("ros", "s02_ros_female")).toBe(true);
    expect(coupleReportEligible("ros", "s02_ros_female_lite")).toBe(false);
    expect(coupleReportEligible("mate", "s03_mate_male")).toBe(true);
    expect(coupleReportEligible("mate", "s03_mate_male_lite")).toBe(false);
    expect(coupleReportEligible("ros", null)).toBe(false);
    expect(coupleReportEligible("ros", null, null, "ROS-ABCD-1234")).toBe(true);
    expect(coupleReportEligible("ros", null, "full")).toBe(true);
  });

  it("has product-specific unavailable copy", () => {
    expect(coupleReportUnavailableCopy("ros")).toMatch(/快速版/);
    expect(coupleReportUnavailableCopy("mate")).toMatch(/完整版/);
  });

  it("surfaces upgrade bullets", () => {
    expect(coupleReportUpgradeBullets("ros").length).toBeGreaterThanOrEqual(3);
    expect(tierSelectCoupleHint("mate", "lite")).toBeNull();
  });
});
