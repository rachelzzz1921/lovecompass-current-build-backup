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
import { FloatingSectionNav } from "@/components/reading/FloatingSectionNav";
import { ResultReadingThreshold } from "@/components/reading/ResultReadingThreshold";
import { useFloatingResultNav } from "@/components/reading/useFloatingResultNav";
import { SELF_RESULT_SECTIONS } from "@/lib/readingSections";
import type { ExampleSubject } from "@/lib/exampleSubjectCopy";
import { useIsMobile } from "@/hooks/use-mobile";

export type SelfResultViewProps = {
  result: SelfResult;
  attemptId?: string;
  suiteSlug?: string | null;
  reportMarkdown?: string;
  reportLoading?: boolean;
  reportError?: string | null;
  onRequestDeepReport?: () => void;
  deepReportRequesting?: boolean;
  accuracyNote?: string | null;
  /** 首页示范档案：隐藏升级引导、跳过 API */
  exampleMode?: boolean;
  exampleSubject?: ExampleSubject;
};

export function SelfResultView({
  result,
  attemptId,
  suiteSlug,
  reportMarkdown,
  reportLoading = false,
  reportError = null,
  onRequestDeepReport,
  deepReportRequesting = false,
  accuracyNote,
  exampleMode = false,
  exampleSubject,
}: SelfResultViewProps) {
  const actOneRef = useRef<HTMLDivElement>(null);
  const [characterRevealed, setCharacterRevealed] = useState(false);
  const isMobile = useIsMobile();
  const { activeSectionId, visible: showFloatingNav } = useFloatingResultNav(SELF_RESULT_SECTIONS);

  const scrollToActOne = useCallback(() => {
    actOneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className={`relative w-full min-w-0 overflow-x-hidden ${exampleMode ? "" : "min-h-screen pb-32 md:pb-28"}`}>
      {!exampleMode ? (
        <header className="relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-6 md:px-12 pt-4 sm:pt-6">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition shrink-0">
            <ArrowLeft className="h-4 w-4" /> 返回
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2 min-w-0">
            <span className="chip chip-cyan font-mono text-[10px] sm:text-xs">SET · 01 / SELF</span>
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
      ) : null}

      <div className="relative z-10 w-full max-w-3xl mx-auto min-w-0 px-4 sm:px-6 md:px-12 pb-12 md:pb-16">
        {!exampleMode ? (
          <LiteResultNotice productId="self" suiteSlug={suiteSlug} accuracyNote={accuracyNote} className="mb-6" />
        ) : null}
        {!exampleMode ? (
          <ResultReadingThreshold
            productId="self"
            headline={result.archetype.name}
            surface="light"
          />
        ) : null}
        <SelfResultOverture
          result={result}
          onScrollToActOne={scrollToActOne}
          exampleSubject={exampleSubject}
          orbSize={isMobile ? 156 : 180}
        />

        <div ref={actOneRef} className="mb-2">
          <SelfActOneMirror result={result} attemptId={attemptId} exampleSubject={exampleSubject} />
        </div>

        <SelfActTwoReveal
          character={result.character}
          matches={result.matches}
          onRevealedChange={setCharacterRevealed}
          exampleSubject={exampleSubject}
        />

        <SelfActThreeInsight
          result={result}
          attemptId={attemptId}
          reportMarkdown={reportMarkdown}
          reportLoading={reportLoading}
          reportError={reportError}
          exampleSubject={exampleSubject}
          onRequestDeepReport={onRequestDeepReport}
          deepReportRequesting={deepReportRequesting}
        />

        <SelfResultCoda
          result={result}
          attemptId={exampleMode ? undefined : attemptId}
          suiteSlug={exampleMode ? null : suiteSlug}
          characterRevealed={characterRevealed}
          exampleMode={exampleMode}
        />
      </div>

      {!exampleMode ? (
        <FloatingSectionNav
          visible={showFloatingNav}
          sections={SELF_RESULT_SECTIONS}
          activeSectionId={activeSectionId}
          tone="violet"
          appearance="glass"
        />
      ) : null}
    </div>
  );
}
