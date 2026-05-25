import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productFlowSpec, getProductMeta } from "@/lib/productRegistry";
import { productTheme } from "@/lib/productTheme";
import {
  PORTRAIT_SUITE_ORDER,
  productEntryPath,
  productNeedsUnlock,
  productStartLabel,
} from "@/lib/productRoutes";
import type { ProductId } from "@/lib/suiteTier";

type Props = {
  exclude?: ProductId;
  variant?: "light" | "dark";
  heading?: string;
};

export function SuiteCrossSell({
  exclude,
  variant = "light",
  heading = "继续画像路径 · NEXT STEPS",
}: Props) {
  const isDark = variant === "dark";
  const items = PORTRAIT_SUITE_ORDER.filter((id) => id !== exclude).map((id) => getProductMeta(id));

  return (
    <div className="mt-10 space-y-3">
      <div className="flex items-center gap-3">
        <div className={`flex-1 divider-line ${isDark ? "opacity-40" : ""}`} />
        <span
          className={`font-mono text-[10px] tracking-[0.35em] ${isDark ? "text-white/45" : "text-muted-foreground"}`}
        >
          {heading}
        </span>
        <div className={`flex-1 divider-line ${isDark ? "opacity-40" : ""}`} />
      </div>

      {items.map((p) => {
        const spec = productFlowSpec(p.id);
        const theme = productTheme(p.id);
        const needsUnlock = productNeedsUnlock(p.id);
        const ctaLabel = productStartLabel(p.id, p.status === "free" ? "lite" : "full");
        const entry = productEntryPath(p.id);

        return (
          <div
            key={p.id}
            className={`relative rounded-2xl p-5 md:p-6 overflow-hidden ${
              isDark
                ? "bg-white/[0.03] ring-1 ring-white/[0.08]"
                : "bg-glass-strong ring-1 ring-border/30"
            }`}
          >
            <div
              className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${theme.accentRing} blur-3xl pointer-events-none`}
            />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div
                  className={`font-mono text-[10px] tracking-[0.3em] ${isDark ? "text-white/40" : "text-muted-foreground"}`}
                >
                  {p.code}
                </div>
                <div className={`font-display text-lg mt-1.5 ${isDark ? "text-white" : "text-foreground"}`}>
                  {p.title}
                </div>
                <div
                  className={`text-[13px] mt-1 leading-relaxed ${isDark ? "text-white/60" : "text-foreground/65"}`}
                >
                  {spec.crossSellHint}
                </div>
              </div>
              {needsUnlock ? (
                <Button
                  asChild
                  variant="outline"
                  className={`rounded-full shrink-0 ${
                    isDark
                      ? "border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      : "border-border/60 bg-secondary/30"
                  }`}
                >
                  <Link to="/access" search={{ product: p.id }}>
                    {ctaLabel}
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className={`rounded-full shrink-0 ${
                    isDark
                      ? `bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground`
                      : ""
                  }`}
                >
                  <Link to={entry}>
                    {ctaLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
