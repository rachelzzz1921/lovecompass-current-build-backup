import type { ProductId } from "@/lib/productRegistry";
import { productTheme } from "@/lib/productTheme";

export type TestRunTheme = {
  chipClass: string;
  progressClass: string;
  sectionActive: string;
  sectionCurrent: string;
  sectionIdle: string;
  dotPast: string;
  dotCurrent: string;
  buttonClass: string;
  submittingOrbClass: string;
  submittingTitleClass: string;
};

const SECTION_IDLE = "border-border/60 text-muted-foreground/70";

function buildTestRunTheme(productId: ProductId): TestRunTheme {
  const t = productTheme(productId);
  return {
    chipClass: t.chipClass,
    progressClass: `${t.progressFrom} ${t.progressTo}`,
    sectionActive: t.sectionActive,
    sectionCurrent: t.sectionCurrent,
    sectionIdle: SECTION_IDLE,
    dotPast: `w-1.5 bg-gradient-to-r ${t.ringGradient} opacity-75`,
    dotCurrent: `w-5 bg-gradient-to-r ${t.buttonGradient}`,
    buttonClass: `rounded-xl bg-gradient-to-r ${t.buttonGradient} text-primary-foreground`,
    submittingOrbClass: `${t.progressFrom} ${t.progressTo}`,
    submittingTitleClass: t.titleGradient,
  };
}

export const TEST_RUN_SECTIONS: Record<ProductId, string[]> = {
  self: ["序章 · 直觉", "底色 · 依恋", "节奏 · 边界", "回声 · 情绪", "尾声 · 取向"],
  ros: ["吸引 · 信号", "互动 · 日常", "兼容 · 价值", "演化 · 走向", "风险 · 扫描"],
  mate: ["初见 · 显示度", "价值 · 输出", "现实 · 支撑", "成熟 · 节奏", "终局 · 坐标"],
};

export function testRunThemeForProduct(productId: ProductId): TestRunTheme {
  return buildTestRunTheme(productId);
}

const ROS_SECTION_BY_DIMENSION: Record<string, number> = {
  PRE: 0,
  AT: 0,
  IN: 1,
  CO: 2,
  EV: 3,
  RK: 4,
};

const SELF_SECTION_BY_DIMENSION: Record<string, number> = {
  SA1: 0,
  SA2: 1,
  SA3: 1,
  SA4: 2,
  SA5: 3,
  SA6: 4,
};

function mateModuleIndex(dimensionCode: string): number | null {
  const match = dimensionCode.match(/^(FS|MS)(\d)/);
  if (!match) return null;
  return Math.max(0, Number(match[2]) - 1);
}

/** Map the current question's dimension to a progress-chip index (0-based). */
export function sectionIndexForQuestion(
  productId: ProductId,
  dimensionCode: string | undefined | null,
  fallbackIdx: number,
  sectionCount: number,
): number {
  const code = (dimensionCode ?? "").trim();
  if (!code) {
    return Math.min(sectionCount - 1, Math.max(0, fallbackIdx));
  }
  if (productId === "ros") {
    const idx = ROS_SECTION_BY_DIMENSION[code];
    return idx ?? Math.min(sectionCount - 1, fallbackIdx);
  }
  if (productId === "mate") {
    const idx = mateModuleIndex(code);
    return idx ?? Math.min(sectionCount - 1, fallbackIdx);
  }
  const idx = SELF_SECTION_BY_DIMENSION[code];
  return idx ?? Math.min(sectionCount - 1, fallbackIdx);
}
