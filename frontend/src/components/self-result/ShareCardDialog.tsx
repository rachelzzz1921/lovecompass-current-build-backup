import { useCallback } from "react";
import type { SelfResult } from "@/data/mockResult";
import { ShareCardDialog } from "@/components/share/ShareCardDialog";
import { drawSelfSummaryShareCard } from "@/lib/share/templates/drawSelfSummaryShareCard";

type Props = {
  result: SelfResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterRevealed?: boolean;
};

/** @deprecated 请直接用 `@/components/share/ShareCardDialog` + `drawSelfSummaryShareCard` */
export function SelfShareCardDialog({ result, open, onOpenChange, characterRevealed = false }: Props) {
  const draw = useCallback(
    (canvas: HTMLCanvasElement) => drawSelfSummaryShareCard(canvas, result, characterRevealed),
    [result, characterRevealed],
  );

  return (
    <ShareCardDialog
      open={open}
      onOpenChange={onOpenChange}
      title="自我画像 · 分享卡片"
      filenamePrefix="mirror-self"
      draw={draw}
    />
  );
}
