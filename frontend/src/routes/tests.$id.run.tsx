import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HintButton } from "@/components/HintButton";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Clock, Sparkles, Eye } from "lucide-react";
import { QuestionRenderer } from "@/components/questions/QuestionRenderer";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { formatApiErrorMessage, getApiErrorHint } from "@/lib/apiErrors";
import { AuthChecking, safeReturnPath, useRequireAuth } from "@/lib/requireAuth";
import { getPartnerRelationCode, getRedemptionEventId, hasRedeemableSuiteAccess } from "@/lib/accessGate";
import { guardRunPage, guardSubmitAccess } from "@/lib/productFlow";
import { stashLiteAnswers, isSelfLiteSuite, isLiteSuite, mergeLiteAnswersForFullSuite } from "@/lib/suiteTier";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { findProductByRouteId, inferGenderFromSuiteSlug, productSetFromSlug, testEntryRouteId, type ProductSet } from "@/lib/resultRoutes";
import { beginAnalyzingHandoff } from "@/lib/analyzingHandoff";
import { analyzingProfileForProductId } from "@/lib/analyzingProfiles";
import {
  sectionIndexForQuestion,
  TEST_RUN_SECTIONS,
  testRunThemeForProduct,
} from "@/lib/testRunProfiles";
import {
  resolveProductId,
  resolveSuiteSlug,
  setStoredMateGender,
  setStoredRosGender,
  setStoredSelfGender,
} from "@/lib/suiteSlugs";
import type { AnswerDraft, AnswerPayload, ApiQuestion } from "@/lib/questionTypes";
import {
  applyQuestionPresentation,
  getPresentationSettings,
  presentationModeSummary,
  resetPresentationSeed,
  setPresentationSettings,
  shouldShowPresentationToggle,
  type PresentationOrderMode,
  type PresentationSettings,
} from "@/lib/shufflePresentation";
import { QuestionOrderToggle } from "@/components/questions/QuestionOrderToggle";
// DEV ONLY — 上线前删除 dev/ 目录与本 import
import { DevRandomFillButton } from "@/components/dev/DevRandomFillButton";
import { buildRandomAnswers, buildRandomDurations } from "@/lib/dev/devRandomFill";
import {
  applyRosEntryStagePrefill,
  prepareSubmitAnswers,
  visibleRosQuestions,
} from "@/lib/rosPreQuestions";

export const Route = createFileRoute("/tests/$id/run")({
  ssr: false,
  component: TestRun,
});

function defaultSliderAnswer(question: ApiQuestion): AnswerPayload {
  const min = question.ui.min ?? 0;
  const max = question.ui.max ?? 100;
  return { value: Math.round((min + max) / 2) };
}

function withSliderDefaults(
  questions: ApiQuestion[],
  answerMap: Record<string, AnswerPayload>,
): Record<string, AnswerPayload> {
  let changed = false;
  const next = { ...answerMap };
  for (const item of questions) {
    if (item.kind !== "slider" || isAnswered(item, next[item.id])) continue;
    next[item.id] = defaultSliderAnswer(item);
    changed = true;
  }
  return changed ? next : answerMap;
}

function isAnswered(q: ApiQuestion | undefined, payload: AnswerPayload | undefined) {
  if (!q || !payload) return false;
  if ("orderedItemIds" in payload)
    return payload.orderedItemIds.length === (q.ui.items?.length ?? 0);
  if ("value" in payload) return Number.isFinite(payload.value);
  return Boolean(payload.optionKey);
}

function TestRun() {
  const { id } = useParams({ from: "/tests/$id/run" });
  const { pending: authPending } = useRequireAuth();
  const routeSuiteSlug = id;
  const product = findProductByRouteId(routeSuiteSlug);
  const productId = resolveProductId(routeSuiteSlug);
  const productSet: ProductSet =
    productId === "ros" ? "ROS" : productId === "mate" ? "MATE" : "SELF";
  const analyzingProfile = analyzingProfileForProductId(productId);
  const runTheme = testRunThemeForProduct(productId);
  const sections = TEST_RUN_SECTIONS[productId];
  const testEntryId = testEntryRouteId(routeSuiteSlug);
  const nav = useNavigate();

  const [idx, setIdx] = useState(0);
  const [rawQuestions, setRawQuestions] = useState<ApiQuestion[]>([]);
  const [presentationSettings, setPresentationSettingsState] = useState<PresentationSettings>({
    questionOrder: "shuffled",
    optionOrder: "shuffled",
  });
  const [answers, setAnswers] = useState<Record<string, AnswerPayload>>({});
  const [questionStartedAt, setQuestionStartedAt] = useState<Record<string, number>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [handoffStarted, setHandoffStarted] = useState(false);
  const submitGuardRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [accessChecked, setAccessChecked] = useState(false);
  const [rosHiddenQuestionIds, setRosHiddenQuestionIds] = useState<Set<string>>(() => new Set());

  const activeSuiteSlug = useMemo(() => {
    const storedSuiteSlug =
      typeof window !== "undefined" ? window.sessionStorage.getItem(`suite:${productId}`) : null;
    return resolveSuiteSlug({
      productId,
      routeId: routeSuiteSlug,
      sessionSuiteSlug: storedSuiteSlug,
    });
  }, [productId, routeSuiteSlug]);

  useEffect(() => {
    setPresentationSettingsState(getPresentationSettings(activeSuiteSlug));
  }, [activeSuiteSlug]);

  const presentedAll = useMemo(
    () => applyQuestionPresentation(rawQuestions, activeSuiteSlug, presentationSettings),
    [rawQuestions, activeSuiteSlug, presentationSettings],
  );

  const questions = useMemo(
    () => visibleRosQuestions(presentedAll, rosHiddenQuestionIds),
    [presentedAll, rosHiddenQuestionIds],
  );

  const applyPresentationChange = (next: PresentationSettings) => {
    if (submitGuardRef.current) return;
    if (
      next.questionOrder === presentationSettings.questionOrder &&
      next.optionOrder === presentationSettings.optionOrder
    ) {
      return;
    }
    const currentQuestionId = questions[idx]?.id;
    setPresentationSettings(activeSuiteSlug, next);
    setPresentationSettingsState(next);
    if (currentQuestionId && next.questionOrder !== presentationSettings.questionOrder) {
      const nextPresented = applyQuestionPresentation(rawQuestions, activeSuiteSlug, next);
      const nextVisible = visibleRosQuestions(nextPresented, rosHiddenQuestionIds);
      const nextIdx = nextVisible.findIndex((item) => item.id === currentQuestionId);
      if (nextIdx >= 0) setIdx(nextIdx);
    }
    toast.info(`已切换为${presentationModeSummary(next)}，已答题目会保留`);
  };

  const handleQuestionOrderChange = (mode: PresentationOrderMode) => {
    applyPresentationChange({ ...presentationSettings, questionOrder: mode });
  };

  const handleOptionOrderChange = (mode: PresentationOrderMode) => {
    applyPresentationChange({ ...presentationSettings, optionOrder: mode });
  };

  useEffect(() => {
    if (authPending) return;
    const productId = resolveProductId(routeSuiteSlug);

    const guard = guardRunPage({ routeSuiteSlug, authPending });
    if (!guard.ok) {
      if (guard.toast) toast.info(guard.toast);
      void nav(guard.route);
      return;
    }

    const slugGender = inferGenderFromSuiteSlug(routeSuiteSlug);
    if (slugGender) {
      if (productId === "ros") setStoredRosGender(slugGender);
      if (productId === "mate") setStoredMateGender(slugGender);
      if (productId === "self") setStoredSelfGender(slugGender);
    }

    setAccessChecked(true);
  }, [authPending, routeSuiteSlug, nav]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (authPending || !accessChecked) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setIdx(0);
    const productId = resolveProductId(routeSuiteSlug);
    const storedSuiteSlug =
      typeof window !== "undefined" ? window.sessionStorage.getItem(`suite:${productId}`) : null;
    const suiteSlug = resolveSuiteSlug({
      productId,
      routeId: routeSuiteSlug,
      sessionSuiteSlug: storedSuiteSlug,
    });
    setPresentationSettingsState(getPresentationSettings(suiteSlug));
    lovecompassApi
      .getQuestions(suiteSlug)
      .then((res) => {
        if (cancelled) return;
        if (!res.questions.length) {
          setError(
            res.suite?.totalQuestions
              ? `「${res.suite.name}」题目尚未导入（预期 ${res.suite.totalQuestions} 题）。请切换完整版，或联系管理员完成题库导入。`
              : "题库暂无可用题目，请返回重新选择版本。",
          );
          setRawQuestions([]);
          return;
        }
        setRawQuestions(res.questions);
        setRosHiddenQuestionIds(new Set());
        const settings = getPresentationSettings(suiteSlug);
        const presented = applyQuestionPresentation(res.questions, suiteSlug, settings);
        const merged = mergeLiteAnswersForFullSuite(presented, suiteSlug, isAnswered);
        const stagePrefill = applyRosEntryStagePrefill(presented, merged.answers);
        const nextAnswers = stagePrefill.answers;
        const hiddenIds = stagePrefill.hiddenIds;
        if (hiddenIds.size > 0) setRosHiddenQuestionIds(hiddenIds);
        const visible = visibleRosQuestions(presented, hiddenIds);

        if (merged.count > 0) {
          setAnswers(nextAnswers);
          toast.info(`已带入快速版 ${merged.count} 题答案，请继续完成剩余题目`);
        } else if (hiddenIds.size > 0) {
          setAnswers(nextAnswers);
        }

        const firstOpen = visible.findIndex((item) => !isAnswered(item, nextAnswers[item.id]));
        if (firstOpen >= 0) setIdx(firstOpen);

        const target = visible[Math.max(0, firstOpen >= 0 ? firstOpen : 0)];
        if (target) setQuestionStartedAt((prev) => ({ ...prev, [target.id]: Date.now() }));
      })
      .catch((e) => {
        if (!cancelled) setError(formatApiErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessChecked, authPending, routeSuiteSlug, reloadKey]);

  const submitAnswerMap = useMemo(
    () => prepareSubmitAnswers(presentedAll, answers, defaultSliderAnswer, isAnswered),
    [presentedAll, answers],
  );

  const q = useMemo(() => questions[idx], [questions, idx]);
  const total = questions.length;
  const currentAnswer = q ? answers[q.id] : undefined;
  const answeredCount = useMemo(
    () => questions.filter((item) => isAnswered(item, submitAnswerMap[item.id])).length,
    [questions, submitAnswerMap],
  );
  const firstMissingIdx = useMemo(
    () => questions.findIndex((item) => !isAnswered(item, submitAnswerMap[item.id])),
    [questions, submitAnswerMap],
  );
  const canSubmit = Boolean(q && isAnswered(q, submitAnswerMap[q.id]) && firstMissingIdx < 0);
  const showPresentationToggle = shouldShowPresentationToggle({
    productId,
    questions,
    currentIndex: idx,
    isAnswered,
    answers: submitAnswerMap,
  });
  const linearSectionIdx =
    total > 0 ? Math.min(sections.length - 1, Math.floor((idx / total) * sections.length)) : 0;
  const sectionIdx = sectionIndexForQuestion(
    productId,
    q?.dimensionCode,
    linearSectionIdx,
    sections.length,
  );
  const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const markDuration = (questionId: string) => {
    const started = questionStartedAt[questionId] ?? Date.now();
    setDurations((prev) => ({
      ...prev,
      [questionId]: Math.max(prev[questionId] ?? 0, Date.now() - started),
    }));
  };

  const goTo = (nextIdx: number) => {
    if (q) {
      markDuration(q.id);
      if (q.kind === "slider" && !isAnswered(q, answers[q.id])) {
        setAnswers((prev) => ({ ...prev, [q.id]: defaultSliderAnswer(q) }));
      }
    }
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

  const finish = async (overrides?: {
    answers?: Record<string, AnswerPayload>;
    durations?: Record<string, number>;
  }) => {
    if (submitGuardRef.current) return;
    const answerMap = overrides?.answers
      ? prepareSubmitAnswers(presentedAll, overrides.answers, defaultSliderAnswer, isAnswered)
      : submitAnswerMap;
    const durationMap = overrides?.durations ?? durations;
    const missingVisible = questions.find((item) => !isAnswered(item, answerMap[item.id]));
    const missingAny = presentedAll.find((item) => !isAnswered(item, answerMap[item.id]));
    if (missingVisible || missingAny) {
      if (!overrides) {
        const target = missingVisible ?? missingAny!;
        const visibleIdx = questions.findIndex((item) => item.id === target.id);
        goTo(visibleIdx >= 0 ? visibleIdx : 0);
        toast.error(
          visibleIdx >= 0
            ? `还有第 ${visibleIdx + 1} 题未完成，请先补全答案`
            : "还有题目未完成，请先补全答案",
        );
      }
      return;
    }
    if (q) markDuration(q.id);

    try {
      const payload: AnswerDraft[] = presentedAll.map((item) => ({
        questionId: item.id,
        externalId: item.externalId,
        kind: item.kind,
        answerPayload: answerMap[item.id],
        durationMs: durationMap[item.id],
      }));
      const productId = resolveProductId(routeSuiteSlug);
      const storedSuiteSlug =
        typeof window !== "undefined" ? window.sessionStorage.getItem(`suite:${productId}`) : null;
      const suiteSlug = resolveSuiteSlug({
        productId,
        routeId: routeSuiteSlug,
        sessionSuiteSlug: storedSuiteSlug,
      });
      const redemptionEventId =
        typeof window !== "undefined" ? getRedemptionEventId(productId, suiteSlug) : null;
      const partnerRelationCode = getPartnerRelationCode();
      const selfLiteFree = isSelfLiteSuite(suiteSlug);
      const submitGuard = guardSubmitAccess({ productId, suiteSlug, routeSuiteSlug });
      if (!partnerRelationCode && !redemptionEventId && !selfLiteFree && !submitGuard.ok) {
        if (submitGuard.toast) toast.error(submitGuard.toast);
        void nav(submitGuard.route);
        return;
      }

      submitGuardRef.current = true;
      setHandoffStarted(true);

      if (isLiteSuite(suiteSlug)) {
        const stashMap = Object.fromEntries(
          presentedAll.map((item) => [item.externalId, answerMap[item.id]]),
        );
        stashLiteAnswers(suiteSlug, stashMap);
      }

      beginAnalyzingHandoff(
        {
          productSet: productSetFromSlug(suiteSlug),
          suiteSlug,
          redemptionEventId: partnerRelationCode ? null : selfLiteFree ? null : redemptionEventId,
          partnerRelationCode,
          answers: payload,
        },
        nav,
        routeSuiteSlug,
      );
    } catch (e) {
      submitGuardRef.current = false;
      setHandoffStarted(false);
      const msg = (e as Error).message || "提交失败，请稍后再试";
      toast.error(msg, { description: getApiErrorHint(msg) ?? undefined });
      if (/需要登录|登录已过期|登录令牌/.test(msg)) {
        nav({
          to: "/auth",
          search: { redirect: safeReturnPath(window.location.pathname + window.location.search) },
        });
      }
    }
  };

  const devRandomFillAndSubmit = () => {
    if (submitGuardRef.current || !questions.length) return;
    const randomAnswers = buildRandomAnswers(questions);
    const randomDurations = buildRandomDurations(questions);
    setAnswers(randomAnswers);
    setDurations(randomDurations);
    setIdx(questions.length - 1);
    toast.info("DEV：已随机填答全部题目，正在提交…");
    void finish({ answers: randomAnswers, durations: randomDurations });
  };

  if (authPending || !accessChecked) return <AuthChecking />;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-muted-foreground">
        正在读取题目…
      </main>
    );
  }

  if (error || !q) {
    return (
      <ApiErrorPanel
        title={error ? "题目加载失败" : "未找到可作答的题目"}
        message={error ?? "请返回测试详情页重新选择性别或兑换码。"}
        onRetry={error ? () => setReloadKey((k) => k + 1) : undefined}
        backTo={{ to: "/tests/$id", params: { id: testEntryId }, label: "返回测试详情" }}
      />
    );
  }

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 max-w-2xl mx-auto px-5 md:px-6 pt-6 pb-24">
        <div className="flex items-center justify-between mb-5">
          <Link
            to="/tests/$id"
            params={{ id: testEntryId }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 退出
          </Link>
          <span className={`chip ${runTheme.chipClass} font-mono`} style={runTheme.chipStyle}>
            {product.code}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono tabular-nums">
            <Clock className="h-3.5 w-3.5" /> {mm}:{ss}
          </div>
        </div>

        <div className="flex justify-between font-mono text-[11px] text-muted-foreground mb-2">
          <span>
            第 <span className="text-foreground/90">{idx + 1}</span> 题 · 共 {total} 题
          </span>
          <span>
            {answeredCount}/{total} · {pct}%
          </span>
        </div>
        <div className="h-[3px] rounded-full bg-secondary/50 overflow-hidden mb-4">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${runTheme.progressClass}`}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="flex gap-1.5 flex-wrap mb-5">
          {sections.map((s, i) => (
            <span
              key={s}
              className={`text-[10px] font-mono tracking-[0.18em] px-2.5 py-1 rounded-full border transition-all ${i === sectionIdx ? runTheme.sectionCurrent : runTheme.sectionIdle}`}
            >
              {String(i + 1).padStart(2, "0")} · {s}
            </span>
          ))}
        </div>

        <div className="flex gap-2 justify-center mb-7">
          {sections.map((label, i) => (
            <span
              key={label}
              title={label}
              className={`h-[5px] rounded-full transition-all duration-300 ${
                i === sectionIdx ? runTheme.dotCurrent : "w-1.5 bg-border/70"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-glass rounded-2xl p-6 md:p-7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Q{String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 flex items-center gap-1">
                    <Eye className="h-3 w-3" /> 跟着直觉走
                  </span>
                </div>
                <h2 className="font-display text-[22px] md:text-[26px] leading-snug text-foreground/95">
                  {q.text}
                </h2>
                {q.subtitle && (
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{q.subtitle}</p>
                )}
                {q.note && (
                  <p className="mt-2 text-xs text-muted-foreground/90 leading-relaxed italic">{q.note}</p>
                )}
                <QuestionRenderer question={q} value={currentAnswer} onChange={pick} />
                {showPresentationToggle && (
                  <QuestionOrderToggle
                    settings={presentationSettings}
                    onQuestionChange={handleQuestionOrderChange}
                    onOptionChange={handleOptionOrderChange}
                    disabled={handoffStarted}
                    variant="inline"
                  />
                )}
              </div>

              <div
                className="md:static md:bg-transparent md:border-0 md:px-0 md:pt-5 md:pb-0 fixed bottom-0 inset-x-0 z-20 px-5 pt-3 bg-background/85 backdrop-blur-xl border-t border-border/40 flex items-center justify-between gap-3 mt-5"
                style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 12px)" }}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    if (idx === 0) {
                      toast.info("已经是第一题了");
                      return;
                    }
                    goTo(idx - 1);
                  }}
                  className="rounded-xl border-border/60 bg-glass flex-1 md:flex-none"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> 上一题
                </Button>
                {idx === total - 1 ? (
                  <div className="flex flex-col items-stretch gap-1.5 flex-1 md:flex-none">
                    <HintButton
                      data-testid="finish-attempt"
                      onClick={() => void finish()}
                      blocked={!canSubmit}
                      blockedHint={
                        !q || !isAnswered(q, submitAnswerMap[q.id])
                          ? q?.kind === "rank"
                            ? "请按优先级点选全部选项后再生成画像"
                            : "请先回答本题后再生成画像"
                          : firstMissingIdx >= 0
                            ? `还有第 ${firstMissingIdx + 1} 题未完成，请补全后再提交`
                            : undefined
                      }
                      className={`${runTheme.buttonClass} w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium`}
                    >
                      生成画像 <Sparkles className="ml-1 h-4 w-4" />
                    </HintButton>
                    <p className="text-[10px] text-center text-muted-foreground leading-snug px-1">
                      {analyzingProfile.estimatedWaitLabel}
                    </p>
                  </div>
                ) : (
                  <HintButton
                    data-testid="next-question"
                    blocked={!isAnswered(q, currentAnswer)}
                    blockedHint="请先回答本题后再继续"
                    onClick={() => goTo(Math.min(total - 1, idx + 1))}
                    className={`${runTheme.buttonClass} opacity-100 flex-1 md:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-medium`}
                  >
                    下一题 <ArrowRight className="ml-1 h-4 w-4" />
                  </HintButton>
                )}
              </div>
              <div className="h-24 md:hidden" />
            </motion.div>
        </AnimatePresence>
      </div>
      {/* DEV ONLY — 上线前删除 */}
      <DevRandomFillButton disabled={handoffStarted || loading} onClick={devRandomFillAndSubmit} />
    </main>
  );
}
