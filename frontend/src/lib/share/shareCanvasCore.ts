/** Canvas 分享卡基础绘制工具 —— 各套题模板共用。 */

import type { ShareCardTheme } from "@/lib/share/shareCardThemes";

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const paragraphs = text.split("\n");
  let cy = y;
  for (const para of paragraphs) {
    const chars = [...para];
    let line = "";
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
    if (line) {
      ctx.fillText(line, x, cy);
      cy += lineHeight;
    }
  }
  return cy;
}

export function strokeDashedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color = "rgba(165, 168, 255, 0.45)",
) {
  ctx.save();
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

export function drawDotGrid(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  for (let x = 64; x < w; x += 48) {
    for (let y = 64; y < h; y += 48) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = width;
  canvas.height = height;
  return ctx;
}

export function drawPortraitBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: ShareCardTheme,
) {
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, theme.gradient[0]);
  bg.addColorStop(0.45, theme.gradient[1]);
  bg.addColorStop(1, theme.gradient[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  drawDotGrid(ctx, w, h, "rgba(255,255,255,0.04)");

  const glow = ctx.createRadialGradient(w * 0.82, h * 0.12, 20, w * 0.82, h * 0.12, 320);
  glow.addColorStop(0, theme.accentGlow);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

export type ShareMetricBar = {
  label: string;
  caption: string;
  fill: number;
  color: string;
};

export type PortraitShareCardSlots = {
  hook?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  heroNumber?: string | number;
  heroSuffix?: string;
  quote?: string;
  metrics?: ShareMetricBar[];
  footerLine?: string;
  codeLine?: string;
};

const PAD = 96;
const INNER_W = 1080 - PAD * 2;

export function drawPortraitShareCard(
  canvas: HTMLCanvasElement,
  theme: ShareCardTheme,
  slots: PortraitShareCardSlots,
) {
  const W = 1080;
  const H = 1440;
  const ctx = setupCanvas(canvas, W, H);
  if (!ctx) return;

  drawPortraitBackground(ctx, W, H, theme);
  strokeDashedRect(ctx, 48, 48, W - 96, H - 96, theme.accentSoft.replace("0.85", "0.35"));

  ctx.fillStyle = theme.accentSoft;
  ctx.font = "500 28px ui-monospace, monospace";
  ctx.fillText(theme.brand, PAD, 120);

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "400 24px ui-monospace, monospace";
  ctx.fillText(theme.setLabel, PAD, 158);

  if (slots.hook) {
    ctx.fillStyle = theme.chipBg;
    const hookW = ctx.measureText(slots.hook).width + 48;
    roundRect(ctx, PAD, 178, hookW, 44, 10);
    ctx.fill();
    ctx.fillStyle = theme.accent;
    ctx.font = "600 22px Inter, sans-serif";
    ctx.fillText(slots.hook, PAD + 24, 208);
  }

  let y = slots.hook ? 280 : 240;

  if (slots.heroNumber !== undefined && slots.heroNumber !== "") {
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 96px Georgia, 'Noto Serif SC', serif";
    const numStr = String(slots.heroNumber);
    ctx.fillText(numStr, PAD, y);
    const numW = ctx.measureText(numStr).width;
    if (slots.heroSuffix) {
      ctx.fillStyle = "rgba(255,255,255,0.42)";
      ctx.font = "400 36px Inter, sans-serif";
      ctx.fillText(slots.heroSuffix, PAD + numW + 14, y - 8);
    }
    y += 24;
    if (slots.badge) {
      ctx.fillStyle = theme.accent;
      ctx.font = "600 38px Inter, sans-serif";
      ctx.fillText(slots.badge, PAD, y + 36);
      y += 72;
    } else {
      y += 48;
    }
  }

  ctx.fillStyle = "#f0ecff";
  ctx.font = "700 64px Georgia, 'Noto Serif SC', serif";
  y = wrapText(ctx, slots.title, PAD, y + (slots.heroNumber !== undefined ? 24 : 0), INNER_W, 72) + 8;

  if (slots.subtitle) {
    ctx.fillStyle = "rgba(220, 210, 255, 0.72)";
    ctx.font = "500 32px Inter, sans-serif";
    y = wrapText(ctx, slots.subtitle, PAD, y + 12, INNER_W, 42) + 8;
  }

  if (slots.quote) {
    ctx.fillStyle = "rgba(230, 225, 250, 0.88)";
    ctx.font = "italic 34px Georgia, 'Noto Serif SC', serif";
    y = wrapText(ctx, `「${slots.quote}」`, PAD, y + 28, INNER_W, 48) + 16;
  }

  if (slots.metrics?.length) {
    y += 20;
    ctx.fillStyle = "rgba(200, 195, 230, 0.55)";
    ctx.font = "500 24px ui-monospace, monospace";
    ctx.fillText("// HIGHLIGHTS", PAD, y);
    y += 36;

    for (const m of slots.metrics.slice(0, 4)) {
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      ctx.font = "600 28px Inter, sans-serif";
      ctx.fillText(m.label, PAD, y);
      ctx.fillStyle = "rgba(255,255,255,0.52)";
      ctx.font = "400 24px Inter, sans-serif";
      const capY = wrapText(ctx, m.caption, PAD + 280, y - 22, INNER_W - 280, 32);
      y = Math.max(y + 8, capY) + 12;

      const barY = y;
      const barW = INNER_W;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRect(ctx, PAD, barY, barW, 14, 7);
      ctx.fill();
      const fillW = Math.max(8, (barW * Math.max(0, Math.min(100, m.fill))) / 100);
      ctx.fillStyle = m.color;
      roundRect(ctx, PAD, barY, fillW, 14, 7);
      ctx.fill();
      y = barY + 40;
    }
  }

  if (slots.footerLine) {
    ctx.fillStyle = "rgba(180, 170, 220, 0.62)";
    ctx.font = "400 26px Inter, sans-serif";
    wrapText(ctx, slots.footerLine, PAD, H - 220, INNER_W, 36);
  }

  theme.hashtags.forEach((tag, i) => {
    ctx.fillStyle = "rgba(180, 170, 220, 0.55)";
    ctx.font = "500 24px Inter, sans-serif";
    ctx.fillText(tag, PAD, H - 180 + i * 36);
  });

  if (slots.codeLine) {
    ctx.fillStyle = "rgba(160, 150, 200, 0.48)";
    ctx.font = "400 22px ui-monospace, monospace";
    ctx.fillText(slots.codeLine, PAD, H - 130);
  }

  ctx.fillStyle = "rgba(160, 150, 200, 0.55)";
  ctx.font = "400 26px Inter, sans-serif";
  ctx.fillText("mirror.app", PAD, H - 72);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}
