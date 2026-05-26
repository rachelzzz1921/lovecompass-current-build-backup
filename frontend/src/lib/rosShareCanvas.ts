/** Canvas helpers for ROS result share exports (heartbeat + prescription). */

import type { RosCoupleResult, RosSingleResult } from "@/data/rosTypes";
import {
  copyCanvasToClipboard,
  downloadCanvas,
  setupCanvas,
  strokeDashedRect,
  wrapText,
} from "@/lib/share/shareCanvasCore";
import { drawRosCoupleSummaryShareCard } from "@/lib/share/templates/drawRosCoupleSummaryShareCard";
import { drawRosSummaryShareCard } from "@/lib/share/templates/drawRosSummaryShareCard";

export {
  copyCanvasToClipboard,
  downloadCanvas,
  drawRosCoupleSummaryShareCard,
  drawRosSummaryShareCard,
};

export function normalizeHeartbeatY(score: number) {
  return 0.1 + (Math.max(0, Math.min(100, score)) / 100) * 0.8;
}

export function buildHeartbeatGeometry(scores: Record<string, number>, rk: number, w: number, h: number) {
  const points = [
    { x: w * 0.1, y: h * (1 - normalizeHeartbeatY(scores.at ?? 0)), label: "AT", val: scores.at },
    { x: w * 0.3, y: h * (1 - normalizeHeartbeatY(scores.in ?? 0)), label: "IN", val: scores.in },
    { x: w * 0.5, y: h * (1 - normalizeHeartbeatY(scores.co ?? 0)), label: "CO", val: scores.co },
    { x: w * 0.7, y: h * (1 - normalizeHeartbeatY(scores.ev ?? 0)), label: "EV", val: scores.ev },
    {
      x: w * 0.9,
      y: h * (1 - normalizeHeartbeatY(100 - rk)),
      label: "RK",
      val: rk,
      rkInverted: true,
    },
  ];
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cx = (points[i].x + points[i + 1].x) / 2;
    d += ` C ${cx} ${points[i].y}, ${cx} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }
  return { d, points, rkRisk: rk > 60 };
}

export function drawHeartbeatShareCard(canvas: HTMLCanvasElement, result: RosSingleResult) {
  const W = 900;
  const H = 520;
  const ctx = setupCanvas(canvas, W, H);
  if (!ctx) return;

  ctx.fillStyle = "#0c0e11";
  ctx.fillRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#141828");
  bg.addColorStop(1, "#0c0e11");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(165, 168, 255, 0.85)";
  ctx.font = "600 22px ui-monospace, monospace";
  ctx.fillText("MIRROR · 关系画像", 48, 52);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "400 18px ui-monospace, monospace";
  ctx.fillText("SET · 02 / ROS", 48, 82);

  const resonance = result.resonance?.score ?? 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 48px Georgia, 'Noto Serif SC', serif";
  ctx.fillText(`${result.type.name}`, 48, 140);

  ctx.fillStyle = "rgba(165, 168, 255, 0.9)";
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillText(`共鸣 ${resonance} · ${result.resonance?.tier ?? ""}`, 48, 178);

  const chartX = 48;
  const chartY = 210;
  const chartW = W - 96;
  const chartH = 180;
  const scoreMap = Object.fromEntries(result.dims.map((d) => [d.key, d.value]));
  const rk = scoreMap.rk ?? 0;
  const { d, points } = buildHeartbeatGeometry(scoreMap, rk, chartW, chartH);

  ctx.save();
  ctx.translate(chartX, chartY);

  const lineGrad = ctx.createLinearGradient(0, 0, chartW, 0);
  lineGrad.addColorStop(0, "#6366f1");
  lineGrad.addColorStop(1, "#f0a5d0");

  const path = new Path2D(d);
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(path);

  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#a5a8ff";
    ctx.fill();
  });

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 16px ui-monospace, monospace";
  points.forEach((p) => {
    const display =
      p.label === "RK"
        ? rk <= 30
          ? "低"
          : rk <= 50
            ? "中"
            : "高"
        : String(Math.round(Number(p.val) || 0));
    ctx.textAlign = "center";
    ctx.fillText(p.label, p.x, chartH + 28);
    ctx.fillText(display, p.x, chartH + 48);
  });

  ctx.restore();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "400 20px Inter, sans-serif";
  ctx.fillText("这段关系的心跳 · 每段关系都有自己的节律", 48, H - 48);

  ctx.fillStyle = "rgba(165, 168, 255, 0.4)";
  ctx.font = "500 16px ui-monospace, monospace";
  ctx.textAlign = "right";
  ctx.fillText("mirror.app", W - 48, H - 48);
}

export function drawPrescriptionShareCard(canvas: HTMLCanvasElement, result: RosSingleResult) {
  const W = 800;
  const H = 960;
  const ctx = setupCanvas(canvas, W, H);
  if (!ctx) return;

  ctx.fillStyle = "#0c0e11";
  ctx.fillRect(0, 0, W, H);

  const pad = 56;
  strokeDashedRect(ctx, pad, pad, W - pad * 2, H - pad * 2);

  ctx.fillStyle = "rgba(165, 168, 255, 0.75)";
  ctx.font = "500 20px ui-monospace, monospace";
  ctx.fillText("MIRROR · ROS", pad + 24, pad + 40);

  ctx.fillStyle = "#a5a8ff";
  ctx.font = "700 72px Georgia, serif";
  ctx.fillText("Rx", pad + 24, pad + 120);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillText("你们的关系处方", pad + 120, pad + 110);

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad + 24, pad + 150);
  ctx.lineTo(W - pad - 24, pad + 150);
  ctx.stroke();
  ctx.setLineDash([]);

  const rx = result.prescription;
  let y = pad + 200;

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 22px ui-monospace, monospace";
  ctx.fillText("主诉", pad + 24, y);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "400 26px ui-monospace, monospace";
  y = wrapText(ctx, rx?.chiefComplaint ?? "联结感", pad + 100, y, W - pad - 130, 34) + 24;

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 22px ui-monospace, monospace";
  ctx.fillText("建议", pad + 24, y);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "400 26px ui-monospace, monospace";
  y = wrapText(ctx, (rx?.rx ?? "").replace(/\n/g, " "), pad + 100, y, W - pad - 130, 34) + 40;

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad + 24, y);
  ctx.lineTo(W - pad - 24, y);
  ctx.stroke();
  ctx.setLineDash([]);

  y += 36;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 22px ui-monospace, monospace";
  ctx.fillText("复诊", pad + 24, y);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "right";
  ctx.fillText(rx?.followUp ?? "三个月后", W - pad - 24, y);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "400 20px Inter, sans-serif";
  wrapText(ctx, rx?.warmup ?? "", pad + 24, H - pad - 100, W - pad * 2, 28);

  ctx.fillStyle = "rgba(165, 168, 255, 0.35)";
  ctx.font = "500 16px ui-monospace, monospace";
  ctx.fillText(`${result.type.name} · 共鸣 ${result.resonance?.score ?? ""}`, pad + 24, H - pad - 36);
}

function coupleScoreMaps(result: RosCoupleResult) {
  const you: Record<string, number> = {};
  const ta: Record<string, number> = {};
  for (const d of result.dims) {
    you[d.key] = d.key === "rk" ? Math.max(0, 100 - d.you) : d.you;
    ta[d.key] = d.key === "rk" ? Math.max(0, 100 - d.ta) : d.ta;
  }
  const youRk = result.dims.find((d) => d.key === "rk")?.you ?? 0;
  const taRk = result.dims.find((d) => d.key === "rk")?.ta ?? 0;
  return { you, ta, youRk, taRk };
}

export function drawDualHeartbeatShareCard(canvas: HTMLCanvasElement, result: RosCoupleResult) {
  const W = 900;
  const H = 560;
  const ctx = setupCanvas(canvas, W, H);
  if (!ctx) return;

  ctx.fillStyle = "#0c0e11";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(165, 168, 255, 0.85)";
  ctx.font = "600 22px ui-monospace, monospace";
  ctx.fillText("MIRROR · 双人心跳", 48, 52);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "400 18px ui-monospace, monospace";
  ctx.fillText(`契合 ${result.resonance.score} · ${result.resonance.tier}`, 48, 82);

  const { you, ta, youRk, taRk } = coupleScoreMaps(result);
  const chartW = W - 96;
  const chartH = 160;
  const youGeo = buildHeartbeatGeometry(you, youRk, chartW, chartH);
  const taGeo = buildHeartbeatGeometry(ta, taRk, chartW, chartH);

  ctx.save();
  ctx.translate(48, 120);

  const youGrad = ctx.createLinearGradient(0, 0, chartW, 0);
  youGrad.addColorStop(0, "#6366f1");
  youGrad.addColorStop(1, "#a5a8ff");
  ctx.strokeStyle = youGrad;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke(new Path2D(youGeo.d));

  ctx.strokeStyle = "rgba(240,165,208,0.85)";
  ctx.setLineDash([10, 6]);
  ctx.lineWidth = 3;
  ctx.stroke(new Path2D(taGeo.d));
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 16px ui-monospace, monospace";
  youGeo.points.forEach((p) => {
    ctx.textAlign = "center";
    ctx.fillText(p.label, p.x, chartH + 32);
  });

  ctx.restore();

  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "400 20px Inter, sans-serif";
  ctx.fillText("实线 · 你 ｜ 虚线 · 对方", 48, H - 48);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(165, 168, 255, 0.4)";
  ctx.font = "500 16px ui-monospace, monospace";
  ctx.fillText("mirror.app", W - 48, H - 48);
}

export function drawCouplePrescriptionShareCard(canvas: HTMLCanvasElement, result: RosCoupleResult) {
  const W = 800;
  const H = 960;
  const ctx = setupCanvas(canvas, W, H);
  if (!ctx) return;

  ctx.fillStyle = "#0c0e11";
  ctx.fillRect(0, 0, W, H);

  const pad = 56;
  strokeDashedRect(ctx, pad, pad, W - pad * 2, H - pad * 2);

  ctx.fillStyle = "rgba(165, 168, 255, 0.75)";
  ctx.font = "500 20px ui-monospace, monospace";
  ctx.fillText("MIRROR · ROS · 双人", pad + 24, pad + 40);

  ctx.fillStyle = "#a5a8ff";
  ctx.font = "700 72px Georgia, serif";
  ctx.fillText("Rx", pad + 24, pad + 120);

  const rx = result.prescription;
  let y = pad + 200;
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 22px ui-monospace, monospace";
  ctx.fillText("主诉", pad + 24, y);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "400 26px ui-monospace, monospace";
  y = wrapText(ctx, rx.chiefComplaint, pad + 100, y, W - pad - 130, 34) + 24;

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("建议", pad + 24, y);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  y = wrapText(ctx, rx.rx.replace(/\n/g, " "), pad + 100, y, W - pad - 130, 34) + 40;

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("复诊", pad + 24, y);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "right";
  ctx.fillText(rx.followUp, W - pad - 24, y);
}
