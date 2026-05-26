import type {
  MateAttentionItem,
  MateConditionRow,
  MateCoupleResult,
  MateDealItem,
  MateRhythmRow,
} from "@/data/mateCoupleTypes";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapConditionRows(raw: unknown): MateConditionRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      field: asString(row.field),
      label: asString(row.label),
      source: asString(row.source),
      male_value: asString(row.male_value),
      female_value: asString(row.female_value),
      male_sub: asString(row.male_sub) || undefined,
      female_sub: asString(row.female_sub) || undefined,
      badge: asString(row.badge, "ok"),
      badge_label: asString(row.badge_label),
    };
  });
}

function mapDealItems(raw: unknown): MateDealItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      field: asString(row.field),
      label: asString(row.label),
      source: asString(row.source),
      male_text: asString(row.male_text),
      female_text: asString(row.female_text),
      badge: asString(row.badge, "ok"),
      status_text: asString(row.status_text),
      highlight: Boolean(row.highlight),
    };
  });
}

function mapRhythm(raw: unknown): MateRhythmRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      label: asString(row.label),
      male_score: asNumber(row.male_score),
      female_score: asNumber(row.female_score),
      note: asString(row.note),
    };
  });
}

function mapAttention(raw: unknown): MateAttentionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = item as Record<string, unknown>;
    return {
      id: asString(row.id) || undefined,
      icon: asString(row.icon, "warn"),
      title: asString(row.title),
      desc: asString(row.desc),
      source: asString(row.source) || undefined,
    };
  });
}

export function mapApiMateCouplePayload(raw: Record<string, unknown>): MateCoupleResult {
  const verdictRaw = (raw.verdict ?? {}) as Record<string, unknown>;
  const dealRaw = (raw.deal_items ?? {}) as Record<string, unknown>;
  const conclusionRaw = (raw.conclusion ?? {}) as Record<string, unknown>;
  const participants = (raw.participants ?? {}) as Record<string, unknown>;

  const legacyScore = asNumber(
    (raw.relationship_summary as Record<string, unknown> | undefined)?.matching_score,
  );

  return {
    code: asString(raw.code),
    verdict: {
      score: asNumber(verdictRaw.score, legacyScore),
      title: asString(verdictRaw.title),
      oneliner: asString(verdictRaw.oneliner),
      desc: asString(verdictRaw.desc),
      texture: asString(verdictRaw.texture) || null,
    },
    conditionTable: mapConditionRows(raw.condition_table),
    dealItems: {
      highlight: mapDealItems(dealRaw.highlight),
      dim: mapDealItems(dealRaw.dim),
    },
    rhythm: mapRhythm(raw.rhythm),
    attention: mapAttention(raw.attention),
    conclusion: {
      summary: asString(conclusionRaw.summary),
      items: Array.isArray(conclusionRaw.items)
        ? conclusionRaw.items.map((item) => {
            const row = item as Record<string, unknown>;
            return { field: asString(row.field), text: asString(row.text) };
          })
        : [],
      action_item: asString(conclusionRaw.action_item) || null,
      ai_pending: Boolean(conclusionRaw.ai_pending),
    },
    supplementComplete: Boolean(raw.supplementComplete),
    youSupplementComplete: Boolean(raw.youSupplementComplete),
    taSupplementComplete: Boolean(raw.taSupplementComplete),
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
