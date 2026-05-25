import { motion } from "framer-motion";
import { Sun, CloudSun, CloudRain, CloudLightning } from "lucide-react";
import type { RosSingleResult } from "@/data/rosTypes";
import { useCountUp } from "@/hooks/useCountUp";

const ICONS = {
  sun: Sun,
  "cloud-sun": CloudSun,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
  cloud: CloudSun,
} as const;

const WEATHER_BG: Record<string, string> = {
  sun: "linear-gradient(180deg, rgba(251,191,36,0.22) 0%, rgba(251,146,60,0.08) 40%, rgba(12,14,17,0) 100%)",
  "cloud-sun": "linear-gradient(180deg, rgba(99,102,241,0.2) 0%, rgba(251,146,60,0.1) 50%, rgba(12,14,17,0) 100%)",
  "cloud-rain": "linear-gradient(180deg, rgba(59,130,246,0.18) 0%, rgba(12,14,17,0) 100%)",
  "cloud-lightning": "linear-gradient(180deg, rgba(88,28,135,0.3) 0%, rgba(12,14,17,0) 100%)",
};

function WeatherParticles({ icon }: { icon: string }) {
  if (icon === "sun") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-6 right-16 w-20 h-20 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(251,191,36,0.35), transparent 70%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-amber-300/70"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              left: `${6 + i * 6.5}%`,
              bottom: `${8 + (i % 4) * 10}%`,
            }}
            animate={{ y: [-10, -70], opacity: [0, 0.85, 0] }}
            transition={{ duration: 2.8 + (i % 4) * 0.4, repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
      </div>
    );
  }

  if (icon === "cloud-sun") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-10 left-8 w-28 h-14 rounded-full bg-white/8 blur-sm"
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-14 left-16 w-20 h-10 rounded-full bg-indigo-400/10 blur-md"
          animate={{ x: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        />
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-12 h-16 w-px origin-bottom"
            style={{
              left: `${18 + i * 8}%`,
              background: "linear-gradient(180deg, rgba(251,146,60,0.35), transparent)",
              rotate: -18 + i * 6,
            }}
            animate={{ opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>
    );
  }

  if (icon === "cloud-rain") {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-px bg-blue-300/35"
            style={{
              height: 8 + (i % 3) * 4,
              left: `${3 + i * 4.2}%`,
              top: `${15 + (i % 5) * 10}%`,
            }}
            animate={{ y: [0, 28], opacity: [0.15, 0.65, 0.1] }}
            transition={{ duration: 0.65 + (i % 5) * 0.08, repeat: Infinity, delay: i * 0.04 }}
          />
        ))}
      </div>
    );
  }

  if (icon === "cloud-lightning") {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-6 right-8 w-32 h-16 rounded-full bg-purple-900/45 blur-lg"
          animate={{ x: [0, 12, -6, 0], opacity: [0.45, 0.85, 0.35, 0.45] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-16 right-20 w-px h-8 bg-violet-200/80"
          style={{ boxShadow: "0 0 12px rgba(196,181,253,0.8)" }}
          animate={{ opacity: [0, 0, 1, 0, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.88, 0.92, 0.96, 1] }}
        />
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-8 h-3 rounded-full bg-slate-500/20 blur-sm"
            style={{ left: `${10 + i * 10}%`, top: `${20 + (i % 2) * 8}%` }}
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 1.2 + i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    );
  }

  return null;
}

export function RelationshipWeatherHero({
  weather,
  resonance,
  tier,
  tierDesc,
  timeLabel,
  stageName,
}: {
  weather: NonNullable<RosSingleResult["weather"]>;
  resonance: number;
  tier: string;
  tierDesc?: string;
  timeLabel?: string | null;
  stageName: string;
}) {
  const Icon = ICONS[weather.icon] ?? CloudSun;
  const bg = WEATHER_BG[weather.icon] ?? WEATHER_BG["cloud-sun"];
  const displayScore = useCountUp(resonance, 1400);

  return (
    <section className="relative overflow-hidden rounded-2xl" style={{ minHeight: 200 }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: bg }} />
      <WeatherParticles icon={weather.icon} />

      <div className="relative z-10 p-5">
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "radial-gradient(circle, rgba(165,168,255,0.25), transparent 70%)" }}>
            <Icon className="h-9 w-9 text-[#c2c4ff]" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] tracking-[0.3em] font-mono text-white/45">NOW · 关系天气</div>
            <div className="font-display text-2xl text-white mt-1">{weather.label}</div>
            <p className="text-sm text-white/70 mt-1 leading-relaxed">{weather.sub}</p>
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/8 pt-5">
          <div>
            <div className="text-[10px] font-mono text-white/40 tracking-widest">共鸣指数</div>
            <div className="font-display text-[48px] leading-none font-semibold text-white tabular-nums tracking-tight">
              {displayScore}
            </div>
            <motion.div
              className="h-1 rounded-full mt-2 overflow-hidden bg-white/8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg,#6366f1,#f0a5d0)" }}
                initial={{ width: 0 }}
                animate={{ width: `${resonance}%` }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>
            <div className="text-sm mt-2" style={{ color: "#a5a8ff" }}>{tier}</div>
            {tierDesc ? <p className="text-xs text-white/55 mt-0.5">{tierDesc}</p> : null}
          </div>
          <div className="text-right text-xs text-white/55 leading-relaxed max-w-[45%]">
            {timeLabel ? <div>{timeLabel}</div> : null}
            <div className="text-white/75 mt-0.5">当前阶段 · {stageName}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
