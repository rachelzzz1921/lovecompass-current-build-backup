import { PRODUCTS, type Product } from "@/data/products";

export type ProductId = "self" | "ros" | "mate";
export type SuiteTier = "lite" | "full";
export type SuiteGender = "female" | "male";

export type TierMetaItem = {
  questions: number;
  minutes: number;
  label: string;
  hint: string;
};

export type UpgradeStep = { title: string; detail: string };

/** 单套产品的流程 / 路由 / 题库 slug —— 新增套题时主要改这里 */
export type ProductFlowSpec = {
  id: ProductId;
  order: number;
  entryPath: string;
  redeemLanding: "tests-entry" | "ros-start";
  pickGenderOnAccess: boolean;
  pickTierOnAccess: boolean;
  liteTierFree: boolean;
  genderStorageKey: string;
  suiteSlugs: Record<SuiteGender, string>;
  liteSlugs: Record<SuiteGender, string>;
  crossSellHint: string;
  incompleteHint: string;
  tiers: Record<SuiteTier, TierMetaItem>;
  upgradeSteps: UpgradeStep[];
};

const SELF_TIERS: Record<SuiteTier, TierMetaItem> = {
  lite: { questions: 20, minutes: 4, label: "快速版", hint: "免费 · 核心六维 · 约 70% 精度" },
  full: { questions: 50, minutes: 8, label: "完整版", hint: "兑换码 · 全维度 · 约 95% 精度" },
};

const ROS_TIERS: Record<SuiteTier, TierMetaItem> = {
  lite: { questions: 20, minutes: 5, label: "快速版", hint: "兑换码 · 五层核心 · 约 70% 精度" },
  full: { questions: 62, minutes: 12, label: "完整版", hint: "兑换码 · 含双人报告 · 约 95% 精度" },
};

const MATE_TIERS: Record<SuiteTier, TierMetaItem> = {
  lite: { questions: 20, minutes: 5, label: "快速版", hint: "兑换码 · 核心坐标 · 约 70% 精度" },
  full: { questions: 80, minutes: 18, label: "完整版", hint: "兑换码 · 全模块 · 约 95% 精度" },
};

export const PRODUCT_FLOW_SPECS: Record<ProductId, ProductFlowSpec> = {
  self: {
    id: "self",
    order: 0,
    entryPath: "/tests/self",
    redeemLanding: "tests-entry",
    pickGenderOnAccess: true,
    pickTierOnAccess: true,
    liteTierFree: true,
    genderStorageKey: "lovecompass:self_gender",
    suiteSlugs: { female: "s01_self_female", male: "s01_self_male" },
    liteSlugs: { female: "s01_self_female_lite", male: "s01_self_male_lite" },
    crossSellHint: "六维关系底片——ROS 与 MATE 都叠在这上面。",
    incompleteHint: "完成基础测试后，画像档案开始沉淀",
    tiers: SELF_TIERS,
    upgradeSteps: [
      { title: "更多情境题", detail: "完整版 50 题覆盖边界、情绪、投入等细枝末节，减少灰色地带误判。" },
      { title: "更准的原型匹配", detail: "依恋焦虑/回避临界状态有专门题目校准，红楼人格定位更稳。" },
      { title: "跨套联动", detail: "与 ROS、MATE 合并后，AI 顾问能引用更完整的自我底片。" },
    ],
  },
  ros: {
    id: "ros",
    order: 1,
    entryPath: "/ros/start",
    redeemLanding: "ros-start",
    pickGenderOnAccess: false,
    pickTierOnAccess: true,
    liteTierFree: false,
    genderStorageKey: "lovecompass:ros_gender",
    suiteSlugs: { female: "s02_ros_female", male: "s02_ros_male" },
    liteSlugs: { female: "s02_ros_female_lite", male: "s02_ros_male_lite" },
    crossSellHint: "针对一段具体关系的五层诊断；需要你心里已经有那个人。",
    incompleteHint: "需要具体恋情对象；完成后叠加在 SELF 底片上",
    tiers: ROS_TIERS,
    upgradeSteps: [
      { title: "互动与冲突细节", detail: "完整版深挖日常沟通、修复模式与隐性消耗，而不只看表层和谐。" },
      { title: "阶段与处方", detail: "结合关系时长与 9 阶段模型，给出更贴合当前处境的语言与建议。" },
      { title: "双人报告", detail: "邀请 TA 作答后可生成碰撞分析——快速版仅单边画像。" },
    ],
  },
  mate: {
    id: "mate",
    order: 2,
    entryPath: "/tests/mate",
    redeemLanding: "tests-entry",
    pickGenderOnAccess: true,
    pickTierOnAccess: true,
    liteTierFree: false,
    genderStorageKey: "lovecompass:mate_gender",
    suiteSlugs: { female: "s03_mate_female", male: "s03_mate_male" },
    liteSlugs: { female: "s03_mate_female_lite", male: "s03_mate_male_lite" },
    crossSellHint: "四象限择偶坐标，与 SELF 底片合并为完整 AI 档案。",
    incompleteHint: "补全择偶坐标，与 SELF、ROS 合并为完整档案",
    tiers: MATE_TIERS,
    upgradeSteps: [
      { title: "资产与风险全扫描", detail: "完整版 80 题覆盖吸引力、供给、现实支撑与风险净值的全谱。" },
      { title: "象限坐标更稳", detail: "更多校准题减少「看起来不错但牌面模糊」的中间态。" },
      { title: "红娘档案", detail: "完整版输出更细的上限/甜蜜区/下限匹配语言，便于顾问引用。" },
    ],
  },
};

/** ROS 三步入口流程（解锁 → 阶段 → 版本） */
export type MultiStepEntryStepId = "unlock" | "setup" | "stage";

export type MultiStepEntryFlow = {
  productId: ProductId;
  steps: readonly string[];
  defaultTier: SuiteTier;
  skipUnlockStepWhenAccessGranted: boolean;
  sessionKeys: { stage: string; tier: string };
  panels: {
    unlock: {
      sectionLabel: string;
      heading: string;
      description: string;
      partnerPath: { title: string; sub: string };
      selfPath: { title: string; sub: string };
      relationCodeLabel: string;
      relationCodePlaceholder: string;
      redeemCodeLabel: string;
      redeemCodePlaceholder: string;
    };
    setup: { heading: string };
    stage: { heading: string; sectionLabel: string };
  };
};

export const ROS_ENTRY_FLOW: MultiStepEntryFlow = {
  productId: "ros",
  steps: ["1 · 解锁", "2 · 阶段", "3 · 版本"],
  defaultTier: "lite",
  skipUnlockStepWhenAccessGranted: false,
  sessionKeys: { stage: "ros:stageUi", tier: "ros:tier" },
  panels: {
    unlock: {
      sectionLabel: "PARTNER CODE",
      heading: "是否有伴侣的关系码？",
      description: "如果 TA 已经做过，输入 TA 的关系码可以免费开始；做完后双方都能看完整双人报告。",
      partnerPath: { title: "有，TA 已经做过", sub: "免费开始 · 自动配对" },
      selfPath: { title: "没有，我先做", sub: "需要兑换码 · 做完可邀请 TA" },
      relationCodeLabel: "RELATION CODE",
      relationCodePlaceholder: "ROS-XXXX-XXXX",
      redeemCodeLabel: "REDEEM CODE",
      redeemCodePlaceholder: "兑换码",
    },
    setup: { heading: "选择测试深度与版本" },
    stage: { heading: "你们现在处于哪个阶段？", sectionLabel: "关系阶段" },
  },
};

export function multiStepEntryFlow(productId: ProductId): MultiStepEntryFlow | null {
  return productId === "ros" ? ROS_ENTRY_FLOW : null;
}

export function tierMeta(productId: ProductId, tier: SuiteTier): TierMetaItem {
  return PRODUCT_FLOW_SPECS[productId].tiers[tier];
}

export function upgradeStepsFor(productId: ProductId): UpgradeStep[] {
  return PRODUCT_FLOW_SPECS[productId].upgradeSteps;
}

/** Backward-compatible slug exports */
export const SELF_SUITE_SLUGS = PRODUCT_FLOW_SPECS.self.suiteSlugs;
export const ROS_SUITE_SLUGS = PRODUCT_FLOW_SPECS.ros.suiteSlugs;
export const MATE_SUITE_SLUGS = PRODUCT_FLOW_SPECS.mate.suiteSlugs;
export const SELF_LITE_SLUGS = PRODUCT_FLOW_SPECS.self.liteSlugs;
export const ROS_LITE_SLUGS = PRODUCT_FLOW_SPECS.ros.liteSlugs;
export const MATE_LITE_SLUGS = PRODUCT_FLOW_SPECS.mate.liteSlugs;

/** @deprecated 使用 upgradeStepsFor */
export const UPGRADE_STEPS = Object.fromEntries(
  (Object.keys(PRODUCT_FLOW_SPECS) as ProductId[]).map((id) => [id, PRODUCT_FLOW_SPECS[id].upgradeSteps]),
) as Record<ProductId, UpgradeStep[]>;

export function productFlowSpec(id: ProductId): ProductFlowSpec {
  return PRODUCT_FLOW_SPECS[id];
}

export function getProductMeta(id: ProductId): Product {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
}

export function orderedProductIds(): ProductId[] {
  return (Object.values(PRODUCT_FLOW_SPECS) as ProductFlowSpec[])
    .sort((a, b) => a.order - b.order)
    .map((s) => s.id);
}

export function inferProductId(value: string): ProductId {
  const lower = value.toLowerCase();
  if (lower === "ros" || lower.includes("ros") || lower.includes("s02")) return "ros";
  if (lower === "mate" || lower.includes("mate") || lower.includes("s03")) return "mate";
  return "self";
}

export function resolveSuiteSlugForTier(
  productId: ProductId,
  gender: SuiteGender,
  tier: SuiteTier,
): string {
  const spec = PRODUCT_FLOW_SPECS[productId];
  return tier === "lite" ? spec.liteSlugs[gender] : spec.suiteSlugs[gender];
}

export function getStoredGender(productId: ProductId): SuiteGender | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(PRODUCT_FLOW_SPECS[productId].genderStorageKey);
  return value === "male" || value === "female" ? value : null;
}

export function setStoredGender(productId: ProductId, gender: SuiteGender) {
  if (typeof window === "undefined") return;
  const spec = PRODUCT_FLOW_SPECS[productId];
  sessionStorage.setItem(spec.genderStorageKey, gender);
  const tierRaw = sessionStorage.getItem(`${productId}:tier`);
  const tier: SuiteTier = tierRaw === "full" ? "full" : "lite";
  sessionStorage.setItem(`suite:${productId}`, resolveSuiteSlugForTier(productId, gender, tier));
}

export function resolveActiveSuiteSlug(options: {
  productId: ProductId;
  routeId: string;
  sessionSuiteSlug?: string | null;
}): string {
  const { productId, routeId, sessionSuiteSlug } = options;
  if (routeId.includes("_")) return routeId;
  if (sessionSuiteSlug?.includes("_")) return sessionSuiteSlug;
  const gender = getStoredGender(productId) ?? "female";
  const tierRaw = typeof window !== "undefined" ? sessionStorage.getItem(`${productId}:tier`) : null;
  const tier: SuiteTier = tierRaw === "full" ? "full" : "lite";
  return resolveSuiteSlugForTier(productId, gender, tier);
}

export function isLiteTierFree(productId: ProductId, tier: SuiteTier): boolean {
  return PRODUCT_FLOW_SPECS[productId].liteTierFree && tier === "lite";
}

export function liteAnswersStorageKey(productId: ProductId, suiteSlug: string): string {
  return `lovecompass:lite_answers:${productId}:${suiteSlug}`;
}

export function stepIndexForMultiStep(step: MultiStepEntryStepId): number {
  return step === "unlock" ? 0 : step === "stage" ? 1 : 2;
}

export function nextMultiStepStep(current: MultiStepEntryStepId): MultiStepEntryStepId | null {
  if (current === "unlock") return "stage";
  if (current === "stage") return "setup";
  return null;
}

/** Declarative flow graphs — see `productFlow/flowGraph.ts` */
export { PRODUCT_FLOW_GRAPHS, flowGraphFor, type ProductFlowGraph, type FlowStepId } from "@/lib/productFlow/flowGraph";
