import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ExampleSuiteTab } from "@/data/exampleCharacters";
import {
  EXAMPLE_SUITE_JOURNEY,
  type ExampleSuitePreview,
} from "@/components/example/exampleReadingFlow";
import { productEntryPath } from "@/lib/productRoutes";

const ACCENT_ACTIVE: Record<string, string> = {
  violet:
    "border-[oklch(0.68_0.18_285/0.55)] bg-[oklch(0.50_0.20_285/0.16)] shadow-[0_0_24px_-8px_oklch(0.68_0.18_285/0.45)]",
  cyan: "border-[oklch(0.72_0.14_235/0.55)] bg-[rgba(99,102,241,0.14)] shadow-[0_0_24px_-8px_rgba(99,102,241,0.35)]",
  rose: "border-[oklch(0.72_0.18_20/0.55)] bg-[rgba(244,114,182,0.12)] shadow-[0_0_24px_-8px_rgba(244,114,182,0.35)]",
};

const ACCENT_RING: Record<string, string> = {
  violet: "ring-[oklch(0.68_0.18_285/0.45)]",
  cyan: "ring-[rgba(99,102,241,0.4)]",
  rose: "ring-[rgba(244,114,182,0.45)]",
};

const ACCENT_GRADIENT: Record<string, string> = {
  violet: "from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]",
  cyan: "from-[#6366f1] to-[#818cf8]",
  rose: "from-[#fb7185] to-[#f472b6]",
};

export function ExampleJourneyBar({
  active,
  onSelect,
  characterName,
  preview,
}: {
  active: ExampleSuiteTab;
  onSelect: (tab: ExampleSuiteTab) => void;
  characterName: string;
  preview: Record<ExampleSuiteTab, ExampleSuitePreview>;
}) {
  return (
    <div className="rounded-2xl border border-[oklch(0.68_0.18_285/0.28)] bg-[oklch(0.18_0.022_270/0.72)] backdrop-blur-md p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="font-mono text-[10px] tracking-[0.32em] text-muted-foreground">
          // 三套测评 · 示范阅读 · {characterName}
        </div>
        <span className="chip chip-violet font-mono text-[10px] py-1">SELF · ROS · MATE</span>
      </div>
      <p className="text-xs text-foreground/60 leading-relaxed mb-4">
        这是 MIRROR 的<strong className="text-foreground/80 font-medium">三套独立题组</strong>
        ——若 {characterName} 来做测评，下方分别展示每套题会生成的报告类型。点选切换阅读，也可直接去做你自己的。
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
        {EXAMPLE_SUITE_JOURNEY.map((step, index) => {
          const isActive = active === step.id;
          const isDone =
            (step.id === "self" && (active === "ros" || active === "mate")) ||
            (step.id === "ros" && active === "mate");

          return (
            <div key={step.id} className="flex flex-col sm:flex-row sm:items-center min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(step.id)}
                className={`group flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${
                  isActive
                    ? ACCENT_ACTIVE[step.accent]
                    : isDone
                      ? "border-[oklch(0.78_0.15_165/0.35)] bg-[oklch(0.50_0.18_165/0.08)] hover:border-[oklch(0.78_0.15_165/0.5)]"
                      : "border-border/45 bg-glass/40 hover:border-border/70"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[11px] ${
                    isActive
                      ? `bg-gradient-to-br ${ACCENT_GRADIENT[step.accent]} text-primary-foreground`
                      : isDone
                        ? "bg-[oklch(0.50_0.18_165/0.25)] text-[oklch(0.82_0.14_165)]"
                        : "bg-secondary/80 text-muted-foreground"
                  }`}
                >
                  {step.step}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{step.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border border-border/50 text-foreground/55">
                      {step.suiteLabel}
                    </span>
                  </span>
                  <span className={`block text-sm truncate ${isActive ? "text-foreground" : "text-foreground/75"}`}>
                    {step.productTitle}
                  </span>
                  <span className="block text-[10px] text-muted-foreground truncate mt-0.5">
                    {step.questionCount} · {step.accessHint}
                  </span>
                </span>
              </button>
              {index < EXAMPLE_SUITE_JOURNEY.length - 1 ? (
                <>
                  <ChevronRight
                    className={`mx-1 sm:mx-2 h-4 w-4 shrink-0 hidden sm:block ${
                      isDone || isActive ? "text-[oklch(0.68_0.18_285/0.7)]" : "text-muted-foreground/40"
                    }`}
                    aria-hidden
                  />
                  <ChevronDown
                    className={`mx-auto my-0.5 h-4 w-4 shrink-0 sm:hidden ${
                      isDone || isActive ? "text-[oklch(0.68_0.18_285/0.7)]" : "text-muted-foreground/40"
                    }`}
                    aria-hidden
                  />
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-2">
        {EXAMPLE_SUITE_JOURNEY.map((step) => {
          const isActive = active === step.id;
          const card = preview[step.id];
          return (
            <button
              key={`card-${step.id}`}
              type="button"
              onClick={() => onSelect(step.id)}
              className={`relative rounded-xl border p-3 text-left transition ${
                isActive
                  ? `${ACCENT_ACTIVE[step.accent]} ring-1 ${ACCENT_RING[step.accent]}`
                  : "border-border/45 bg-glass/30 hover:border-border/70 hover:bg-glass/50"
              }`}
            >
              {isActive ? (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full border border-[oklch(0.68_0.18_285/0.45)] bg-[oklch(0.50_0.20_285/0.18)] px-2 py-1 text-[10px] font-mono text-[oklch(0.88_0.14_200)] shadow-[0_0_16px_-4px_oklch(0.68_0.18_285/0.5)]">
                  阅读中
                  <ChevronDown className="h-4 w-4 animate-bounce" strokeWidth={2.5} aria-hidden />
                </span>
              ) : null}
              <div className="flex items-center gap-1.5 pr-14">
                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">{step.title}</span>
                <span className="text-[9px] text-foreground/45">{step.suiteLabel}</span>
              </div>
              <div className="text-sm font-medium text-foreground mt-1.5 line-clamp-1">{card.headline}</div>
              <p className="text-[11px] text-foreground/55 mt-1 line-clamp-2 leading-relaxed">{card.sub}</p>
              <div className="mt-2 pt-2 border-t border-border/30 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-mono text-muted-foreground">
                <span>{step.productTitle}</span>
                <span className="text-foreground/25">·</span>
                <span>{step.questionCount}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-border/35">
        <p className="text-[11px] text-foreground/55 leading-relaxed">
          建议按 <span className="text-foreground/75">第一套 → 第二套 → 第三套</span> 顺序阅读；正文对应当前卡片。
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          {EXAMPLE_SUITE_JOURNEY.map((step) => (
            <Link
              key={`cta-${step.id}`}
              to={productEntryPath(step.productId)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-border/50 text-foreground/65 hover:text-foreground hover:border-[oklch(0.68_0.18_285/0.45)] transition"
            >
              做{step.suiteLabel}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
