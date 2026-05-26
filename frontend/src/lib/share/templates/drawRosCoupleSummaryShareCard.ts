import type { RosCoupleResult } from "@/data/rosTypes";
import { drawPortraitShareCard } from "@/lib/share/shareCanvasCore";
import { SHARE_CARD_THEMES } from "@/lib/share/shareCardThemes";

export function drawRosCoupleSummaryShareCard(canvas: HTMLCanvasElement, result: RosCoupleResult) {
  const gap = result.perceptionGap;
  const gapLine = gap ? `感知差值 ${gap.value} · ${gap.label}` : undefined;

  const metrics = [
    result.highlights?.glow
      ? { label: "高光", caption: result.highlights.glow, fill: 78, color: "#a5a8ff" }
      : null,
    result.highlights?.shadow
      ? { label: "阴影", caption: result.highlights.shadow, fill: 52, color: "#f0a5d0" }
      : null,
    result.strengths?.[0]
      ? {
          label: "优势",
          caption: result.strengths[0].text,
          fill: 68,
          color: "#6366f1",
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; caption: string; fill: number; color: string }>;

  drawPortraitShareCard(canvas, SHARE_CARD_THEMES["ros-couple"], {
    hook: "双人关系报告",
    heroNumber: result.resonance.score,
    heroSuffix: "/100",
    badge: result.resonance.tier,
    title: result.type.name,
    subtitle: result.bond?.name ? `依恋碰撞 · ${result.bond.name}` : result.type.code,
    quote: gapLine ?? result.shareLine ?? result.type.one_liner,
    metrics,
    codeLine: `# ${result.code}`,
  });
}
