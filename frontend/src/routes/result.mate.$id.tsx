import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Bot, ChevronDown, ChevronLeft, ChevronRight, Lock, RefreshCw, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { MateLensCard, MateNavId, MateResult, MateTimelineNode } from "@/data/mateTypes";
import { MATE_NAV_SECTIONS } from "@/data/mateTypes";
import { RadarChart } from "@/components/RadarChart";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { mapApiSingleToMateResult } from "@/lib/mapMateResult";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { chatRouteSearch } from "@/lib/chatRouteSearch";

export const Route = createFileRoute("/result/mate/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "择偶坐标档案 · MIRROR" },
      { name: "description", content: "MATE 择偶坐标 · 红娘档案系统。" },
    ],
  }),
  component: MateResultRoute,
});

const ROSE = {
  chip: "rgba(244,114,182,0.12)",
  chipText: "#f9a8d4",
  chipBorder: "rgba(244,114,182,0.35)",
  accent: "#fb7185",
  glow: "rgba(244,114,182,0.18)",
};

function MateResultRoute() {
  const { id } = useParams({ from: "/result/mate/$id" });
  const { pending: authPending } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MateResult | null>(null);

  useEffect(() => {
    if (authPending) return;
    let cancelled = false;
    setLoading(true);
    lovecompassApi
      .getMateSingleResult(id)
      .then((res) => {
        if (cancelled) return;
        setResult(mapApiSingleToMateResult(id, res.single));
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
  if (error || !result) {
    return (
      <ApiErrorPanel title="档案加载失败" message={error ?? "未找到结果"} backTo={{ to: "/", label: "返回首页" }} />
    );
  }

  return <MateResultView result={result} />;
}

function MateResultView({ result }: { result: MateResult }) {
  const [activeNav, setActiveNav] = useState<MateNavId>("identity");
  const [recordIdx, setRecordIdx] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedLens, setExpandedLens] = useState<string | null>(null);
  const [adviceOpen, setAdviceOpen] = useState<number | null>(0);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [coordOpen, setCoordOpen] = useState(false);

  const quotes = result.socialQuotes.length ? result.socialQuotes : ["看起来一般，熟了以后会越来越上头"];
  const moduleRadar = result.modules
    .filter((m) => m.score != null)
    .map((m) => ({
      label: m.label.replace(/模块|资产|净值/g, "").trim() || m.code,
      value: m.score ?? 0,
      color: "#fb7185",
    }));

  const scrollTo = (sectionId: MateNavId) => {
    setActiveNav(sectionId);
    document.getElementById(`mate-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyQuote = () => {
    const text = quotes[quoteIdx % quotes.length];
    navigator.clipboard.writeText(text).then(() => toast.success("已复制到剪贴板")).catch(() => toast.error("复制失败"));
  };

  const record = result.matchmakerRecords[recordIdx];

  return (
    <main className="relative min-h-screen pb-28" style={{ background: "#0f0a0c" }}>
      <header
        className="sticky top-0 z-30 px-4 pt-4 pb-2"
        style={{ background: "linear-gradient(180deg,#0f0a0c 75%, transparent)" }}
      >
        <div className="max-w-[480px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span
            className="chip font-mono text-[10px] tracking-[0.25em]"
            style={{ background: ROSE.chip, color: ROSE.chipText, border: `1px solid ${ROSE.chipBorder}` }}
          >
            SET · 03 / MATE
          </span>
        </div>

        <nav className="max-w-[480px] mx-auto mt-3 flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {MATE_NAV_SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider transition"
              style={{
                background: activeNav === item.id ? ROSE.chip : "rgba(255,255,255,0.04)",
                color: activeNav === item.id ? ROSE.chipText : "rgba(255,255,255,0.55)",
                border: `1px solid ${activeNav === item.id ? ROSE.chipBorder : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="max-w-[480px] mx-auto px-4 space-y-4">
        {/* Module grid preview */}
        <section className="grid grid-cols-2 gap-2 pt-1">
          {[
            { id: "coordinate" as MateNavId, title: "坐标站", sub: "市场定位" },
            { id: "modules" as MateNavId, title: "模块雷达", sub: "FS/MS" },
            { id: "observe" as MateNavId, title: "观察室", sub: "红娘记录" },
            { id: "rehearse" as MateNavId, title: "恋爱预演", sub: "时间轴" },
            { id: "advice" as MateNavId, title: "市场建议", sub: "世俗实用" },
            { id: "match" as MateNavId, title: "匹配区间", sub: "上/下限" },
            { id: "lens" as MateNavId, title: "透视镜", sub: "AI 分析" },
          ].map((card, i) => (
            <button
              key={`${card.title}-${i}`}
              type="button"
              onClick={() => scrollTo(card.id)}
              className="text-left rounded-2xl p-4 transition hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="text-[10px] font-mono tracking-[0.25em] text-white/40">// {card.sub}</div>
              <div className="font-display text-lg text-white mt-1">{card.title}</div>
            </button>
          ))}
        </section>

        {/* Identity card */}
        <section id="mate-identity" className="scroll-mt-28">
          <SectionLabel>ARCHIVE · 身份卡</SectionLabel>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 text-center"
            style={{
              background: `linear-gradient(145deg, ${ROSE.glow}, rgba(255,255,255,0.02))`,
              border: `1px solid ${ROSE.chipBorder}`,
            }}
          >
            <h1 className="font-display text-2xl text-white leading-snug">{result.identityCard.title}</h1>
            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {result.identityCard.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full"
                  style={{ background: ROSE.chip, color: ROSE.chipText }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            <p className="text-sm text-white/75 mt-5 leading-relaxed">{result.identityCard.tagline}</p>
            <p className="text-xs text-white/45 mt-3 italic">{result.identityCard.subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            {result.identityCard.assets.map((asset) => (
              <div
                key={asset.label}
                className="rounded-2xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="text-[10px] text-white/45">{asset.label}</div>
                <div className="text-xs text-white/90 mt-1 leading-snug">{asset.summary}</div>
                <div className="text-[10px] mt-1" style={{ color: ROSE.accent }}>
                  {asset.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Module radar */}
        {result.modules.length > 0 && (
          <section id="mate-modules" className="scroll-mt-28">
            <SectionLabel>MODULES · 模块雷达</SectionLabel>
            <div
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {moduleRadar.length >= 3 ? (
                <div className="flex flex-col items-center">
                  <RadarChart data={moduleRadar} size={260} variant="rose" />
                </div>
              ) : null}
              <div className="mt-4 space-y-2.5">
                {result.modules.map((mod) => (
                  <div key={mod.code} className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <span className="text-[10px] font-mono text-white/40 mr-2">{mod.code}</span>
                      <span className="text-white/85">{mod.label}</span>
                    </div>
                    <span className="text-xs text-white/55">{mod.displaySummary}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Market coordinate */}
        <section id="mate-coordinate" className="scroll-mt-28">
          <SectionLabel>MARKET · 坐标站</SectionLabel>
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <CoordinateChart
              x={result.marketCoordinate.axisX}
              y={result.marketCoordinate.axisY}
              xLabel={result.marketCoordinate.horizontalLabel}
              yLabel={result.marketCoordinate.verticalLabel}
              onSelect={() => setCoordOpen((v) => !v)}
            />
            <AnimatePresence>
              {coordOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-white/8 space-y-2 text-sm">
                    <Row label="第一眼" value={result.marketCoordinate.summary.firstImpression} />
                    <Row label="长期评价" value={result.marketCoordinate.summary.longTerm} />
                    <Row label="长期留存" value={result.marketCoordinate.summary.retention} />
                    <Row label="风险等级" value={result.marketCoordinate.summary.riskLevel} />
                  </div>
                  <blockquote className="mt-4 text-sm text-white/70 border-l-2 pl-3" style={{ borderColor: ROSE.accent }}>
                    {result.marketCoordinate.insight}
                  </blockquote>
                </motion.div>
              )}
            </AnimatePresence>
            {!coordOpen && (
              <button type="button" onClick={() => setCoordOpen(true)} className="text-xs mt-3 text-white/50 hover:text-white/80">
                点击坐标点查看市场摘要 →
              </button>
            )}
          </div>
        </section>

        {/* Matchmaker records */}
        <section id="mate-observe" className="scroll-mt-28">
          <SectionLabel>MATCHMAKER · 观察室</SectionLabel>
          {record && (
            <div
              className="rounded-2xl p-5 min-h-[220px] relative"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-[10px] font-mono tracking-widest text-white/40">【记录{record.id}】</div>
                  <h3 className="font-display text-xl text-white mt-2">{record.title}</h3>
                  {record.remember && (
                    <div className="mt-4 text-sm text-white/80">
                      <div className="text-white/50 text-xs mb-2">对方大概率记住：</div>
                      {record.remember.map((item) => (
                        <div key={item} className="flex items-center gap-2 mt-1">
                          <span style={{ color: ROSE.accent }}>✓</span> {item}
                        </div>
                      ))}
                    </div>
                  )}
                  {record.notRemember && (
                    <div className="mt-3 text-sm text-white/55">
                      <div className="text-xs mb-2">而不是：</div>
                      {record.notRemember.map((item) => (
                        <div key={item} className="flex items-center gap-2 mt-1">
                          <span className="text-white/30">○</span> {item}
                        </div>
                      ))}
                    </div>
                  )}
                  {record.discover && (
                    <p className="mt-4 text-sm text-white/80">
                      对方开始发现：<span className="text-white">"{record.discover}"</span>
                    </p>
                  )}
                  {record.feel && (
                    <p className="mt-4 text-sm text-white/80">
                      对方最容易感觉：<span className="text-white">"{record.feel}"</span>
                    </p>
                  )}
                  <p className="text-xs text-white/45 mt-4">{record.narrative}</p>
                </motion.div>
              </AnimatePresence>
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/8">
                <button
                  type="button"
                  disabled={recordIdx <= 0}
                  onClick={() => setRecordIdx((i) => Math.max(0, i - 1))}
                  className="p-2 rounded-full disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <ChevronLeft className="h-4 w-4 text-white/70" />
                </button>
                <span className="text-[10px] font-mono text-white/40">
                  {recordIdx + 1} / {result.matchmakerRecords.length}
                </span>
                <button
                  type="button"
                  disabled={recordIdx >= result.matchmakerRecords.length - 1}
                  onClick={() => setRecordIdx((i) => Math.min(result.matchmakerRecords.length - 1, i + 1))}
                  className="p-2 rounded-full disabled:opacity-30"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <ChevronRight className="h-4 w-4 text-white/70" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Love timeline */}
        <section id="mate-rehearse" className="scroll-mt-28">
          <SectionLabel>REHEARSAL · 恋爱预演</SectionLabel>
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex gap-4">
              <div className="flex flex-col items-center pt-1">
                {result.loveTimeline.map((node, i) => (
                  <div key={node.label} className="flex flex-col items-center">
                    <div className="text-[10px] font-mono text-white/45 w-12 text-right">{node.label}</div>
                    {i < result.loveTimeline.length - 1 && (
                      <div className="w-px h-10 my-1" style={{ background: "rgba(255,255,255,0.12)" }} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex-1 space-y-6 pt-1">
                {result.loveTimeline.map((node) => (
                  <TimelineNode
                    key={node.label}
                    node={node}
                    expanded={expandedDay === node.day}
                    onToggle={() => setExpandedDay(expandedDay === node.day ? null : node.day)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upper + sweet + lower match */}
        <section id="mate-match" className="scroll-mt-28 space-y-3">
          <SectionLabel>MATCH · 匹配区间</SectionLabel>
          <TraitCard profile={result.upperMatch} tone="upper" />
          <SweetSpotCard spot={result.sweetSpot} />
          <TraitCard profile={result.lowerMatch} tone="lower" />
        </section>

        {/* Secular advice */}
        <section id="mate-advice" className="scroll-mt-28">
          <SectionLabel>REAL · 红娘不会明说的话</SectionLabel>
          <div className="space-y-2">
            {result.secularAdvice.map((card, i) => (
              <div
                key={card.title}
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setAdviceOpen(adviceOpen === i ? null : i)}
                >
                  <span className="font-display text-base text-white">{card.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-white/40 transition ${adviceOpen === i ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {adviceOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 text-sm">
                        {card.dont && (
                          <div>
                            <div className="text-white/40 text-xs mb-1">不要</div>
                            <div className="text-white/70">{card.dont}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-white/40 text-xs mb-1">建议</div>
                          <div className="text-white/90 whitespace-pre-line">{card.do}</div>
                        </div>
                        <div className="text-xs text-white/45">{card.reason}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* AI lens */}
        <section id="mate-lens" className="scroll-mt-28">
          <SectionLabel>LENS · AI透视镜</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {result.aiLens.map((card) => (
              <LensTile
                key={card.key}
                card={card}
                open={expandedLens === card.key}
                onToggle={() => setExpandedLens(expandedLens === card.key ? null : card.key)}
              />
            ))}
          </div>
        </section>

        {/* Deep archive */}
        <section className="scroll-mt-8">
          <div
            className="rounded-3xl p-6 text-center"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.04), ${ROSE.glow})`,
              border: `1px dashed ${ROSE.chipBorder}`,
            }}
          >
            <Lock className="h-5 w-5 mx-auto text-white/40" />
            <h3 className="font-display text-lg text-white mt-3">{result.deepArchive.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/65">
              {result.deepArchive.items.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
            <Link
              to="/chat"
              search={chatRouteSearch(result.attemptId)}
              className="inline-flex items-center gap-2 mt-5 px-5 h-10 rounded-full text-sm font-medium"
              style={{ background: ROSE.chip, color: ROSE.chipText, border: `1px solid ${ROSE.chipBorder}` }}
            >
              <Sparkles className="h-4 w-4" /> {result.deepArchive.cta}
            </Link>
          </div>
        </section>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            to="/chat"
            search={chatRouteSearch(result.attemptId)}
            className="flex items-center justify-center gap-2 h-11 rounded-2xl text-sm"
            style={{ background: ROSE.chip, color: ROSE.chipText, border: `1px solid ${ROSE.chipBorder}` }}
          >
            <Bot className="h-4 w-4" /> 问 AI 分析师
          </Link>
          <button
            type="button"
            onClick={copyQuote}
            className="flex items-center justify-center gap-2 h-11 rounded-2xl text-sm text-white/80"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Share2 className="h-4 w-4" /> 分享档案
          </button>
        </div>
      </div>

      {/* Floating social quote */}
      <div className="fixed bottom-4 inset-x-4 z-40 max-w-[480px] mx-auto">
        <button
          type="button"
          onClick={() => setQuoteIdx((i) => (i + 1) % quotes.length)}
          className="w-full rounded-2xl px-4 py-3 text-left flex items-start gap-3 shadow-xl"
          style={{
            background: "rgba(20,12,16,0.92)",
            border: `1px solid ${ROSE.chipBorder}`,
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono tracking-widest text-white/40 mb-1">别人可能这样评价你</div>
            <p className="text-sm text-white/85 leading-relaxed">"{quotes[quoteIdx % quotes.length]}"</p>
          </div>
          <RefreshCw className="h-4 w-4 shrink-0 mt-1 text-white/40" />
        </button>
      </div>

    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-mono tracking-[0.3em] text-white/40 mb-2 mt-2 flex items-center gap-2">
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/45">{label}</span>
      <span className="text-white/85 text-right">{value}</span>
    </div>
  );
}

function CoordinateChart({
  x,
  y,
  xLabel,
  yLabel,
  onSelect,
}: {
  x: number;
  y: number;
  xLabel: string;
  yLabel: string;
  onSelect: () => void;
}) {
  const px = 12 + (x / 100) * 76;
  const py = 88 - (y / 100) * 76;
  const dots = [
    { cx: 22, cy: 25 },
    { cx: 35, cy: 55 },
    { cx: 68, cy: 30 },
    { cx: 75, cy: 70 },
    { cx: 28, cy: 78 },
  ];
  return (
    <div className="relative aspect-square max-w-[280px] mx-auto">
      <div className="absolute inset-0 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }} />
      <div className="absolute left-1/2 top-[8%] bottom-[12%] w-px -translate-x-1/2 bg-white/10" />
      <div className="absolute top-1/2 left-[8%] right-[8%] h-px -translate-y-1/2 bg-white/10" />
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-white/40">{yLabel} ↑</div>
      <div className="absolute bottom-1 right-3 text-[10px] text-white/40">{xLabel} →</div>
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/15 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${d.cx}%`, top: `${d.cy}%` }}
        />
      ))}
      <button
        type="button"
        onClick={onSelect}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        style={{ left: `${px}%`, top: `${py}%` }}
      >
        <span className="text-lg leading-none" style={{ color: ROSE.accent }}>
          ✦
        </span>
        <span className="text-[10px] text-white/70 mt-0.5">你</span>
      </button>
    </div>
  );
}

function TimelineNode({
  node,
  expanded,
  onToggle,
}: {
  node: MateTimelineNode;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        className="text-left w-full"
        onClick={() => node.expandable && onToggle()}
        disabled={!node.expandable}
      >
        <div className="text-sm text-white/90">{node.mood}</div>
        {node.expandable && (
          <div className="text-[10px] text-white/35 mt-0.5">{expanded ? "收起" : "点击展开"}</div>
        )}
      </button>
      <AnimatePresence>
        {expanded && node.danger && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 rounded-xl text-xs overflow-hidden"
            style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)" }}
          >
            <div className="text-white/50 mb-1">危险提示</div>
            <div className="text-white/80">{node.danger}</div>
            {node.advice && (
              <>
                <div className="text-white/50 mt-2 mb-1">建议</div>
                <div className="text-white/80">{node.advice}</div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarRow({ label, stars }: { label: string; stars: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/55">{label}</span>
      <span className="tracking-widest" style={{ color: ROSE.accent }}>
        {"★".repeat(stars)}
        {"☆".repeat(Math.max(0, 5 - stars))}
      </span>
    </div>
  );
}

function TraitCard({ profile, tone }: { profile: MateResult["upperMatch"]; tone: "upper" | "lower" }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: tone === "upper" ? "rgba(244,114,182,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${tone === "upper" ? ROSE.chipBorder : "rgba(255,255,255,0.07)"}`,
      }}
    >
      <h3 className="font-display text-lg text-white">{profile.title}</h3>
      <div className="mt-3 space-y-2">
        {Object.entries(profile.traits).map(([label, stars]) => (
          <StarRow key={label} label={label} stars={stars} />
        ))}
      </div>
      <blockquote className="mt-4 text-sm text-white/70 border-l-2 pl-3" style={{ borderColor: ROSE.accent }}>
        {profile.summary}
      </blockquote>
      {profile.venues && (
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.venues.map((v) => (
            <span key={v} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-white/60">
              ✓ {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SweetSpotCard({ spot }: { spot: MateResult["sweetSpot"] }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <h3 className="font-display text-lg text-white">{spot.title}</h3>
      <div className="mt-3 space-y-1.5 text-sm">
        {Object.entries(spot.profile).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <span className="text-white/45">{k}</span>
            <span className="text-white/85">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-3xl text-white">{spot.successRate}%</span>
        <span className="text-xs text-white/45">成功率</span>
      </div>
      <p className="text-sm text-white/65 mt-2 leading-relaxed">{spot.reason}</p>
    </div>
  );
}

function LensTile({
  card,
  open,
  onToggle,
}: {
  card: MateLensCard;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="w-full rounded-2xl p-3 text-left min-h-[88px]"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="text-[10px] text-white/40">{card.title}</div>
        <div className="text-xs text-white/90 mt-2 leading-snug">{card.tag}</div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-white/55 mt-2 px-1 leading-relaxed"
          >
            {card.body}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
