import { motion } from "framer-motion";
import type { ExampleSuiteTab } from "@/data/exampleCharacters";
import { EXAMPLE_SUITE_JOURNEY, type ExampleSection } from "@/components/example/exampleReadingFlow";
import {
  FloatingSectionNav,
  type FloatingNavTone,
} from "@/components/reading/FloatingSectionNav";

const SUITE_TAB_ACTIVE: Record<string, string> = {
  violet:
    "border-[oklch(0.68_0.18_285/0.5)] bg-[oklch(0.50_0.20_285/0.2)] text-[oklch(0.88_0.14_200)] shadow-[0_0_20px_-6px_oklch(0.68_0.18_285/0.55)]",
  cyan: "border-[rgba(99,102,241,0.45)] bg-[rgba(99,102,241,0.18)] text-[#c7d2fe] shadow-[0_0_20px_-6px_rgba(99,102,241,0.45)]",
  rose: "border-[rgba(244,114,182,0.5)] bg-[rgba(244,114,182,0.18)] text-[#fbcfe8] shadow-[0_0_20px_-6px_rgba(244,114,182,0.45)]",
};

export function ExampleFloatingReadingNav({
  visible,
  activeTab,
  activeSectionId,
  sections,
  onSelectTab,
  tone = "violet",
}: {
  visible: boolean;
  activeTab: ExampleSuiteTab;
  activeSectionId: string;
  sections: ExampleSection[];
  onSelectTab: (tab: ExampleSuiteTab) => void;
  tone?: FloatingNavTone;
}) {
  const header = (
    <div
      className="flex items-center gap-1.5 px-2.5 py-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="套题切换"
    >
      {EXAMPLE_SUITE_JOURNEY.map((item) => {
        const isActive = item.id === activeTab;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectTab(item.id)}
            className={`relative shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-mono tracking-wider transition-all duration-200 active:scale-[0.97] ${
              isActive
                ? SUITE_TAB_ACTIVE[item.accent]
                : "border-white/10 bg-white/[0.04] text-foreground/55 hover:border-white/20 hover:bg-white/[0.08] hover:text-foreground/85"
            }`}
          >
            {isActive ? (
              <motion.span
                layoutId="example-suite-tab-glow"
                className="absolute inset-0 rounded-full"
                style={{ opacity: 0.35 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                aria-hidden
              />
            ) : null}
            <span className="relative">{item.suiteLabel}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <FloatingSectionNav
      visible={visible}
      sections={sections}
      activeSectionId={activeSectionId}
      tone={tone}
      header={header}
      appearance="glass"
    />
  );
}

export type { FloatingNavTone };
