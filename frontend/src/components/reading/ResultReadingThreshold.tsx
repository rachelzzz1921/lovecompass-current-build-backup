import { ChevronDown } from "lucide-react";
import { PRODUCTS, type ProductId } from "@/data/products";

const THRESHOLD_ACCENT: Record<
  ProductId,
  { line: string; chip: string; glow: string; hint: string }
> = {
  self: {
    line: "from-transparent via-[oklch(0.68_0.18_285/0.55)] to-transparent",
    chip: "border-[oklch(0.68_0.18_285/0.45)] bg-[oklch(0.50_0.20_285/0.12)] text-[oklch(0.82_0.14_200)]",
    glow: "bg-[oklch(0.68_0.18_285/0.08)]",
    hint: "text-[oklch(0.78_0.12_285/0.85)]",
  },
  ros: {
    line: "from-transparent via-[#818cf8]/55 to-transparent",
    chip: "border-[rgba(99,102,241,0.45)] bg-[rgba(99,102,241,0.12)] text-[#a5a8ff]",
    glow: "bg-[rgba(99,102,241,0.08)]",
    hint: "text-[#a5a8ff]/85",
  },
  mate: {
    line: "from-transparent via-[#fb7185]/55 to-transparent",
    chip: "border-[rgba(244,114,182,0.45)] bg-[rgba(244,114,182,0.12)] text-[#f9a8d4]",
    glow: "bg-[rgba(244,114,182,0.08)]",
    hint: "text-[#f9a8d4]/85",
  },
};

export function ResultReadingThreshold({
  productId,
  headline,
  chipLabel,
  productTitle,
  productSubtitle,
  surface = "light",
  kicker = "进入分析结果",
}: {
  productId: ProductId;
  /** 主标题，如「示范 · 黛玉」或「安全型 · 探索者」 */
  headline: string;
  /** 顶栏 chip，默认用产品 code */
  chipLabel?: string;
  productTitle?: string;
  productSubtitle?: string;
  surface?: "light" | "dark";
  kicker?: string;
}) {
  const product = PRODUCTS.find((p) => p.id === productId)!;
  const accent = THRESHOLD_ACCENT[productId];
  const onDark = surface === "dark";

  return (
    <section
      aria-label={kicker}
      className="relative w-full min-w-0 px-4 sm:px-6 md:px-12 pt-10 sm:pt-12 md:pt-16 pb-8 sm:pb-10 md:pb-14"
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 sm:h-32 ${accent.glow} blur-3xl opacity-80`}
        aria-hidden
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <span className={`h-px w-10 sm:w-16 bg-gradient-to-r ${accent.line}`} aria-hidden />
          <span
            className={`font-mono text-[10px] sm:text-[11px] tracking-[0.38em] uppercase ${
              onDark ? "text-white/45" : "text-muted-foreground"
            }`}
          >
            {kicker}
          </span>
          <span className={`h-px w-10 sm:w-16 bg-gradient-to-l ${accent.line}`} aria-hidden />
        </div>

        <div className="mt-6 sm:mt-8 space-y-3">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.28em] ${accent.chip}`}
          >
            {chipLabel ?? product.code}
          </span>
          <h2
            className={`font-display text-2xl sm:text-3xl md:text-[2.125rem] leading-tight ${
              onDark ? "text-white" : "text-foreground"
            }`}
          >
            {headline}
          </h2>
          <p className={`text-base sm:text-lg font-medium ${accent.hint}`}>
            {productTitle ?? product.title}
          </p>
          <p
            className={`text-sm max-w-md mx-auto leading-relaxed pt-1 ${
              onDark ? "text-white/55" : "text-foreground/55"
            }`}
          >
            {productSubtitle ?? product.subtitle}
          </p>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3">
          <div className={`h-px w-full max-w-xs bg-gradient-to-r ${accent.line}`} aria-hidden />
          <div className="min-h-[1.25rem] sm:min-h-[1.75rem]" aria-hidden />
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] ${accent.chip}`}
          >
            正文开始
            <ChevronDown className="h-3.5 w-3.5 animate-bounce" strokeWidth={2.5} aria-hidden />
          </span>
        </div>
      </div>
    </section>
  );
}
