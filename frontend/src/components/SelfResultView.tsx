import { useCallback, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { SelfResult } from "@/data/mockResult";
import { SelfResultOverture } from "@/components/self-result/SelfResultOverture";
import { SelfActOneMirror } from "@/components/self-result/SelfActOneMirror";
import { SelfActTwoReveal } from "@/components/self-result/SelfActTwoReveal";
import { SelfActThreeInsight } from "@/components/self-result/SelfActThreeInsight";
import { SelfResultCoda } from "@/components/self-result/SelfResultCoda";
import { LiteResultNotice } from "@/components/LiteResultNotice";

export type SelfResultViewProps = {
  result: SelfResult;
  attemptId?: string;
  suiteSlug?: string | null;
  reportMarkdown?: string;
  reportLoading?: boolean;
  reportError?: string | null;
  accuracyNote?: string | null;
};

export function SelfResultView({
  result,
  attemptId,
  suiteSlug,
  reportMarkdown,
  reportLoading = false,
  reportError = null,
  accuracyNote,
}: SelfResultViewProps) {
  const actOneRef = useRef<HTMLDivElement>(null);
  const [characterRevealed, setCharacterRevealed] = useState(false);

  const scrollToActOne = useCallback(() => {
    actOneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="relative min-h-screen">
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> 返回
        </Link>
        <div className="flex items-center gap-3">
          <span className="chip chip-cyan font-mono">SET · 01 / SELF</span>
          <span className="chip font-mono hidden md:inline-flex">PROFILE · V3.0</span>
          {attemptId ? (
            <Link
              to="/history"
              className="text-xs tracking-[0.25em] text-muted-foreground hover:text-foreground transition hidden md:inline"
            >
              我的画像 →
            </Link>
          ) : null}
        </div>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 pb-16">
        <LiteResultNotice productId="self" suiteSlug={suiteSlug} accuracyNote={accuracyNote} className="mb-6" />
        <SelfResultOverture result={result} onScrollToActOne={scrollToActOne} />

        <div ref={actOneRef}>
          <SelfActOneMirror result={result} attemptId={attemptId} />
        </div>

        <SelfActTwoReveal
          character={result.character}
          matches={result.matches}
          onRevealedChange={setCharacterRevealed}
        />

        <SelfActThreeInsight
          result={result}
          attemptId={attemptId}
          reportMarkdown={reportMarkdown}
          reportLoading={reportLoading}
          reportError={reportError}
        />

        <SelfResultCoda
          result={result}
          attemptId={attemptId}
          suiteSlug={suiteSlug}
          characterRevealed={characterRevealed}
        />
      </div>
    </main>
  );
}
