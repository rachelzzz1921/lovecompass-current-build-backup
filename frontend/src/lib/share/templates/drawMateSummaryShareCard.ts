import type { MateResult } from "@/data/mateTypes";
import { drawPortraitShareCard } from "@/lib/share/shareCanvasCore";
import { SHARE_CARD_THEMES } from "@/lib/share/shareCardThemes";

const MATE_MODULE_COLORS = ["#fb7185", "#f472b6", "#fbbf24", "#34d399", "#60a5fa"];

export function drawMateSummaryShareCard(canvas: HTMLCanvasElement, result: MateResult) {
  const quote =
    result.socialQuotes[0] ??
    result.identityCard.tagline ??
    result.identityCard.subtitle ??
    "看起来一般，熟了以后会越来越上头";

  const modules = [...result.modules]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);

  drawPortraitShareCard(canvas, SHARE_CARD_THEMES.mate, {
    hook: `择偶坐标 · ${result.positionName}`,
    title: result.identityCard.title,
    subtitle: result.identityCard.subtitle || result.quadrant,
    badge: result.marketCoordinate?.summary?.riskLevel ?? result.quadrant,
    quote,
    metrics: modules.map((m, i) => ({
      label: m.label,
      caption: m.displaySummary,
      fill: m.score ?? 55,
      color: MATE_MODULE_COLORS[i % MATE_MODULE_COLORS.length],
    })),
    footerLine: result.sweetSpot?.title ?? result.upperMatch?.title,
    codeLine: result.identityCard.tags.slice(0, 3).map((t) => `#${t}`).join(" "),
  });
}
