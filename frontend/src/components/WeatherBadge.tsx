import { Sun, Cloud, CloudSun, CloudRain, CloudLightning } from "lucide-react";
import { motion } from "framer-motion";

const ICONS = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
} as const;

export function WeatherBadge({
  icon,
  label,
  sub,
}: {
  icon: keyof typeof ICONS;
  label: string;
  sub: string;
}) {
  const Icon = ICONS[icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-glass rounded-2xl px-5 py-4 flex items-center gap-4"
    >
      <div className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.14 200 / 0.35), transparent 70%)" }}>
        <Icon className="h-8 w-8 text-[oklch(0.85_0.14_200)]" strokeWidth={1.6} />
      </div>
      <div>
        <div className="text-[10px] tracking-[0.3em] text-muted-foreground font-mono">关系天气</div>
        <div className="font-display text-xl text-gradient-violet">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
      </div>
    </motion.div>
  );
}
