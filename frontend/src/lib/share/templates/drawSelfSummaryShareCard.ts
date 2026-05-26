import type { SelfResult } from "@/data/mockResult";
import { drawPortraitShareCard } from "@/lib/share/shareCanvasCore";
import { SHARE_CARD_THEMES } from "@/lib/share/shareCardThemes";

export function drawSelfSummaryShareCard(
  canvas: HTMLCanvasElement,
  result: SelfResult,
  characterRevealed: boolean,
) {
  const topDims = [...result.dimensions].sort((a, b) => b.value - a.value).slice(0, 3);
  const topTrait = result.coreTraits.find((t) => t.highlight) ?? result.coreTraits[0];

  drawPortraitShareCard(canvas, SHARE_CARD_THEMES.self, {
    hook: result.archetype.badge,
    title: characterRevealed ? result.character.name : result.archetype.name,
    subtitle: characterRevealed
      ? `${result.archetype.name} · ${result.archetype.code}`
      : result.archetype.code,
    heroNumber: result.overallScore,
    heroSuffix: "/100",
    badge: characterRevealed ? undefined : "揭晓红楼人格后可见全名 →",
    quote: result.archetype.tagline,
    metrics: topDims.map((d) => ({
      label: d.label,
      caption: d.displaySummary ?? "",
      fill: d.value,
      color: d.color,
    })),
    footerLine: topTrait ? `核心侧写 · ${topTrait.title}` : undefined,
    codeLine: characterRevealed ? result.character.pinyin : undefined,
  });
}
