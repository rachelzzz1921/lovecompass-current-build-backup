import type { MateCoupleResult } from "@/data/mateCoupleTypes";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function mapApiMateCouplePayload(raw: Record<string, unknown>): MateCoupleResult {
  const summary = (raw.relationship_summary ?? raw.coordinate ?? {}) as Record<string, unknown>;
  const analysisRaw = (raw.relationship_analysis ?? {}) as Record<string, Record<string, unknown>>;
  const portraitRaw = (raw.relationship_portrait ?? {}) as Record<string, unknown>;
  const portraitDetail = (portraitRaw.portrait ?? {}) as Record<string, string>;
  const participants = (raw.participants ?? {}) as Record<string, unknown>;
  const risk = (raw.risk_lab ?? {}) as Record<string, unknown>;
  const future = (raw.future_prediction ?? {}) as Record<string, unknown>;
  const advice = (raw.matchmaker_advice ?? {}) as Record<string, unknown>;

  const analysis: MateCoupleResult["analysis"] = {};
  for (const [key, val] of Object.entries(analysisRaw)) {
    analysis[key] = {
      level: asString(val?.level),
      desc: asString(val?.desc),
    };
  }

  return {
    code: asString(raw.code),
    matchingScore: asNumber(summary.matching_score),
    relationshipStatus: asString(summary.relationship_status),
    relationshipSpark: asString(summary.relationship_spark),
    keywords: Array.isArray(summary.keywords) ? summary.keywords.map(String) : [],
    youPosition: asString(participants.youPosition),
    taPosition: asString(participants.taPosition),
    analysis,
    portrait: {
      common: Array.isArray(portraitRaw.common) ? portraitRaw.common.map(String) : [],
      difference: Array.isArray(portraitRaw.difference) ? portraitRaw.difference.map(String) : [],
      detail: portraitDetail,
    },
    riskLab: {
      riskName: asString(risk.risk_name),
      riskLevel: asString(risk.risk_level),
      riskVisual: asString(risk.risk_visual),
      manifest: Array.isArray(risk.manifest) ? risk.manifest.map(String) : [],
      repair: Array.isArray(risk.repair) ? risk.repair.map(String) : [],
    },
    future: {
      stableRelationshipProbability: asNumber(future.stable_relationship_probability),
      marriageAdaptationScore: asNumber(future.marriage_adaptation_score),
      timeline: Array.isArray(future.timeline)
        ? future.timeline.map((item) => {
            const row = item as Record<string, unknown>;
            return { stage: asString(row.stage), text: asString(row.text) };
          })
        : [],
    },
    advice: {
      goodNews: asString(advice.goodNews),
      caution: asString(advice.caution),
      oneChange: asString(advice.oneChange),
    },
  };
}
