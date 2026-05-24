import type {
  MateAdviceCard,
  MateDeepArchive,
  MateIdentityCard,
  MateLensCard,
  MateMarketCoordinate,
  MateMatchmakerRecord,
  MateModule,
  MateResult,
  MateSweetSpot,
  MateTimelineNode,
  MateTraitProfile,
} from "@/data/mateTypes";

type ApiPayload = Record<string, unknown>;

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapIdentityCard(raw: unknown): MateIdentityCard {
  const card = (raw && typeof raw === "object" ? raw : {}) as ApiPayload;
  const pos = (card.positionType as ApiPayload) || {};
  const assetsRaw = Array.isArray(card.assets) ? card.assets : [];
  return {
    title: asString(card.title || pos.name, "择偶坐标"),
    tags: Array.isArray(card.tags || pos.tags) ? (card.tags || pos.tags).map(String) : [],
    tagline: asString(card.tagline || pos.tagline),
    subtitle: asString(card.subtitle || pos.subtitle),
    assets: assetsRaw.map((item) => {
      const a = item as ApiPayload;
      return {
        label: asString(a.label),
        summary: asString(a.summary),
        role: asString(a.role),
      };
    }),
  };
}

function mapMarketCoordinate(raw: unknown): MateMarketCoordinate {
  const m = (raw && typeof raw === "object" ? raw : {}) as ApiPayload;
  const summary = (m.summary as ApiPayload) || {};
  return {
    axisX: asNumber(m.axisX, 50),
    axisY: asNumber(m.axisY, 50),
    horizontalLabel: asString(m.horizontalLabel, "显示度"),
    verticalLabel: asString(m.verticalLabel, "现实支撑"),
    summary: {
      firstImpression: asString(summary.firstImpression),
      longTerm: asString(summary.longTerm),
      retention: asString(summary.retention),
      riskLevel: asString(summary.riskLevel),
    },
    insight: asString(m.insight),
  };
}

function mapRecords(raw: unknown): MateMatchmakerRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const r = item as ApiPayload;
    return {
      id: asString(r.id),
      title: asString(r.title),
      remember: Array.isArray(r.remember) ? r.remember.map(String) : undefined,
      notRemember: Array.isArray(r.notRemember) ? r.notRemember.map(String) : undefined,
      discover: r.discover ? asString(r.discover) : undefined,
      feel: r.feel ? asString(r.feel) : undefined,
      narrative: asString(r.narrative),
    };
  });
}

function mapTimeline(raw: unknown): MateTimelineNode[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const t = item as ApiPayload;
    return {
      day: asNumber(t.day),
      label: asString(t.label),
      mood: asString(t.mood),
      expandable: Boolean(t.expandable),
      danger: t.danger ? asString(t.danger) : undefined,
      advice: t.advice ? asString(t.advice) : undefined,
    };
  });
}

function mapTraitProfile(raw: unknown, fallbackTitle: string): MateTraitProfile {
  const p = (raw && typeof raw === "object" ? raw : {}) as ApiPayload;
  const traitsRaw = (p.traits as ApiPayload) || {};
  const traits: Record<string, number> = {};
  for (const [k, v] of Object.entries(traitsRaw)) {
    traits[k] = asNumber(v, 3);
  }
  return {
    title: asString(p.title, fallbackTitle),
    traits,
    summary: asString(p.summary),
    venues: Array.isArray(p.venues) ? p.venues.map(String) : undefined,
  };
}

function mapSweetSpot(raw: unknown): MateSweetSpot {
  const s = (raw && typeof raw === "object" ? raw : {}) as ApiPayload;
  const profileRaw = (s.profile as ApiPayload) || {};
  const profile: Record<string, string> = {};
  for (const [k, v] of Object.entries(profileRaw)) {
    profile[k] = asString(v);
  }
  return {
    title: asString(s.title, "最高成功概率区"),
    profile,
    successRate: asNumber(s.successRate, 70),
    reason: asString(s.reason),
    summary: asString(s.summary),
  };
}

function mapAdvice(raw: unknown): MateAdviceCard[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const a = item as ApiPayload;
    return {
      title: asString(a.title),
      dont: asString(a.dont),
      do: asString(a.do),
      reason: asString(a.reason),
    };
  });
}

function mapLens(raw: unknown): MateLensCard[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const l = item as ApiPayload;
    return {
      key: asString(l.key),
      title: asString(l.title),
      tag: asString(l.tag),
      body: asString(l.body),
    };
  });
}

function mapDeepArchive(raw: unknown): MateDeepArchive {
  const d = (raw && typeof raw === "object" ? raw : {}) as ApiPayload;
  return {
    title: asString(d.title, "还有1份档案未拆封"),
    items: Array.isArray(d.items) ? d.items.map(String) : [],
    cta: asString(d.cta, "拆开完整档案"),
  };
}

function mapModules(raw: unknown, single: ApiPayload): MateModule[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const m = item as ApiPayload;
    const code = asString(m.code);
    const rawScore = single[code];
    const score = asNumber(rawScore, NaN);
    return {
      code,
      label: asString(m.label),
      displaySummary: asString(m.displaySummary),
      score: Number.isFinite(score) ? score : undefined,
    };
  });
}

export function mapApiSingleToMateResult(attemptId: string, single: ApiPayload): MateResult {
  const pos = (single.positionType as ApiPayload) || {};
  const identityRaw = single.identityCard || {
    title: pos.name,
    tags: pos.tags,
    tagline: pos.tagline,
    subtitle: pos.subtitle,
  };

  return {
    attemptId,
    gender: single.gender === "male" ? "male" : "female",
    positionName: asString(pos.name, "择偶坐标"),
    quadrant: asString(single.quadrant, "Q0"),
    identityCard: mapIdentityCard({ ...identityRaw, positionType: pos }),
    marketCoordinate: mapMarketCoordinate(single.marketCoordinate || single),
    matchmakerRecords: mapRecords(single.matchmakerRecords),
    loveTimeline: mapTimeline(single.loveTimeline),
    upperMatch: mapTraitProfile(single.upperMatch, "能激活你上限的人"),
    sweetSpot: mapSweetSpot(single.sweetSpot),
    lowerMatch: mapTraitProfile(single.lowerMatch, "最容易消耗你的人"),
    secularAdvice: mapAdvice(single.secularAdvice),
    aiLens: mapLens(single.aiLens),
    deepArchive: mapDeepArchive(single.deepArchive),
    socialQuotes: Array.isArray(single.socialQuotes) ? single.socialQuotes.map(String) : [],
    modules: mapModules(single.modules, single),
  };
}

export function mapAttemptToMateResult(attemptId: string, attempt: ApiPayload): MateResult | null {
  const payload = attempt.result_payload;
  if (!payload || typeof payload !== "object") return null;
  if ((payload as ApiPayload).productSet !== "MATE" && (payload as ApiPayload).model !== "MATE_V3") {
    return null;
  }
  return mapApiSingleToMateResult(attemptId, payload as ApiPayload);
}
