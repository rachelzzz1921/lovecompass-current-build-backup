import type { RosCoupleResult, RosSingleResult } from "@/data/rosTypes";

type ApiSinglePayload = Record<string, unknown>;

export function mapApiSingleToRosResult(
  single: ApiSinglePayload,
  relationCode: string,
): RosSingleResult {
  const relType = (single.relationshipType as Record<string, string>) || {};
  const stage = (single.relationshipStage as Record<string, unknown>) || {};
  const dims = Array.isArray(single.dims) ? single.dims : [];
  const insights = Array.isArray(single.insights) ? single.insights : [];
  const resonance = single.resonance as RosSingleResult["resonance"];

  return {
    code: relationCode || String(single.relationCode || ""),
    type: {
      key: relType.key || "warm",
      name: relType.name || "温水同行",
      one_liner: relType.one_liner || relType.oneLiner || "",
      description: relType.description || relType.desc || "",
    },
    stageId: Number(stage.id || 4),
    dims: dims.map((d: Record<string, unknown>) => ({
      key: String(d.key || "in") as RosSingleResult["dims"][0]["key"],
      label: String(d.label || ""),
      value: Number(d.value || 0),
      color: String(d.color || "oklch(0.68 0.18 285)"),
    })),
    insights: insights.map((item: Record<string, string>) => ({
      kind: (item.kind || "edge") as "edge" | "watch" | "advice",
      title: item.title || "",
      body: item.body || "",
    })),
    resonance,
    prescription: single.prescription as RosSingleResult["prescription"],
    keywords: Array.isArray(single.keywords) ? (single.keywords as string[]) : undefined,
  };
}

export function mapApiCouplePayload(couple: Record<string, unknown>): RosCoupleResult {
  return couple as unknown as RosCoupleResult;
}
