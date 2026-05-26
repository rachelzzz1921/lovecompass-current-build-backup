import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { CoupleReportUnavailableNotice } from "@/components/CoupleReportUnavailableNotice";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { lovecompassApi } from "@/lib/lovecompassApi";
import type { AnswerPayload, ApiQuestion } from "@/lib/questionTypes";
import { visibleSupplementQuestions } from "@/lib/matePairSupplementFlow";
import { productTheme } from "@/lib/productTheme";

export const Route = createFileRoute("/mate/pair-supplement/$attemptId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "双人适配补充题 · MATE" },
      { name: "description", content: "补全现实条件与婚育规划，解锁 MATE 双人匹配分析。" },
    ],
  }),
  component: MatePairSupplementPage,
});

const theme = productTheme("mate");

function defaultSliderAnswer(question: ApiQuestion): AnswerPayload {
  const min = question.ui.min ?? 0;
  const max = question.ui.max ?? 100;
  return { value: Math.round((min + max) / 2) };
}

function isAnswered(q: ApiQuestion | undefined, payload: AnswerPayload | undefined) {
  if (!q || !payload) return false;
  if ("value" in payload) return Number.isFinite(payload.value);
  return Boolean(payload.optionKey);
}

function MatePairSupplementPage() {
  const { attemptId } = useParams({ from: "/mate/pair-supplement/$attemptId" });
  const nav = useNavigate();
  const { pending: authPending, authed } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawQuestions, setRawQuestions] = useState<ApiQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerPayload>>({});
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (authPending || !authed) return;
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const singleRes = await lovecompassApi.getMateSingleResult(attemptId);
        if (cancelled) return;
        if (singleRes.suiteTier === "lite") {
          setError("快速版不支持双人匹配，请升级完整版后再填写补充题。");
          return;
        }
        if (singleRes.pairSupplementComplete) {
          void nav({ to: "/result/mate/$id", params: { id: attemptId } });
          return;
        }
        const gender = singleRes.gender === "male" ? "male" : "female";
        const qRes = await lovecompassApi.getMatePairSupplementQuestions(gender, attemptId);
        if (cancelled) return;
        setRawQuestions(qRes.questions);
        if (qRes.singleMappedNote) {
          toast.message(qRes.singleMappedNote, { duration: 4000 });
        }
      } catch (e) {
        if (!cancelled) setError(formatApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authPending, authed, attemptId, nav]);

  const questions = useMemo(
    () => visibleSupplementQuestions(rawQuestions, answers),
    [rawQuestions, answers],
  );

  useEffect(() => {
    if (idx >= questions.length && questions.length > 0) setIdx(questions.length - 1);
  }, [idx, questions.length]);

  const current = questions[idx];

  useEffect(() => {
    if (!current || current.kind !== "slider" || isAnswered(current, answers[current.id])) return;
    setAnswers((prev) => ({ ...prev, [current.id]: defaultSliderAnswer(current) }));
  }, [current, answers]);

  const progress = questions.length ? ((idx + 1) / questions.length) * 100 : 0;

  const submit = async () => {
    const missing = questions.filter((q) => !isAnswered(q, answers[q.id]));
    if (missing.length) {
      toast.error(`还有 ${missing.length} 题未作答`);
      return;
    }
    setSubmitting(true);
    try {
      const payload = questions.map((q) => {
        const ans = answers[q.id];
        if (ans && "value" in ans) return { questionId: q.id, value: ans.value };
        if (ans && "optionKey" in ans) return { questionId: q.id, optionKey: ans.optionKey };
        return { questionId: q.id };
      });
      await lovecompassApi.submitMatePairSupplement(attemptId, payload);
      toast.success("补充题已保存");
      void nav({ to: "/result/mate/$id", params: { id: attemptId } });
    } catch (e) {
      toast.error(formatApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (authPending) return <AuthChecking />;
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white/60 text-sm">
        加载补充题…
      </main>
    );
  }
  if (error) {
    const liteBlocked = /快速版|完整版/.test(error);
    if (liteBlocked) {
      return (
        <main className="relative min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{ background: "#100a0d" }}>
          <div className="w-full max-w-lg space-y-4">
            <Link
              to="/result/mate/$id"
              params={{ id: attemptId }}
              className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              返回档案
            </Link>
            <CoupleReportUnavailableNotice productId="mate" surface="light" />
          </div>
        </main>
      );
    }
    return (
      <ApiErrorPanel title="无法加载补充题" message={error} backTo={{ to: "/result/mate/$id", params: { id: attemptId }, label: "返回档案" }} />
    );
  }

  return (
    <main className="relative min-h-screen flex flex-col" style={{ background: "#100a0d" }}>
      <header className="sticky top-0 z-20 px-5 pt-5 pb-3" style={{ background: "linear-gradient(180deg,#100a0d 85%, transparent)" }}>
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <Link
            to="/result/mate/$id"
            params={{ id: attemptId }}
            className="flex items-center gap-2 text-sm text-white/55 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
          <span className={`text-[10px] font-mono tracking-[0.25em] ${theme.iconColor}`}>MATE · 双人补充</span>
        </div>
        <div className="max-w-lg mx-auto mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="max-w-lg mx-auto mt-2 text-[11px] text-white/45 text-center">
          {questions.length ? `${idx + 1} / ${questions.length}` : "—"} · 不计入单人评分，仅用于双人对比
        </p>
      </header>

      <section className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <div className="text-[10px] font-mono tracking-[0.28em] text-white/40 mb-2">{current.dimensionCode}</div>
                  <h1 className="text-xl text-white leading-snug">{current.text}</h1>
                  {current.note ? <p className="text-sm text-white/50 mt-2">{current.note}</p> : null}
                </div>
                <QuestionRenderer
                  question={current}
                  value={answers[current.id]}
                  onChange={(payload) => setAnswers((prev) => ({ ...prev, [current.id]: payload }))}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <footer className="sticky bottom-0 px-5 pb-8 pt-4" style={{ background: "linear-gradient(0deg,#100a0d 70%, transparent)" }}>
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            type="button"
            disabled={idx <= 0 || submitting}
            onClick={() => setIdx((v) => Math.max(0, v - 1))}
            className="h-11 px-4 rounded-xl text-sm text-white/70 border border-white/10 disabled:opacity-40"
          >
            上一题
          </button>
          {idx < questions.length - 1 ? (
            <button
              type="button"
              disabled={!isAnswered(current, answers[current?.id ?? ""]) || submitting}
              onClick={() => setIdx((v) => v + 1)}
              className={`flex-1 h-11 rounded-xl text-sm font-medium bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground disabled:opacity-40 flex items-center justify-center gap-2`}
            >
              下一题 <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !questions.every((q) => isAnswered(q, answers[q.id]))}
              onClick={() => void submit()}
              className={`flex-1 h-11 rounded-xl text-sm font-medium bg-gradient-to-r ${theme.buttonGradient} text-primary-foreground disabled:opacity-40`}
            >
              {submitting ? "保存中…" : "完成并返回档案"}
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}
