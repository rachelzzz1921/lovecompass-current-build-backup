import { ChevronDown } from "lucide-react";

type Props = {
  children: React.ReactNode;
  /** chapter = 幕间大断点，强制阅读停顿 */
  variant?: "default" | "chapter";
  hint?: string;
};

export function SectionDivider({ children, variant = "default", hint }: Props) {
  if (variant === "chapter") {
    return (
      <div
        className="relative py-14 md:py-20 my-6 md:my-10"
        aria-hidden={false}
        role="separator"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-px divider-line opacity-80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 md:h-24 bg-gradient-to-b from-transparent to-background/40"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-transparent to-background/40"
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-4 px-4">
          <div className="rounded-full border border-[oklch(0.68_0.18_285/0.35)] bg-background/80 px-5 py-3 backdrop-blur-sm shadow-[0_8px_32px_-12px_oklch(0.50_0.20_285/0.5)]">
            <div className="font-mono text-[11px] md:text-xs tracking-[0.22em] text-muted-foreground text-center leading-relaxed max-w-[280px]">
              {children}
            </div>
          </div>
          {hint ? (
            <p className="text-[12px] text-foreground/55 text-center max-w-xs leading-relaxed">{hint}</p>
          ) : null}
          <ChevronDown className="h-4 w-4 text-[oklch(0.68_0.18_285/0.65)] animate-bounce" aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-10">
      <div className="flex-1 border-t border-dashed border-border/50" />
      <div className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground text-center leading-relaxed max-w-[220px]">
        {children}
      </div>
      <div className="flex-1 border-t border-dashed border-border/50" />
    </div>
  );
}
