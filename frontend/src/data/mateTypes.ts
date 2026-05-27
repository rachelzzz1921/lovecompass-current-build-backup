/** MATE V3 card-matrix result types */

export type MateAssetCard = {
  label: string;
  summary: string;
  role: string;
};

export type MateIdentityCard = {
  title: string;
  tags: string[];
  tagline: string;
  subtitle: string;
  assets: MateAssetCard[];
};

export type MateModuleAccordion = {
  code: string;
  dimension: string;
  display: string;
  visual: string;
  tag: string;
  subBadges: string[];
  answerEvidence: string;
  marketMapping: string;
};

export type MateReverseCard = {
  front: { title: string; subtitle: string; content: string; tip: string };
  back: { title: string; subtitle: string; content: string; mechanism?: string; cost?: string; shareTip?: string };
};

export type MateObserveSlice = {
  slice: string;
  title: string;
  correctTraits: string;
  missingTraits: string;
};

export type MateRehearseEpisode = {
  name: string;
  time: string;
  desc: string;
  plot: string;
  partnerPsychology: string;
  warning: string;
  suggestion: string;
  comfortIndex: string;
};

export type MateSimulator = {
  title: string;
  slogan: string;
  diagnosis: string;
  slider: { name: string; boostPercent: number; method: string; max?: number };
  /** 支持 {{boost}} {{baseline}} {{projected}} 占位符 */
  dynamicText: string;
  baselineDisplay: number;
  baselineLabel?: string;
  projectedDisplay?: number;
  leverEvidence?: string;
  peerAxis?: { label: string; value: number };
  targetArchetype?: string;
};

export type MateInsight = {
  kind: "strength" | "watch" | "match" | "growth";
  title: string;
  body: string;
};

export type MateAdviceV4 = {
  goodNews: string;
  warning: string;
  oneChange?: string;
};

export type MateMatchZone = {
  sliderTitle: string;
  zones: string[];
  userZone: string;
  targetPortrait: string;
  matchingReason: string;
  meetScene: string;
  riskPortrait: string;
  sweetScore?: number;
  upperScore?: number;
  lowerScore?: number;
  stableProbability?: number;
  marriageAdaptScore?: number;
};

export type MateLensGridItem = { title: string; desc: string };

export type MateProfileEngine = {
  main_type: string;
  sub_type: string;
  trait_atoms: string[];
  behavior_atoms: string[];
  relationship_atoms: string[];
  scene_atoms: string[];
};

export type MateIdentityDossier = MateIdentityCard & {
  subTitle?: string;
  quadrantResult?: string;
  quadrantDesc?: string;
  slogan?: string;
  badges?: Array<{ name: string; result: string }>;
};

export type MateMarketCoordinate = {
  axisX: number;
  axisY: number;
  horizontalLabel: string;
  verticalLabel: string;
  summary: {
    firstImpression: string;
    longTerm: string;
    retention: string;
    riskLevel: string;
  };
  insight: string;
};

export type MateMatchmakerRecord = {
  id: string;
  title: string;
  remember?: string[];
  notRemember?: string[];
  discover?: string;
  feel?: string;
  narrative: string;
};

export type MateTimelineNode = {
  day: number;
  label: string;
  mood: string;
  expandable?: boolean;
  danger?: string;
  advice?: string;
};

export type MatePartnerPortrait = {
  id: string;
  name: string;
  tags: string[];
  snapshot: string;
  matchScore?: number;
  stableProbability?: number;
};

export type MateTraitProfile = {
  title: string;
  traits: Record<string, number>;
  summary: string;
  venues?: string[];
  matchScore?: number;
  stableProbability?: number;
  marriageAdaptScore?: number;
  bandLabel?: string;
  portraits?: MatePartnerPortrait[];
  warning?: string;
};

export type MateSweetSpot = {
  title: string;
  profile: Record<string, string>;
  successRate: number;
  reason: string;
  summary: string;
  matchScore?: number;
  stableProbability?: number;
  marriageAdaptScore?: number;
  bandLabel?: string;
  portraits?: MatePartnerPortrait[];
};

export type MateAdviceCard = {
  title: string;
  dont: string;
  do: string;
  reason: string;
};

export type MateLensCard = {
  key: string;
  title: string;
  tag: string;
  body: string;
};

export type MateDeepArchive = {
  title: string;
  items: string[];
  cta: string;
};

export type MateModule = {
  code: string;
  label: string;
  displaySummary: string;
  score?: number;
};

export type MateAiContent = {
  mode?: "deterministic" | "ai" | "cached";
  cached?: boolean;
  status?: "pending" | "ready";
  generated_at?: string;
};

export type MateScoreScope = {
  label: string;
  shortLabel?: string;
  hint: string;
  bandHint?: string;
};

export type MateResult = {
  attemptId: string;
  gender: "female" | "male";
  positionName: string;
  quadrant: string;
  identityCard: MateIdentityDossier;
  marketCoordinate: MateMarketCoordinate;
  matchmakerRecords: MateMatchmakerRecord[];
  loveTimeline: MateTimelineNode[];
  upperMatch: MateTraitProfile;
  sweetSpot: MateSweetSpot;
  lowerMatch: MateTraitProfile;
  secularAdvice: MateAdviceCard[];
  aiLens: MateLensCard[];
  deepArchive: MateDeepArchive;
  socialQuotes: string[];
  modules: MateModule[];
  /** V4.1 engine fields */
  profileEngine?: MateProfileEngine;
  moduleAccordions?: MateModuleAccordion[];
  reverse?: MateReverseCard;
  observeSlices?: MateObserveSlice[];
  rehearseEpisodes?: MateRehearseEpisode[];
  simulator?: MateSimulator;
  adviceV4?: MateAdviceV4;
  matchZone?: MateMatchZone;
  lensGrid?: MateLensGridItem[];
  footerMarquee?: { marquee: string[]; intervalMs: number };
  aiContent?: MateAiContent;
  insights?: MateInsight[];
  scoreScope?: MateScoreScope;
};

export const MATE_NAV_SECTIONS = [
  { id: "modules", label: "得分", icon: "📊" },
  { id: "identity", label: "档案", icon: "📄" },
  { id: "coordinate", label: "坐标", icon: "📍" },
  { id: "simulator", label: "模拟", icon: "🎛️" },
  { id: "observe", label: "观察", icon: "🪞" },
  { id: "rehearse", label: "预演", icon: "🎬" },
  { id: "advice", label: "建议", icon: "📋" },
  { id: "match", label: "匹配", icon: "💡" },
  { id: "lens", label: "透视", icon: "🔭" },
] as const;

export type MateNavId = (typeof MATE_NAV_SECTIONS)[number]["id"];
