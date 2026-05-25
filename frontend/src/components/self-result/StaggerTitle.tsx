import { motion } from "framer-motion";

export function StaggerTitle({ text, className }: { text: string; className?: string }) {
  const chars = [...text];
  return (
    <h1 className={className} aria-label={text}>
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.4 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          style={{ whiteSpace: char === " " ? "pre" : undefined }}
        >
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </h1>
  );
}
