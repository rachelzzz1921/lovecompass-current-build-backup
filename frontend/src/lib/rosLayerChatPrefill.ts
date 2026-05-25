import type { RosSingleResult } from "@/data/rosTypes";

export function rosLayerChatPrefill(
  layerCode: string,
  layerLabel: string,
  layerScore: number,
  probeQuestion: string,
  evidenceSnippet?: string,
) {
  const evidence = evidenceSnippet
    ? `\n答题证据摘要：${evidenceSnippet.slice(0, 120)}${evidenceSnippet.length > 120 ? "…" : ""}`
    : "";
  return [
    `我在看 ROS 报告里的「${layerLabel}」层（${layerCode} · ${layerScore}）。`,
    `问诊问题：${probeQuestion}`,
    evidence,
    "",
    "我的回忆是：",
  ]
    .filter(Boolean)
    .join("\n");
}

export function rosBlindSpotChatPrefill(
  result: RosSingleResult,
  blindSpotText: string,
) {
  const meta = result.aiContent?.blind_spot_meta;
  const layer = meta?.layer;
  const gap = meta?.gap;
  const selfScore = meta?.self_reported_score;
  const implied = meta?.behavior_implied_score;
  const gapLine =
    layer && gap != null
      ? `\n系统检测到 ${layer} 层：自报 ${selfScore} 分 vs 行为暗示约 ${implied} 分（差 ${gap}）。`
      : "";
  return [
    "我想展开了解报告里的「盲区提示」。",
    gapLine,
    "",
    `盲区原文：${blindSpotText}`,
    "",
    "我想补充的是：",
  ]
    .filter(Boolean)
    .join("\n");
}

export function rosPartnerInvitePrefill(layerLabel: string, yourScore: number) {
  return `我已经完成了 ROS 关系测评。我给「${layerLabel}」打了 ${yourScore} 分——很好奇你眼中的我们会差多少？`;
}

export function rosCoupleGapChatPrefill(
  layerLabel: string,
  gap: number,
  gapText: string,
  probeQuestion?: string,
) {
  return [
    "我在看 ROS 双人报告里的层间差距。",
    `维度：${layerLabel}，差值 ${gap} 分。`,
    `差距解读：${gapText.slice(0, 160)}${gapText.length > 160 ? "…" : ""}`,
    probeQuestion ? `想聊的问题：${probeQuestion}` : "",
    "",
    "我的感受是：",
  ]
    .filter(Boolean)
    .join("\n");
}
