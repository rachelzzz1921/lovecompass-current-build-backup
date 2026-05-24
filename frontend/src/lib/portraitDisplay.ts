import type { PortraitAttemptSummary } from "@/lib/lovecompassApi";

export function portraitHeadline(
  item: PortraitAttemptSummary,
  productSet: string,
): string {
  if (productSet === "ROS") {
    return item.relationshipType ?? item.attachmentType ?? "关系画像";
  }
  if (productSet === "MATE") {
    return item.matePosition ?? item.attachmentType ?? "择偶坐标";
  }
  return item.attachmentType ?? item.archetypeCode ?? "关系画像";
}

export function portraitMetaLine(
  item: PortraitAttemptSummary,
  productSet: string,
): string | null {
  if (productSet === "SELF" && item.archetypeCode && item.attachmentType) {
    return `红楼人格 · ${item.archetypeCode}`;
  }
  if (productSet === "ROS" && item.relationshipStage) {
    return `阶段 · ${item.relationshipStage}`;
  }
  if (productSet === "MATE" && item.quadrant) {
    return `象限 · ${item.quadrant}`;
  }
  return null;
}

export function portraitIndexLabel(productSet: string): string {
  if (productSet === "ROS") return "共振";
  if (productSet === "MATE") return "坐标";
  return "INDEX";
}
