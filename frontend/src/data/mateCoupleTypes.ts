export type MateCoupleCompareRow = {
  label: string;
  you: string;
  ta: string;
  verdict: string;
  badge: "ok" | "warn" | "alert" | string;
};

export type MateCoupleModule = { level: string; desc: string };

export type MateCoupleResult = {
  code: string;
  matchingScore: number;
  relationshipStatus: string;
  relationshipSpark: string;
  keywords: string[];
  youPosition: string;
  taPosition: string;
  analysis: Record<string, MateCoupleModule>;
  portrait: {
    common: string[];
    difference: string[];
    detail: Record<string, string>;
  };
  riskLab: {
    riskName: string;
    riskLevel: string;
    riskVisual: string;
    manifest: string[];
    repair: string[];
  };
  future: {
    stableRelationshipProbability: number;
    marriageAdaptationScore: number;
    timeline: Array<{ stage: string; text: string }>;
  };
  advice: {
    goodNews: string;
    caution: string;
    oneChange: string;
  };
  pairSupplement?: {
    supplementComplete: boolean;
    youSupplementComplete: boolean;
    taSupplementComplete: boolean;
    conditionCompareTable: MateCoupleCompareRow[];
    dealItemsTable: MateCoupleCompareRow[];
    rhythmSection: {
      label: string;
      youScore: number | null;
      taScore: number | null;
      note: string;
    };
    attentionItems: Array<{ label: string; message: string; desc: string; badge: string }>;
  };
  participants?: {
    initiatorSuiteTier?: "lite" | "full";
    partnerSuiteTier?: "lite" | "full";
    initiatorSuiteSlug?: string;
    partnerSuiteSlug?: string;
  };
};
