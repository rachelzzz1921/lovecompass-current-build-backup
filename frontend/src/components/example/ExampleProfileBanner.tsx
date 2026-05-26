import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function ExampleProfileBanner({ name }: { name: string }) {
  return (
    <div className="relative z-20 w-full max-w-6xl mx-auto min-w-0 px-4 sm:px-6 md:px-12 pt-3 sm:pt-4">
      <div className="rounded-2xl border border-[oklch(0.68_0.18_285/0.35)] bg-[oklch(0.18_0.022_270/0.85)] backdrop-blur-md px-4 py-3 md:px-5 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <Sparkles className="h-4 w-4 shrink-0 text-[oklch(0.82_0.14_200)] mt-0.5" />
          <div className="min-w-0">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">
              // EXAMPLE · 示范档案
            </div>
            <p className="text-sm text-foreground/85 mt-1 leading-relaxed">
              以下为 {name} 的推演示范，非真实答题生成。SELF / ROS / MATE 结果供体验产品形态。
            </p>
          </div>
        </div>
        <Link
          to="/#examples"
          className="shrink-0 text-xs font-mono tracking-wider text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-full border border-border/60"
        >
          ← 返回案例列表
        </Link>
      </div>
    </div>
  );
}
