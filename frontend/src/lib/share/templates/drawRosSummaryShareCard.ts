import type { RosSingleResult } from "@/data/rosTypes";
import { drawPortraitShareCard } from "@/lib/share/shareCanvasCore";
import { SHARE_CARD_THEMES } from "@/lib/share/shareCardThemes";

export function drawRosSummaryShareCard(canvas: HTMLCanvasElement, result: RosSingleResult) {
  const topDims = [...result.dims]
    .filter((d) => d.key !== "rk")
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  drawPortraitShareCard(canvas, SHARE_CARD_THEMES.ros, {
    hook: `关系天气 · ${result.weather?.label ?? "多云转晴"}`,
    heroNumber: result.resonance?.score ?? "",
    heroSuffix: "/100",
    badge: result.resonance?.tier ?? "",
    title: result.type.name,
    subtitle: result.type.code,
    quote: result.type.one_liner,
    metrics: topDims.map((d) => ({
      label: d.label,
      caption: d.displaySummary || "表现稳定",
      fill: d.value,
      color: d.color ?? "#a5a8ff",
    })),
    footerLine: result.resonance?.desc || result.insights[0]?.body,
    codeLine: `# ${result.code}`,
  });
}
