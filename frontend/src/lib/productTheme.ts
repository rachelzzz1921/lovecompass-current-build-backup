import type { CSSProperties } from "react";
import type { Product } from "@/data/products";
import { getProductMeta, type ProductId } from "@/lib/productRegistry";

/** 三套测评共用结构；视觉差异来自 accent palette（与 products.ts `accent` 对齐） */
export type ProductTheme = {
  id: ProductId;
  titleGradient: string;
  buttonGradient: string;
  ringGradient: string;
  chipClass: string;
  chipStyle?: CSSProperties;
  selectedOption: string;
  unselectedOption: string;
  iconBg: string;
  iconColor: string;
  progressFrom: string;
  progressTo: string;
  inputFocus: string;
  cardGlow?: string;
  accentRing: string;
  coreShadow: string;
  sectionCurrent: string;
  sectionActive: string;
};

type AccentKey = Product["accent"];

const UNSELECTED =
  "border-border/60 bg-glass text-muted-foreground hover:text-foreground hover:border-border";

/** 按 accent 定义一次；新增套题只需在 products.ts 指定 accent */
const PALETTE_THEMES: Record<AccentKey, Omit<ProductTheme, "id">> = {
  violet: {
    titleGradient: "text-gradient-violet",
    buttonGradient: "from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]",
    ringGradient: "from-[oklch(0.68_0.18_285)] to-[oklch(0.50_0.20_285)]",
    chipClass: "chip-violet",
    selectedOption:
      "border-[oklch(0.68_0.18_285_/_0.7)] bg-[oklch(0.50_0.20_285_/_0.12)] text-foreground shadow-[0_0_0_1px_oklch(0.68_0.18_285_/_0.25)]",
    unselectedOption: UNSELECTED,
    iconBg: "bg-[oklch(0.50_0.20_285_/_0.18)]",
    iconColor: "text-[oklch(0.82_0.10_285)]",
    progressFrom: "from-[oklch(0.68_0.18_285)]",
    progressTo: "to-[oklch(0.82_0.14_200)]",
    inputFocus: "focus:border-[oklch(0.82_0.14_200_/_0.7)] focus:glow-cyan",
    cardGlow:
      "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-[oklch(0.68_0.18_285/0.08)] before:to-transparent before:pointer-events-none",
    accentRing: "from-[oklch(0.68_0.18_285/0.35)] to-[oklch(0.82_0.14_200/0.15)]",
    coreShadow: "0 0 60px oklch(0.65 0.20 285 / 0.6)",
    sectionActive:
      "border-[oklch(0.68_0.18_285_/_0.5)] bg-[oklch(0.50_0.20_285_/_0.12)] text-[oklch(0.85_0.10_285)]",
    sectionCurrent:
      "border-[oklch(0.82_0.14_200_/_0.6)] bg-[oklch(0.55_0.16_200_/_0.16)] text-[oklch(0.88_0.10_200)] glow-cyan",
  },
  cyan: {
    titleGradient: "text-gradient-cyan",
    buttonGradient: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
    ringGradient: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
    chipClass: "chip-cyan",
    selectedOption:
      "border-[oklch(0.82_0.14_200_/_0.7)] bg-[oklch(0.55_0.16_200_/_0.12)] text-foreground shadow-[0_0_0_1px_oklch(0.82_0.14_200_/_0.25)]",
    unselectedOption: UNSELECTED,
    iconBg: "bg-[oklch(0.55_0.16_200_/_0.18)]",
    iconColor: "text-[oklch(0.82_0.14_200)]",
    progressFrom: "from-[oklch(0.82_0.14_200)]",
    progressTo: "to-[oklch(0.55_0.16_200)]",
    inputFocus: "focus:border-[oklch(0.82_0.14_200_/_0.7)] focus:glow-cyan",
    cardGlow:
      "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-[oklch(0.82_0.14_200/0.08)] before:to-transparent before:pointer-events-none",
    accentRing: "from-[oklch(0.82_0.14_200/0.35)] to-[oklch(0.55_0.16_200/0.15)]",
    coreShadow: "0 0 60px oklch(0.65 0.20 200 / 0.6)",
    sectionActive:
      "border-[oklch(0.82_0.14_200_/_0.5)] bg-[oklch(0.55_0.16_200_/_0.12)] text-[oklch(0.88_0.10_200)]",
    sectionCurrent:
      "border-[oklch(0.68_0.18_285_/_0.45)] bg-[oklch(0.50_0.20_285_/_0.14)] text-[oklch(0.85_0.10_285)]",
  },
  rose: {
    titleGradient: "text-transparent bg-clip-text bg-gradient-to-r from-[#f9a8d4] to-[#fb7185]",
    buttonGradient: "from-[#f472b6] to-[#fb7185]",
    ringGradient: "from-[#f472b6] to-[#fb7185]",
    chipClass: "chip-rose",
    selectedOption:
      "border-[rgba(244,114,182,0.7)] bg-[rgba(244,114,182,0.12)] text-foreground shadow-[0_0_0_1px_rgba(244,114,182,0.25)]",
    unselectedOption: UNSELECTED,
    iconBg: "bg-[rgba(244,114,182,0.15)]",
    iconColor: "text-[#f9a8d4]",
    progressFrom: "from-[#f472b6]",
    progressTo: "to-[#fb7185]",
    inputFocus: "focus:border-[rgba(244,114,182,0.7)]",
    cardGlow:
      "before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-[rgba(244,114,182,0.08)] before:to-transparent before:pointer-events-none",
    accentRing: "from-[rgba(244,114,182,0.35)] to-[rgba(251,113,133,0.15)]",
    coreShadow: "0 0 60px rgba(244,114,182,0.55)",
    sectionActive: "border-[#f472b6]/50 bg-[#f472b6]/12 text-[#f9a8d4]",
    sectionCurrent: "border-[#fb7185]/60 bg-[#fb7185]/16 text-[#fecdd3]",
  },
};

const CARD_GLOW: Record<AccentKey, string> = {
  violet: "hover:glow-violet",
  cyan: "hover:glow-cyan",
  rose: "hover:glow-violet",
};

export function productTheme(productId: ProductId): ProductTheme {
  const accent = getProductMeta(productId).accent;
  return { id: productId, ...PALETTE_THEMES[accent] };
}

export type ProductMarketing = {
  chipClass: string;
  titleClass: string;
  ringGradient: string;
  barGradient: string;
  accentRing: string;
  buttonGradient: string;
  cardGlow: string;
};

/** 列表 / 卡片 / 历史页 —— 与 productTheme 同源 */
export function productMarketing(productId: ProductId): ProductMarketing {
  const meta = getProductMeta(productId);
  const t = productTheme(productId);
  return {
    chipClass: t.chipClass,
    titleClass: t.titleGradient,
    ringGradient: t.ringGradient,
    barGradient: `${t.progressFrom} ${t.progressTo}`,
    accentRing: t.accentRing,
    buttonGradient: t.buttonGradient,
    cardGlow: CARD_GLOW[meta.accent],
  };
}

export function progressClass(productId: ProductId): string {
  const t = productTheme(productId);
  return `${t.progressFrom} ${t.progressTo}`;
}

export function optionClass(theme: ProductTheme, selected: boolean): string {
  return `h-11 rounded-xl border text-sm font-medium transition ${selected ? theme.selectedOption : theme.unselectedOption}`;
}

export function tierOptionClass(theme: ProductTheme, selected: boolean): string {
  return `h-auto min-h-11 rounded-xl border px-3 py-2.5 text-left transition ${selected ? theme.selectedOption : theme.unselectedOption}`;
}
