import type { CSSProperties } from "react";
import type { ProductId } from "@/lib/resultRoutes";

export type TestRunTheme = {
  chipClass: string;
  chipStyle?: CSSProperties;
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

const SELF_THEME: TestRunTheme = {
  chipClass: "chip-violet",
  progressClass: "from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]",
  sectionActive:
    "border-[oklch(0.68_0.18_285_/_0.5)] bg-[oklch(0.50_0.20_285_/_0.12)] text-[oklch(0.85_0.10_285)]",
  sectionCurrent:
    "border-[oklch(0.82_0.14_200_/_0.6)] bg-[oklch(0.55_0.16_200_/_0.16)] text-[oklch(0.88_0.10_200)] glow-cyan",
  sectionIdle: "border-border/60 text-muted-foreground/70",
  dotPast: "w-1.5 bg-[oklch(0.68_0.18_285_/_0.7)]",
  dotCurrent: "w-5 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]",
  buttonClass:
    "rounded-xl bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground",
  submittingOrbClass: "from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]",
  submittingTitleClass: "text-gradient-violet",
};

const ROS_THEME: TestRunTheme = {
  chipClass: "chip-cyan",
  progressClass: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
  sectionActive:
    "border-[oklch(0.82_0.14_200_/_0.5)] bg-[oklch(0.55_0.16_200_/_0.12)] text-[oklch(0.88_0.10_200)]",
  sectionCurrent:
    "border-[oklch(0.68_0.18_285_/_0.45)] bg-[oklch(0.50_0.20_285_/_0.14)] text-[oklch(0.85_0.10_285)]",
  sectionIdle: "border-border/60 text-muted-foreground/70",
  dotPast: "w-1.5 bg-[oklch(0.82_0.14_200_/_0.75)]",
  dotCurrent: "w-5 bg-gradient-to-r from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
  buttonClass:
    "rounded-xl bg-gradient-to-r from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)] text-primary-foreground",
  submittingOrbClass: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
  submittingTitleClass: "text-gradient-cyan",
};

const MATE_THEME: TestRunTheme = {
  chipClass: "font-mono text-[10px] tracking-[0.25em]",
  chipStyle: {
    background: "rgba(244,114,182,0.12)",
    color: "#f9a8d4",
    border: "1px solid rgba(244,114,182,0.35)",
    borderRadius: "9999px",
    padding: "0.25rem 0.75rem",
  },
  progressClass: "from-[#f472b6] to-[#fb7185]",
  sectionActive: "border-[#f472b6]/50 bg-[#f472b6]/12 text-[#f9a8d4]",
  sectionCurrent: "border-[#fb7185]/60 bg-[#fb7185]/16 text-[#fecdd3]",
  sectionIdle: "border-border/60 text-muted-foreground/70",
  dotPast: "w-1.5 bg-[#f472b6]/75",
  dotCurrent: "w-5 bg-gradient-to-r from-[#f472b6] to-[#fb7185]",
  buttonClass: "rounded-xl bg-gradient-to-r from-[#f472b6] to-[#fb7185] text-white",
  submittingOrbClass: "from-[#f472b6] to-[#fb7185]",
  submittingTitleClass: "text-transparent bg-clip-text bg-gradient-to-r from-[#f9a8d4] to-[#fb7185]",
};

export const TEST_RUN_SECTIONS: Record<ProductId, string[]> = {
  self: ["序章 · 直觉", "底色 · 依恋", "节奏 · 边界", "回声 · 情绪", "尾声 · 取向"],
  ros: ["吸引 · 信号", "互动 · 日常", "兼容 · 价值", "演化 · 走向", "风险 · 扫描"],
  mate: ["初见 · 显示度", "价值 · 输出", "现实 · 支撑", "成熟 · 节奏", "终局 · 坐标"],
};

export function testRunThemeForProduct(productId: ProductId): TestRunTheme {
  if (productId === "ros") return ROS_THEME;
  if (productId === "mate") return MATE_THEME;
  return SELF_THEME;
}
