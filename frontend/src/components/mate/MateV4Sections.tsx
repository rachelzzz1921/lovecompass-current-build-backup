import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronDown, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { MateResult } from "@/data/mateTypes";

const ROSE = {
  chip: "rgba(244,114,182,0.12)",
  chipText: "#f9a8d4",
  chipBorder: "rgba(244,114,182,0.35)",
  accent: "#fb7185",
};

export function MateIdentityDossier({ result }: { result: MateResult }) {
  const id = result.identityCard;
  return (
    <div
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(244,114,182,0.12), rgba(255,255,255,0.02))",
        border: `1px solid ${ROSE.chipBorder}`,
      }}
    >
      <div className="text-[10px] font-mono tracking-[0.35em] text-white/45 text-center">
        {id.subTitle || "SET 03 / MATE  |  CONFIDENTIAL"}
      </div>
      <h1 className="font-display text-2xl text-white text-center mt-3 leading-snug">
        {id.quadrantResult || result.positionName}
      </h1>
      {id.quadrantDesc && (
        <p className="text-[11px] font-mono text-center text-white/50 mt-2">{id.quadrantDesc}</p>
      )}
      <p className="text-sm text-white/80 text-center mt-4 leading-relaxed italic">
        {id.slogan || id.tagline}
      </p>
      <div className="flex flex-wrap justify-center gap-1.5 mt-4">
        {id.tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: ROSE.chip, color: ROSE.chipText }}
          >
            #{tag}
          </span>
        ))}
      </div>
      {(id.badges?.length ? id.badges : id.assets.slice(0, 3)).map((b) => (
        <div key={"name" in b ? b.name : b.label} className="hidden" />
      ))}
      <div className="grid grid-cols-3 gap-2 mt-5">
        {(id.badges?.length
          ? id.badges.map((b) => ({ label: b.name, summary: b.result, role: "" }))
          : id.assets
        ).slice(0, 3).map((asset) => (
          <div
            key={asset.label}
            className="rounded-xl p-3 text-center border border-white/8 bg-black/20"
          >
            <div className="text-[10px] text-white/45">{asset.label}</div>
            <div className="text-xs text-white/90 mt-1">{asset.summary}</div>
          </div>
        ))}
      </div>
      {result.profileEngine?.sub_type && (
        <div className="mt-4 text-center text-[11px] font-mono text-white/40">
          二级人格 · {result.profileEngine.sub_type}
        </div>
      )}
    </div>
  );
}

export function MateModuleAccordionPanel({ result }: { result: MateResult }) {
  const [open, setOpen] = useState<string | null>(null);
  const items = result.moduleAccordions?.length ? result.moduleAccordions : [];

  if (!items.length) return null;

  return (
    <div className="space-y-2">
      {items.map((mod) => (
        <div
          key={mod.code}
          className="rounded-2xl overflow-hidden border border-white/8 bg-white/[0.03]"
        >
          <button
            type="button"
            className="w-full p-4 text-left flex items-center justify-between gap-3"
            onClick={() => setOpen(open === mod.code ? null : mod.code)}
          >
            <div>
              <div className="text-[10px] font-mono text-white/40">{mod.code}</div>
              <div className="text-sm text-white mt-0.5">{mod.dimension}</div>
              <div className="font-mono text-[11px] text-white/55 mt-2 tracking-wider">{mod.visual}</div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: ROSE.chip, color: ROSE.chipText }}>
                {mod.tag}
              </span>
              <div className="text-xs text-white/70 mt-2">{mod.display}</div>
              <ChevronDown className={`h-4 w-4 text-white/40 ml-auto mt-1 transition ${open === mod.code ? "rotate-180" : ""}`} />
            </div>
          </button>
          <AnimatePresence>
            {open === mod.code && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-white/8">
                  <div className="flex flex-wrap gap-1.5">
                    {mod.subBadges.map((b) => (
                      <span key={b} className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-white/65">
                        {b}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{mod.answerEvidence}</p>
                  <p className="text-xs text-white/55 leading-relaxed border-l-2 pl-3" style={{ borderColor: ROSE.accent }}>
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
  const [boost, setBoost] = useState(sim?.slider.boostPercent ?? 15);
  if (!sim) return null;

  const display = Math.min(100, sim.baselineDisplay + boost);

  return (
    <div className="rounded-2xl p-5 border border-white/8 bg-white/[0.03]">
      <div className="text-[10px] font-mono tracking-[0.3em] text-white/40">{sim.title}</div>
      <p className="text-sm text-white/75 mt-2 leading-relaxed">{sim.slogan}</p>
      <p className="text-xs text-white/55 mt-2">{sim.diagnosis}</p>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-white/60 mb-2">
          <span>{sim.slider.name}</span>
          <span style={{ color: ROSE.accent }}>+{boost}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={25}
          value={boost}
          onChange={(e) => setBoost(Number(e.target.value))}
          className="w-full accent-pink-400"
        />
        <div className="font-mono text-[11px] text-white/45 mt-2 tracking-widest">
          {"░".repeat(Math.max(0, 20 - Math.round(display / 5)))}
          <span style={{ color: ROSE.accent }}>{"●"}</span>
        </div>
      </div>
      <p className="text-sm text-white/80 mt-4 leading-relaxed">
        {sim.dynamicText.replace(String(sim.slider.boostPercent), String(boost))}
      </p>
      <p className="text-[11px] text-white/45 mt-2">{sim.slider.method}</p>
    </div>
  );
}

export function MateReverseFlipCard({ result }: { result: MateResult }) {
  const [flipped, setFlipped] = useState(false);
  const rev = result.reverse;
  if (!rev) return null;

  return (
    <div className="perspective-[1000px]">
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        className="w-full min-h-[220px] relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55 }}
          className="w-full rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-[10px] font-mono tracking-[0.3em] text-white/45">{rev.front.subtitle}</div>
          <h3 className="font-display text-lg text-white mt-2">{rev.front.title}</h3>
          <p className="text-sm text-white/75 mt-4 leading-relaxed">{rev.front.content}</p>
          <p className="text-xs text-white/45 mt-4">{rev.front.tip}</p>
        </motion.div>
      </button>
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl p-5 border border-pink-500/30 bg-pink-500/10"
          >
            <div className="text-[10px] font-mono tracking-[0.3em] text-pink-200/70">{rev.back.subtitle}</div>
            <p className="text-sm text-white/85 mt-3 leading-relaxed">{rev.back.content}</p>
            {rev.back.shareTip && (
              <button
                type="button"
                className="mt-4 text-xs flex items-center gap-1 text-pink-200/80"
                onClick={() => {
                  navigator.clipboard.writeText(rev.back.content).then(() => toast.success("已复制卡片内容"));
                }}
              >
                <Share2 className="h-3.5 w-3.5" /> {rev.back.shareTip}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MateObserveCarousel({ result }: { result: MateResult }) {
  const slices = result.observeSlices?.length ? result.observeSlices : [];
  const [idx, setIdx] = useState(0);
  if (!slices.length) return null;
  const slice = slices[idx % slices.length];

  return (
    <div className="rounded-2xl p-5 border border-white/8 bg-white/[0.03] min-h-[200px]">
      <div className="text-[10px] font-mono text-white/40">观察者视角的切片 {slice.slice}</div>
      <h3 className="font-display text-lg text-white mt-2">{slice.title}</h3>
      <p className="text-sm text-white/80 mt-4">
        <span className="text-white/50">会注意到：</span>
        {slice.correctTraits}
      </p>
      <p className="text-sm text-white/55 mt-2">
        <span className="text-white/40">而不是：</span>
        {slice.missingTraits}
      </p>
      <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/8">
        <button type="button" className="text-xs text-white/50" onClick={() => setIdx((i) => Math.max(0, i - 1))}>
          ←
        </button>
        <span className="text-[10px] font-mono text-white/40">
          {idx + 1} / {slices.length}
        </span>
        <button
          type="button"
          className="text-xs text-white/50"
          onClick={() => setIdx((i) => Math.min(slices.length - 1, i + 1))}
        >
          →
        </button>
      </div>
    </div>
  );
}

export function MateRehearseNetflix({ result }: { result: MateResult }) {
  const eps = result.rehearseEpisodes?.length ? result.rehearseEpisodes : [];
  const [active, setActive] = useState<number | null>(0);
  if (!eps.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {eps.map((ep, i) => (
          <button
            key={ep.name}
            type="button"
            onClick={() => setActive(active === i ? null : i)}
            className="shrink-0 w-36 rounded-xl p-3 text-left border transition"
            style={{
              borderColor: active === i ? ROSE.chipBorder : "rgba(255,255,255,0.08)",
              background: active === i ? ROSE.chip : "rgba(255,255,255,0.03)",
            }}
          >
            <div className="text-[10px] font-mono text-white/45">{ep.time}</div>
            <div className="text-sm text-white mt-1">{ep.name}</div>
            <div className="text-[11px] text-white/55 mt-1">{ep.desc}</div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {active !== null && eps[active] && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="rounded-t-3xl p-5 border border-white/10 bg-black/40"
          >
            <div className="text-sm font-display text-white">{eps[active].name}</div>
            <p className="text-xs text-white/70 mt-3"><strong>剧情：</strong>{eps[active].plot}</p>
            <p className="text-xs text-white/70 mt-2"><strong>对方心理：</strong>{eps[active].partnerPsychology}</p>
            {eps[active].warning && (
              <p className="text-xs text-amber-200/80 mt-2"><strong>危险信号：</strong>{eps[active].warning}</p>
            )}
            <p className="text-xs text-white/70 mt-2"><strong>红娘动作：</strong>{eps[active].suggestion}</p>
            <div className="text-sm mt-3">{eps[active].comfortIndex}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MateAdviceBubbles({ result }: { result: MateResult }) {
  const advice = result.adviceV4;
  if (!advice) return null;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl rounded-bl-sm p-4 border border-emerald-500/25 bg-emerald-500/10">
        <div className="text-[10px] font-mono text-emerald-200/70 mb-2">红娘 · 好消息</div>
        <p className="text-sm text-white/85 leading-relaxed">{advice.goodNews}</p>
      </div>
      <div className="rounded-2xl rounded-br-sm p-4 border border-amber-500/25 bg-amber-500/10 ml-4">
        <div className="text-[10px] font-mono text-amber-200/70 mb-2">红娘 · 提醒</div>
        <p className="text-sm text-white/85 leading-relaxed">{advice.warning}</p>
      </div>
    </div>
  );
}

export function MateMatchTemperature({ result }: { result: MateResult }) {
  const zone = result.matchZone;
  if (!zone) return null;
  const zoneIdx = zone.zones.indexOf(zone.userZone);

  return (
    <div className="rounded-2xl p-5 border border-white/8 bg-white/[0.03]">
      <div className="text-sm text-white/80">{zone.sliderTitle}</div>
      <div className="mt-4 relative h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${Math.max(0, (zoneIdx / Math.max(1, zone.zones.length - 1)) * 70)}%`,
            width: "28%",
            background: `linear-gradient(90deg, ${ROSE.accent}, #f9a8d4)`,
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-white/40 mt-2">
        {zone.zones.map((z) => (
          <span key={z} className={z === zone.userZone ? "text-pink-300" : ""}>
            {z}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-sm text-white/75">
        <p><span className="text-white/45">目标画像 · </span>{zone.targetPortrait}</p>
        <p><span className="text-white/45">匹配理由 · </span>{zone.matchingReason}</p>
        <p><span className="text-white/45">相遇场景 · </span>{zone.meetScene}</p>
      </div>
    </div>
  );
}

export function MateLensGridPanel({ result }: { result: MateResult }) {
  const items = result.lensGrid?.length ? result.lensGrid : [];
  const [open, setOpen] = useState<number | null>(null);
  if (!items.length) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          onClick={() => setOpen(open === i ? null : i)}
          className="rounded-xl p-3 text-left min-h-[88px] border border-white/8 bg-white/[0.04] hover:bg-white/[0.07] transition"
        >
          <div className="text-[10px] font-mono text-white/45">{String(i + 1).padStart(2, "0")}</div>
          <div className="text-xs text-white mt-1 leading-snug">{item.title}</div>
        </button>
      ))}
      <AnimatePresence>
        {open !== null && items[open] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-3 rounded-xl p-4 border border-pink-500/30 bg-pink-500/10"
          >
            <div className="font-display text-white">{items[open].title}</div>
            <p className="text-sm text-white/80 mt-2 leading-relaxed">{items[open].desc}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MateFooterMarquee({ result }: { result: MateResult }) {
  const quotes = result.footerMarquee?.marquee?.length
    ? result.footerMarquee.marquee
    : result.socialQuotes;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const ms = result.footerMarquee?.intervalMs ?? 3000;
    const t = setInterval(() => setIdx((i) => (i + 1) % quotes.length), ms);
    return () => clearInterval(t);
  }, [quotes.length, result.footerMarquee?.intervalMs]);

  if (!quotes.length) return null;

  return (
    <div className="rounded-full py-3 px-5 border border-white/10 bg-white/[0.04] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="text-sm text-white/70 text-center whitespace-nowrap"
        >
          「{quotes[idx % quotes.length]}」
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
