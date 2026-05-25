import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import type { SelfResult } from "@/data/mockResult";
import { growthDimensionLabel, growthPathForCharacter } from "@/lib/selfGrowthPaths";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import { Button } from "@/components/ui/button";

type Props = {
  result: SelfResult;
  attemptId?: string;
};

export function GrowthTimeMachine({ result, attemptId }: Props) {
  const path = growthPathForCharacter(result.character.name);
  if (!path && !result.growthPathText) return null;

  const dimLabel = path ? growthDimensionLabel(path.keyDimension) : "关键维度";
  const prefill = path
    ? `我想聊聊成长路径：如果我的「${dimLabel}」提升一些，我会更接近${path.targetCharacter}型的状态吗？`
    : "我想聊聊我的成长路径。";

  return (
    <div className="mt-6 rounded-2xl border border-[oklch(0.82_0.14_200/0.25)] bg-[oklch(0.50_0.16_200/0.06)] p-5 md:p-6">
      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground flex items-center gap-2">
        <Sparkles className="h-3 w-3" /> // 如果是三年后的你
      </div>
      {result.growthPathText ? (
        <p className="text-[14px] text-foreground/85 mt-3 leading-relaxed">{result.growthPathText}</p>
      ) : path ? (
        <>
          <p className="text-[14px] text-foreground/85 mt-3 leading-relaxed">
            你的「{dimLabel}」如果再稳一些（大约 {path.delta} 分的方向），你会从「{result.character.name}型」更接近「
            {path.targetCharacter}型」的状态。
          </p>
          <p className="text-[13px] text-muted-foreground mt-2 mb-4">这意味着：</p>
          <ul className="space-y-1.5 text-[13px] text-foreground/75">
            {path.changes.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-[oklch(0.82_0.14_200)]">·</span>
                {line}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-lg bg-glass">
          <Link to="/chat" search={chatRouteSearch(attemptId, undefined, prefill)}>
            找 AI 分析师 <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
