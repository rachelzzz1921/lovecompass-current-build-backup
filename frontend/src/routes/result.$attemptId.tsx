import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { findTest } from "@/data/tests";
import { ScoreRing } from "@/components/ScoreRing";
import { AbilityRadar } from "@/components/AbilityRadar";
import { Petals } from "@/components/Petals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/result/$attemptId")({
  component: ResultPage,
});

type ResultDimension = {
  code: string;
  name: string;
  core?: string;
  score: number;
};

type ArchetypeProfile = {
  attachment_type?: string;
  tagline?: string;
  description?: string;
  matching_logic?: string;
  radar_baseline?: Record<string, number>;
};

type ResultPayload = {
  attachment_type?: string;
  archetype_code?: string;
  dimensions?: ResultDimension[];
  archetype_profile?: ArchetypeProfile;
};

type AttemptResult = {
  id: string;
  test_id: string;
  scores?: Record<string, number>;
  dimension_scores?: Record<string, number>;
  archetype_code?: string;
  archetype_gender?: string;
  ros_index?: number;
  ai_report?: string;
  result_payload?: ResultPayload;
};

const SELF_DIMENSION_META: Record<string, { name: string; core: string }> = {
  SA1: { name: "自我吸引感知", core: "我相信自己值得被爱吗？" },
  SA2: { name: "依恋焦虑", core: "我在关系里容易不安全感吗？" },
  SA3: { name: "依恋回避", core: "我在关系里容易逃避亲密吗？" },
  SA4: { name: "自我边界", core: "我能守住自己吗？" },
  SA5: { name: "情绪调节", core: "我能好好处理关系里的情绪吗？" },
  SA6: { name: "关系投入模式", core: "我是怎么爱人的？" },
};

const RED_CHAMBER_FALLBACK: Record<string, ArchetypeProfile> = {
  薛宝钗: {
    attachment_type: "安全型",
    tagline: "你是关系里最稀有的人",
    description:
      "清醒但不冷漠，温柔但有边界。不会因为爱一个人而失去自己，也不需要对方时刻确认才能安心。",
    matching_logic: "情绪稳定、边界清晰、能给能收、不因爱失去自我",
  },
  林黛玉: {
    attachment_type: "焦虑型",
    tagline: "你的敏感是一种天赋，不是缺陷",
    description: "你比任何人都更能感受到关系里的细微变化，爱得深、想得多，是因为你把感情当真。",
    matching_logic: "高敏感、需要被确认、爱得深但安全感弱、把感情当真的人",
  },
  妙玉: {
    attachment_type: "回避型",
    tagline: "你不是不懂爱，你只是对平庸的亲密没有兴趣",
    description: "你有极高的精神标准，不轻易让人靠近，是因为你深知自己值得真正懂你的人。",
    matching_logic: "高冷疏离、精神标准极高、渴望亲密却主动筑墙、等到懂的人才开放",
  },
  史湘云: {
    attachment_type: "混合型",
    tagline: "你是关系里最有生命力的那种人",
    description: "时而热烈时而需要空间，不是因为你不稳定，而是因为你足够真实。",
    matching_logic: "时而热烈时而需要空间、情绪真实不表演、足够复杂才足够有趣",
  },
  王熙凤: {
    attachment_type: "高边界安全型",
    tagline: "你是感情里最有掌控力的人",
    description: "清楚自己要什么，不会被情绪带着走，爱得现实但绝对忠诚。你的边界不是冷漠，是尊重。",
    matching_logic: "掌控感强、边界极硬、爱得现实但绝对忠诚、尊重自己才能尊重感情",
  },
  袭人: {
    attachment_type: "低自我高投入型",
    tagline: "你是感情里最有温度的人",
    description: "你的爱是具体的、日常的、落在每一个细节里的。你懂得如何让一个人感到被珍视。",
    matching_logic: "爱得具体日常、落在细节里、温度最高、懂得让人感到被珍视",
  },
};

function ResultPage() {
  const { attemptId } = useParams({ from: "/result/$attemptId" });
  const nav = useNavigate();
  const [data, setData] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lovecompassApi
      .getAttemptResult(attemptId)
      .then((r) => setData(r.attempt as AttemptResult))
      .catch((e) => setError((e as Error).message));
  }, [attemptId]);

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        {error}
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        读取你的画像…
      </div>
    );

  const test = findTest(data.test_id);
  const resultPayload = (data.result_payload ?? {}) as ResultPayload;
  const archetypeCode = String(resultPayload.archetype_code ?? data.archetype_code ?? "史湘云");
  const profile =
    resultPayload.archetype_profile ??
    RED_CHAMBER_FALLBACK[archetypeCode] ??
    RED_CHAMBER_FALLBACK.史湘云;
  const attachmentType = resultPayload.attachment_type ?? profile.attachment_type ?? "混合型";
  const dimensions = normalizeSelfDimensions(
    resultPayload.dimensions,
    data.dimension_scores ?? data.scores,
  );
  const axes = dimensions.map((dimension) => ({
    key: dimension.code,
    label: dimension.name,
    value: dimension.score,
  }));
  const highlights = splitMatchingLogic(profile.matching_logic);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(
        `我的 LoveCompass 画像：${archetypeCode}（${attachmentType}）—— ${profile.tagline ?? ""}\n${window.location.href}`,
      );
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <main className="relative min-h-screen">
      <Petals count={10} />
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-8">
        <Link to="/" className="font-display text-lg text-gradient-sakura">
          墨樱 · 婚恋画像
        </Link>
        <Link to="/history" className="text-xs tracking-[0.3em] text-muted-foreground">
          我的画像 →
        </Link>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-12">
        <div className="text-center">
          <div className="text-xs tracking-[0.5em] text-muted-foreground">
            {test?.code ?? data.test_id} · {test?.title ?? "自我关系模式测试"}
          </div>
          <h1 className="font-display text-4xl md:text-5xl mt-3 text-gradient-sakura">
            {archetypeCode}
          </h1>
          <p className="mt-2 text-foreground/75 italic">「{profile.tagline}」</p>
          <div className="mt-4 inline-flex rounded-full border border-sakura/30 bg-sakura/10 px-4 py-2 text-sm text-foreground/80">
            依恋类型：{attachmentType}
          </div>
          <div className="mt-8 flex justify-center">
            <ScoreRing value={Number(data.ros_index ?? 0)} label="综合指数" />
          </div>
        </div>

        <div className="mt-12 bg-glass rounded-3xl p-8 border border-border/60">
          <div className="text-xs tracking-[0.3em] text-muted-foreground">
            红楼人格 · RED CHAMBER ARCHETYPE
          </div>
          <h2 className="font-display text-3xl mt-2 text-foreground">{archetypeCode}</h2>
          <p className="mt-4 text-foreground/85 leading-8">{profile.description}</p>
          {profile.matching_logic && (
            <p className="mt-4 text-sm text-muted-foreground">
              人格关键词：{profile.matching_logic}
            </p>
          )}
        </div>

        <div className="mt-12 bg-glass rounded-3xl p-8">
          <div className="text-xs tracking-[0.3em] text-muted-foreground">
            SELF 六维画像 · YOUR RELATIONSHIP MAP
          </div>
          <h3 className="font-display text-2xl mt-2 text-foreground">自我关系能力雷达</h3>
          <div className="flex flex-col md:flex-row items-center gap-8 mt-6">
            <AbilityRadar data={axes} />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {dimensions.map((dimension) => (
                <div key={dimension.code} className="rounded-xl border border-border/60 p-3">
                  <div className="text-xs text-muted-foreground">
                    {dimension.code} · {dimension.name}
                  </div>
                  <div className="font-display text-2xl mt-1 text-sakura">{dimension.score}</div>
                  {dimension.core && (
                    <div className="mt-1 text-xs text-foreground/65">{dimension.core}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-glass rounded-3xl p-8">
          <Tabs defaultValue="report">
            <TabsList className="bg-secondary/40">
              <TabsTrigger value="report">画像故事</TabsTrigger>
              <TabsTrigger value="strengths">高光与提醒</TabsTrigger>
            </TabsList>
            <TabsContent value="report" className="mt-6">
              <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-gradient-sakura prose-h2:text-2xl prose-p:text-foreground/85 prose-li:text-foreground/85">
                <ReactMarkdown>{data.ai_report ?? ""}</ReactMarkdown>
              </article>
            </TabsContent>
            <TabsContent value="strengths" className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs tracking-[0.3em] text-muted-foreground mb-3">
                  人格关键词
                </div>
                <ul className="space-y-2">
                  {highlights.map((trait) => (
                    <li key={trait} className="text-sm">
                      · {trait}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs tracking-[0.3em] text-muted-foreground mb-3">温柔提醒</div>
                <p className="text-sm leading-7 text-foreground/80">
                  六维分数反映的是你在亲密关系中的当前模式，不是固定标签。后续套二、套三完成后，系统会继续叠加关系互动与择偶偏好数据，生成更完整的动态画像。
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          <Button
            onClick={share}
            className="rounded-full bg-gradient-to-r from-[oklch(0.78_0.14_350)] to-[oklch(0.55_0.18_355)] text-primary-foreground h-11 px-6"
          >
            复制分享
          </Button>
          <Button
            variant="outline"
            className="rounded-full h-11 px-6"
            onClick={() => nav({ to: "/chat", search: { attemptId, analystId: "mirror" } })}
          >
            和分析师聊聊
          </Button>
          <Button
            variant="outline"
            className="rounded-full h-11 px-6"
            onClick={() => nav({ to: "/tests/$id", params: { id: data.test_id } })}
          >
            再做一次
          </Button>
          <Button
            variant="outline"
            className="rounded-full h-11 px-6"
            onClick={() => nav({ to: "/history" })}
          >
            我的历史
          </Button>
        </div>
      </section>
    </main>
  );
}

function normalizeSelfDimensions(rawDimensions: unknown, rawScores: unknown): ResultDimension[] {
  if (Array.isArray(rawDimensions) && rawDimensions.length > 0) {
    return rawDimensions
      .map((item) => item as Partial<ResultDimension>)
      .filter((item) => item.code && Number.isFinite(Number(item.score)))
      .map((item) => {
        const meta = SELF_DIMENSION_META[item.code as string] ?? {
          name: item.name ?? String(item.code),
          core: item.core ?? "",
        };
        return {
          code: String(item.code),
          name: String(item.name ?? meta.name),
          core: item.core ?? meta.core,
          score: clampScore(Number(item.score)),
        };
      });
  }

  const scoreObj = (rawScores && typeof rawScores === "object" ? rawScores : {}) as Record<
    string,
    unknown
  >;
  return Object.entries(SELF_DIMENSION_META).map(([code, meta]) => ({
    code,
    name: meta.name,
    core: meta.core,
    score: clampScore(Number(scoreObj[code] ?? 0)),
  }));
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function splitMatchingLogic(value: string | undefined): string[] {
  const parts = (value ?? "")
    .split(/[、,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return parts.length ? parts : ["真实", "敏感", "有关系觉察力"];
}
