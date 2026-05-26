import { useCallback } from "react";
import type { RosCoupleResult } from "@/data/rosTypes";
import { ShareCardDialog } from "@/components/share/ShareCardDialog";
import { drawRosCoupleSummaryShareCard } from "@/lib/share/templates/drawRosCoupleSummaryShareCard";

type Props = {
  result: RosCoupleResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RosCoupleShareDialog({ result, open, onOpenChange }: Props) {
  const draw = useCallback(
    (canvas: HTMLCanvasElement) => drawRosCoupleSummaryShareCard(canvas, result),
    [result],
  );

  return (
    <ShareCardDialog
      open={open}
      onOpenChange={onOpenChange}
      title="双人报告 · 分享卡片"
      filenamePrefix="mirror-ros-couple"
      draw={draw}
      variant="dark"
    />
  );
}
