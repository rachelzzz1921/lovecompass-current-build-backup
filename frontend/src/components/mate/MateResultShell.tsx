import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { mateLayout, MATE_PAGE_BG } from "@/lib/mateLayout";

export function MateResultShell({
  children,
  showHeader = true,
}: {
  children: ReactNode;
  showHeader?: boolean;
}) {
  return (
    <main className={mateLayout.main} style={{ background: MATE_PAGE_BG }}>
      {showHeader ? (
        <header className={mateLayout.header} style={{ background: mateLayout.headerFade }}>
          <Link to="/" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition shrink-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">返回</span>
          </Link>
          <span className="chip chip-rose font-mono text-[10px] tracking-[0.25em] shrink-0">
            SET · 03 / MATE
          </span>
        </header>
      ) : null}
      <div className={mateLayout.container}>{children}</div>
    </main>
  );
}
