import { motion } from "framer-motion";
import type { Archetype } from "@/data/archetypes";

export function ArchetypeCard({ a }: { a: Archetype }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-glass rounded-3xl p-8 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 text-[160px] opacity-15 select-none pointer-events-none">{a.emoji}</div>
      <div className="text-xs tracking-[0.4em] text-muted-foreground">你的婚恋画像</div>
      <h2 className="font-display text-4xl mt-3 text-gradient-sakura">{a.emoji} {a.name}</h2>
      <p className="mt-3 text-base text-foreground/85 italic">「{a.tagline}」</p>
      <p className="mt-5 text-sm leading-relaxed text-foreground/80">{a.description}</p>
      <div className="sakura-divider my-6" />
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-xs tracking-[0.3em] text-muted-foreground mb-2">高光特质</div>
          <ul className="space-y-1.5">
            {a.traits.map((t) => <li key={t} className="text-sm text-foreground/85">· {t}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-xs tracking-[0.3em] text-muted-foreground mb-2">温柔提醒</div>
          <ul className="space-y-1.5">
            {a.cautions.map((t) => <li key={t} className="text-sm text-foreground/75">· {t}</li>)}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
