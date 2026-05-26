import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Compass,
  GitMerge,
  Heart,
  Layers,
  MapPin,
  Radar,
  ScanLine,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { ProductSet } from "@/lib/resultRoutes";
import type { ProductId } from "@/lib/productRegistry";
import { productTheme } from "@/lib/productTheme";

export type AnalyzingStage = {
  icon: LucideIcon;
  title: string;
  whisper: string;
  detail: string;
  hue: number;
  dur: number;
};

export type AnalyzingTheme = {
  chipClass: string;
  titleClass: string;
  progressClass: string;
  coreShadow: string;
};

export type AnalyzingProfile = {
  productSet: ProductSet;
  chip: string;
  progressLabel: string;
  footer: string;
  submittingTitle: string;
  submittingDetail: string;
  doneDetail: string;
  doneTitle: string;
  doneWhisper: string;
  /** Shown before / during analysis — honest expected wait. */
  estimatedWaitLabel: string;
  /** Shown when backend exceeds the planned animation timeline. */
  longWaitHint: string;
  stages: AnalyzingStage[];
  keywords: string[];
  terminalLines: string[];
  theme: AnalyzingTheme;
};

function analyzingThemeFor(productId: ProductId): AnalyzingTheme {
  const t = productTheme(productId);
  return {
    chipClass: t.chipClass,
    titleClass: t.titleGradient,
    progressClass: `${t.progressFrom} ${t.progressTo}`,
    coreShadow: t.coreShadow,
  };
}

const SELF_PROFILE: AnalyzingProfile = {
  productSet: "SELF",
  chip: "SET · 01 / SELF",
  theme: analyzingThemeFor("self"),
  progressLabel: "底片合成进度",
  estimatedWaitLabel: "预计分析 10–25 秒（视网络与服务器负载）",
  longWaitHint: "完整版题量较大，算分有时需 30–45 秒，请稍候",
  footer: "预计 10–25 秒 · 正在绘制关系底片 · 请勿离开",
  submittingTitle: "正在提交并合成自我底片…",
  submittingDetail: "PARSING · 50 SCENARIOS",
  doneDetail: "DONE · 自我底片就绪",
  doneTitle: "你是谁，有了轮廓。",
  doneWhisper: "正在把这份理解，递给你。",
  stages: [
    {
      icon: ScanLine,
      title: "正在读取 50 道情境答案",
      whisper: "每一道题，都在说你怎么爱、怎么退、怎么靠近。",
      detail: "PARSING · 50 SCENARIOS",
      hue: 285,
      dur: 680,
    },
    {
      icon: Radar,
      title: "正在提取六个关系面向的信号",
      whisper: "自我吸引、依恋焦虑与回避、边界、情绪调节、投入方式——六个面向同时展开。",
      detail: "MAPPING · 6 DIMENSIONS",
      hue: 270,
      dur: 720,
    },
    {
      icon: Heart,
      title: "正在定位你的依恋类型",
      whisper: "不是贴标签，是找你在关系里反复出现的节奏。",
      detail: "DETECTING · ATTACHMENT STYLE",
      hue: 320,
      dur: 760,
    },
    {
      icon: Brain,
      title: "正在匹配红楼六维人格原型",
      whisper: "在六种可能的你之中，找最像、也最能解释你的那一个。",
      detail: "MATCHING · 6 ARCHETYPES",
      hue: 300,
      dur: 800,
    },
    {
      icon: Layers,
      title: "正在合成自我关系底片",
      whisper: "和具体的某个人无关——这是你在亲密关系里的默认配置。",
      detail: "RENDERING · SELF PORTRAIT",
      hue: 255,
      dur: 700,
    },
  ],
  keywords: [
    "自我吸引感知 · 信号提取",
    "依恋焦虑 · 中低",
    "依恋回避 · 适中",
    "自我边界 · 清晰",
    "情绪调节 · 偏内化",
    "关系投入 · 谨慎",
    "冲突时先冷却",
    "对沉默敏感",
    "独处后再沟通",
    "理想关系：可独处的共处",
    "对赞美 · 半信半疑",
    "承诺意愿 · 审慎",
  ],
  terminalLines: [
    "› 已读取 50 道情境题",
    "› 六个关系面向 · 信号已提取",
    "› 依恋类型 · 判定中",
    "› 红楼人格 · 34 原型匹配",
    "› 自我底片 · 准备呈现",
  ],
};

const ROS_PROFILE: AnalyzingProfile = {
  productSet: "ROS",
  chip: "SET · 02 / ROS",
  theme: analyzingThemeFor("ros"),
  progressLabel: "关系画像合成进度",
  estimatedWaitLabel: "预计分析 12–30 秒（视网络与服务器负载）",
  longWaitHint: "关系五层算分较复杂，繁忙时可能需 30–50 秒",
  footer: "预计 12–30 秒 · 正在读取关系信号 · 请勿离开",
  submittingTitle: "正在提交并读取关系信号…",
  submittingDetail: "PARSING · 60 RELATION SIGNALS",
  doneDetail: "DONE · 关系画像就绪",
  doneTitle: "这段关系，有了形状。",
  doneWhisper: "单边报告已生成，关系码稍后可用。",
  stages: [
    {
      icon: ScanLine,
      title: "正在读取 60 道关系信号",
      whisper: "你心里的那个人，正在穿过每一道题浮现出来。",
      detail: "PARSING · 60 RELATION SIGNALS",
      hue: 200,
      dur: 680,
    },
    {
      icon: GitMerge,
      title: "正在分层解析五层关系结构",
      whisper: "吸引还在不在、相处轻不轻松、合不合拍、往哪走、有没有雷。",
      detail: "LAYERING · 5 RELATION LAYERS",
      hue: 215,
      dur: 760,
    },
    {
      icon: Target,
      title: "正在计算关系共振指数",
      whisper: "不是感觉好不好，是五个层面加权后的真实位置。",
      detail: "SCORING · ROS INDEX",
      hue: 230,
      dur: 720,
    },
    {
      icon: Users,
      title: "正在识别关系类型与当前阶段",
      whisper: "彼此生长、温水同行、还是消耗——模式比单次争吵更说明问题。",
      detail: "CLASSIFYING · RELATION PATTERN",
      hue: 205,
      dur: 800,
    },
    {
      icon: Compass,
      title: "正在生成单边关系画像",
      whisper: "这是你眼中的这段关系；等 TA 加入，画像会再叠一层。",
      detail: "RENDERING · RELATION PORTRAIT",
      hue: 195,
      dur: 700,
    },
  ],
  keywords: [
    "吸引基础 · 扫描中",
    "互动质量 · 评估中",
    "兼容程度 · 对齐度",
    "关系走向 · 识别中",
    "风险信号 · 扫描中",
    "相处节奏 · 扫描中",
    "冲突后修复力",
    "日常摩擦频率",
    "未来方向 · 对齐度",
    "情绪消耗 · 评估中",
    "共振指数 · 计算中",
    "关系阶段 · 识别中",
  ],
  terminalLines: [
    "› 已读取 60 道关系题",
    "› 吸引基础层 · 已分层",
    "› 互动与兼容 · 已分析",
    "› 走向与风险 · 已扫描",
    "› 关系画像 · 准备呈现",
  ],
};

const MATE_PROFILE: AnalyzingProfile = {
  productSet: "MATE",
  chip: "SET · 03 / MATE",
  theme: analyzingThemeFor("mate"),
  progressLabel: "坐标档案合成进度",
  estimatedWaitLabel: "预计分析 15–40 秒（完整版题量更多）",
  longWaitHint: "择偶坐标含多模块校准，繁忙时可能需 40–60 秒",
  footer: "预计 15–40 秒 · 正在计算市场坐标 · 请勿离开",
  submittingTitle: "正在提交并计算择偶坐标…",
  submittingDetail: "PARSING · 80 MARKET SIGNALS",
  doneDetail: "DONE · 择偶档案就绪",
  doneTitle: "你的牌面，算清楚了。",
  doneWhisper: "第一印象与现实托底，已找到你的位置。",
  stages: [
    {
      icon: ScanLine,
      title: "正在读取 80 道市场信号",
      whisper: "不是你觉得自己怎么样，是别人会怎么筛你。",
      detail: "PARSING · 80 MARKET SIGNALS",
      hue: 350,
      dur: 680,
    },
    {
      icon: Layers,
      title: "正在分层计算模块得分",
      whisper: "吸引力、情感价值、现实托底、关系成熟度、相处风险——逐层加权。",
      detail: "MODULES · 5 CAPABILITY LAYERS",
      hue: 10,
      dur: 760,
    },
    {
      icon: MapPin,
      title: "正在定位第一印象 × 现实托底",
      whisper: "横轴是别人第一眼看见什么，纵轴是长期能不能托底。",
      detail: "AXES · QUADRANT MAPPING",
      hue: 25,
      dur: 720,
    },
    {
      icon: Sparkles,
      title: "正在匹配择偶坐标类型",
      whisper: "让人想留下来、越了解越值钱、还是还没到时候——找你的位置。",
      detail: "CLASSIFYING · POSITION TYPE",
      hue: 340,
      dur: 800,
    },
    {
      icon: Target,
      title: "正在生成红娘档案",
      whisper: "第一印象、长期留存、成功概率区——不是报告，是坐标。",
      detail: "RENDERING · MATE PROFILE",
      hue: 355,
      dur: 700,
    },
  ],
  keywords: [
    "第一印象 · 横轴",
    "现实托底 · 纵轴",
    "情感价值输出",
    "吸引力资产 · 校准中",
    "相处风险 · 评估",
    "长期留存 · 预测",
    "坐标定位 · 进行中",
    "红娘档案 · 生成中",
    "匹配区间 · 计算中",
  ],
  terminalLines: [
    "› 已读取 80 道情境题",
    "› 模块得分 · 分层完成",
    "› 第一印象 / 现实托底 · 已定位",
    "› 择偶坐标 · 已确定",
    "› 红娘档案 · 准备拆封",
  ],
};

const PROFILES: Record<ProductSet, AnalyzingProfile> = {
  SELF: SELF_PROFILE,
  ROS: ROS_PROFILE,
  MATE: MATE_PROFILE,
};

export function resolveAnalyzingProfile(productSet?: string | null): AnalyzingProfile {
  if (productSet === "ROS") return ROS_PROFILE;
  if (productSet === "MATE") return MATE_PROFILE;
  return SELF_PROFILE;
}

export function analyzingProfileForProductId(productId: string): AnalyzingProfile {
  if (productId === "ros") return ROS_PROFILE;
  if (productId === "mate") return MATE_PROFILE;
  return SELF_PROFILE;
}

export { PROFILES };
