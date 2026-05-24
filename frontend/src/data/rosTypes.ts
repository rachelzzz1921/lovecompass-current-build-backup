/** ROS 套二 · 与后端 result_payload / couple payload 对齐 */

export type RosDim = {
  key: "at" | "in" | "co" | "ev" | "rk";
  label: string;
  value: number;
  color: string;
};

export type RelStage = { id: number; name: string; caption: string };

export const REL_STAGES: RelStage[] = [
  { id: 1, name: "怦然相遇", caption: "新鲜感最强，滤镜最厚" },
  { id: 2, name: "渐入佳境", caption: "开始展示真实的自己" },
  { id: 3, name: "暗流初现", caption: "第一次感受到摩擦" },
  { id: 4, name: "磨合阵痛", caption: "考验真正开始" },
  { id: 5, name: "倦怠低谷", caption: "消耗感开始明显" },
  { id: 6, name: "十字路口", caption: "有过放弃的念头" },
  { id: 7, name: "重建信任", caption: "真正开始懂得彼此" },
  { id: 8, name: "深度联结", caption: "不只是喜欢，是懂得" },
  { id: 9, name: "并肩同行", caption: "稳定、成熟、有未来感" },
];

export type RelType = {
  key: string;
  name: string;
  one_liner: string;
  description: string;
};

export type RosSingleResult = {
  code: string;
  type: RelType;
  stageId: number;
  dims: RosDim[];
  insights: { kind: "edge" | "watch" | "advice"; title: string; body: string }[];
  resonance?: { score: number; tier: string; desc: string };
  prescription?: {
    warmup: string;
    chiefComplaint: string;
    rx: string;
    followUp: string;
  };
  weather?: { icon: string; label: string; sub: string };
  keywords?: string[];
};

export type Prescription = {
  warmup: string;
  chiefComplaint: string;
  rx: string;
  followUp: string;
};

export type TimelinePoint = { label: string; value: number; note?: string };
export type Milestone = { when: string; title: string; tone: "warm" | "cool" | "spark" };

export type Resonance = {
  score: number;
  tier: "心有灵犀" | "深度共鸣" | "温柔磨合" | "初见雏形" | string;
  desc: string;
};

export type CoupleDim = {
  key: RosDim["key"];
  label: string;
  you: number;
  ta: number;
  color: string;
};

export type RosCoupleResult = {
  code: string;
  resonance: Resonance;
  weather: { icon: "sun" | "cloud-sun" | "cloud" | "cloud-rain" | "cloud-lightning"; label: string; sub: string };
  stageId: number;
  type: RelType;
  dims: CoupleDim[];
  keywords: string[];
  highlights: { glow: string; shadow: string };
  timeline: { label: string; value: number; note?: string }[];
  milestones: { when: string; title: string; tone: "warm" | "cool" | "spark" }[];
  nextSignal: string;
  gap: { dimKey: RosDim["key"]; dimLabel: string; body: string };
  consensus: { dimLabel: string; body: string };
  strengths: { who: "you" | "ta" | "both"; text: string }[];
  blindspots: { who: "you" | "ta" | "both"; text: string }[];
  collision: { combo: string; name: string; body: string };
  triggers: { you: string; ta: string };
  loop: { actor: "you" | "ta"; action: string }[];
  bridge: string;
  advice: { title: string; body: string }[];
  horizons: { when: string; title: string; body: string }[];
  doDont: { do: string[]; dont: string[] };
  prescription: { warmup: string; chiefComplaint: string; rx: string; followUp: string };
  shareLine: string;
};

export const STAGE_OPTIONS = [
  { id: "crush", label: "暗恋 / 还没在一起", tag: "secret_crush" },
  { id: "ambig", label: "暧昧中（三个月以内）", tag: "ambiguous" },
  { id: "early", label: "在一起不久（三个月到一年）", tag: "early" },
  { id: "mid", label: "在一起一到三年", tag: "mid" },
  { id: "long", label: "在一起三年以上", tag: "long" },
  { id: "married", label: "已婚 / 长期伴侣", tag: "married" },
] as const;
