import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { ARCHETYPES } from "@/data/archetypes";
import { findTest } from "@/data/tests";
import { ScoreRing } from "@/components/ScoreRing";
import { ArchetypeCard } from "@/components/ArchetypeCard";
import { AbilityRadar } from "@/components/AbilityRadar";
import { Petals } from "@/components/Petals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/result/$attemptId")({
  component: ResultPage,
});

function ResultPage() {
  const { attemptId } = useParams({ from: "/result/$attemptId" });
  const nav = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lovecompassApi.getAttemptResult(attemptId)
      .then((r) => setData(r.attempt as any))
      .catch((e) => setError((e as Error).message));
  }, [attemptId]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">读取你的画像…</div>;

  const archetype = ARCHETYPES.find((a) => a.code === data.archetype_code) ?? ARCHETYPES[0];
  const test = findTest(data.test_id);
  const s = normalizeScores(data.scores ?? data.dimension_scores);

  // 体面命名的"能力倾向"（不暴露内部维度名）
  const axes = [
    { key: "at", label: "气场表达", value: s.at },
    { key: "in", label: "亲密温度", value: s.in },
    { key: "co", label: "生活协作", value: s.co },
    { key: "ev", label: "成长意愿", value: s.ev },
    { key: "rk", label: "稳定从容", value: Math.max(0, 100 - s.rk) },
  ];

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`我的婚恋画像：${archetype.emoji} ${archetype.name} —— ${archetype.tagline}\n${window.location.href}`);
      toast.success("已复制到剪贴板");
    } catch { toast.error("复制失败"); }
  };

  return (
    <main className="relative min-h-screen">
      <Petals count={10} />
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-8">
        <Link to="/" className="font-display text-lg text-gradient-sakura">墨樱 · 婚恋画像</Link>
        <Link to="/history" className="text-xs tracking-[0.3em] text-muted-foreground">我的画像 →</Link>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 py-12">
        {/* A 顶部 */}
        <div className="text-center">
          <div className="text-xs tracking-[0.5em] text-muted-foreground">{test?.code} · {test?.title}</div>
          <h1 className="font-display text-4xl md:text-5xl mt-3 text-gradient-sakura">{archetype.name}</h1>
          <p className="mt-2 text-foreground/75 italic">「{archetype.tagline}」</p>
          <div className="mt-8 flex justify-center">
            <ScoreRing value={Number(data.ros_index ?? 0)} label="关系展望" />
          </div>
        </div>

        {/* B 原型卡 */}
        <div className="mt-12">
          <ArchetypeCard a={archetype} />
        </div>

        {/* C 雷达图 */}
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

        {/* D AI 报告 */}
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

        {/* E 操作区 */}
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

function normalizeScores(raw: unknown): { at: number; in: number; co: number; ev: number; rk: number } {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const values = Object.values(obj).map(Number).filter((v) => Number.isFinite(v));
  const fallback = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const pick = (keys: string[], idx: number) => {
    for (const key of keys) {
      const value = Number(obj[key]);
      if (Number.isFinite(value)) return value;
    }
    return values[idx] ?? fallback;
  };
  return {
    at: pick(["at", "AT", "attachment", "attachment_security"], 0),
    in: pick(["in", "IN", "intimacy", "intimacy_temperature"], 1),
    co: pick(["co", "CO", "cooperation", "collaboration"], 2),
    ev: pick(["ev", "EV", "growth", "evolution"], 3),
    rk: pick(["rk", "RK", "risk", "risk_alert"], 4),
  };
}
