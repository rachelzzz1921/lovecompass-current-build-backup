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

export type RosLayerDetail = {
  displaySummary: string;
  read: string;
  watch: string;
  bright: string;
  tags: string[];
};

export type RosLayerExpansion = {
  subdims: { key: string; label: string; score: number; summary: string }[];
  probe_question: string;
  evidence_text: string;
  tier_label: string;
};

export type RosAiContent = {
  evidence?: Partial<Record<"AT" | "IN" | "CO" | "EV" | "RK", string>>;
  insights?: Partial<Record<"strength" | "watch" | "advice" | "action", { title: string; body: string }>>;
  insights_list?: { kind: "strength" | "watch" | "advice" | "action" | "edge"; title: string; body: string }[];
  prescription?: { complaint: string; prescription_text: string; followup: string };
  blind_spot?: string;
  blind_spot_meta?: {
    layer?: string;
    self_reported_score?: number;
    behavior_implied_score?: number;
    gap?: number;
    blind_spot_text?: string;
  };
  layer_expansion?: Partial<Record<RosDim["key"], RosLayerExpansion>>;
  mode?: string;
  cached?: boolean;
};

export type RosComputed = {
  raw_resonance?: number;
  display_resonance?: number;
  resonance_level?: string;
  relationship_type?: string;
  stage?: string;
  stage_index?: number;
  weather?: string;
  followup_time?: string;
  highest_layer?: string;
  lowest_layer?: string;
  blind_spot_layer?: string;
  blind_spot_gap?: number;
};

export type RosStaticCopy = {
  type?: { tagline?: string; desc?: string; hero_quote?: string };
  stage?: { desc?: string; guide?: string };
  hero_quote?: string;
};

export type RosSingleResult = {
  code: string;
  type: RelType;
  stageId: number;
  timeTag?: string | null;
  timeLabel?: string | null;
  dims: RosDim[];
  layerDetails?: Partial<Record<RosDim["key"], RosLayerDetail>>;
  insights: { kind: "strength" | "watch" | "advice" | "action" | "edge"; title: string; body: string }[];
  resonance?: { score: number; tier: string; desc: string };
  prescription?: {
    warmup: string;
    chiefComplaint: string;
    rx: string;
    followUp: string;
  };
  weather?: { icon: "sun" | "cloud-sun" | "cloud" | "cloud-rain" | "cloud-lightning"; label: string; sub: string };
  computed?: RosComputed;
  aiContent?: RosAiContent;
  staticCopy?: RosStaticCopy;
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

export type CoupleLayerCompare = {
  code: string;
  label: string;
  you: number;
  ta: number;
  gap: number;
  gap_signed?: number;
  diff_level: "consistent" | "moderate" | "significant";
  diff_color: "green" | "blue" | "amber";
  diff_dots: number;
  you_perspective: string;
  ta_perspective: string;
  gap_text: string;
  probe_question?: string;
  you_highlight?: string;
  ta_highlight?: string;
  you_evidence?: string;
  ta_evidence?: string;
};

export type RosCoupleResult = {
  code: string;
  resonance: Resonance;
  perspectives?: { you: { score: number; label: string }; ta: { score: number; label: string } };
  perceptionGap?: {
    value: number;
    level: string;
    color: "green" | "blue" | "amber";
    label: string;
    message: string;
  };
  weather: { icon: "sun" | "cloud-sun" | "cloud" | "cloud-rain" | "cloud-lightning"; label: string; sub: string };
  stageId: number;
  type: RelType;
  dims: CoupleDim[];
  layerCompare?: Partial<Record<RosDim["key"], CoupleLayerCompare>>;
  insights?: { kind: "strength" | "watch" | "advice" | "action"; title: string; body: string }[];
  bond?: {
    combo: string;
    name: string;
    body: string;
    you_type?: string;
    ta_type?: string;
    gap_reason?: string;
    advice_you?: string;
    advice_ta?: string;
    self_unlocked?: boolean;
    partner_unlocked?: boolean;
  };
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
  participants?: {
    initiatorAttemptId?: string;
    partnerAttemptId?: string;
    initiatorSuiteTier?: "lite" | "full";
    partnerSuiteTier?: "lite" | "full";
    initiatorSuiteSlug?: string;
    partnerSuiteSlug?: string;
  };
  ai_content?: {
    insights_list?: { kind: "strength" | "watch" | "advice" | "action"; title: string; body: string }[];
    layer_compare?: Partial<Record<RosDim["key"], CoupleLayerCompare>>;
    gap_evidences?: Record<string, { you_evidence?: string; ta_evidence?: string }>;
    mode?: string;
    cached?: boolean;
    generated_at?: string;
  };
};

export const STAGE_OPTIONS = [
  { id: "crush", label: "暗恋 / 还没在一起", tag: "secret_crush" },
  { id: "ambig", label: "暧昧中（三个月以内）", tag: "ambiguous" },
  { id: "early", label: "在一起不久（三个月到一年）", tag: "early" },
  { id: "mid", label: "在一起一到三年", tag: "mid" },
  { id: "long", label: "在一起三年以上", tag: "long" },
  { id: "married", label: "已婚 / 长期伴侣", tag: "married" },
] as const;
