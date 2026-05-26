import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown, Share2, Sparkles, Eye, Heart, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import type { MateResult, MatePartnerPortrait } from "@/data/mateTypes";
import { renderMateSimulatorText } from "@/lib/buildExampleMateSimulator";
import { resolveRehearseEpisodes } from "@/lib/mateRehearseEpisodes";
import { mateLayout } from "@/lib/mateLayout";
import { MATE_THEME as T } from "@/lib/mateTheme";

export function MateIdentityDossier({ result }: { result: MateResult }) {
  const id = result.identityCard;
  const title = id.quadrantResult || result.positionName;
  const titleChars = [...title];

  return (
    <div className="text-center space-y-5 py-2">
      <div>
        <div className={mateLayout.monoLabel}>MIRROR · 择偶坐标档案</div>
        <div className="text-[10px] font-mono text-white/30 mt-1">
          SET 03 / MATE · {result.gender === "female" ? "女版" : "男版"}
        </div>
      </div>

      <h1 className="font-display text-2xl sm:text-[1.65rem] text-white leading-snug px-1">
        {titleChars.map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.02 }}
            className="inline-block"
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className={`${mateLayout.prose} italic max-w-md mx-auto`}
      >
        「{id.slogan || id.tagline}」
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {id.tags.map((tag) => (
          <span key={tag} className="text-xs text-white/55">
            #{tag}
          </span>
        ))}
      </motion.div>

      <div className="sakura-divider max-w-[12rem] mx-auto" />

      <div className={`${mateLayout.statRow} justify-center text-left max-w-md mx-auto`}>
        {(id.badges?.length
          ? id.badges.map((b) => ({ label: b.name, summary: b.result, role: "" }))
          : id.assets
        )
          .slice(0, 3)
          .map((asset) => (
            <div key={asset.label} className="min-w-[5.5rem] flex-1">
              <div className={mateLayout.monoLabel}>{asset.label}</div>
              <p className={`${mateLayout.proseSm} mt-1`}>{asset.summary}</p>
              {"role" in asset && asset.role ? (
                <p className="text-xs text-sakura/90 mt-0.5">{asset.role}</p>
              ) : null}
            </div>
          ))}
      </div>
    </div>
  );
}

export function MateModuleAccordionPanel({
  result,
  initialOpen,
}: {
  result: MateResult;
  initialOpen?: string | null;
}) {
  const [open, setOpen] = useState<string | null>(initialOpen ?? null);
  const items = result.moduleAccordions?.length ? result.moduleAccordions : [];

  useEffect(() => {
    if (initialOpen) setOpen(initialOpen);
  }, [initialOpen]);

  if (!items.length) return null;

  return (
    <div className="divide-y divide-white/8">
      {items.map((mod) => (
        <div key={mod.code}>
          <button
            type="button"
            className="w-full py-4 text-left flex items-start justify-between gap-4 group"
            onClick={() => setOpen(open === mod.code ? null : mod.code)}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-white/40">{mod.code}</span>
                <span className="text-sm text-white/90">{mod.dimension}</span>
              </div>
              <p className={`${mateLayout.caption} mt-1`}>{mod.visual}</p>
            </div>
            <div className="text-right shrink-0 pt-0.5">
              <span className="text-xs text-sakura/90">{mod.tag}</span>
              <div className="text-xs text-white/55 mt-1">{mod.display}</div>
              <ChevronDown
                className={`h-4 w-4 text-white/35 ml-auto mt-1 transition group-hover:text-white/55 ${open === mod.code ? "rotate-180" : ""}`}
              />
            </div>
          </button>
          <AnimatePresence initial={false}>
            {open === mod.code && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-5 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {mod.subBadges.map((b) => (
                      <span key={b} className="text-[11px] text-white/55">
                        {b}
                      </span>
                    ))}
                  </div>
                  <p className={mateLayout.proseSm}>{mod.answerEvidence}</p>
                  <p className={`${mateLayout.proseSm} ${mateLayout.rail} border-sakura/40 text-white/65`}>
                    {mod.marketMapping}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function MateParamSimulator({ result }: { result: MateResult }) {
  const sim = result.simulator;
  const sliderMax = sim?.slider.max ?? 25;
  const [boost, setBoost] = useState(sim?.slider.boostPercent ?? 12);
  if (!sim) return null;

  const baseline = sim.baselineDisplay;
  const projected = Math.min(100, baseline + boost);
  const baselineLabel = sim.baselineLabel ?? sim.slider.name;
  const narrative = sim.dynamicText.includes("{{boost}}")
    ? renderMateSimulatorText(sim.dynamicText, {
        boost,
        baseline,
        projected,
        baselineLabel,
      })
    : boost !== sim.slider.boostPercent
      ? sim.dynamicText.replaceAll(String(sim.slider.boostPercent), String(boost))
      : sim.dynamicText;

  const beforePos = Math.max(2, Math.min(98, baseline));
  const afterPos = Math.max(2, Math.min(98, projected));

  return (
    <div className="rounded-2xl p-5 border border-white/8 bg-white/[0.03]">
      <div className="text-[10px] font-mono tracking-[0.3em] text-white/40">{sim.title}</div>
      <p className="text-sm text-white/80 mt-2 leading-relaxed">{sim.slogan}</p>
      <p className="text-xs text-white/55 mt-2 leading-relaxed">{sim.diagnosis}</p>

      {sim.peerAxis ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl px-3 py-2.5 border border-white/8 bg-white/[0.02]">
            <div className="text-[10px] font-mono text-white/40">{sim.peerAxis.label}</div>
            <div className="text-lg font-mono tabular-nums text-white/85 mt-0.5">{sim.peerAxis.value}</div>
            <div className="text-[10px] text-white/40 mt-0.5">对照轴 · 暂不变</div>
          </div>
          <div
            className="rounded-xl px-3 py-2.5 border border-pink-500/25 bg-pink-500/[0.06]"
          >
            <div className="text-[10px] font-mono text-pink-200/70">{baselineLabel}</div>
            <div className="text-lg font-mono tabular-nums text-white mt-0.5">
              <span className="text-white/50">{baseline}</span>
              <span className="text-white/35 mx-1">→</span>
              <span style={{ color: T.accent }}>{projected}</span>
            </div>
            <div className="text-[10px] text-pink-200/60 mt-0.5">模拟调整中</div>
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span>{sim.slider.name}</span>
          <span style={{ color: T.accent }}>+{boost}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={sliderMax}
          value={boost}
          onChange={(e) => setBoost(Number(e.target.value))}
          className="w-full accent-pink-400"
        />
        <div className="relative h-6 mt-3 font-mono text-[10px] tracking-widest text-white/35">
          <div className="absolute inset-x-0 top-2 h-px bg-white/10" />
          <span
            className="absolute top-0 -translate-x-1/2 text-white/45"
            style={{ left: `${beforePos}%` }}
            title={`调整前 ${baseline}`}
          >
            ▲{baseline}
          </span>
          <span
            className="absolute top-3 -translate-x-1/2"
            style={{ left: `${afterPos}%`, color: T.accent }}
            title={`调整后约 ${projected}`}
          >
            ●{projected}
          </span>
        </div>
      </div>

      <p className="text-sm text-white/82 mt-4 leading-relaxed">{narrative}</p>

      {sim.leverEvidence ? (
        <div className="mt-3 rounded-xl px-3 py-2.5 border border-white/8 bg-white/[0.02]">
          <div className="text-[10px] font-mono tracking-widest text-white/40 mb-1">模块依据</div>
          <p className="text-xs text-white/65 leading-relaxed">{sim.leverEvidence}</p>
        </div>
      ) : null}

      <p className="text-[11px] text-white/45 mt-3 leading-relaxed">
        <span className="text-white/55">建议动作：</span>
        {sim.slider.method}
      </p>

      {sim.targetArchetype ? (
        <p className="text-[10px] font-mono text-white/35 mt-3 tracking-wide">
          目标坐标 · {sim.targetArchetype}
        </p>
      ) : null}
    </div>
  );
}

export function MateReverseFlipCard({ result }: { result: MateResult }) {
  const [flipped, setFlipped] = useState(false);
  const rev = result.reverse;
  if (!rev) return null;

  const faceShared =
    "[grid-area:stack] relative w-full overflow-hidden rounded-2xl p-5 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

  return (
    <div className="w-full [perspective:1000px]">
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        className="relative block w-full min-h-[240px] text-left"
        aria-expanded={flipped}
        aria-label={flipped ? "点击翻回误读面" : "点击翻转查看真实机制"}
      >
        <motion.div
          className="relative w-full min-h-[240px]"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid [grid-template-areas:'stack'] w-full">
          {/* 正面 · 外界误读 */}
          <div
            className={`${faceShared} border border-amber-500/30 shadow-[inset_0_1px_0_rgba(251,191,36,0.12),0_12px_40px_-16px_rgba(0,0,0,0.65)]`}
            style={{
              transform: "rotateY(0deg)",
              background:
                "linear-gradient(148deg, rgba(28,18,12,0.98) 0%, rgba(14,10,16,0.99) 42%, rgba(22,14,20,0.98) 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400/70 via-amber-500/35 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -top-10 -right-6 h-32 w-32 rounded-full bg-amber-500/[0.07] blur-2xl"
              aria-hidden
            />
            <div className="relative pl-2 h-full flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono tracking-[0.28em] text-amber-200/85">
                  MISREAD · 误读面
                </span>
                <span className="text-[10px] font-mono tracking-[0.24em] text-amber-100/45">{rev.front.subtitle}</span>
              </div>
              <h3 className="font-display text-lg text-amber-50/95">{rev.front.title}</h3>
              <p className="text-sm text-amber-50/72 mt-4 leading-relaxed flex-1">{rev.front.content}</p>
              <p className="text-xs text-amber-100/45 mt-4">{rev.front.tip ?? "点击翻转 · 看真实机制"}</p>
            </div>
          </div>

          {/* 背面 · 真实机制 */}
          <div
            className={`${faceShared} border border-pink-500/35 shadow-[0_12px_36px_-14px_rgba(244,114,182,0.35)]`}
            style={{
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(145deg, rgba(36,16,28,0.95) 0%, rgba(24,12,20,0.98) 55%, rgba(18,10,16,0.99) 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-pink-400/75 via-pink-500/35 to-transparent"
              aria-hidden
            />
            <div className="relative pl-2 h-full flex flex-col">
              <span className="inline-flex w-fit items-center rounded-full border border-pink-400/35 bg-pink-500/12 px-2.5 py-0.5 text-[10px] font-mono tracking-[0.28em] text-pink-200/85">
                TRUTH · 真实面
              </span>
              <div className="text-[10px] font-mono tracking-[0.3em] text-pink-200/55 mt-3">{rev.back.subtitle}</div>
              <p className="text-sm text-white/88 mt-3 leading-relaxed flex-1">{rev.back.content}</p>
              {rev.back.shareTip ? (
                <span
                  role="button"
                  tabIndex={0}
                  className="mt-4 inline-flex w-fit items-center gap-1 text-xs text-pink-200/80 hover:text-pink-100 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(rev.back.content).then(() => toast.success("已复制卡片内容"));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      navigator.clipboard.writeText(rev.back.content).then(() => toast.success("已复制卡片内容"));
                    }
                  }}
                >
                  <Share2 className="h-3.5 w-3.5" /> {rev.back.shareTip}
                </span>
              ) : null}
              <p className="text-xs text-pink-100/40 mt-4">点击翻回误读面</p>
            </div>
          </div>
          </div>
        </motion.div>
      </button>
    </div>
  );
}

const OBSERVER_LABELS = ["陌生人眼中的你", "约会对象眼中的你", "长期伴侣眼中的你"];

export function MateObserveCarousel({ result }: { result: MateResult }) {
  const slices = result.observeSlices?.length ? result.observeSlices : [];
  const records = result.matchmakerRecords ?? [];
  const count = Math.max(slices.length, records.length);
  const [idx, setIdx] = useState(0);
  if (!count) return null;

  const slice = slices[idx];
  const record = records[idx];
  const title = OBSERVER_LABELS[idx] ?? slice?.title ?? record?.title ?? `观察者 ${idx + 1}`;
  const remember = record?.remember?.length
    ? record.remember
    : slice?.correctTraits
      ? slice.correctTraits.split(/[、·]/).map((s) => s.trim()).filter(Boolean)
      : [];
  const notRemember = record?.notRemember?.length
    ? record.notRemember
    : slice?.missingTraits
      ? slice.missingTraits.split(/[、·]/).map((s) => s.trim()).filter(Boolean)
      : [];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className={mateLayout.monoLabel}>
          视角 {String(idx + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </div>
        <div className="flex gap-3 text-sm text-white/45">
          <button type="button" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx <= 0} className="disabled:opacity-30 hover:text-white/70">
            ←
          </button>
          <button
            type="button"
            onClick={() => setIdx((i) => Math.min(count - 1, i + 1))}
            disabled={idx >= count - 1}
            className="disabled:opacity-30 hover:text-white/70"
          >
            →
          </button>
        </div>
      </div>

      <h3 className="font-display text-lg text-white">{title}</h3>

      <div className="space-y-4">
        <div>
          <p className={mateLayout.caption}>他们会记住</p>
          <ul className={`${mateLayout.prose} mt-2 space-y-1.5 list-none`}>
            {remember.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        {notRemember.length ? (
          <div>
            <p className={mateLayout.caption}>而不是</p>
            <ul className={`${mateLayout.proseSm} mt-2 space-y-1 text-white/55`}>
              {notRemember.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {record?.discover ? (
          <p className={`${mateLayout.proseSm} ${mateLayout.rail} border-white/15`}>
            <span className={mateLayout.caption}>他们不知道的是 · </span>
            {record.discover}
          </p>
        ) : null}
        {record?.feel ? (
          <p className={`${mateLayout.prose} italic`}>{record.feel}</p>
        ) : null}
      </div>
    </div>
  );
}

export function MateMisunderstoodCard({ result }: { result: MateResult }) {
  const rev = result.reverse;
  if (!rev) return null;
  return (
    <figure className={`${mateLayout.rail} border-amber-500/35 mt-8 space-y-3`}>
      <figcaption className={mateLayout.caption}>关于你，外界最常见的误解</figcaption>
      <blockquote className={`${mateLayout.prose} text-white/88 not-italic`}>「{rev.front.content}」</blockquote>
      <figcaption className={mateLayout.caption}>真实情况是</figcaption>
      <p className={mateLayout.proseSm}>{rev.back.content}</p>
    </figure>
  );
}

const MATE_INSIGHT_META = {
  strength: { Icon: Sparkles, color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  watch: { Icon: Eye, color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  match: { Icon: Heart, color: "#fb7185", bg: "rgba(251,113,133,0.12)" },
  growth: { Icon: TrendingUp, color: "#a5b4fc", bg: "rgba(165,180,252,0.12)" },
} as const;

export function MateInsightsPanel({ result }: { result: MateResult }) {
  const items = result.insights;
  if (!items?.length) return null;

  return (
    <div className="space-y-4 mt-6">
      {items.map((it, i) => {
        const meta = MATE_INSIGHT_META[it.kind] ?? MATE_INSIGHT_META.strength;
        const Icon = meta.Icon;
        return (
          <motion.div
            key={`${it.kind}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-3"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
            >
              <Icon className="h-4 w-4" style={{ color: meta.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white font-medium">{it.title}</div>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">{it.body}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function MateRehearseNetflix({ result }: { result: MateResult }) {
  const eps = resolveRehearseEpisodes(result);
  const [active, setActive] = useState<number | null>(0);
  if (!eps.length) return null;

  return (
    <div className="space-y-5">
      <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-white/10 pb-0 -mx-1 px-1">
        {eps.map((ep, i) => (
          <button
            key={ep.name}
            type="button"
            onClick={() => setActive(i)}
            className={`shrink-0 pb-3 text-left border-b-2 transition -mb-px ${
              active === i ? "border-sakura text-white" : "border-transparent text-white/45 hover:text-white/70"
            }`}
          >
            <div className={mateLayout.monoLabel}>{ep.time}</div>
            <div className="text-sm mt-1 whitespace-nowrap">{ep.name}</div>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {active !== null && eps[active] && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3"
          >
            <p className={mateLayout.prose}>{eps[active].plot}</p>
            <p className={mateLayout.proseSm}>
              <span className="text-white/45">对方在想什么 · </span>
              {eps[active].partnerPsychology}
            </p>
            {eps[active].warning ? (
              <p className={`${mateLayout.proseSm} ${mateLayout.rail} border-amber-500/40`}>
                <span className="text-white/45">注意 · </span>
                {eps[active].warning}
              </p>
            ) : null}
            <p className={mateLayout.proseSm}>
              <span className="text-white/45">你可以主动 · </span>
              {eps[active].suggestion}
            </p>
            <div className="text-base tracking-widest pt-1">{eps[active].comfortIndex}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MateAdviceBubbles({ result }: { result: MateResult }) {
  const advice = result.adviceV4;
  const fallback = result.secularAdvice[0];
  const goodNews = advice?.goodNews ?? fallback?.do;
  const warning = advice?.warning ?? fallback?.reason;
  const oneChange =
    advice?.oneChange ??
    result.secularAdvice.find((c) => c.title.includes("改") || c.title.includes("一件事"))?.do ??
    result.secularAdvice[1]?.do;
  if (!goodNews && !warning) return null;

  return (
    <div className="space-y-6">
      {goodNews ? (
        <blockquote className={`${mateLayout.rail} border-emerald-500/45 space-y-1.5`}>
          <p className={mateLayout.caption}>先说一件好消息</p>
          <p className={mateLayout.prose}>{goodNews}</p>
        </blockquote>
      ) : null}
      {warning ? (
        <blockquote className={`${mateLayout.rail} border-amber-500/45 space-y-1.5`}>
          <p className={mateLayout.caption}>但有一件事你要注意</p>
          <p className={mateLayout.prose}>{warning}</p>
        </blockquote>
      ) : null}
      {oneChange ? (
        <blockquote className={`${mateLayout.rail} border-sakura/50 space-y-1.5`}>
          <p className={mateLayout.caption}>如果你只改一件事</p>
          <p className={mateLayout.prose}>{oneChange}</p>
        </blockquote>
      ) : null}
    </div>
  );
}

export function MateVenueGuide({ result }: { result: MateResult }) {
  const venueBad = result.secularAdvice.find((c) => c.dont)?.dont ?? result.upperMatch.summary;
  const venueGood =
    result.sweetSpot.summary ||
    result.matchZone?.meetScene ||
    result.secularAdvice.find((c) => c.title.includes("场合") || c.title.includes("出场"))?.do;
  const opening =
    result.secularAdvice.find((c) => c.title.includes("开场") || c.title.includes("出场"))?.do ??
    result.secularAdvice[0]?.do;
  if (!venueGood && !venueBad && !opening) return null;

  return (
    <div className="mt-10 pt-8 border-t border-white/8 space-y-5">
      <p className={mateLayout.monoLabel}>最优出场策略</p>
      {venueBad ? (
        <div>
          <p className={mateLayout.caption}>不适合</p>
          <p className={`${mateLayout.proseSm} mt-1`}>{venueBad}</p>
        </div>
      ) : null}
      {venueGood ? (
        <div>
          <p className={mateLayout.caption}>更适合</p>
          <p className={`${mateLayout.proseSm} mt-1`}>{venueGood}</p>
        </div>
      ) : null}
      {opening ? (
        <div>
          <p className={mateLayout.caption}>开场白</p>
          <p className={`${mateLayout.proseSm} mt-1`}>{opening}</p>
        </div>
      ) : null}
    </div>
  );
}

function MatePartnerPortraitCard({ portrait }: { portrait: MatePartnerPortrait }) {
  return (
    <div className={`${mateLayout.rail} border-white/12 space-y-2 py-3`}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm text-white/90">{portrait.name}</span>
        {portrait.matchScore != null ? (
          <span className="font-mono text-xs text-sakura/90">适配 {portrait.matchScore}</span>
        ) : null}
        {portrait.stableProbability != null ? (
          <span className="font-mono text-[10px] text-white/45">稳定 {portrait.stableProbability}%</span>
        ) : null}
      </div>
      {portrait.tags.length ? (
        <p className={mateLayout.caption}>{portrait.tags.join(" · ")}</p>
      ) : null}
      <p className={mateLayout.proseSm}>{portrait.snapshot}</p>
    </div>
  );
}

function MateMatchEntry({
  title,
  badge,
  bandLabel,
  matchScore,
  stableProbability,
  summary,
  traits,
  portraits,
  featured = false,
}: {
  title: string;
  badge?: string;
  bandLabel?: string;
  matchScore?: number;
  stableProbability?: number;
  summary: string;
  traits?: Record<string, number | string>;
  portraits?: MatePartnerPortrait[];
  featured?: boolean;
}) {
  return (
    <div className={featured ? mateLayout.highlight : "py-4 border-b border-white/8 last:border-0"}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h4 className={`font-display ${featured ? "text-lg text-white" : "text-base text-white/90"}`}>{title}</h4>
        {matchScore != null ? (
          <span className="font-mono text-sm text-sakura tabular-nums">{matchScore}</span>
        ) : null}
        {badge ? <span className="text-[10px] text-sakura/80">{badge}</span> : null}
      </div>
      {bandLabel ? <p className={`${mateLayout.caption} mt-1`}>{bandLabel}</p> : null}
      {stableProbability != null ? (
        <p className={`${mateLayout.caption} mt-1`}>
          进入稳定关系概率 · {stableProbability}%
        </p>
      ) : null}
      {traits && Object.keys(traits).length ? (
        <p className={`${mateLayout.caption} mt-2`}>
          {Object.entries(traits)
            .slice(0, 3)
            .map(([k, v]) => `${k} · ${typeof v === "number" ? Math.round(v) : v}`)
            .join("  ·  ")}
        </p>
      ) : null}
      {portraits?.length ? (
        <div className="mt-4 space-y-3">
          {portraits.slice(0, 2).map((p) => (
            <MatePartnerPortraitCard key={p.id || p.name} portrait={p} />
          ))}
        </div>
      ) : null}
      <p className={`${featured ? mateLayout.prose : mateLayout.proseSm} mt-3`}>{summary}</p>
    </div>
  );
}

export function MateMatchTemperature({ result }: { result: MateResult }) {
  const zone = result.matchZone;
  const zoneIdx = zone ? Math.max(0, zone.zones.indexOf(zone.userZone)) : 1;
  const partner = result.gender === "female" ? "男性" : "女性";

  return (
    <div className="space-y-2">
      <p className={mateLayout.proseSm}>
        以下不是「普适好{partner}标准」，而是<strong className="text-white/90 font-normal">基于你的坐标</strong>
        ，告诉你什么类型对你算上限、甜区、该避开。
      </p>
      {zone ? (
        <div className="mb-6">
          <p className={mateLayout.proseSm}>{zone.sliderTitle}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono text-white/55">
            {zone.lowerScore != null ? <span>下限 {zone.lowerScore}</span> : null}
            {zone.sweetScore != null ? <span className="text-sakura/90">甜区 {zone.sweetScore}</span> : null}
            {zone.upperScore != null ? <span>上限 {zone.upperScore}</span> : null}
            {zone.stableProbability != null ? <span>稳定概率 {zone.stableProbability}%</span> : null}
          </div>
          <div
            className="mt-3 relative h-1.5 rounded-full overflow-hidden max-w-sm"
            style={{ background: "linear-gradient(90deg, #1e3a5f, oklch(0.68 0.18 285) 45%, oklch(0.82 0.14 75))" }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sakura"
              style={{ left: `${12 + (zoneIdx / Math.max(1, zone.zones.length - 1)) * 76}%` }}
            />
          </div>
          <p className={`${mateLayout.caption} mt-2`}>
            {zone.zones.join(" · ")}
          </p>
          {zone.targetPortrait ? (
            <p className={`${mateLayout.caption} mt-2`}>典型画像 · {zone.targetPortrait}</p>
          ) : null}
        </div>
      ) : null}

      <MateMatchEntry
        featured
        title={result.sweetSpot.title}
        badge="最佳匹配带"
        bandLabel={result.sweetSpot.bandLabel}
        matchScore={result.sweetSpot.matchScore ?? result.sweetSpot.successRate}
        stableProbability={result.sweetSpot.stableProbability ?? zone?.stableProbability}
        summary={result.sweetSpot.reason || result.sweetSpot.summary}
        traits={result.sweetSpot.profile}
        portraits={result.sweetSpot.portraits}
      />
      {zone?.meetScene ? (
        <p className={`${mateLayout.caption} -mt-2 mb-4`}>在哪里遇见 · {zone.meetScene}</p>
      ) : null}
      <MateMatchEntry
        title={result.upperMatch.title}
        badge="上限"
        bandLabel={result.upperMatch.bandLabel}
        matchScore={result.upperMatch.matchScore ?? zone?.upperScore}
        stableProbability={result.upperMatch.stableProbability}
        summary={result.upperMatch.summary}
        traits={result.upperMatch.traits}
        portraits={result.upperMatch.portraits}
      />
      <MateMatchEntry
        title={result.lowerMatch.title}
        badge="下限 · 留意"
        bandLabel={result.lowerMatch.bandLabel}
        matchScore={result.lowerMatch.matchScore ?? zone?.lowerScore}
        summary={result.lowerMatch.summary || zone?.riskPortrait || ""}
        traits={result.lowerMatch.traits}
        portraits={result.lowerMatch.portraits}
      />
    </div>
  );
}

export function MateRecommendationLetter({ result }: { result: MateResult }) {
  const body =
    result.sweetSpot.summary ||
    result.matchZone?.matchingReason ||
    "情感稳定性和情绪供给在同龄人中属明显上游水平，相处摩擦不多，是难得的长期伴侣候选。";
  const note =
    result.reverse?.back.content.slice(0, 120) ||
    result.matchZone?.riskPortrait ||
    "需要对方有足够的耐心和眼力，才能发现你真正的好。";

  return (
    <aside className="mt-10 pt-6 border-t border-dashed border-white/10 space-y-4">
      <p className={mateLayout.monoLabel}>红娘推荐信</p>
      <p className={`${mateLayout.proseSm} italic text-white/55`}>
        致有缘人 · 被推荐人 {result.identityCard.title || result.positionName} · ★★★★☆
      </p>
      <p className={mateLayout.prose}>{body}</p>
      <p className={`${mateLayout.proseSm} ${mateLayout.rail} border-white/12 text-white/60`}>{note}</p>
      <p className={`${mateLayout.caption} text-right`}>MIRROR 认证</p>
    </aside>
  );
}

export function MateLensGridPanel({ result }: { result: MateResult }) {
  const items = result.lensGrid?.length ? result.lensGrid : [];
  const [open, setOpen] = useState<number | null>(null);
  if (!items.length) return null;

  const LENS_ICONS = ["💎", "👁", "🔗"];

  return (
    <div className="divide-y divide-white/8">
      {items.map((item, i) => (
        <div key={item.title}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full py-4 text-left flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-lg shrink-0">{LENS_ICONS[i] ?? "◆"}</span>
              <span className="text-sm text-white/88 group-hover:text-white">{item.title}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-white/35 transition ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className={`${mateLayout.proseSm} pb-5 ${mateLayout.rail} border-violet-500/30 text-white/70`}>
                  {item.desc}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function MateFooterMarquee({ result }: { result: MateResult }) {
  const quotes = result.footerMarquee?.marquee?.length
    ? result.footerMarquee.marquee
    : result.socialQuotes;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const ms = result.footerMarquee?.intervalMs ?? 4000;
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), ms);
    return () => clearInterval(t);
  }, [quotes.length, result.footerMarquee?.intervalMs]);

  if (!quotes.length) return null;

  return (
    <figure className="py-6 text-center space-y-3">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${mateLayout.prose} italic max-w-md mx-auto`}
        >
          {quotes[idx % quotes.length]}
        </motion.p>
      </AnimatePresence>
      <figcaption className={mateLayout.caption}>mirror.app</figcaption>
    </figure>
  );
}
