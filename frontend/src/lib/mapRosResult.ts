import type { RosCoupleResult, RosLayerDetail, RosSingleResult } from "@/data/rosTypes";
import { STAGE_OPTIONS } from "@/data/rosTypes";

type ApiSinglePayload = Record<string, unknown>;

const TIME_LABELS: Record<string, string> = Object.fromEntries(
  STAGE_OPTIONS.map((o) => [o.tag, o.label]),
);

function mapLayerDetails(raw: unknown): RosSingleResult["layerDetails"] {
  if (!raw || typeof raw !== "object") return undefined;
  const out: Partial<Record<RosSingleResult["dims"][0]["key"], RosLayerDetail>> = {};
  for (const [key, val] of Object.entries(raw as Record<string, unknown>)) {
    if (!val || typeof val !== "object") continue;
    const item = val as Record<string, unknown>;
    out[key as RosSingleResult["dims"][0]["key"]] = {
      displaySummary: String(item.displaySummary || ""),
      read: String(item.read || ""),
      watch: String(item.watch || ""),
      bright: String(item.bright || ""),
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    };
  }
  return Object.keys(out).length ? out : undefined;
}

export function mapApiSingleToRosResult(
  single: ApiSinglePayload,
  relationCode: string,
): RosSingleResult {
  const relType = (single.relationshipType as Record<string, string>) || {};
  const stage = (single.relationshipStage as Record<string, unknown>) || {};
  const dims = Array.isArray(single.dims) ? single.dims : [];
  const insights = Array.isArray(single.insights) ? single.insights : [];
  const resonance = single.resonance as RosSingleResult["resonance"];
  const timeTag = single.timeTag ? String(single.timeTag) : null;

  return {
    code: relationCode || String(single.relationCode || ""),
    type: {
      key: relType.key || "warm",
      name: relType.name || "温水同行",
      one_liner: relType.one_liner || relType.oneLiner || "",
      description: relType.description || relType.desc || "",
    },
    stageId: Number(stage.id || 4),
    timeTag,
    timeLabel: timeTag ? TIME_LABELS[timeTag] ?? null : null,
    dims: dims.map((d: Record<string, unknown>) => ({
      key: String(d.key || "in") as RosSingleResult["dims"][0]["key"],
      label: String(d.label || ""),
      value: Number(d.value || 0),
      color: String(d.color || "oklch(0.68 0.18 285)"),
    })),
    layerDetails: mapLayerDetails(single.layerDetails),
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
