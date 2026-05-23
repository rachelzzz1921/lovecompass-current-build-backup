import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { lovecompassApi, type AttemptReport } from "@/lib/lovecompassApi";
import { ARCHETYPES, findArchetype, getArchetypeByCode } from "@/data/archetypes";
import type { Archetype } from "@/data/archetypes";
import { findTest } from "@/data/tests";
import { ScoreRing } from "@/components/ScoreRing";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { AbilityRadar } from "@/components/AbilityRadar";
import { Petals } from "@/components/Petals";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { formatApiErrorMessage } from "@/lib/apiErrors";
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

type ResultPayload = {
  dimensions?: ResultDimension[];
  archetype_code?: string;
  archetype_gender?: string;
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

const REPORT_PLACEHOLDER_MARKERS = ["正式 AI 深度报告可由后台任务继续生成", "【AI 占位回复】", "【智谱未配置】"];

const SELF_DIMENSION_META: Record<string, { name: string; core: string }> = {
  SA1: { name: "自我吸引感知", core: "我相信自己值得被爱吗？" },
  SA2: { name: "依恋焦虑", core: "我在关系里容易不安全感吗？" },
  SA3: { name: "依恋回避", core: "我在关系里容易逃避亲密吗？" },
  SA4: { name: "自我边界", core: "我能守住自己吗？" },
  SA5: { name: "情绪调节", core: "我能好好处理关系里的情绪吗？" },
  SA6: { name: "关系投入模式", core: "我是怎么爱人的？" },
};

function ResultPage() {
  const { attemptId } = useParams({ from: "/result/$attemptId" });
  const nav = useNavigate();
  const [data, setData] = useState<AttemptResult | null>(null);
  const [report, setReport] = useState<AttemptReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setError(null);
    setReport(null);
    setReportError(null);
    setReportLoading(false);
    lovecompassApi
      .getAttemptResult(attemptId)
      .then((r) => {
        if (ignore) return;
        const attempt = r.attempt as AttemptResult;
        setData(attempt);
        if (!isPlaceholderReport(attempt.ai_report)) {
          setReport({
            attemptId,
            status: "succeeded",
            content: attempt.ai_report ?? "",
            cached: true,
          });
          return;
        }
        setReportLoading(true);
        lovecompassApi
          .getAttemptReport(attemptId)
          .then((res) => {
            if (ignore) return;
            setReport(res.report);
            setData((current) => (current ? { ...current, ai_report: res.report.content } : current));
          })
          .catch((e) => {
            if (ignore) return;
            setReportError((e as Error).message);
          })
          .finally(() => {
            if (!ignore) setReportLoading(false);
          });
      })
      .catch((e) => {
        if (!ignore) setError(formatApiErrorMessage(e));
      });
    return () => {
      ignore = true;
    };
  }, [attemptId]);

  const normalized = useMemo(() => {
    if (!data) return null;
    const dimensions = normalizeSelfDimensions(data.result_payload?.dimensions, data.dimension_scores ?? data.scores);
    const ability = toAbilityScores(dimensions, data.dimension_scores ?? data.scores);
    const gender = normalizeGender(data.result_payload?.archetype_gender ?? data.archetype_gender);
    const designArchetype = resolveDesignArchetype(data, ability, gender);
    return { dimensions, ability, designArchetype };
  }, [data]);

  if (error) {
    return (
      <ApiErrorPanel
        title="画像加载失败"
        message={error}
        backTo={{ to: "/", label: "返回首页" }}
      />
    );
  }
  if (!data || !normalized) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">读取你的画像…</div>;

  const { ability, designArchetype: archetype } = normalized;
  const test = findTest(data.test_id);
  const axes = [
    { key: "at", label: "气场表达", value: ability.at },
    { key: "in", label: "亲密温度", value: ability.in },
    { key: "co", label: "生活协作", value: ability.co },
    { key: "ev", label: "成长意愿", value: ability.ev },
    { key: "rk", label: "稳定从容", value: Math.max(0, 100 - ability.rk) },
  ];
  const reportMarkdown = report?.content ?? data.ai_report ?? "";

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`我的婚恋画像：${archetype.emoji} ${archetype.name} —— ${archetype.tagline}\n${window.location.href}`);
      toast.success("已复制到剪贴板");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <main className="relative min-h-screen">
      <Petals count={10} />
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-8">
        <Link to="/" className="font-display text-lg text-gradient-sakura">墨樱 · 婚恋画像</Link>
        <Link to="/history" className="text-xs tracking-[0.3em] text-muted-foreground">我的画像 →</Link>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-12">
        <div className="text-center">
          <div className="text-xs tracking-[0.5em] text-muted-foreground">{test?.code ?? data.test_id} · {test?.title ?? "自我关系模式测试"}</div>
          <h1 className="font-display text-4xl md:text-5xl mt-3 text-gradient-sakura">{archetype.name}</h1>
          <p className="mt-2 text-foreground/75 italic">「{archetype.tagline}」</p>
          <div className="mt-8 flex justify-center">
            <ScoreRing value={Number(data.ros_index ?? average(Object.values(ability)))} label="关系展望" />
          </div>
        </div>

        <div className="mt-12">
          <ArchetypeCard a={archetype} />
        </div>

        <div className="mt-12 bg-glass rounded-3xl p-8">
          <div className="text-xs tracking-[0.3em] text-muted-foreground">能力雷达 · YOUR ABILITY MAP</div>
          <h3 className="font-display text-2xl mt-2 text-foreground">能力倾向</h3>
          <div className="flex flex-col md:flex-row items-center gap-8 mt-6">
            <AbilityRadar data={axes} />
            <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
              {axes.map((a) => (
                <div key={a.key} className="rounded-xl border border-border/60 p-3">
                  <div className="text-xs text-muted-foreground">{a.label}</div>
                  <div className="font-display text-2xl mt-1 text-sakura">{a.value}</div>
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
              {reportLoading && (
                <div className="mb-4 rounded-2xl border border-sakura/20 bg-sakura/10 px-4 py-3 text-sm text-foreground/75">
                  正在生成你的画像故事…这通常只需要几秒。
                </div>
              )}
              {reportError && (
                <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-foreground/75">
                  深度报告暂未生成成功，先展示基础画像：{reportError}
                </div>
              )}
              {report?.generatedAt && (
                <div className="mb-4 text-xs tracking-[0.2em] text-muted-foreground">AI 深度报告 · {new Date(report.generatedAt).toLocaleString()}</div>
              )}
              <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-gradient-sakura prose-h2:text-2xl prose-p:text-foreground/85 prose-li:text-foreground/85">
                <ReactMarkdown>{reportMarkdown || archetype.description}</ReactMarkdown>
              </article>
            </TabsContent>
            <TabsContent value="strengths" className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs tracking-[0.3em] text-muted-foreground mb-3">高光特质</div>
                <ul className="space-y-2">{archetype.traits.map((t) => <li key={t} className="text-sm">· {t}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs tracking-[0.3em] text-muted-foreground mb-3">温柔提醒</div>
                <ul className="space-y-2">{archetype.cautions.map((t) => <li key={t} className="text-sm">· {t}</li>)}</ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          <Button onClick={share} className="rounded-full bg-gradient-to-r from-[oklch(0.78_0.14_350)] to-[oklch(0.55_0.18_355)] text-primary-foreground h-11 px-6">复制分享</Button>
          <Button variant="outline" className="rounded-full h-11 px-6" onClick={() => nav({ to: "/chat", search: { attemptId, analystId: "mirror" } })}>和分析师聊聊</Button>
          <Button variant="outline" className="rounded-full h-11 px-6" onClick={() => nav({ to: "/tests/$id", params: { id: data.test_id } })}>再做一次</Button>
          <Button variant="outline" className="rounded-full h-11 px-6" onClick={() => nav({ to: "/history" })}>我的历史</Button>
        </div>
      </section>
    </main>
  );
}

function isPlaceholderReport(report?: string | null) {
  if (!report) return true;
  return REPORT_PLACEHOLDER_MARKERS.some((marker) => report.includes(marker));
}

function normalizeSelfDimensions(rawDimensions: unknown, rawScores: unknown): ResultDimension[] {
  if (Array.isArray(rawDimensions) && rawDimensions.length > 0) {
    return rawDimensions
      .map((item) => item as Partial<ResultDimension>)
      .filter((item) => item.code && Number.isFinite(Number(item.score)))
      .map((item) => {
        const meta = SELF_DIMENSION_META[item.code as string] ?? { name: item.name ?? String(item.code), core: item.core ?? "" };
        return { code: String(item.code), name: String(item.name ?? meta.name), core: item.core ?? meta.core, score: clampScore(Number(item.score)) };
      });
  }
  const scoreObj = (rawScores && typeof rawScores === "object" ? rawScores : {}) as Record<string, unknown>;
  return Object.entries(SELF_DIMENSION_META).map(([code, meta]) => ({ code, name: meta.name, core: meta.core, score: clampScore(Number(scoreObj[code] ?? 0)) }));
}

function resolveDesignArchetype(data: AttemptResult, ability: { at: number; in: number; co: number; ev: number; rk: number }, gender: "M" | "F" | null): Archetype {
  const candidateCode = String(data.result_payload?.archetype_code ?? data.archetype_code ?? "");
  const byCode = getArchetypeByCode(candidateCode);
  if (byCode) return byCode;
  if (candidateCode) {
    const byName = ARCHETYPES.find((item) => item.name === candidateCode || `${item.emoji} ${item.name}` === candidateCode);
    if (byName) return byName;
  }
  return findArchetype(ability, gender);
}

function normalizeGender(value: unknown): "M" | "F" | null {
  const text = String(value ?? "").toUpperCase();
  if (text === "M" || text === "MALE") return "M";
  if (text === "F" || text === "FEMALE") return "F";
  return null;
}

function toAbilityScores(dimensions: ResultDimension[], rawScores: unknown): { at: number; in: number; co: number; ev: number; rk: number } {
  const scoreObj = (rawScores && typeof rawScores === "object" ? rawScores : {}) as Record<string, unknown>;
  const byCode = Object.fromEntries(dimensions.map((item) => [item.code, item.score]));
  const sa1 = num(byCode.SA1 ?? scoreObj.SA1, 68);
  const sa2 = num(byCode.SA2 ?? scoreObj.SA2, 35);
  const sa3 = num(byCode.SA3 ?? scoreObj.SA3, 35);
  const sa4 = num(byCode.SA4 ?? scoreObj.SA4, 68);
  const sa5 = num(byCode.SA5 ?? scoreObj.SA5, 68);
  const sa6 = num(byCode.SA6 ?? scoreObj.SA6, 68);
  return {
    at: clampScore((sa1 * 0.7 + sa5 * 0.3)),
    in: clampScore(((100 - sa2) * 0.45 + (100 - sa3) * 0.25 + sa6 * 0.3)),
    co: clampScore((sa4 * 0.55 + sa6 * 0.45)),
    ev: clampScore((sa5 * 0.6 + sa4 * 0.4)),
    rk: clampScore((sa2 * 0.55 + sa3 * 0.45)),
  };
}

function num(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}
