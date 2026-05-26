import type {
  RosAiContent,
  RosComputed,
  RosLayerDetail,
  RosSingleResult,
  RosStaticCopy,
} from "@/data/rosTypes";
import { STAGE_OPTIONS } from "@/data/rosTypes";

type ApiSinglePayload = Record<string, unknown>;

const TIME_LABELS: Record<string, string> = Object.fromEntries(
  STAGE_OPTIONS.map((o) => [o.tag, o.label]),
);

const WEATHER_ICONS = new Set(["sun", "cloud-sun", "cloud", "cloud-rain", "cloud-lightning"]);

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

function mapAiContent(raw: unknown): RosAiContent | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const item = raw as Record<string, unknown>;
  return {
    evidence: item.evidence as RosAiContent["evidence"],
    insights: item.insights as RosAiContent["insights"],
    insights_list: Array.isArray(item.insights_list)
      ? (item.insights_list as RosAiContent["insights_list"])
      : undefined,
    prescription: item.prescription as RosAiContent["prescription"],
    blind_spot: item.blind_spot ? String(item.blind_spot) : undefined,
    blind_spot_meta: item.blind_spot_meta as RosAiContent["blind_spot_meta"],
    layer_expansion: item.layer_expansion as RosAiContent["layer_expansion"],
    mode: item.mode ? String(item.mode) : undefined,
    cached: Boolean(item.cached),
  };
}

function mapInsights(
  single: ApiSinglePayload,
  ai: RosAiContent | undefined,
): RosSingleResult["insights"] {
  if (ai?.insights_list?.length) {
    return ai.insights_list.map((item) => ({
      kind: (item.kind === "edge" ? "strength" : item.kind) as RosSingleResult["insights"][0]["kind"],
      title: item.title,
      body: item.body,
    }));
  }
  if (ai?.insights && typeof ai.insights === "object") {
    const order: Array<"strength" | "watch" | "advice" | "action"> = [
      "strength",
      "watch",
      "advice",
      "action",
    ];
    return order
      .map((kind) => {
        const block = ai.insights?.[kind];
        if (!block) return null;
        return { kind, title: block.title, body: block.body };
      })
      .filter(Boolean) as RosSingleResult["insights"];
  }
  const insights = Array.isArray(single.insights) ? single.insights : [];
  return insights.map((item: Record<string, string>) => ({
    kind: (item.kind === "edge" ? "strength" : item.kind || "watch") as RosSingleResult["insights"][0]["kind"],
    title: item.title || "",
    body: item.body || "",
  }));
}

function mapPrescription(
  single: ApiSinglePayload,
  ai: RosAiContent | undefined,
): RosSingleResult["prescription"] {
  const base = single.prescription as RosSingleResult["prescription"];
  const aiRx = ai?.prescription;
  if (!aiRx) return base;
  return {
    warmup: base?.warmup ?? "",
    chiefComplaint: aiRx.complaint || base?.chiefComplaint || "",
    rx: aiRx.prescription_text || base?.rx || "",
    followUp: aiRx.followup || base?.followUp || "三个月后",
  };
}

export function mapApiSingleToRosResult(
  single: ApiSinglePayload,
  relationCode: string,
): RosSingleResult {
  const relType = (single.relationshipType as Record<string, string>) || {};
  const stage = (single.relationshipStage as Record<string, unknown>) || {};
  let dims = Array.isArray(single.dims) ? single.dims : [];
  if (!dims.length && Array.isArray(single.layers)) {
    dims = (single.layers as Array<Record<string, unknown>>).map((layer) => ({
      key: String(layer.code ?? "").toLowerCase(),
      label: String(layer.name ?? ""),
      value: Number(layer.displayScore ?? layer.score ?? 0),
      color: String(layer.color ?? ""),
    }));
  }
  const resonance = single.resonance as RosSingleResult["resonance"];
  const timeTag = single.timeTag ? String(single.timeTag) : null;
  const aiContent = mapAiContent(single.ai_content);
  const staticCopy = (single.static_copy as RosStaticCopy) || undefined;
  const computed = (single.computed as RosComputed) || undefined;
  const weatherRaw = single.weather as { icon?: string; label?: string; sub?: string } | undefined;
  const weatherIcon = (
    weatherRaw?.icon && WEATHER_ICONS.has(weatherRaw.icon) ? weatherRaw.icon : "cloud-sun"
  ) as NonNullable<RosSingleResult["weather"]>["icon"];

  return {
    code: relationCode || String(single.relationCode || ""),
    type: {
      key: relType.key || "warm",
      name: relType.name || "温水同行",
      one_liner: relType.one_liner || relType.oneLiner || staticCopy?.type?.tagline || "",
      description: relType.description || relType.desc || staticCopy?.type?.desc || "",
    },
    stageId: Number(stage.id || computed?.stage_index || 4),
    timeTag,
    timeLabel: timeTag ? TIME_LABELS[timeTag] ?? null : null,
    dims: dims.map((d: Record<string, unknown>) => ({
      key: String(d.key || "in") as RosSingleResult["dims"][0]["key"],
      label: String(d.label || ""),
      value: Number(d.value || 0),
      color: String(d.color || "oklch(0.68 0.18 285)"),
    })),
    layerDetails: mapLayerDetails(single.layerDetails),
    insights: mapInsights(single, aiContent),
    resonance,
    prescription: mapPrescription(single, aiContent),
    weather: weatherRaw
      ? { icon: weatherIcon, label: weatherRaw.label || "多云转晴", sub: weatherRaw.sub || "" }
      : undefined,
    computed,
    aiContent,
    staticCopy,
    keywords: Array.isArray(single.keywords) ? (single.keywords as string[]) : undefined,
  };
}

export { mapApiCouplePayload } from "@/lib/mapRosCoupleResult";
