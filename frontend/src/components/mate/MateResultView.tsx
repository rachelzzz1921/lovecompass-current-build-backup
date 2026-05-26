import { Link } from "@tanstack/react-router";
import { Bot, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { MateResult } from "@/data/mateTypes";
import { LiteResultNotice } from "@/components/LiteResultNotice";
import { SuiteCrossSell } from "@/components/SuiteCrossSell";
import { SuiteUpgradeBanner } from "@/components/SuiteUpgradeBanner";
import { FloatingSectionNav } from "@/components/reading/FloatingSectionNav";
import { ResultReadingThreshold } from "@/components/reading/ResultReadingThreshold";
import { useFloatingResultNav } from "@/components/reading/useFloatingResultNav";
import { MateFooterMarquee } from "@/components/mate/MateV4Sections";
import { MateResultContent } from "@/components/mate/MateResultContent";
import { MateResultShell } from "@/components/mate/MateResultShell";
import { MATE_RESULT_SECTIONS } from "@/lib/readingSections";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import { inferSuiteTier } from "@/lib/suiteTier";
import { mateLayout } from "@/lib/mateLayout";

export function MateResultView({
  result,
  attemptId,
  suiteSlug,
  relationCode,
  coupleUnlocked,
  pairSupplementComplete,
  accuracyNote,
}: {
  result: MateResult;
  attemptId: string;
  suiteSlug: string | null;
  relationCode: string | null;
  coupleUnlocked: boolean;
  pairSupplementComplete: boolean;
  accuracyNote: string | null;
}) {
  const { activeSectionId, visible: showFloatingNav } = useFloatingResultNav(MATE_RESULT_SECTIONS);
  const quotes = result.socialQuotes.length ? result.socialQuotes : ["看起来一般，熟了以后会越来越上头"];

  const copyQuote = () => {
    navigator.clipboard.writeText(quotes[0]).then(() => toast.success("已复制语录")).catch(() => toast.error("复制失败"));
  };

  return (
    <MateResultShell>
      <LiteResultNotice productId="mate" suiteSlug={suiteSlug} accuracyNote={accuracyNote} />
      <ResultReadingThreshold productId="mate" headline={result.identityCard.title} surface="dark" />
      <MateResultContent result={result} attemptId={attemptId} showAiReport />

      {suiteSlug && inferSuiteTier(suiteSlug) === "lite" ? (
        <SuiteUpgradeBanner productId="mate" suiteSlug={suiteSlug} attemptId={attemptId} />
      ) : null}

      {relationCode && suiteSlug && inferSuiteTier(suiteSlug) !== "lite" ? (
        <section className={`${mateLayout.chapter} ${mateLayout.highlight}`}>
          <p className={mateLayout.monoLabel}>双人婚恋适配</p>
          {!pairSupplementComplete ? (
            <>
              <p className={mateLayout.proseSm}>
                先完成 13 道双人补充题（学历等单人题已作答会自动带入），再邀请 TA 解锁 P1–P6 婚恋适配报告。
              </p>
              <Link
                to="/mate/pair-supplement/$attemptId"
                params={{ attemptId }}
                className="flex items-center justify-center h-10 rounded-xl text-sm text-white/90 bg-white/[0.08] mt-3"
              >
                填写双人补充题
              </Link>
            </>
          ) : (
            <>
              <p className={mateLayout.proseSm}>
                {coupleUnlocked
                  ? "TA 已完成测评，你们的 MATE 双人报告已解锁。"
                  : "把关系码发给 TA，完成测评与补充题后双方可免费解锁双人报告。"}
              </p>
              <div className="font-mono text-base tracking-[0.12em] text-white break-all py-2">{relationCode}</div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={coupleUnlocked ? "/result/mate/couple/$code" : "/mate/invite/$code"}
                  params={{ code: relationCode }}
                  className="flex items-center justify-center h-10 rounded-xl text-sm text-white/90 bg-white/[0.08]"
                >
                  {coupleUnlocked ? "查看双人报告" : "邀请 TA"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(relationCode);
                    toast.success("关系码已复制");
                  }}
                  className="flex items-center justify-center h-10 rounded-xl text-sm text-white/80 border border-white/10"
                >
                  复制关系码
                </button>
              </div>
            </>
          )}
        </section>
      ) : relationCode && suiteSlug && inferSuiteTier(suiteSlug) === "lite" ? (
        <section className={`${mateLayout.chapter} ${mateLayout.highlight}`}>
          <p className={mateLayout.monoLabel}>双人婚恋适配</p>
          <p className={mateLayout.proseSm}>
            快速版不支持 MATE 双人匹配。升级完整版后可填写补充题并邀请 TA。
          </p>
        </section>
      ) : null}

      <SuiteCrossSell exclude="mate" variant="dark" />
      <MateFooterMarquee result={result} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/chat"
          search={chatRouteSearch(result.attemptId)}
          className="flex items-center justify-center gap-2 h-11 rounded-2xl text-sm chip chip-rose !py-2.5"
        >
          <Bot className="h-4 w-4" /> 找 AI 分析师
        </Link>
        <button
          type="button"
          onClick={copyQuote}
          className="flex items-center justify-center gap-2 h-11 rounded-2xl text-sm text-white/80 border border-white/10"
        >
          <Share2 className="h-4 w-4" /> 生成分享卡片
        </button>
      </div>

      <FloatingSectionNav
        visible={showFloatingNav}
        sections={MATE_RESULT_SECTIONS}
        activeSectionId={activeSectionId}
        tone="rose"
        appearance="solid"
      />
    </MateResultShell>
  );
}
