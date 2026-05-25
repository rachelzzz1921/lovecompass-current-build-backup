import { useCallback, useEffect, useRef, useState } from "react";
import type { RosCoupleResult } from "@/data/rosTypes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import {
  copyCanvasToClipboard,
  drawRosCoupleSummaryShareCard,
  downloadCanvas,
} from "@/lib/rosShareCanvas";

type Props = {
  result: RosCoupleResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RosCoupleShareDialog({ result, open, onOpenChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    drawRosCoupleSummaryShareCard(canvasRef.current, result);
    setPreviewUrl(canvasRef.current.toDataURL("image/png"));
  }, [open, result]);

  const download = useCallback(() => {
    if (!canvasRef.current) return;
    downloadCanvas(canvasRef.current, `mirror-ros-couple-${Date.now()}.png`);
    toast.success("分享卡片已保存");
  }, []);

  const copyImage = useCallback(async () => {
    if (!canvasRef.current) return;
    const ok = await copyCanvasToClipboard(canvasRef.current);
    toast.success(ok ? "图片已复制" : "请使用保存图片");
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#12141a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>双人报告 · 分享卡片</DialogTitle>
        </DialogHeader>
        <canvas ref={canvasRef} className="hidden" aria-hidden />
        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
          {previewUrl ? (
            <img src={previewUrl} alt="MIRROR ROS 双人分享卡片" className="w-full h-auto" />
          ) : (
            <div className="aspect-[3/4] grid place-items-center text-white/45 text-sm">生成中…</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={copyImage} className="rounded-xl border-white/15" disabled={!previewUrl}>
            <Copy className="mr-2 h-4 w-4" /> 复制图片
          </Button>
          <Button onClick={download} className="rounded-xl" disabled={!previewUrl}>
            <Download className="mr-2 h-4 w-4" /> 保存图片
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
