import { Link, useNavigate } from "@tanstack/react-router";
import { MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import type { SelfResult } from "@/data/mockResult";
import { Button } from "@/components/ui/button";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import { SuiteCrossSell } from "@/components/SuiteCrossSell";
import { SuiteUpgradeBanner } from "@/components/SuiteUpgradeBanner";
import { inferSuiteTier } from "@/lib/suiteTier";
import { SectionDivider } from "@/components/self-result/SectionDivider";
import { ShareCardDialog } from "@/components/self-result/ShareCardDialog";

type Props = {
  result: SelfResult;
  attemptId?: string;
  suiteSlug?: string | null;
  characterRevealed?: boolean;
};

export function SelfResultCoda({ result, attemptId, suiteSlug, characterRevealed = false }: Props) {
  const nav = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);

  const share = async () => {
    setShareOpen(true);
  };

  return (
    <section id="coda" className="scroll-mt-20 pb-8">
      <SectionDivider>解锁更深层 · UNLOCK DEEPER</SectionDivider>

      {suiteSlug && inferSuiteTier(suiteSlug) === "lite" ? (
        <SuiteUpgradeBanner productId="self" suiteSlug={suiteSlug} attemptId={attemptId} />
      ) : null}

      <SuiteCrossSell exclude="self" />

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button asChild variant="outline" className="rounded-xl h-12 bg-glass border-border/60 text-foreground">
          <Link to="/chat" search={chatRouteSearch(attemptId)}>
            <MessageCircle className="mr-2 h-4 w-4" /> 找 AI 分析师聊聊
          </Link>
        </Button>
        <Button
          onClick={share}
          className="rounded-xl h-12 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90 font-medium"
        >
          <Share2 className="mr-2 h-4 w-4" /> 生成分享卡片
        </Button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => nav({ to: "/" })}
          className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground hover:text-foreground transition"
        >
          ← 返回首页
        </button>
      </div>
      <ShareCardDialog result={result} open={shareOpen} onOpenChange={setShareOpen} characterRevealed={characterRevealed} />
    </section>
  );
}
