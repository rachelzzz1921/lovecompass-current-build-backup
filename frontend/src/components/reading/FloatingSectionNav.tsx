import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { RESULT_FLOATING_NAV_OFFSET, scrollToSection } from "@/hooks/use-scroll-spy";

export type ReadingSection = {
  id: string;
  label: string;
  hint?: string;
};

export type FloatingNavTone = "violet" | "indigo" | "rose";

const TONE_STYLES: Record<
  FloatingNavTone,
  { activeBg: string; activeBorder: string; activeText: string; dot: string }
> = {
  violet: {
    activeBg: "oklch(0.50 0.20 285 / 0.16)",
    activeBorder: "oklch(0.68 0.18 285 / 0.45)",
    activeText: "oklch(0.82 0.14 200)",
    dot: "bg-[oklch(0.68_0.18_285)]",
  },
  indigo: {
    activeBg: "rgba(99,102,241,0.14)",
    activeBorder: "rgba(99,102,241,0.4)",
    activeText: "#a5a8ff",
    dot: "bg-[#818cf8]",
  },
  rose: {
    activeBg: "rgba(244,114,182,0.16)",
    activeBorder: "rgba(244,114,182,0.45)",
    activeText: "#f9a8d4",
    dot: "bg-[#fb7185]",
  },
};

export function FloatingSectionNav({
  visible,
  sections,
  activeSectionId,
  tone = "violet",
  header,
  scrollOffset = RESULT_FLOATING_NAV_OFFSET,
  placement = "auto",
  appearance = "solid",
}: {
  visible: boolean;
  sections: ReadingSection[];
  activeSectionId: string;
  tone?: FloatingNavTone;
  header?: ReactNode;
  scrollOffset?: number;
  /** auto: 移动端底栏 / 桌面顶栏；top: 始终顶栏（避免与页内其它底栏重叠） */
  placement?: "auto" | "top";
  /** glass: 半透明毛玻璃（范例页）；solid: 实底（真实结果页） */
  appearance?: "solid" | "glass";
}) {
  const styles = TONE_STYLES[tone];
  const activeIndex = sections.findIndex((s) => s.id === activeSectionId);
  const active = sections[activeIndex] ?? sections[0];
  const positionClass =
    placement === "top" ? "md:top-3.5 top-3.5 bottom-auto" : "bottom-4 md:bottom-auto md:top-3.5";
  const shellClass =
    appearance === "glass"
      ? "rounded-2xl border border-white/12 bg-[oklch(0.14_0.02_270/0.52)] shadow-[0_20px_50px_-16px_oklch(0.08_0.02_270/0.65)] backdrop-blur-2xl backdrop-saturate-150 overflow-hidden"
      : "rounded-2xl border border-border/50 bg-[oklch(0.13_0.018_270/0.94)] shadow-[0_16px_48px_-12px_oklch(0.10_0.02_270/0.75)] backdrop-blur-xl overflow-hidden";
  const headerDivider = appearance === "glass" ? "border-white/10" : "border-border/40";
  const chipIdle =
    appearance === "glass"
      ? "text-foreground/60 border-white/12 bg-white/[0.05] hover:bg-white/[0.1] hover:border-white/22 hover:text-foreground/85"
      : "text-muted-foreground border-border/30 bg-transparent hover:bg-secondary/25";
  const chipPast =
    appearance === "glass"
      ? "text-foreground/70 border-white/15 bg-white/[0.07]"
      : "text-foreground/65 border-border/35 bg-secondary/30";
  const hintClass = appearance === "glass" ? "text-foreground/45" : "text-foreground/50";
  const hintActiveClass = appearance === "glass" ? "text-foreground/80" : "text-foreground/75";

  return (
    <AnimatePresence>
      {visible && sections.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: appearance === "glass" ? 20 : 16, scale: appearance === "glass" ? 0.98 : 1 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: appearance === "glass" ? 0.98 : 1 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed z-50 left-1/2 -translate-x-1/2 w-[min(calc(100vw-1.25rem),42rem)] ${positionClass}`}
        >
          <div className={shellClass}>
            {header ? <div className={`border-b ${headerDivider}`}>{header}</div> : null}

            <div className="px-2 py-2">
              <nav
                aria-label="章节导航"
                className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
              >
                {sections.map((section, index) => {
                  const isActive = section.id === activeSectionId;
                  const isPast = activeIndex > index;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id, scrollOffset)}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-mono tracking-wide transition-all duration-200 active:scale-[0.97] ${
                        isActive
                          ? "text-foreground"
                          : isPast
                            ? chipPast
                            : chipIdle
                      }`}
                      style={
                        isActive
                          ? {
                              background: styles.activeBg,
                              borderColor: styles.activeBorder,
                              color: styles.activeText,
                            }
                          : undefined
                      }
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          isActive || isPast ? styles.dot : "bg-muted-foreground/40"
                        }`}
                      />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
              {active?.hint ? (
                <p className={`mt-2 px-1 text-[10px] leading-relaxed ${hintClass}`}>
                  当前：<span className={hintActiveClass}>{active.hint}</span>
                </p>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
