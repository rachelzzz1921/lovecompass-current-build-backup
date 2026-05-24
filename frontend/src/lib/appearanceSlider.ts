export type AppearanceReferenceRow = {
  score: number;
  perception: string;
  behavior: string;
};

export type AppearanceTierLabel = {
  range: [number, number];
  label: string;
};

export const APPEARANCE_TIER_LABELS: AppearanceTierLabel[] = [
  { range: [1, 2], label: "自然型" },
  { range: [3, 4], label: "普通辨识度" },
  { range: [5, 6], label: "有记忆点" },
  { range: [7, 8], label: "高辨识度" },
  { range: [9, 10], label: "极高辨识度" },
];

export const APPEARANCE_SLIDER_FOOTNOTE =
  "注意：不是素颜自拍视角，也不是美颜后的自己。\n参考：现实社交 + 日常状态 + 外形管理后的综合感受";

export function appearanceTierLabel(value: number): string {
  const tier = APPEARANCE_TIER_LABELS.find(
    (item) => value >= item.range[0] && value <= item.range[1],
  );
  return tier?.label ?? "有记忆点";
}

export function appearanceReferenceRow(
  value: number,
  reference?: AppearanceReferenceRow[],
): AppearanceReferenceRow | undefined {
  if (!reference?.length) return undefined;
  const exact = reference.find((row) => row.score === value);
  if (exact) return exact;
  return reference.reduce((best, row) =>
    Math.abs(row.score - value) < Math.abs(best.score - value) ? row : best,
  );
}
