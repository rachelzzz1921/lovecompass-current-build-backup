export type SliderFeedback = { range: [number, number]; text: string };

export type SliderReferenceRow = {
  score: number;
  perception?: string;
  behavior?: string;
  desc?: string;
};

export type SliderTierLabel = { range: [number, number]; label: string };

export function feedbackForValue(
  value: number,
  feedback?: SliderFeedback[],
): SliderFeedback | undefined {
  return feedback?.find((item) => value >= item.range[0] && value <= item.range[1]);
}

export function referenceRowAt(
  value: number,
  reference?: SliderReferenceRow[],
): SliderReferenceRow | undefined {
  if (!reference?.length) return undefined;
  const exact = reference.find((row) => row.score === value);
  if (exact) return exact;
  return reference.reduce((best, row) =>
    Math.abs(row.score - value) < Math.abs(best.score - value) ? row : best,
  );
}

export function tierLabelAt(value: number, tierLabels?: SliderTierLabel[]): string | undefined {
  return tierLabels?.find((item) => value >= item.range[0] && value <= item.range[1])?.label;
}

export function referencePrimaryText(row: SliderReferenceRow): string {
  return row.perception ?? row.desc ?? "";
}
