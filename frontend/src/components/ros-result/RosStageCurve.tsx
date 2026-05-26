import { REL_STAGES } from "@/data/rosTypes";

const STAGE_Y = [72, 22, 48, 36, 78, 92, 58, 30, 8];

import type { ExampleSubject } from "@/lib/exampleSubjectCopy";

export function RosStageCurve({
  currentId,
  exampleMode = false,
  exampleSubject,
  examplePartner,
}: {
  currentId: number;
  exampleMode?: boolean;
  exampleSubject?: ExampleSubject;
  examplePartner?: string;
}) {
  const W = 440, H = 220, PAD_X = 28, PAD_TOP = 28, PAD_BOTTOM = 30;
  const n = REL_STAGES.length;
  const usableH = H - PAD_TOP - PAD_BOTTOM;
  const xs = Array.from({ length: n }, (_, i) => PAD_X + (i * (W - PAD_X * 2)) / (n - 1));
  const ys = STAGE_Y.map((y) => PAD_TOP + (y / 100) * usableH);

  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < n - 1; i++) {
    const cx = (xs[i] + xs[i + 1]) / 2;
    d += ` C ${cx} ${ys[i]}, ${cx} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
  }
  const curIdx = Math.max(0, Math.min(n - 1, currentId - 1));
  let dFuture = `M ${xs[curIdx]} ${ys[curIdx]}`;
  for (let i = curIdx; i < n - 1; i++) {
    const cx = (xs[i] + xs[i + 1]) / 2;
    dFuture += ` C ${cx} ${ys[i]}, ${cx} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
  }

  const stage = REL_STAGES[currentId - 1];
  const markerLabel =
    exampleMode && exampleSubject && examplePartner
      ? `${exampleSubject.name}×${examplePartner}`
      : exampleMode && exampleSubject
        ? "关系在此"
        : "你在这里";

  return (
    <section>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">STAGE · {currentId}/9</div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}>
          <defs>
            <linearGradient id="rosCurveStroke" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#a5a8ff" />
              <stop offset="100%" stopColor="#f0a5d0" />
            </linearGradient>
            <linearGradient id="rosCurveFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={PAD_X} x2={W - PAD_X} y1={H - PAD_BOTTOM + 4} y2={H - PAD_BOTTOM + 4} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 5" />
          <path d={`${d} L ${xs[n - 1]} ${H - PAD_BOTTOM + 4} L ${xs[0]} ${H - PAD_BOTTOM + 4} Z`} fill="url(#rosCurveFill)" />
          <path d={d} fill="none" stroke="url(#rosCurveStroke)" strokeWidth={2.2} strokeLinecap="round" />
          <path d={dFuture} fill="none" stroke="#0c0e11" strokeWidth={2.4} />
          <path d={dFuture} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={1.2} strokeDasharray="3 4" strokeLinecap="round" />
          {xs.map((x, i) => {
            const id = i + 1;
            const passed = id < currentId;
            const isCur = id === currentId;
            const isEdge = i === 0 || i === n - 1;
            const labelAbove = ys[i] > H / 2;
            const ly = labelAbove ? ys[i] - 14 : ys[i] + 20;
            return (
              <g key={id}>
                {!isEdge && (
                  <circle cx={x} cy={ys[i]} r={isCur ? 5.5 : 3.2}
                    fill={isCur ? "#fff" : passed ? "#a5a8ff" : "#0c0e11"}
                    stroke={isCur ? "#6366f1" : passed ? "transparent" : "rgba(255,255,255,0.3)"}
                    strokeWidth={isCur ? 2 : 1}
                    strokeDasharray={!passed && !isCur ? "1.5 1.5" : undefined} />
                )}
                {isCur && (
                  <circle cx={x} cy={ys[i]} r={11} fill="none" stroke="#a5a8ff" strokeWidth={1.2} opacity={0.6}>
                    <animate attributeName="r" values="11;17;11" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={x} y={ly} fontSize={10.5} textAnchor="middle"
                  fill={isCur ? "#fff" : passed ? "rgba(240,165,208,0.9)" : "rgba(255,255,255,0.42)"}
                  fontWeight={isCur ? 600 : 500} fontFamily="system-ui">
                  {REL_STAGES[i].name}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${xs[curIdx] - (markerLabel.length > 6 ? 38 : 28)} ${ys[curIdx] + (STAGE_Y[curIdx] > 50 ? -44 : 30)})`}>
            <rect width={markerLabel.length > 6 ? 76 : 56} height={18} rx={9} fill="#6366f1" />
            <text x={(markerLabel.length > 6 ? 76 : 56) / 2} y={12} textAnchor="middle" fontSize="9.5" fill="#fff" fontFamily="system-ui">{markerLabel}</text>
          </g>
        </svg>
        <div className="mt-3 pt-3 border-t border-white/8 text-sm text-white">
          <span className="text-white/50 text-xs mr-2">当前阶段</span>
          <span className="font-medium">{stage.name}</span>
          <span className="text-white/55 ml-2 text-xs">· {stage.caption}</span>
        </div>
      </div>
    </section>
  );
}
