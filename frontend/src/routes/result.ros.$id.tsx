import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowLeft, ChevronDown, Copy, Link2, Sparkles, Sun, Cloud, CloudSun, CloudRain, CloudLightning,
  Star, AlertCircle, Lightbulb, Compass, Bot, Share2,
} from "lucide-react";
import { toast } from "sonner";
import { REL_STAGES, type RosSingleResult } from "@/data/rosTypes";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { mapApiSingleToRosResult } from "@/lib/mapRosResult";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

export const Route = createFileRoute("/result/ros/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "你们的关系画像 · MIRROR" },
      { name: "description", content: "ROS 关系测评 · 单边关系画像。" },
    ],
  }),
  component: RosResultPage,
});

// ---- subdim data (UI-only) ----
const SUB = {
  at: [
    { label: "外在化学", value: 86 },
    { label: "性格吸引", value: 80 },
    { label: "气味相投", value: 78 },
  ],
  in: [
    { label: "表达顺畅度", value: 60 },
    { label: "倾听质量", value: 52 },
    { label: "冲突修复", value: 56 },
  ],
  co: [
    { label: "节奏相合", value: 70 },
    { label: "价值观重叠", value: 62 },
    { label: "生活习惯", value: 60 },
  ],
  ev: [
    { label: "未来共识", value: 52 },
    { label: "成长方向", value: 58 },
  ],
  rk: [
    { label: "情绪触发", value: 46 },
    { label: "信任脆弱", value: 38 },
  ],
} as const;

const LAYER_DETAIL: Record<string, { tags: string[]; bright: string; watch: string; read: string }> = {
  at: {
    tags: ["化学反应真", "外形对味", "气场互补"],
    bright: "见到对方时身体先于脑子反应——这种心跳感不是装的。",
    watch: "新鲜感总会褪色，别只靠吸引维系。",
    read: "化学反应是真实的——这是关系最难造假的底色，把它当礼物，不要当全部。",
  },
  in: {
    tags: ["小摩擦多", "修复慢半拍", "等对方先开口"],
    bright: "你们能聊到深夜不困——只要状态对，话题永远不缺。",
    watch: "争执后习惯各自消化，缺一个『谁先靠近』的默契。",
    read: "日常沟通正在悄悄消耗你们，需要一点固定的修复仪式。",
  },
  co: {
    tags: ["节奏对得上", "价值观重叠多", "细节磨合中"],
    bright: "对『重要的事』看法很一致，吵也吵不出根本分歧。",
    watch: "生活习惯上的小差异容易被放大成情绪。",
    read: "节奏对得上，但在生活细节上还要再耐心一点。",
  },
  ev: {
    tags: ["有未来感", "节奏待对齐", "成长方向一致"],
    bright: "对长期方向有共识，不是只活在当下。",
    watch: "『下一步』什么时候发生，还没真正聊过。",
    read: "未来感还在搭建中——先把『下一步』摆到桌面上聊清。",
  },
  rk: {
    tags: ["情绪易触发", "敏感", "信任在恢复"],
    bright: "你愿意把脆弱说出口——这本身就是一种信任。",
    watch: "一些旧伤还没被对方真正看见，容易反复发作。",
    read: "敏感的部分要被看见，而不是被压下去。",
  },
};

function healthColor(v: number) {
  if (v >= 80) return "oklch(0.68 0.18 285)"; // violet
  if (v >= 65) return "oklch(0.72 0.14 235)"; // blue
  if (v >= 50) return "oklch(0.82 0.14 75)";  // amber
  return "oklch(0.72 0.18 20)";               // coral
}

const WIcons = { sun: Sun, "cloud-sun": CloudSun, cloud: Cloud, "cloud-rain": CloudRain, "cloud-lightning": CloudLightning };

function RosResultPage() {
  const nav = useNavigate();
  const { id } = useParams({ from: "/result/ros/$id" });
  const { pending: authPending } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [r, setR] = useState<RosSingleResult | null>(null);
  const [coupleUnlocked, setCoupleUnlocked] = useState(false);

  useEffect(() => {
    if (authPending) return;
    let cancelled = false;
    setLoading(true);
    lovecompassApi
      .getRosSingleResult(id)
      .then((res) => {
        if (cancelled) return;
        setR(mapApiSingleToRosResult(res.single, res.relationCode || ""));
        setCoupleUnlocked(Boolean(res.coupleUnlocked));
      })
      .catch((e) => {
        if (!cancelled) setError(formatApiErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authPending, id]);

  if (authPending || loading) return <AuthChecking />;
  if (error || !r) {
    return (
      <ApiErrorPanel title="关系画像加载失败" message={error ?? "未找到结果"} backTo={{ to: "/", label: "返回首页" }} />
    );
  }

  const stage = REL_STAGES[r.stageId - 1];
  const resonance = r.resonance?.score ?? Math.round(r.dims.reduce((s, d) => s + d.value, 0) / r.dims.length);
  const tier = r.resonance?.tier ?? "深度共鸣";
  const WIcon = CloudSun;
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/ros/invite/${r.code}` : `/ros/invite/${r.code}`;

  const copy = (text: string, msg: string) => navigator.clipboard.writeText(text).then(() => toast.success(msg)).catch(() => toast.error("复制失败"));

  return (
    <main className="relative min-h-screen" style={{ background: "#0c0e11" }}>
      {/* NAV */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 pt-5 pb-3"
        style={{ background: "linear-gradient(180deg,#0c0e11 70%, transparent)" }}>
        <Link to="/" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="chip font-mono text-[10px] tracking-[0.25em]"
          style={{ background: "rgba(99,102,241,0.12)", color: "#a5a8ff", border: "1px solid rgba(99,102,241,0.3)" }}>
          SET · 02 / ROS
        </span>
      </header>

      <div className="max-w-[480px] mx-auto px-5 pb-24 space-y-7">
        {/* HERO */}
        <section className="pt-3">
          <div className="flex gap-4">
            {/* L 60% */}
            <div className="flex-[3] min-w-0">
              <span className="inline-block text-[10px] font-mono px-2 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                在一起 · 1年 4 个月
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-[52px] leading-none font-semibold text-white tabular-nums tracking-tight">{resonance}</span>
                <span className="text-xs text-white/40">/100</span>
              </div>
              <div className="text-base mt-1" style={{ color: "#a5a8ff" }}>{tier}</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-white/65">
                <WIcon className="h-4 w-4" style={{ color: "#a5a8ff" }} />
                <span>{tier}</span>
              </div>
            </div>
            {/* R 40% */}
            <div className="flex-[2] min-w-0 pl-4 border-l border-white/8">
              <div className="font-display text-2xl text-white leading-tight">{r.type.name}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(r.keywords ?? [r.type.name]).slice(0, 3).map((k) => (
                  <span key={k} className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#c2c4ff" }}>{k}</span>
                ))}
              </div>
              <p className="text-[11px] text-white/55 mt-2 leading-relaxed">{r.type.one_liner}</p>
            </div>
          </div>
        </section>

        {/* 九阶段曲线 */}
        <StageCurve currentId={r.stageId} />

        {/* 下一阶段触发信号 */}
        <section className="rounded-2xl p-4 -mt-2"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.12))",
            border: "1px solid rgba(99,102,241,0.3)",
          }}>
          <div className="flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5" style={{ color: "#a5a8ff" }} />
            <span className="text-[10px] tracking-[0.3em] font-mono" style={{ color: "#a5a8ff" }}>NEXT · 下一阶段触发</span>
          </div>
          <p className="text-sm text-white/85 mt-2 leading-relaxed">
            {coupleUnlocked ? (
              <Link to="/result/ros/couple/$code" params={{ code: r.code }} className="underline text-[#c2c4ff]">
                双人报告已解锁，点击查看
              </Link>
            ) : (
              "完成伴侣测评后，这里会出现下一阶段触发信号。"
            )}
          </p>
        </section>

        {/* 五维手风琴 */}
        <FiveLayerAccordion dims={r.dims} />

        {/* AI 洞察时间线 */}
        <InsightTimeline items={r.insights} />

        {/* 关系处方签 */}
        <section>
          <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-2">PRESCRIPTION</div>
          <p className="text-sm text-white/70 leading-relaxed mb-3 whitespace-pre-line">
            {r.prescription?.warmup}
          </p>
          <div className="rounded-2xl p-5 relative"
            style={{ border: "1.5px dashed rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.04)" }}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-white/10">
              <div className="flex items-center gap-2">
                <div className="font-display text-2xl font-bold" style={{ color: "#a5a8ff" }}>Rx</div>
                <div className="text-xs text-white/70">关系处方</div>
              </div>
              <div className="font-mono text-[10px] tracking-widest text-white/35">MIRROR · ROS</div>
            </div>
            <RxRow label="主诉" value={r.prescription?.chiefComplaint ?? "联结感"} />
            <RxRow label="建议" value={r.prescription?.rx ?? "每周一次不带手机的两小时对话"} multiline />
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-dashed border-white/10">
              <span className="text-xs text-white/50 font-mono">复诊</span>
              <span className="text-sm text-white/85 font-mono">{r.prescription?.followUp ?? "三个月后"}</span>
            </div>
          </div>
        </section>

        {/* 关系码邀请 */}
        <section className="rounded-2xl p-5"
          style={{ border: "1.5px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}>
          <div className="text-[10px] tracking-[0.3em] font-mono text-white/40">YOUR CODE</div>
          <div className="font-mono text-xl tracking-[0.25em] text-white mt-1">{r.code}</div>
          <p className="text-xs text-white/55 mt-2 leading-relaxed">
            把这个码发给 TA，做完 TA 那一侧的 60 题后，你们会同时解锁完整双人报告。
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => copy(r.code, "关系码已复制")}
              className="h-10 rounded-lg text-sm text-white/80 hover:text-white transition"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Copy className="h-3.5 w-3.5 inline mr-1.5" />复制关系码
            </button>
            <button onClick={() => copy(inviteUrl, "邀请链接已复制")}
              className="h-10 rounded-lg text-sm text-white font-medium transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 8px 24px -8px rgba(99,102,241,0.6)" }}>
              <Link2 className="h-3.5 w-3.5 inline mr-1.5" />生成邀请链接
            </button>
          </div>
        </section>

        {/* 底部 CTA */}
        <section className="grid grid-cols-2 gap-3">
          <button onClick={() => nav({ to: "/chat" })}
            className="rounded-2xl p-4 text-left hover:bg-white/[0.04] transition"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Bot className="h-5 w-5 mb-2" style={{ color: "#a5a8ff" }} />
            <div className="text-sm text-white font-medium">找 AI 分析师</div>
            <div className="text-[11px] text-white/50 mt-0.5">深聊这份报告</div>
          </button>
          <button onClick={() => toast.info("分享卡片生成中…")}
            className="rounded-2xl p-4 text-left hover:bg-white/[0.04] transition"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Share2 className="h-5 w-5 mb-2" style={{ color: "#a5a8ff" }} />
            <div className="text-sm text-white font-medium">生成分享卡片</div>
            <div className="text-[11px] text-white/50 mt-0.5">一张图带走</div>
          </button>
        </section>
      </div>
    </main>
  );
}

function RxRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex gap-3 py-1.5">
      <div className="w-10 shrink-0 text-white/45 text-xs font-mono pt-0.5">{label}</div>
      <div className="text-white/90 text-sm font-mono leading-relaxed whitespace-pre-line">{value}</div>
    </div>
  );
}

// ---------- 九阶段曲线 · 山路徒步式 ----------
// Y 越小越高（视觉海拔越高），模拟真实关系起伏
const STAGE_Y = [72, 22, 48, 36, 78, 92, 58, 30, 8];

function StageCurve({ currentId }: { currentId: number }) {
  const W = 440, H = 220, PAD_X = 28, PAD_TOP = 28, PAD_BOTTOM = 30;
  const n = REL_STAGES.length;
  const usableH = H - PAD_TOP - PAD_BOTTOM;
  const xs = Array.from({ length: n }, (_, i) => PAD_X + (i * (W - PAD_X * 2)) / (n - 1));
  const ys = STAGE_Y.map((y) => PAD_TOP + (y / 100) * usableH);

  // smooth bezier
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < n - 1; i++) {
    const cx = (xs[i] + xs[i + 1]) / 2;
    d += ` C ${cx} ${ys[i]}, ${cx} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
  }
  // dashed future-only path
  const curIdx = Math.max(0, Math.min(n - 1, currentId - 1));
  let dFuture = `M ${xs[curIdx]} ${ys[curIdx]}`;
  for (let i = curIdx; i < n - 1; i++) {
    const cx = (xs[i] + xs[i + 1]) / 2;
    dFuture += ` C ${cx} ${ys[i]}, ${cx} ${ys[i + 1]}, ${xs[i + 1]} ${ys[i + 1]}`;
  }

  const stage = REL_STAGES[currentId - 1];
  const start = { x: xs[0], y: ys[0] };
  const end = { x: xs[n - 1], y: ys[n - 1] };

  return (
    <section>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">RELATIONSHIP STAGE · {currentId}/9</div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}>
          <defs>
            <linearGradient id="curveStroke" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#a5a8ff" />
              <stop offset="100%" stopColor="#f0a5d0" />
            </linearGradient>
            <linearGradient id="curveFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="flagGlow"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.55" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
            <radialGradient id="targetGlow"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0" /></radialGradient>
          </defs>

          {/* horizon */}
          <line x1={PAD_X} x2={W - PAD_X} y1={H - PAD_BOTTOM + 4} y2={H - PAD_BOTTOM + 4} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 5" />

          {/* fill under curve */}
          <path d={`${d} L ${xs[n - 1]} ${H - PAD_BOTTOM + 4} L ${xs[0]} ${H - PAD_BOTTOM + 4} Z`} fill="url(#curveFill)" />
          {/* solid past+present path */}
          <path d={d} fill="none" stroke="url(#curveStroke)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          {/* dashed overlay on future portion */}
          <path d={dFuture} fill="none" stroke="#0c0e11" strokeWidth={2.4} />
          <path d={dFuture} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={1.2} strokeDasharray="3 4" strokeLinecap="round" />

          {/* START · 红旗 */}
          <circle cx={start.x} cy={start.y} r={20} fill="url(#flagGlow)" />
          <line x1={start.x} y1={start.y} x2={start.x} y2={start.y - 20} stroke="#fff" strokeWidth={1.4} />
          <path d={`M ${start.x} ${start.y - 20} L ${start.x + 12} ${start.y - 16} L ${start.x} ${start.y - 12} Z`} fill="#ef4444" />

          {/* END · 靶心 */}
          <circle cx={end.x} cy={end.y} r={22} fill="url(#targetGlow)" />
          <circle cx={end.x} cy={end.y} r={9} fill="none" stroke="#fbbf24" strokeWidth={1.3} />
          <circle cx={end.x} cy={end.y} r={5} fill="none" stroke="#fbbf24" strokeWidth={1.1} />
          <circle cx={end.x} cy={end.y} r={2.2} fill="#fbbf24" />

          {/* nodes + labels */}
          {xs.map((x, i) => {
            const id = i + 1;
            const passed = id < currentId;
            const isCur = id === currentId;
            const isEdge = i === 0 || i === n - 1;
            const labelAbove = ys[i] > H / 2; // 节点在下方→label 放上面；反之放下面
            const ly = labelAbove ? ys[i] - 14 : ys[i] + 20;
            return (
              <g key={id}>
                {!isEdge && (
                  <circle
                    cx={x} cy={ys[i]}
                    r={isCur ? 5.5 : 3.2}
                    fill={isCur ? "#fff" : passed ? "#a5a8ff" : "#0c0e11"}
                    stroke={isCur ? "#6366f1" : passed ? "transparent" : "rgba(255,255,255,0.3)"}
                    strokeWidth={isCur ? 2 : 1}
                    strokeDasharray={!passed && !isCur ? "1.5 1.5" : undefined}
                  />
                )}
                {isCur && (
                  <circle cx={x} cy={ys[i]} r={11} fill="none" stroke="#a5a8ff" strokeWidth={1.2} opacity={0.6}>
                    <animate attributeName="r" values="11;17;11" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <text
                  x={x} y={ly}
                  fontSize={10.5}
                  textAnchor="middle"
                  fill={isCur ? "#fff" : passed ? "rgba(240,165,208,0.9)" : "rgba(255,255,255,0.42)"}
                  fontWeight={isCur ? 600 : 500}
                  fontFamily="system-ui"
                >
                  {REL_STAGES[i].name}
                </text>
              </g>
            );
          })}

          {/* 你在这里 bubble */}
          <g transform={`translate(${xs[curIdx] - 28} ${ys[curIdx] + (STAGE_Y[curIdx] > 50 ? -44 : 30)})`}>
            <rect width={56} height={18} rx={9} fill="#6366f1" />
            <text x={28} y={12} textAnchor="middle" fontSize="9.5" fill="#fff" fontFamily="system-ui">你在这里</text>
          </g>

          {/* START / GOAL 标签 */}
          <text x={start.x} y={H - 10} fontSize={9} textAnchor="middle" fill="rgba(239,68,68,0.85)" fontFamily="ui-monospace,monospace">START</text>
          <text x={end.x} y={H - 10} fontSize={9} textAnchor="middle" fill="rgba(251,191,36,0.9)" fontFamily="ui-monospace,monospace">GOAL</text>
        </svg>

        <div className="mt-3 pt-3 border-t border-white/8">
          <div className="text-sm text-white">
            <span className="text-white/50 text-xs mr-2">当前阶段</span>
            <span className="font-medium">{stage.name}</span>
            <span className="text-white/55 ml-2 text-xs">· {stage.caption}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- 五维手风琴 ----------
const LAYER_META: { key: keyof typeof SUB; code: string; label: string }[] = [
  { key: "at", code: "AT", label: "吸引基础" },
  { key: "in", code: "IN", label: "互动质量" },
  { key: "co", code: "CO", label: "兼容程度" },
  { key: "ev", code: "EV", label: "关系走向" },
  { key: "rk", code: "RK", label: "风险信号" },
];

function FiveLayerAccordion({ dims }: { dims: RosSingleResult["dims"] }) {
  const [open, setOpen] = useState<string | null>("at");
  const valueOf = (k: string) => dims.find((d) => d.key === k)?.value ?? 0;

  return (
    <section>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">FIVE LAYERS</div>
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)" }}>
        {LAYER_META.map((m, i) => {
          const v = valueOf(m.key);
          const c = healthColor(v);
          const isOpen = open === m.key;
          const filled = Math.round(v / 10);
          const detail = LAYER_DETAIL[m.key];
          return (
            <div key={m.key} className={i > 0 ? "border-t border-white/[0.06]" : ""}>
              <button
                onClick={() => setOpen(isOpen ? null : m.key)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition"
              >
                <div className="w-1 self-stretch rounded-full"
                  style={{ background: c, minHeight: 32, boxShadow: `0 0 12px -2px ${c}` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/35">{m.code}</span>
                    <span className="text-sm font-medium text-white/90">{m.label}</span>
                    <span className="ml-auto text-xs font-mono tabular-nums" style={{ color: c }}>{v}</span>
                  </div>
                  <div className="font-mono text-[11px] mt-1 tracking-tight" style={{ color: c, opacity: 0.85 }}>
                    {Array.from({ length: 10 }).map((_, j) => (j < filled ? "■" : "□")).join("")}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-white/40 transition"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-8">
                      {/* tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {detail.tags.map((t) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: `${c.replace(")", " / 0.14)")}`, color: c, border: `1px solid ${c.replace(")", " / 0.25)")}` }}>
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* subdims */}
                      <div className="space-y-2 mt-3">
                        {SUB[m.key].map((s) => (
                          <div key={s.label} className="flex items-center gap-3">
                            <div className="text-[11px] text-white/55 w-20 shrink-0">{s.label}</div>
                            <div className="flex-1 h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${s.value}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full" style={{ background: healthColor(s.value) }} />
                            </div>
                            <div className="text-[11px] font-mono text-white/75 w-7 text-right tabular-nums">{s.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* bright / watch two-line */}
                      <div className="mt-3 grid grid-cols-1 gap-1.5">
                        <div className="flex gap-2 text-[11px] leading-relaxed">
                          <span className="shrink-0 text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(99,102,241,0.18)", color: "#c2c4ff" }}>亮点</span>
                          <span className="text-white/75">{detail.bright}</span>
                        </div>
                        <div className="flex gap-2 text-[11px] leading-relaxed">
                          <span className="shrink-0 text-[9px] font-mono mt-0.5 px-1.5 py-0.5 rounded"
                            style={{ background: "rgba(251,191,36,0.16)", color: "#fcd34d" }}>留意</span>
                          <span className="text-white/75">{detail.watch}</span>
                        </div>
                      </div>

                      <div className="h-px bg-white/[0.08] my-3" />
                      <p className="text-xs text-white/60 leading-relaxed">{detail.read}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------- AI 洞察时间线 ----------
const INSIGHT_ICON: Record<string, { Icon: typeof Star; color: string; bg: string }> = {
  edge: { Icon: Star, color: "#a5a8ff", bg: "rgba(99,102,241,0.15)" },
  watch: { Icon: AlertCircle, color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  advice: { Icon: Lightbulb, color: "#34d399", bg: "rgba(52,211,153,0.15)" },
};

function InsightTimeline({ items }: { items: RosSingleResult["insights"] }) {
  return (
    <section>
      <div className="text-[10px] tracking-[0.3em] font-mono text-white/40 mb-3">AI · INSIGHTS</div>
      <div className="relative pl-9">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-white/5 via-white/15 to-white/5" />
        <div className="space-y-5">
          {items.map((it, i) => {
            const meta = INSIGHT_ICON[it.kind] ?? INSIGHT_ICON.edge;
            const Icon = meta.Icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative">
                <div className="absolute -left-[26px] top-0 w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                </div>
                <div className="text-sm text-white font-medium">{it.title}</div>
                <p className="text-xs text-white/60 mt-1 leading-relaxed">{it.body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
