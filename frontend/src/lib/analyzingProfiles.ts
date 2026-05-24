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
  stages: AnalyzingStage[];
  keywords: string[];
  terminalLines: string[];
  theme: AnalyzingTheme;
};

const SELF_THEME: AnalyzingTheme = {
  chipClass: "chip-violet",
  titleClass: "text-gradient-violet",
  progressClass: "from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]",
  coreShadow: "0 0 60px oklch(0.65 0.20 285 / 0.6)",
};

const ROS_THEME: AnalyzingTheme = {
  chipClass: "chip-cyan",
  titleClass: "text-gradient-cyan",
  progressClass: "from-[oklch(0.82_0.14_200)] to-[oklch(0.55_0.16_200)]",
  coreShadow: "0 0 60px oklch(0.65 0.20 200 / 0.6)",
};

const MATE_THEME: AnalyzingTheme = {
  chipClass: "font-mono",
  titleClass: "text-transparent bg-clip-text bg-gradient-to-r from-[#f9a8d4] to-[#fb7185]",
  progressClass: "from-[#f472b6] to-[#fb7185]",
  coreShadow: "0 0 60px rgba(244,114,182,0.55)",
};

const SELF_PROFILE: AnalyzingProfile = {
  productSet: "SELF",
  chip: "SET · 01 / SELF",
  theme: SELF_THEME,
  progressLabel: "底片合成进度",
  footer: "请稍候 · 正在绘制你的关系底片 · DO NOT LEAVE",
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
      dur: 1700,
    },
    {
      icon: Radar,
      title: "正在提取 SA1–SA6 六维信号",
      whisper: "亲密需求、边界、情绪、沟通、冲突、承诺——六个面向同时展开。",
      detail: "MAPPING · 6 DIMENSIONS",
      hue: 270,
      dur: 1900,
    },
    {
      icon: Heart,
      title: "正在定位你的依恋类型",
      whisper: "不是贴标签，是找你在关系里反复出现的节奏。",
      detail: "DETECTING · ATTACHMENT STYLE",
      hue: 320,
      dur: 2000,
    },
    {
      icon: Brain,
      title: "正在匹配红楼 34 个人格原型",
      whisper: "在所有可能的你之中，找最像、也最能解释你的那一个。",
      detail: "MATCHING · 34 ARCHETYPES",
      hue: 300,
      dur: 2100,
    },
    {
      icon: Layers,
      title: "正在合成自我关系底片",
      whisper: "和具体的某个人无关——这是你在亲密关系里的默认配置。",
      detail: "RENDERING · SELF PORTRAIT",
      hue: 255,
      dur: 1800,
    },
  ],
  keywords: [
    "亲密需求 · 信号提取",
    "依恋焦虑 · 中低",
    "边界感 · 清晰",
    "情绪调节 · 偏内化",
    "冲突时先冷却",
    "承诺意愿 · 谨慎",
    "独处后再沟通",
    "对沉默敏感",
    "SA3 · 独立倾向",
    "SA4 · 沟通风格",
    "理想关系：可独处的共处",
    "对赞美 · 半信半疑",
  ],
  terminalLines: [
    "› 已读取 50 道情境题",
    "› SA1–SA6 六维信号已提取",
    "› 依恋类型 · 判定中",
    "› 红楼人格 · 34 原型匹配",
    "› 自我底片 · 准备呈现",
  ],
};

const ROS_PROFILE: AnalyzingProfile = {
  productSet: "ROS",
  chip: "SET · 02 / ROS",
  theme: ROS_THEME,
  progressLabel: "关系画像合成进度",
  footer: "请稍候 · 正在读取你们之间的真实互动 · DO NOT LEAVE",
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
      dur: 1700,
    },
    {
      icon: GitMerge,
      title: "正在分层解析五层关系结构",
      whisper: "吸引还在不在、相处轻不轻松、合不合拍、往哪走、有没有雷。",
      detail: "LAYERING · AT / IN / CO / EV / RK",
      hue: 215,
      dur: 2000,
    },
    {
      icon: Target,
      title: "正在计算关系共振指数",
      whisper: "不是感觉好不好，是五个层面加权后的真实位置。",
      detail: "SCORING · ROS INDEX",
      hue: 230,
      dur: 1900,
    },
    {
      icon: Users,
      title: "正在识别关系类型与当前阶段",
      whisper: "彼此生长、温水同行、还是消耗——模式比单次争吵更说明问题。",
      detail: "CLASSIFYING · RELATION PATTERN",
      hue: 205,
      dur: 2100,
    },
    {
      icon: Compass,
      title: "正在生成单边关系画像",
      whisper: "这是你眼中的这段关系；等 TA 加入，画像会再叠一层。",
      detail: "RENDERING · RELATION PORTRAIT",
      hue: 195,
      dur: 1800,
    },
  ],
  keywords: [
    "AT · 吸引基础",
    "IN · 互动质量",
    "CO · 兼容程度",
    "EV · 关系走向",
    "RK · 风险信号",
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
    "› AT · 吸引层已分层",
    "› IN / CO · 互动与兼容已分析",
    "› EV / RK · 走向与风险已扫描",
    "› 关系画像 · 准备呈现",
  ],
};

const MATE_PROFILE: AnalyzingProfile = {
  productSet: "MATE",
  chip: "SET · 03 / MATE",
  theme: MATE_THEME,
  progressLabel: "坐标档案合成进度",
  footer: "请稍候 · 正在计算你的市场坐标 · DO NOT LEAVE",
  submittingTitle: "正在提交并计算择偶坐标…",
  submittingDetail: "PARSING · 80 MARKET SIGNALS",
  doneDetail: "DONE · 择偶档案就绪",
  doneTitle: "你的牌面，算清楚了。",
  doneWhisper: "显示度与现实支撑，已映射到四象限。",
  stages: [
    {
      icon: ScanLine,
      title: "正在读取 80 道市场信号",
      whisper: "不是你觉得自己怎么样，是别人会怎么筛你。",
      detail: "PARSING · 80 MARKET SIGNALS",
      hue: 350,
      dur: 1700,
    },
    {
      icon: Layers,
      title: "正在分层计算模块得分",
      whisper: "吸引力、情感价值、现实支撑、关系成熟度、风险净值——逐层加权。",
      detail: "MODULES · FS / MS SCORING",
      hue: 10,
      dur: 2000,
    },
    {
      icon: MapPin,
      title: "正在映射显示度 × 现实支撑",
      whisper: "横轴是别人第一眼看见什么，纵轴是长期能不能托底。",
      detail: "AXES · QUADRANT MAPPING",
      hue: 25,
      dur: 1900,
    },
    {
      icon: Sparkles,
      title: "正在匹配择偶坐标类型",
      whisper: "让人想留下来、越了解越值钱、还是还没到时候——找你的位置。",
      detail: "CLASSIFYING · POSITION TYPE",
      hue: 340,
      dur: 2100,
    },
    {
      icon: Target,
      title: "正在生成红娘档案",
      whisper: "第一印象、长期留存、成功概率区——不是报告，是坐标。",
      detail: "RENDERING · MATE PROFILE",
      hue: 355,
      dur: 1800,
    },
  ],
  keywords: [
    "显示度 · 横轴",
    "现实支撑 · 纵轴",
    "情感价值输出",
    "吸引力资产 · 校准中",
    "风险净值 · 反向计分",
    "第一印象 · 评估",
    "长期留存 · 预测",
    "四象限 · 定位中",
    "红娘档案 · 生成中",
    "市场坐标 · 映射中",
    "成功概率区 · 计算中",
    "敏感字段 · 已脱敏",
  ],
  terminalLines: [
    "› 已读取 80 道情境题",
    "› 模块得分 · 分层完成",
    "› 显示度 / 现实支撑 · 已定位",
    "› 四象限坐标 · 已映射",
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
