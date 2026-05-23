import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/products";
import { ArrowLeft, ArrowRight, Clock, Sparkles, Eye } from "lucide-react";
import { toast } from "sonner";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";
import { lovecompassApi } from "@/lib/lovecompassApi";
import type { AnswerDraft, AnswerPayload, ApiQuestion } from "@/lib/questionTypes";

export const Route = createFileRoute("/tests/$id/run")({
  component: TestRun,
});

const SECTIONS = ["序章 · 直觉", "底色 · 依恋", "节奏 · 边界", "回声 · 情绪", "尾声 · 取向"];

function isAnswered(q: ApiQuestion | undefined, payload: AnswerPayload | undefined) {
  if (!q || !payload) return false;
  if ("orderedItemIds" in payload) return payload.orderedItemIds.length === (q.ui.items?.length ?? 0);
  if ("value" in payload) return Number.isFinite(payload.value);
  return Boolean(payload.optionKey);
}

function TestRun() {
  const { id } = useParams({ from: "/tests/$id/run" });
  const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
  const nav = useNavigate();

  const [idx, setIdx] = useState(0);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerPayload>>({});
  const [questionStartedAt, setQuestionStartedAt] = useState<Record<string, number>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setIdx(0);
    lovecompassApi
      .getQuestions(product.id)
      .then((res) => {
        if (cancelled) return;
        const sorted = [...res.questions].sort((a, b) => a.order - b.order);
        setQuestions(sorted);
        if (sorted[0]) setQuestionStartedAt((prev) => ({ ...prev, [sorted[0].id]: Date.now() }));
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product.id]);

  const q = useMemo(() => questions[idx], [questions, idx]);
  const total = questions.length;
  const currentAnswer = q ? answers[q.id] : undefined;
  const sectionIdx = total > 0 ? Math.min(SECTIONS.length - 1, Math.floor((idx / total) * SECTIONS.length)) : 0;
  const pct = total > 0 ? Math.round(((idx + (isAnswered(q, currentAnswer) ? 1 : 0)) / total) * 100) : 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const markDuration = (questionId: string) => {
    const started = questionStartedAt[questionId] ?? Date.now();
    setDurations((prev) => ({ ...prev, [questionId]: Math.max(prev[questionId] ?? 0, Date.now() - started) }));
  };

  const goTo = (nextIdx: number) => {
    if (q) markDuration(q.id);
    setIdx(nextIdx);
    const next = questions[nextIdx];
    if (next) setQuestionStartedAt((prev) => ({ ...prev, [next.id]: prev[next.id] ?? Date.now() }));
  };

  const pick = (payload: AnswerPayload) => {
    if (!q) return;
    setAnswers((a) => ({ ...a, [q.id]: payload }));
    if (q.kind !== "rank" && q.kind !== "slider" && q.kind !== "scale") {
      setTimeout(() => {
        if (idx < total - 1) goTo(idx + 1);
      }, 280);
    }
  };

  const finish = async () => {
    if (finishing || !q) return;
    if (!questions.every((item) => isAnswered(item, answers[item.id]))) {
      toast.error("还有题目未完成，请先补全答案");
      return;
    }
    markDuration(q.id);
    setFinishing(true);
    try {
      const payload: AnswerDraft[] = questions.map((item) => ({
        questionId: item.id,
        externalId: item.externalId,
        kind: item.kind,
        answerPayload: answers[item.id],
        durationMs: durations[item.id],
      }));
      const redemptionEventId = typeof window !== "undefined" ? window.sessionStorage.getItem(`redemption:${product.id}`) : null;
      const res = await lovecompassApi.submitAttempt({ suiteSlug: product.id, redemptionEventId, answers: payload });
      nav({ to: "/analyzing", search: { attemptId: res.attemptId } });
    } catch (e) {
      setFinishing(false);
      toast.error((e as Error).message || "提交失败，请稍后再试");
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center text-muted-foreground">正在读取题目…</main>;
  }

  if (error || !q) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground px-6 text-center">
        <p>{error ?? "未找到可作答的题目"}</p>
        <Button variant="outline" onClick={() => nav({ to: "/tests/$id", params: { id: product.id } })}>返回测试详情</Button>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 max-w-2xl mx-auto px-5 md:px-6 pt-6 pb-24">
        <div className="flex items-center justify-between mb-5">
          <Link to="/tests/$id" params={{ id: product.id }} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-3.5 w-3.5" /> 退出
          </Link>
          <span className="chip chip-violet font-mono">{product.code}</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono tabular-nums"><Clock className="h-3.5 w-3.5" /> {mm}:{ss}</div>
        </div>

        <div className="flex justify-between font-mono text-[11px] text-muted-foreground mb-2">
          <span>第 <span className="text-foreground/90">{idx + 1}</span> 题 · 共 {total} 题</span>
          <span>{pct}%</span>
        </div>
        <div className="h-[3px] rounded-full bg-secondary/50 overflow-hidden mb-5">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
        </div>

        <div className="flex gap-1.5 flex-wrap mb-5">
          {SECTIONS.map((s, i) => (
            <span key={s} className={`text-[10px] font-mono tracking-[0.18em] px-2.5 py-1 rounded-full border transition-all ${i < sectionIdx ? "border-[oklch(0.68_0.18_285_/_0.5)] bg-[oklch(0.50_0.20_285_/_0.12)] text-[oklch(0.85_0.10_285)]" : i === sectionIdx ? "border-[oklch(0.82_0.14_200_/_0.6)] bg-[oklch(0.55_0.16_200_/_0.16)] text-[oklch(0.88_0.10_200)] glow-cyan" : "border-border/60 text-muted-foreground/70"}`}>
              {String(i + 1).padStart(2, "0")} · {s}
            </span>
          ))}
        </div>

        <div className="flex gap-1 justify-center mb-7">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-[5px] rounded-full transition-all duration-300 ${i < idx ? "w-1.5 bg-[oklch(0.68_0.18_285_/_0.7)]" : i === idx ? "w-5 bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]" : "w-1.5 bg-border/70"}`} />
          ))}
        </div>

        {finishing ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16 bg-glass-strong rounded-3xl px-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]">
              <Sparkles className="h-7 w-7 text-[oklch(0.10_0.018_270)] animate-pulse-ring" />
            </div>
            <p className="mt-6 font-display text-2xl text-gradient-violet">MIRROR 正在生成你的画像…</p>
            <p className="mt-2 text-xs text-muted-foreground font-mono tracking-[0.2em]">SUBMITTING · SCORING · COMPOSING</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <div className="bg-glass rounded-2xl p-6 md:p-7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[11px] text-muted-foreground">Q{String(idx + 1).padStart(2, "0")}</span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 flex items-center gap-1"><Eye className="h-3 w-3" /> 跟着直觉走</span>
                </div>
                <h2 className="font-display text-[22px] md:text-[26px] leading-snug text-foreground/95">{q.text}</h2>
                <QuestionRenderer question={q} value={currentAnswer} onChange={pick} />
              </div>

              <div className="md:static md:bg-transparent md:border-0 md:px-0 md:pt-5 md:pb-0 fixed bottom-0 inset-x-0 z-20 px-5 pt-3 bg-background/85 backdrop-blur-xl border-t border-border/40 flex items-center justify-between gap-3 mt-5" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}>
                <Button variant="outline" disabled={idx === 0} onClick={() => goTo(idx - 1)} className="rounded-xl border-border/60 bg-glass disabled:opacity-30 flex-1 md:flex-none"><ArrowLeft className="mr-1 h-4 w-4" /> 上一题</Button>
                {idx === total - 1 && isAnswered(q, currentAnswer) ? (
                  <Button onClick={finish} className="rounded-xl bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground flex-1 md:flex-none">生成画像 <Sparkles className="ml-1 h-4 w-4" /></Button>
                ) : (
                  <Button disabled={!isAnswered(q, currentAnswer)} onClick={() => goTo(Math.min(total - 1, idx + 1))} className="rounded-xl bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground disabled:opacity-40 flex-1 md:flex-none">下一题 <ArrowRight className="ml-1 h-4 w-4" /></Button>
                )}
              </div>
              <div className="h-24 md:hidden" />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </main>
  );
}
