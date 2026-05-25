import type { SelfDimensionCode } from "@/data/selfSuiteSpec";
import { SELF_DIMENSION_BY_CODE } from "@/data/selfSuiteSpec";

export type GrowthPathSpec = {
  targetCharacter: string;
  keyDimension: SelfDimensionCode;
  delta: number;
  changes: string[];
};

/** 时光机：各红楼人格 → 成长目标（Layer B 预置，Layer C 可覆盖描述） */
export const GROWTH_PATHS: Record<string, GrowthPathSpec> = {
  林黛玉: {
    targetCharacter: "史湘云",
    keyDimension: "SA2",
    delta: 15,
    changes: [
      "不再需要那么多来自对方的确认",
      "能更快从冲突中恢复",
      "你给的爱会更轻盈，也更长久",
    ],
  },
  贾宝玉: {
    targetCharacter: "北静王",
    keyDimension: "SA2",
    delta: 12,
    changes: [
      "情绪不再完全跟着对方起伏",
      "能在热烈里保留自己的节奏",
      "关系里少些试探，多些笃定",
    ],
  },
  薛宝钗: {
    targetCharacter: "贾探春",
    keyDimension: "SA3",
    delta: 10,
    changes: [
      "偶尔暴露脆弱不等于失控",
      "亲密不必永远完美得体",
      "对方会更靠近真实的你",
    ],
  },
  贾探春: {
    targetCharacter: "北静王",
    keyDimension: "SA6",
    delta: 12,
    changes: [
      "原则之外留一点柔软",
      "不必事事都自己扛",
      "关系可以既清醒又温暖",
    ],
  },
  妙玉: {
    targetCharacter: "柳湘莲",
    keyDimension: "SA3",
    delta: 12,
    changes: [
      "撤回之后记得留一句「我还在」",
      "标准高不等于永远独处",
      "值得的人会在你的节奏里靠近",
    ],
  },
  柳湘莲: {
    targetCharacter: "北静王",
    keyDimension: "SA3",
    delta: 10,
    changes: [
      "独立与靠近可以并存",
      "不必用距离证明清醒",
      "稳定的人会让你更愿意停留",
    ],
  },
  史湘云: {
    targetCharacter: "薛宝钗",
    keyDimension: "SA5",
    delta: 12,
    changes: [
      "热烈里多一层可持续的节奏",
      "冲突后恢复得更快",
      "真实不必总是即兴",
    ],
  },
  王熙凤: {
    targetCharacter: "贾探春",
    keyDimension: "SA4",
    delta: 10,
    changes: [
      "边界之外也能表达需要",
      "不必永远做关系里的强者",
      "被照顾不等于失去掌控",
    ],
  },
  袭人: {
    targetCharacter: "薛宝钗",
    keyDimension: "SA4",
    delta: 15,
    changes: [
      "付出之前先问自己是否也被照顾",
      "说「我需要」不等于自私",
      "你值得被同样具体地珍视",
    ],
  },
  蒋玉菡: {
    targetCharacter: "贾宝玉",
    keyDimension: "SA1",
    delta: 12,
    changes: [
      "你的付出不必总是无声",
      "被看见的需求也是爱的一部分",
      "关系可以既细腻又对等",
    ],
  },
  北静王: {
    targetCharacter: "薛宝钗",
    keyDimension: "SA6",
    delta: 10,
    changes: [
      "分寸感里多一分 spontaneity",
      "稳定也可以有惊喜",
      "对方会感到你不仅可靠，也可亲近",
    ],
  },
  贾雨村: {
    targetCharacter: "贾探春",
    keyDimension: "SA5",
    delta: 12,
    changes: [
      "复杂不必总是切换面具",
      "识别自己此刻要的是空间还是连接",
      "真实比一致更能留住对的人",
    ],
  },
};

export function growthPathForCharacter(characterName: string): GrowthPathSpec | null {
  return GROWTH_PATHS[characterName.trim()] ?? null;
}

export function growthDimensionLabel(code: SelfDimensionCode): string {
  return SELF_DIMENSION_BY_CODE[code]?.name ?? code;
}
