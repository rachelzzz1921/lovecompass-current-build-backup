import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { copyCanvasToClipboard, downloadCanvas } from "@/lib/share/shareCanvasCore";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  filenamePrefix: string;
  draw: (canvas: HTMLCanvasElement) => void;
  /** 深色 ROS/MATE 弹层 */
  variant?: "default" | "dark";
};

export function ShareCardDialog({
  open,
  onOpenChange,
  title,
  filenamePrefix,
  draw,
  variant = "default",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    draw(canvasRef.current);
    setPreviewUrl(canvasRef.current.toDataURL("image/png"));
  }, [open, draw]);

  const download = useCallback(() => {
    if (!canvasRef.current) return;
    downloadCanvas(canvasRef.current, `${filenamePrefix}-${Date.now()}.png`);
    toast.success("分享卡片已保存");
  }, [filenamePrefix]);

  const copyImage = useCallback(async () => {
    if (!canvasRef.current) return;
    const ok = await copyCanvasToClipboard(canvasRef.current);
    toast.success(ok ? "图片已复制到剪贴板" : "请使用保存图片");
  }, []);

  const dark = variant === "dark";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          dark
            ? "max-w-md bg-[#12141a] border-white/10 text-white"
            : "max-w-md"
        }
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <canvas ref={canvasRef} className="hidden" aria-hidden />
        <div
          className={
            dark
              ? "rounded-xl overflow-hidden border border-white/10 bg-black/40"
              : "rounded-xl overflow-hidden border border-border/50 bg-black/40"
          }
        >
          {previewUrl ? (
            <img src={previewUrl} alt={title} className="w-full h-auto" />
          ) : (
            <div
              className={`aspect-[3/4] grid place-items-center text-sm ${
                dark ? "text-white/45" : "text-muted-foreground"
              }`}
            >
              生成中…
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={copyImage}
            className={dark ? "rounded-xl border-white/15" : "rounded-xl"}
            disabled={!previewUrl}
          >
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
