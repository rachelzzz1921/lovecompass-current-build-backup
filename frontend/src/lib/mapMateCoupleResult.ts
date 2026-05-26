import type { MateCoupleCompareRow, MateCoupleResult } from "@/data/mateCoupleTypes";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapCompareRows(raw: unknown): MateCoupleCompareRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      label: asString(row.label),
      you: asString(row.you),
      ta: asString(row.ta),
      verdict: asString(row.verdict),
      badge: asString(row.badge, "ok"),
    };
  });
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

  const rhythmRaw = raw.rhythm_section as Record<string, unknown> | undefined;
  const youScoreRaw = rhythmRaw?.youScore;
  const taScoreRaw = rhythmRaw?.taScore;
  const hasSupplement = Boolean(raw.condition_compare_table || raw.deal_items_table || raw.engine);

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
    pairSupplement: hasSupplement
      ? {
          supplementComplete: Boolean(raw.supplementComplete),
          youSupplementComplete: Boolean(raw.youSupplementComplete),
          taSupplementComplete: Boolean(raw.taSupplementComplete),
          conditionCompareTable: mapCompareRows(raw.condition_compare_table),
          dealItemsTable: mapCompareRows(raw.deal_items_table),
          rhythmSection: {
            label: asString(rhythmRaw?.label, "育儿分工灵活度"),
            youScore:
              youScoreRaw != null && Number.isFinite(Number(youScoreRaw)) ? Number(youScoreRaw) : null,
            taScore:
              taScoreRaw != null && Number.isFinite(Number(taScoreRaw)) ? Number(taScoreRaw) : null,
            note: asString(rhythmRaw?.note),
          },
          attentionItems: Array.isArray(raw.attention_items)
            ? raw.attention_items.map((item) => {
                const row = item as Record<string, unknown>;
                return {
                  label: asString(row.label),
                  message: asString(row.message),
                  desc: asString(row.desc),
                  badge: asString(row.badge, "warn"),
                };
              })
            : [],
        }
      : undefined,
    participants: {
      initiatorSuiteTier:
        participants.initiatorSuiteTier === "lite" || participants.initiatorSuiteTier === "full"
          ? participants.initiatorSuiteTier
          : undefined,
      partnerSuiteTier:
        participants.partnerSuiteTier === "lite" || participants.partnerSuiteTier === "full"
          ? participants.partnerSuiteTier
          : undefined,
      initiatorSuiteSlug: asString(participants.initiatorSuiteSlug) || undefined,
      partnerSuiteSlug: asString(participants.partnerSuiteSlug) || undefined,
    },
  };
}
