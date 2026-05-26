import { useCallback } from "react";
import type { RosSingleResult } from "@/data/rosTypes";
import { ShareCardDialog } from "@/components/share/ShareCardDialog";
import { drawRosSummaryShareCard } from "@/lib/share/templates/drawRosSummaryShareCard";

type Props = {
  result: RosSingleResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RosShareCardDialog({ result, open, onOpenChange }: Props) {
  const draw = useCallback(
    (canvas: HTMLCanvasElement) => drawRosSummaryShareCard(canvas, result),
    [result],
  );

  return (
    <ShareCardDialog
      open={open}
      onOpenChange={onOpenChange}
      title="关系画像 · 分享卡片"
      filenamePrefix="mirror-ros"
      draw={draw}
      variant="dark"
    />
  );
}
