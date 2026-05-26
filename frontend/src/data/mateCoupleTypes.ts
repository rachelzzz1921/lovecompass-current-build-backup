export type MateCoupleBadge = "ok" | "warn" | "alert" | string;

export type MateConditionRow = {
  field: string;
  label: string;
  source: string;
  male_value: string;
  female_value: string;
  male_sub?: string;
  female_sub?: string;
  badge: MateCoupleBadge;
  badge_label: string;
};

export type MateDealItem = {
  field: string;
  label: string;
  source: string;
  male_text: string;
  female_text: string;
  badge: MateCoupleBadge;
  status_text: string;
  highlight: boolean;
};

export type MateRhythmRow = {
  label: string;
  male_score: number;
  female_score: number;
  note: string;
};

export type MateAttentionItem = {
  id?: string;
  icon: "ok" | "warn" | string;
  title: string;
  desc: string;
  source?: string;
};

export type MateCoupleResult = {
  code: string;
  verdict: {
    score: number;
    title: string;
    oneliner: string;
    desc: string;
    texture?: string | null;
  };
  conditionTable: MateConditionRow[];
  dealItems: {
    highlight: MateDealItem[];
    dim: MateDealItem[];
  };
  rhythm: MateRhythmRow[];
  attention: MateAttentionItem[];
  conclusion: {
    summary: string;
    items: Array<{ field: string; text: string }>;
    action_item?: string | null;
    ai_pending?: boolean;
  };
  supplementComplete: boolean;
  youSupplementComplete: boolean;
  taSupplementComplete: boolean;
  participants?: {
    initiatorSuiteTier?: "lite" | "full";
    partnerSuiteTier?: "lite" | "full";
    initiatorSuiteSlug?: string;
    partnerSuiteSlug?: string;
  };
};
