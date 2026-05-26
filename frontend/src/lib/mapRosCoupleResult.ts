import type { RosCoupleResult } from "@/data/rosTypes";

const WEATHER_ICONS = ["sun", "cloud-sun", "cloud", "cloud-rain", "cloud-lightning"] as const;

function asWeatherIcon(raw: unknown): RosCoupleResult["weather"]["icon"] {
  const s = String(raw ?? "cloud-sun");
  return (WEATHER_ICONS.includes(s as (typeof WEATHER_ICONS)[number])
    ? s
    : "cloud-sun") as RosCoupleResult["weather"]["icon"];
}

function fallbackInsights(result: Partial<RosCoupleResult>): RosCoupleResult["insights"] {
  return [
    {
      kind: "strength",
      title: "你们的共同高光",
      body: result.consensus?.body ?? "你们有一些维度感受很接近——这是关系的底色。",
    },
    {
      kind: "watch",
      title: "最值得用心的差距",
      body: result.gap?.body ?? "有些层的感受还不完全一致，值得一次不被打扰的对话。",
    },
    {
      kind: "advice",
      title: "给你们两个人的话",
      body: result.bond
        ? `对你：${result.bond.advice_you ?? "先把感受说具体。"}\n对方：${result.bond.advice_ta ?? "留一句回应，而不是沉默。"}`
        : "试着各自说一件「我感受到的是什么」，不评判，只描述。",
    },
    {
      kind: "action",
      title: "这周可以做的一件事",
      body:
        "各自写下「我觉得我们做得很好的一件事」和「我希望我们更用心的一件事」，然后交换着读。",
    },
  ];
}

export function mapApiCouplePayload(raw: Record<string, unknown>): RosCoupleResult {
  const ai = (raw.ai_content ?? {}) as Record<string, unknown>;
  const layerCompare =
    (raw.layerCompare as RosCoupleResult["layerCompare"]) ||
    (ai.layer_compare as RosCoupleResult["layerCompare"]);
  const insights =
    (raw.insights as RosCoupleResult["insights"]) ||
    (ai.insights_list as RosCoupleResult["insights"]);
  const bond = (raw.bond as RosCoupleResult["bond"]) || undefined;
  const collision = raw.collision as RosCoupleResult["collision"];
  const weatherRaw = (raw.weather ?? {}) as Record<string, unknown>;

  const partial = raw as unknown as RosCoupleResult;
  const mapped: RosCoupleResult = {
    ...partial,
    weather: {
      icon: asWeatherIcon(weatherRaw.icon),
      label: String(weatherRaw.label ?? "多云转晴"),
      sub: String(weatherRaw.sub ?? "有一些小摩擦，但在往好的方向走"),
    },
    layerCompare,
    insights: insights?.length ? insights : fallbackInsights(partial),
    bond: bond ?? {
      combo: collision?.combo ?? "",
      name: collision?.name ?? "独特组合",
      body: collision?.body ?? "",
      self_unlocked: false,
      partner_unlocked: false,
    },
    collision: collision ?? {
      combo: bond?.combo ?? "",
      name: bond?.name ?? "",
      body: bond?.body ?? "",
    },
    perspectives: (raw.perspectives as RosCoupleResult["perspectives"]) ?? {
      you: { score: partial.resonance?.score ?? 0, label: "你的视角" },
      ta: { score: partial.resonance?.score ?? 0, label: "对方视角" },
    },
    perceptionGap: (raw.perceptionGap as RosCoupleResult["perceptionGap"]) ?? {
      value: 0,
      level: "consistent",
      color: "green",
      label: "感知高度一致",
      message: "你们对这段关系的感受比较接近。",
    },
    participants: raw.participants as RosCoupleResult["participants"],
    ai_content: (raw.ai_content as RosCoupleResult["ai_content"]) ?? undefined,
  };

  return mapped;
}
