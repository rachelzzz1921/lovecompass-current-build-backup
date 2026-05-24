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

export type MateTraitProfile = {
  title: string;
  traits: Record<string, number>;
  summary: string;
  venues?: string[];
};

export type MateSweetSpot = {
  title: string;
  profile: Record<string, string>;
  successRate: number;
  reason: string;
  summary: string;
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

export type MateResult = {
  attemptId: string;
  gender: "female" | "male";
  positionName: string;
  quadrant: string;
  identityCard: MateIdentityCard;
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
};

export const MATE_NAV_SECTIONS = [
  { id: "identity", label: "档案" },
  { id: "modules", label: "模块" },
  { id: "coordinate", label: "坐标" },
  { id: "observe", label: "观察" },
  { id: "rehearse", label: "预演" },
  { id: "advice", label: "建议" },
  { id: "match", label: "匹配" },
  { id: "lens", label: "分析" },
] as const;

export type MateNavId = (typeof MATE_NAV_SECTIONS)[number]["id"];
