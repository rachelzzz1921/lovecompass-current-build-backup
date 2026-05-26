import logicLibrary from "@/data/self_dimension_logic_v1.json";
import type { SelfDimensionCode } from "@/data/selfSuiteSpec";

export type SelfUnderlyingLogic = {
  measure: string;
  headline: string;
  interpretation: string;
  inRelationship: string;
  growthHint?: string | null;
  bandKey: string;
};

type BandKey = "emerging" | "developing" | "steady" | "asset" | "strength";

function scoreBandKey(score: number): BandKey {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  if (s <= 30) return "emerging";
  if (s <= 50) return "developing";
  if (s <= 65) return "steady";
  if (s <= 80) return "asset";
  return "strength";
}

/** 与 backend/app/self_dimension_logic.py 同词库、同分数带规则。 */
export function resolveSelfUnderlyingLogic(
  code: SelfDimensionCode,
  score: number,
): SelfUnderlyingLogic | null {
  const dim = logicLibrary.dimensions[code as keyof typeof logicLibrary.dimensions];
  if (!dim) return null;
  const bandKey = scoreBandKey(score);
  const band = dim.bands[bandKey as keyof typeof dim.bands];
  if (!band) return null;
  return {
    measure: dim.measure,
    headline: band.headline,
    interpretation: band.interpretation,
    inRelationship: band.inRelationship,
    growthHint: band.growthHint ?? null,
    bandKey,
  };
}

export function positionLabelsForDimension(code: string): { low: string; high: string } {
  if (code === "SA2") return { low: "高焦虑", high: "低焦虑" };
  if (code === "SA3") return { low: "高回避", high: "低回避" };
  const spec = logicLibrary.dimensions[code as SelfDimensionCode];
  if (!spec) return { low: "偏低", high: "偏高" };
  return { low: "还在展开", high: "更成熟" };
}
