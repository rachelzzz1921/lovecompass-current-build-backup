import { useCallback, useEffect, useRef, useState } from "react";
import type { SelfResult } from "@/data/mockResult";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { toast } from "sonner";

const W = 1080;
const H = 1440;

function drawShareCard(canvas: HTMLCanvasElement, result: SelfResult, characterRevealed: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = W;
  canvas.height = H;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1a1528");
  bg.addColorStop(0.5, "#12101c");
  bg.addColorStop(1, "#0e0c14");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(180, 160, 255, 0.15)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.fillStyle = "rgba(200, 195, 230, 0.55)";
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillText("MIRROR · 关系画像", 96, 120);

  ctx.fillStyle = "#f0ecff";
  ctx.font = "700 72px Georgia, 'Noto Serif SC', serif";
  if (characterRevealed) {
    ctx.fillText(result.character.name, 96, 260);
    ctx.fillStyle = "rgba(220, 210, 255, 0.85)";
    ctx.font = "500 36px Inter, sans-serif";
    ctx.fillText(result.archetype.name, 96, 330);
  } else {
    ctx.fillText(result.archetype.name, 96, 260);
    ctx.fillStyle = "rgba(180, 170, 220, 0.65)";
    ctx.font = "400 28px Inter, sans-serif";
    ctx.fillText("揭晓红楼人格后可见 →", 96, 310);
  }

  ctx.font = "400 28px monospace";
  ctx.fillStyle = "rgba(180, 170, 220, 0.7)";
  ctx.fillText(result.archetype.code, 96, characterRevealed ? 380 : 350);

  ctx.fillStyle = "rgba(230, 225, 250, 0.9)";
  ctx.font = "italic 32px Georgia, 'Noto Serif SC', serif";
  wrapText(ctx, `「${result.archetype.tagline}」`, 96, 460, W - 192, 44);

  const topDim = [...result.dimensions].sort((a, b) => b.value - a.value)[0];
  if (topDim) {
    ctx.fillStyle = "rgba(200, 195, 230, 0.75)";
    ctx.font = "500 26px Inter, sans-serif";
    ctx.fillText(topDim.label, 96, 680);
    ctx.fillStyle = "rgba(230, 225, 250, 0.85)";
    ctx.font = "400 24px Inter, sans-serif";
    ctx.fillText(topDim.displaySummary ?? "", 96, 720);

    const barX = 96;
    const barY = 750;
    const barW = W - 192;
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(barX, barY, barW, 16);
    ctx.fillStyle = "rgba(160, 140, 255, 0.85)";
    ctx.fillRect(barX, barY, (barW * topDim.value) / 100, 16);
  }

  const tags = ["# 关系画像", "# MIRROR", "# 把爱当真"];
  ctx.font = "500 24px Inter, sans-serif";
  ctx.fillStyle = "rgba(180, 170, 220, 0.65)";
  tags.forEach((tag, i) => ctx.fillText(tag, 96, 860 + i * 40));

  ctx.fillStyle = "rgba(160, 150, 200, 0.55)";
  ctx.font = "400 26px Inter, sans-serif";
  ctx.fillText("mirror.app", 96, H - 96);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const chars = [...text];
  let line = "";
  let cy = y;
  for (const ch of chars) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = ch;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cy);
}

type Props = {
  result: SelfResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterRevealed?: boolean;
};

export function ShareCardDialog({ result, open, onOpenChange, characterRevealed = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    drawShareCard(canvasRef.current, result, characterRevealed);
    setPreviewUrl(canvasRef.current.toDataURL("image/png"));
  }, [open, result, characterRevealed]);

  const download = useCallback(() => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `mirror-self-${Date.now()}.png`;
    a.click();
    toast.success("分享卡片已保存");
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>分享卡片</DialogTitle>
        </DialogHeader>
        <canvas ref={canvasRef} className="hidden" aria-hidden />
        <div className="rounded-xl overflow-hidden border border-border/50 bg-black/40">
          {previewUrl ? (
            <img src={previewUrl} alt="MIRROR 分享卡片" className="w-full h-auto" />
          ) : (
            <div className="aspect-[3/4] grid place-items-center text-muted-foreground text-sm">生成中…</div>
          )}
        </div>
        <Button onClick={download} className="w-full rounded-xl" disabled={!previewUrl}>
          <Download className="mr-2 h-4 w-4" /> 保存图片
        </Button>
      </DialogContent>
    </Dialog>
  );
}
