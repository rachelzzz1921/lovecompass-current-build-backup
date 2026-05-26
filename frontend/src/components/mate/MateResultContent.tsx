import type { MateResult } from "@/data/mateTypes";
import { AiReportSection } from "@/components/AiReportSection";
import { MateCoordinateStation } from "@/components/mate/MateCoordinateStation";
import { MateModuleRadarSection } from "@/components/mate/MateModuleRadarSection";
import {
  MateChapterHead,
  MateDivider,
  MateQuickJumpGrid,
  MateSubhead,
} from "@/components/mate/MateReadingChrome";
import {
  MateAdviceBubbles,
  MateIdentityDossier,
  MateInsightsPanel,
  MateLensGridPanel,
  MateMatchTemperature,
  MateMisunderstoodCard,
  MateObserveCarousel,
  MateParamSimulator,
  MateRecommendationLetter,
  MateRehearseNetflix,
  MateVenueGuide,
} from "@/components/mate/MateV4Sections";
import { mateLayout } from "@/lib/mateLayout";

export function MateResultContent({
  result,
  attemptId,
  showAiReport = false,
  compact = false,
}: {
  result: MateResult;
  attemptId?: string;
  showAiReport?: boolean;
  /** 范例页：省略章节导语 */
  compact?: boolean;
}) {
  return (
    <>
      <MateQuickJumpGrid />

      <MateModuleRadarSection
        result={result}
        label={
          <MateChapterHead
            index="第一章"
            title="五维得分"
            lead={compact ? undefined : "先看清各模块分数，再展开看依据与蜂巢结构"}
          />
        }
      />

      <MateDivider />

      <section id="mate-identity" className={mateLayout.chapter}>
        <MateChapterHead
          index="第二章"
          title="市场定位"
          lead={compact ? undefined : "你在择偶坐标系里落在哪一类人"}
        />
        <MateIdentityDossier result={result} />
      </section>

      <section id="mate-coordinate" className={mateLayout.chapterSub}>
        <MateSubhead>{compact ? "坐标站" : "坐标站 · 第一印象 × 托底感"}</MateSubhead>
        <MateCoordinateStation coord={result.marketCoordinate} />
      </section>

      {result.simulator ? (
        <section id="mate-simulator" className={mateLayout.chapterSub}>
          <MateSubhead>{compact ? "参数模拟" : "参数模拟 · 档案重组"}</MateSubhead>
          <MateParamSimulator result={result} />
        </section>
      ) : null}

      <MateDivider />

      <section id="mate-observe" className={mateLayout.chapter}>
        <MateChapterHead
          index="第三章"
          title="他人怎么看你"
          lead={compact ? undefined : "三个距离下的 witness 证词"}
        />
        <MateObserveCarousel result={result} />
        <MateMisunderstoodCard result={result} />
      </section>

      <section id="mate-rehearse" className={mateLayout.chapterSub}>
        <MateSubhead>{compact ? "恋爱预演" : "恋爱预演 · 三集时间线"}</MateSubhead>
        <MateRehearseNetflix result={result} />
      </section>

      <MateDivider />

      <section id="mate-advice" className={mateLayout.chapter}>
        <MateChapterHead
          index="第四章"
          title="红娘建议"
          lead={compact ? undefined : "好消息、提醒、以及只改一件事"}
        />
        <MateAdviceBubbles result={result} />
        <MateVenueGuide result={result} />
      </section>

      <section id="mate-match" className={mateLayout.chapterSub}>
        <MateSubhead>什么样的{result.gender === "female" ? "男性" : "女性"}更适合你</MateSubhead>
        <MateMatchTemperature result={result} />
        <MateRecommendationLetter result={result} />
      </section>

      <MateDivider />

      <section id="mate-lens" className={mateLayout.chapter}>
        <MateChapterHead
          index="第五章"
          title="透视镜"
          lead={compact ? undefined : "隐形资产、盲区与套一联动"}
        />
        <MateLensGridPanel result={result} />
        <MateInsightsPanel result={result} />
        {showAiReport && attemptId ? (
          <div className="pt-4">
            <AiReportSection attemptId={attemptId} title="AI · 择偶深度报告" />
          </div>
        ) : null}
      </section>
    </>
  );
}
