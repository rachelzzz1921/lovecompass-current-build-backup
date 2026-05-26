import type { ExampleSuiteTab } from "@/data/exampleCharacters";
import type { MateNavId } from "@/data/mateTypes";
import { MATE_NAV_SECTIONS } from "@/data/mateTypes";
import { PRODUCTS, SUITE_LABELS, type ProductId } from "@/data/products";

export type ExampleSection = {
  id: string;
  label: string;
  hint?: string;
};

const PRODUCT_META = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<
  ProductId,
  (typeof PRODUCTS)[number]
>;

export type ExampleSuiteJourneyStep = {
  id: ExampleSuiteTab;
  step: number;
  productId: ProductId;
  /** 用户可见：第一套题 / 第二套题 / 第三套题 */
  suiteLabel: string;
  title: string;
  /** 产品全称 */
  productTitle: string;
  subtitle: string;
  questionCount: string;
  accessHint: string;
  accent: "violet" | "cyan" | "rose";
};

export const EXAMPLE_SUITE_JOURNEY: ExampleSuiteJourneyStep[] = (
  [
    { id: "self", step: 1, productId: "self", suiteLabel: "第一套题" },
    { id: "ros", step: 2, productId: "ros", suiteLabel: "第二套题" },
    { id: "mate", step: 3, productId: "mate", suiteLabel: "第三套题" },
  ] as const
).map(({ id, step, productId, suiteLabel }) => {
  const product = PRODUCT_META[productId];
  const labels = SUITE_LABELS[productId];
  return {
    id,
    step,
    productId,
    suiteLabel,
    title: labels.code,
    productTitle: labels.title,
    subtitle: product.subtitle,
    questionCount: product.questionCount,
    accessHint: product.status === "free" ? "免费体验" : "兑换码解锁",
    accent: product.accent,
  };
});

export type ExampleSuitePreview = {
  headline: string;
  sub: string;
};

export const EXAMPLE_SELF_SECTIONS: ExampleSection[] = [
  { id: "overture", label: "开篇", hint: "依恋类型总览" },
  { id: "act-i", label: "Act I", hint: "特质 · 六维 · 场景" },
  { id: "act-ii", label: "Act II", hint: "红楼人格揭晓" },
  { id: "act-iii", label: "Act III", hint: "分析师摘要" },
  { id: "coda", label: "收尾", hint: "开始你的测评" },
];

export const EXAMPLE_ROS_SECTIONS: ExampleSection[] = [
  { id: "ros-hero", label: "概览", hint: "关系天气与阶段" },
  { id: "ros-layers", label: "五层", hint: "关系结构拆解" },
  { id: "ros-pulse", label: "洞察", hint: "盲点与脉搏" },
  { id: "ros-next", label: "处方", hint: "接下来怎么办" },
];

export const EXAMPLE_ROS_COUPLE_SECTIONS: ExampleSection[] = [
  { id: "ros-couple-overview", label: "概览", hint: "双人契合与感知差" },
  { id: "ros-couple-compare", label: "对比", hint: "五层双轨" },
  { id: "ros-couple-bond", label: "碰撞", hint: "依恋组合" },
  { id: "ros-couple-signal", label: "心跳", hint: "双轨脉搏" },
  { id: "ros-couple-next", label: "处方", hint: "AI 四卡" },
];

const MATE_PRIMARY_HINTS: Record<MateNavId, string> = {
  modules: "五维分数 · 先看底牌",
  identity: "市场定位卡",
  coordinate: "四象限坐标站",
  observe: "三视角证词",
  rehearse: "恋爱三集预演",
  advice: "红娘大实话",
  match: "温度带区间",
  lens: "AI 洞察",
};

const MATE_PRIMARY_NUMERALS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"] as const;

/** 示范 MATE：8 模块档案室路径 · 与 MATE_NAV_SECTIONS 顺序一致 */
export const EXAMPLE_MATE_PRIMARY: ExampleSection[] = MATE_NAV_SECTIONS.map((s, i) => ({
  id: `mate-${s.id}`,
  label: `${MATE_PRIMARY_NUMERALS[i] ?? String(i + 1)} ${s.label}`,
  hint: MATE_PRIMARY_HINTS[s.id],
}));

export const EXAMPLE_MATE_SECTIONS: ExampleSection[] = MATE_NAV_SECTIONS.map((s) => ({
  id: `mate-${s.id}`,
  label: s.label,
}));

export function exampleSuitePath(tab: ExampleSuiteTab): ExampleSection[] {
  if (tab === "self") return EXAMPLE_SELF_SECTIONS;
  if (tab === "ros") return EXAMPLE_ROS_SECTIONS;
  return EXAMPLE_MATE_PRIMARY;
}

export function nextExampleSuite(tab: ExampleSuiteTab): ExampleSuiteTab | null {
  if (tab === "self") return "ros";
  if (tab === "ros") return "mate";
  return null;
}

export function mateSectionId(navId: MateNavId | "simulator" | "reverse"): string {
  return `mate-${navId}`;
}
