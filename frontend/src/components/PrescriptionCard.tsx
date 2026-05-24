import { motion } from "framer-motion";
import type { Prescription } from "@/data/rosTypes";

export function PrescriptionCard({ data }: { data: Prescription }) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
        {data.warmup}
      </p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.98 0.005 90 / 0.97), oklch(0.94 0.015 90 / 0.95))",
          color: "oklch(0.22 0.04 270)",
          boxShadow: "0 18px 60px -20px oklch(0.50 0.20 285 / 0.55)",
        }}
      >
        {/* paper grain */}
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(oklch(0.30 0.02 270 / 0.05) 1px, transparent 1px)",
            backgroundSize: "4px 4px",
          }} />

        <div className="relative px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[oklch(0.30_0.02_270/0.2)] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="font-display text-2xl font-bold text-[oklch(0.55_0.20_285)]">Rx</div>
              <div className="text-sm font-medium">你们的关系处方</div>
            </div>
            <div className="font-mono text-[10px] tracking-widest text-[oklch(0.45_0.02_270)]">
              MIRROR · ROS
            </div>
          </div>

          <Row label="主诉" value={data.chiefComplaint} />
          <Row label="建议" value={data.rx} multiline />
          <Row label="复诊" value={data.followUp} />

          <div className="mt-5 pt-3 border-t border-dashed border-[oklch(0.30_0.02_270/0.2)] flex items-end justify-between">
            <div className="text-[10px] text-[oklch(0.45_0.02_270)]">
              本方仅供参考 · 关系疗愈需要耐心
            </div>
            <div className="font-display italic text-base text-[oklch(0.55_0.20_285)]">
              Mirror
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex gap-3 py-1.5">
      <div className="w-12 shrink-0 text-[oklch(0.45_0.02_270)] text-sm">{label}</div>
      <div className="text-[oklch(0.20_0.02_270)] text-[15px] font-medium whitespace-pre-line leading-relaxed">
        {multiline ? value : value}
      </div>
    </div>
  );
}
