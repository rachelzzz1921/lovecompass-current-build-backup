import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { REL_STAGES, type RosSingleResult } from "@/data/rosTypes";
import { SuiteUpgradeBanner } from "@/components/SuiteUpgradeBanner";
import { LiteResultNotice } from "@/components/LiteResultNotice";
import { SuiteCrossSell } from "@/components/SuiteCrossSell";
import { FloatingSectionNav } from "@/components/reading/FloatingSectionNav";
import { ResultReadingThreshold } from "@/components/reading/ResultReadingThreshold";
import { useFloatingResultNav } from "@/components/reading/useFloatingResultNav";
import { ROS_RESULT_SECTIONS } from "@/lib/readingSections";
import { RESULT_PAGE_BG, resultChrome, resultProductChipClass } from "@/lib/resultChrome";
import { inferSuiteTier, type SuiteTier } from "@/lib/suiteTier";
import { RelationshipWeatherHero } from "@/components/ros-result/RelationshipWeatherHero";
import { RosStageCurve } from "@/components/ros-result/RosStageCurve";
import { RosFiveLayers } from "@/components/ros-result/RosFiveLayers";
import { RosHeartbeatLine, RosBlindSpot } from "@/components/ros-result/RosHeartbeatLine";
import { RosResultNext } from "@/components/ros-result/RosResultNext";
import { RosCoupleInvitePanel } from "@/components/ros-result/RosCoupleInvitePanel";
import { RosShareCardDialog } from "@/components/ros-result/RosShareCardDialog";

import type { ExampleSubject } from "@/lib/exampleSubjectCopy";

export type RosResultViewProps = {
  result: RosSingleResult;
  attemptId: string;
  coupleUnlocked?: boolean;
  suiteSlug?: string | null;
  suiteTier?: SuiteTier | null;
  accuracyNote?: string | null;
  exampleMode?: boolean;
  exampleSubject?: ExampleSubject;
  examplePartner?: string;
};

export function RosResultView({
  result,
  attemptId,
  coupleUnlocked = false,
  suiteSlug,
  suiteTier = null,
  accuracyNote,
  exampleMode = false,
  exampleSubject,
  examplePartner,
}: RosResultViewProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const stage = REL_STAGES[Math.min(Math.max(result.stageId, 1), REL_STAGES.length) - 1];
  const resonance = result.resonance?.score ?? Math.round(
    result.dims.reduce((s, d) => s + d.value, 0) / Math.max(result.dims.length, 1),
  );
  const tier = result.resonance?.tier ?? "深度共鸣";
  const tierDesc = result.resonance?.desc;
  const weather = result.weather ?? {
    icon: "cloud-sun" as const,
    label: "多云转晴",
    sub: "有一些小摩擦，但在往好的方向走",
  };
  const { activeSectionId, visible: showFloatingNav } = useFloatingResultNav(ROS_RESULT_SECTIONS);
  const isLiteResult =
    suiteTier === "lite" || (suiteSlug ? inferSuiteTier(suiteSlug) === "lite" : false);

  return (
    <main className={resultChrome.page} style={{ background: RESULT_PAGE_BG }}>
      {!exampleMode ? (
        <header
          className={resultChrome.header}
          style={{ background: resultChrome.headerFade }}
        >
          <Link to="/" className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">返回</span>
          </Link>
          <span className={`chip ${resultProductChipClass("ros")} font-mono text-[10px] tracking-[0.25em]`}>
            SET · 02 / ROS
          </span>
        </header>
      ) : null}

      <div className="max-w-[480px] mx-auto px-5 pb-24 space-y-10">
        {!exampleMode ? (
          <LiteResultNotice productId="ros" suiteSlug={suiteSlug} accuracyNote={accuracyNote} />
        ) : null}
        {!exampleMode ? (
          <ResultReadingThreshold
            productId="ros"
            headline={result.type.name}
            surface="dark"
          />
        ) : null}

        {!exampleMode ? (
          <RosCoupleInvitePanel
            relationCode={result.code}
            coupleUnlocked={coupleUnlocked}
            suiteSlug={suiteSlug}
            suiteTier={suiteTier}
          />
        ) : null}

        <section id="ros-hero" className="scroll-mt-32 space-y-5">
          <RelationshipWeatherHero
            weather={weather}
            resonance={resonance}
            tier={tier}
            tierDesc={tierDesc}
            timeLabel={result.timeLabel}
            stageName={stage?.name ?? "重建信任"}
          />
          {result.staticCopy?.hero_quote || result.staticCopy?.type?.hero_quote ? (
            <p className="text-sm text-white/60 leading-relaxed italic px-1">
              「{result.staticCopy.hero_quote ?? result.staticCopy.type?.hero_quote}」
            </p>
          ) : null}
          <RosStageCurve currentId={result.stageId} exampleMode={exampleMode} exampleSubject={exampleSubject} examplePartner={examplePartner} />
          <div className="flex items-baseline justify-between px-1">
            <div className="font-display text-xl text-white">{result.type.name}</div>
            <div className="text-xs text-white/50 max-w-[55%] text-right">{result.type.one_liner}</div>
          </div>
        </section>

        <div className="relative py-4">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] font-mono text-white/35">
            <span>↓</span>
            <span>五层结构</span>
          </div>
        </div>

        <section id="ros-layers" className="scroll-mt-32">
          <RosFiveLayers
            result={result}
            attemptId={attemptId}
            inviteCode={result.code}
            suiteSlug={suiteSlug}
            suiteTier={suiteTier}
            exampleMode={exampleMode}
          />
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <section id="ros-pulse" className="scroll-mt-32">
          <RosHeartbeatLine result={result} exampleMode={exampleMode} />
          <RosBlindSpot text={result.aiContent?.blind_spot} attemptId={attemptId} result={result} exampleMode={exampleMode} />
        </section>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <section id="ros-next" className="scroll-mt-32">
          <RosResultNext
            result={result}
            attemptId={attemptId}
            onShare={() => setShareOpen(true)}
            exampleMode={exampleMode}
            exampleSubject={exampleSubject}
            examplePartner={examplePartner}
          />
        </section>

        {!exampleMode ? (
          <>
            {isLiteResult && suiteSlug ? (
              <SuiteUpgradeBanner productId="ros" suiteSlug={suiteSlug} attemptId={attemptId} />
            ) : null}

            <SuiteCrossSell exclude="ros" variant="dark" />
          </>
        ) : null}
      </div>

      {!exampleMode ? (
        <RosShareCardDialog result={result} open={shareOpen} onOpenChange={setShareOpen} />
      ) : null}

      {!exampleMode ? (
        <FloatingSectionNav
          visible={showFloatingNav}
          sections={ROS_RESULT_SECTIONS}
          activeSectionId={activeSectionId}
          tone="indigo"
          appearance="glass"
        />
      ) : null}
    </main>
  );
}
