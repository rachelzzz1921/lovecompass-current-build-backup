import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { CharacterReveal } from "@/data/mockResult";

type Props = {
  open: boolean;
  character: CharacterReveal;
  onClose: () => void;
};

export function RedChamberRevealOverlay({ open, character, onClose }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-6 py-10"
          style={{ background: "color-mix(in oklab, oklch(0.10 0.018 270) 96%, transparent)" }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              background:
                "radial-gradient(circle at 50% 38%, oklch(0.50 0.20 285 / 0.35), transparent 55%), radial-gradient(circle at 50% 62%, oklch(0.45 0.15 200 / 0.25), transparent 60%)",
            }}
          />

          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const dist = 120 + (i % 3) * 40;
            return (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full pointer-events-none"
                style={{ background: "oklch(0.85 0.14 200)", boxShadow: "0 0 8px oklch(0.85 0.14 200)" }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: [0, 1, 0.6, 0], scale: [0, 1, 1, 0] }}
                transition={{ duration: 2.4, delay: 0.3 + i * 0.05, ease: "easeOut", repeat: Infinity, repeatDelay: 1.5 }}
              />
            );
          })}

          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 z-10 text-[11px] font-mono tracking-wide text-muted-foreground hover:text-foreground transition px-2.5 py-1 rounded-md border border-border/40 bg-background/50"
          >
            跳过动画
          </button>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 w-9 h-9 rounded-full grid place-items-center text-muted-foreground hover:text-foreground transition z-10 border border-border/40 bg-background/40"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-[130px] h-[130px] rounded-full grid place-items-center mb-6"
            style={{ background: "radial-gradient(circle, oklch(0.68 0.18 285 / 0.30), transparent 70%)" }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border"
                style={{ borderColor: "oklch(0.78 0.16 285 / 0.45)" }}
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 2.4, delay: i * 0.7, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl relative"
            >
              {character.emoji}
            </motion.div>
          </motion.div>

          <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground mb-2">· 数据已经说完了 ·</div>
          <div className="text-[13px] text-foreground/65 tracking-wider mb-3">现在，换一种语言</div>

          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="font-display text-5xl md:text-6xl text-gradient-violet tracking-tight"
          >
            {character.name}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="font-mono text-[10px] tracking-[0.32em] text-muted-foreground mt-3 mb-4"
          >
            {character.pinyin}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="text-[14px] text-foreground/75 leading-[1.95] text-center max-w-[300px] whitespace-pre-line mb-8"
          >
            {character.archetypeLine}
          </motion.p>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-[13px] tracking-wider text-[oklch(0.82_0.14_200)] border border-[oklch(0.82_0.14_200/0.35)] bg-[oklch(0.50_0.16_200/0.10)] hover:bg-[oklch(0.50_0.16_200/0.16)] transition"
          >
            查看详细解读 →
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
