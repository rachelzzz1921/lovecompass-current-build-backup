import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { lovecompassApi } from "@/lib/lovecompassApi";
import {
  detectProductSetFromAttempt,
  parseBackendNextPath,
  resultRouteForProductSet,
  safeResultRouteFromAttempt,
  type ProductSet,
} from "@/lib/resultRoutes";
import { resolveAnalyzingProfile, type AnalyzingProfile } from "@/lib/analyzingProfiles";
import {
  clearPendingAttemptSubmit,
  markPendingHandlerAttached,
  peekPendingAttemptSubmit,
  takeStashedSubmitResult,
} from "@/lib/pendingAttemptSubmit";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { Check, Sparkles } from "lucide-react";

const searchSchema = z.object({
  attemptId: z.string().optional(),
  to: z.string().optional(),
  productSet: z.enum(["SELF", "ROS", "MATE"]).optional(),
  pending: z.coerce.boolean().optional(),
});

type WorkState = "submitting" | "ready" | "error";

export const Route = createFileRoute("/analyzing")({
  validateSearch: (search) => searchSchema.parse(search),
  ssr: false,
  head: () => ({
    meta: [
      { title: "AI 正在分析… · MIRROR" },
      { name: "description", content: "MIRROR 正在阅读你的答题，生成属于你的画像。" },
    ],
  }),
  component: AnalyzingPage,
});

function AnalyzingPage() {
  const nav = useNavigate();
  const {
    attemptId: initialAttemptId,
    to,
    productSet: searchProductSet,
    pending: searchPending,
  } = Route.useSearch();
  const { pending: authPending } = useRequireAuth();

  const [resolvedProductSet, setResolvedProductSet] = useState<ProductSet | null>(
    searchProductSet ?? null,
  );
  const [submitNext, setSubmitNext] = useState<string | null>(null);
  const [resolvedAttemptId, setResolvedAttemptId] = useState<string | null>(
    initialAttemptId ?? null,
  );
  const [workState, setWorkState] = useState<WorkState>(
    searchPending ? "submitting" : initialAttemptId ? "ready" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchPending || initialAttemptId ? null : "缺少分析会话，请从测试页提交后再进入。",
  );
  const [stage, setStage] = useState(0);
  const [overall, setOverall] = useState(0);
  const workStartedRef = useRef(false);

  const profile = useMemo(
    () => resolveAnalyzingProfile(resolvedProductSet ?? searchProductSet),
    [resolvedProductSet, searchProductSet],
  );

  const lastStageIdx = profile.stages.length - 1;
  const done = stage >= profile.stages.length;

  /* —— 绑定真实提交：pending 时在此页等待 API —— */
  useEffect(() => {
    if (workStartedRef.current) return;
    workStartedRef.current = true;

    if (searchPending) {
      const ctx = peekPendingAttemptSubmit();
      const stashed = ctx ? null : takeStashedSubmitResult();
      if (!ctx && stashed) {
        if (stashed.relationCode && typeof window !== "undefined") {
          sessionStorage.setItem("ros:myCode", stashed.relationCode);
        }
        setResolvedAttemptId(stashed.attemptId);
        if (stashed.productSet === "ROS" || stashed.productSet === "MATE" || stashed.productSet === "SELF") {
          setResolvedProductSet(stashed.productSet);
        }
        setSubmitNext(stashed.next ?? null);
        setWorkState("ready");
        clearPendingAttemptSubmit();
        return;
      }
      if (!ctx) {
        setWorkState("error");
        setErrorMessage("分析会话已过期，请返回测试页重新提交。");
        return;
      }
      if (!markPendingHandlerAttached()) {
        return;
      }
      if (ctx.productSet) setResolvedProductSet(ctx.productSet);
      setWorkState("submitting");

      void ctx.promise
        .then((res) => {
          if (res.relationCode && typeof window !== "undefined") {
            sessionStorage.setItem("ros:myCode", res.relationCode);
          }
          setResolvedAttemptId(res.attemptId);
          if (res.productSet === "ROS" || res.productSet === "MATE" || res.productSet === "SELF") {
            setResolvedProductSet(res.productSet);
          }
          setSubmitNext(res.next ?? null);
          setWorkState("ready");
        })
        .catch((e: unknown) => {
          setWorkState("error");
          setErrorMessage(formatApiErrorMessage(e));
        })
        .finally(() => {
          clearPendingAttemptSubmit();
        });
      return;
    }

    if (initialAttemptId) {
      setResolvedAttemptId(initialAttemptId);
      setWorkState("ready");
      return;
    }

    setWorkState("error");
    setErrorMessage("缺少分析会话，请从测试页提交后再进入。");
  }, [searchPending, initialAttemptId, profile.stages.length]);

  /* —— 已有 attemptId 时补全 productSet —— */
  useEffect(() => {
    if (searchProductSet || !resolvedAttemptId || workState !== "ready") return;
    let cancelled = false;
    lovecompassApi
      .getAttemptResult(resolvedAttemptId)
      .then((res) => {
        if (cancelled) return;
        const attempt = (res.attempt ?? {}) as Record<string, unknown>;
        setResolvedProductSet(detectProductSetFromAttempt(attempt));
      })
      .catch(() => {
        if (!cancelled && !searchProductSet) setResolvedProductSet("SELF");
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedAttemptId, searchProductSet, workState]);

  /* —— 阶段推进：最后一阶段卡住，直到 API 真正完成 —— */
  useEffect(() => {
    if (workState === "error") return;
    if (done) return;
    if (stage >= lastStageIdx && workState !== "ready") return;

    const t = setTimeout(() => setStage((s) => s + 1), profile.stages[stage].dur);
    return () => clearTimeout(t);
  }, [stage, workState, done, lastStageIdx, profile]);

  /* —— API 完成后：若还在前面阶段，快进到最后一阶段再收尾 —— */
  useEffect(() => {
    if (workState !== "ready" || done) return;
    if (stage < lastStageIdx) {
      setStage(lastStageIdx);
      return;
    }
    const t = setTimeout(() => setStage((s) => s + 1), 420);
    return () => clearTimeout(t);
  }, [workState, stage, done, lastStageIdx]);

  /* —— 完成后跳转 —— */
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setOverall((prev) => {
        const stageCap = ((Math.min(stage, lastStageIdx) + 1) / profile.stages.length) * 92;
        const target =
          workState === "ready" || done
            ? 100
            : workState === "error"
              ? Math.min(prev, 30)
              : Math.min(92, stageCap);
        const next = prev + (target - prev) * 0.08;
        return Math.abs(next - target) < 0.3 ? target : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, workState, done, lastStageIdx, profile.stages.length]);

  /* —— 完成后跳转 —— */
  useEffect(() => {
    if (!done || workState === "submitting" || workState === "error") return;
    let cancelled = false;

    const finish = async () => {
      await new Promise((resolve) => setTimeout(resolve, 380));
      if (cancelled) return;

      const explicit = parseBackendNextPath(to ?? submitNext ?? undefined);
      if (explicit) {
        void nav(explicit);
        return;
      }

      if (resolvedAttemptId) {
        try {
          const res = await lovecompassApi.getAttemptResult(resolvedAttemptId);
          const attempt = (res.attempt ?? {}) as Record<string, unknown>;
          void nav(safeResultRouteFromAttempt(resolvedAttemptId, attempt));
          return;
        } catch {
          const ps = resolvedProductSet ?? searchProductSet;
          if (ps && ps !== "SELF") {
            void nav(resultRouteForProductSet(ps, resolvedAttemptId));
            return;
          }
          void nav({ to: "/result/$attemptId", params: { attemptId: resolvedAttemptId } });
        }
      }
    };

    void finish();
    return () => {
      cancelled = true;
    };
  }, [
    done,
    workState,
    nav,
    to,
    resolvedAttemptId,
    resolvedProductSet,
    submitNext,
    searchProductSet,
  ]);

  const cur = profile.stages[Math.min(stage, lastStageIdx)];

  if (authPending) return <AuthChecking />;

  if (workState === "error") {
    return (
      <main className="min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <ApiErrorPanel
            title="分析未能完成"
            message={errorMessage ?? "提交失败，请稍后再试"}
            backTo={{ to: "/tests/$id", params: { id: profile.productSet.toLowerCase() }, label: "返回测试" }}
          />
        </div>
      </main>
    );
  }

  return (
    <AnalyzingView
      profile={profile}
      stage={stage}
      overall={overall}
      done={done}
      cur={cur}
      waiting={workState === "submitting" && stage >= lastStageIdx}
    />
  );
}

function AnalyzingView({
  profile,
  stage,
  overall,
  done,
  cur,
  waiting,
}: {
  profile: AnalyzingProfile;
  stage: number;
  overall: number;
  done: boolean;
  cur: AnalyzingProfile["stages"][number];
  waiting?: boolean;
}) {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-10 overflow-hidden">
      <motion.div
        key={`bg-${profile.productSet}-${stage}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ duration: 1.4 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(60% 50% at 50% 40%, oklch(0.55 0.22 ${cur.hue} / 0.32) 0%, transparent 70%)`,
        }}
      />

      <motion.div
        className="absolute inset-x-0 h-[2px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, oklch(0.85 0.16 ${cur.hue}), transparent)`,
          boxShadow: `0 0 24px oklch(0.75 0.18 ${cur.hue})`,
        }}
        animate={{ top: ["8%", "92%", "8%"] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      />

      <FloatingKeywords hue={cur.hue} keywords={profile.keywords} />

      <div className="relative z-10 w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-glass-strong rounded-3xl p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 ring-grid opacity-25 pointer-events-none" />

          <div className="relative flex items-center justify-between mb-6">
            <span
              className={`${profile.theme.chipClass} font-mono inline-flex items-center gap-1.5`}
              style={
                profile.productSet === "MATE"
                  ? {
                      background: "rgba(244,114,182,0.12)",
                      color: "#f9a8d4",
                      border: "1px solid rgba(244,114,182,0.35)",
                      borderRadius: "9999px",
                      padding: "0.25rem 0.75rem",
                      fontSize: "0.75rem",
                    }
                  : undefined
              }
            >
              <Sparkles className="h-3 w-3" /> MIRROR · {profile.chip}
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
              {waiting ? "WAIT · API" : "LIVE"}
            </span>
          </div>

          <div className="relative h-44 flex items-center justify-center mb-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute rounded-full border"
                style={{ borderColor: `oklch(0.75 0.18 ${cur.hue} / 0.5)` }}
                animate={{ width: [60, 180], height: [60, 180], opacity: [0.65, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay: i * 0.85,
                  ease: "easeOut",
                }}
              />
            ))}
            <motion.div
              key={`core-${profile.productSet}-${stage}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-20 h-20 rounded-full grid place-items-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, oklch(0.85 0.16 ${cur.hue}) 0%, oklch(0.45 0.20 ${cur.hue}) 70%)`,
                boxShadow: profile.theme.coreShadow,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                  transition={{ duration: 0.45 }}
                >
                  {done ? (
                    <Check className="h-9 w-9 text-[oklch(0.10_0.018_270)]" />
                  ) : (
                    <cur.icon className="h-9 w-9 text-[oklch(0.10_0.018_270)]" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="relative text-center min-h-[88px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${profile.productSet}-${stage}-${done ? "done" : "run"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45 }}
              >
                <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
                  {done ? profile.doneDetail : waiting ? "WAITING · BACKEND" : cur.detail}
                </div>
                <h2 className={`font-display text-2xl mt-2 leading-tight ${profile.theme.titleClass}`}>
                  {done ? profile.doneTitle : waiting ? profile.stages[profile.stages.length - 1].title : cur.title}
                </h2>
                <p className="text-[13px] text-foreground/70 mt-2 italic">
                  {done
                    ? profile.doneWhisper
                    : waiting
                      ? "「服务器还在算，这一步不会先走。」"
                      : `「${cur.whisper}」`}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between gap-2">
            {profile.stages.map((s, i) => {
              const isDone = i < stage || done;
              const isCur = i === stage && !done;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.span
                    className="h-2 w-2 rounded-full"
                    animate={{
                      scale: isCur ? [1, 1.7, 1] : 1,
                      backgroundColor: isDone
                        ? `oklch(0.82 0.14 ${s.hue})`
                        : isCur
                          ? `oklch(0.75 0.18 ${s.hue})`
                          : "oklch(0.30 0.02 270)",
                    }}
                    transition={
                      isCur
                        ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.3 }
                    }
                  />
                  <span
                    className={`text-[9px] font-mono tracking-wider transition-colors ${
                      isDone || isCur ? "text-foreground/70" : "text-muted-foreground/40"
                    }`}
                  >
                    0{i + 1}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1.5">
              <span>{profile.progressLabel}</span>
              <span className="tabular-nums text-foreground/80">{Math.round(overall)}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-secondary/50 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${profile.theme.progressClass}`}
                style={{ width: `${overall}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>
          </div>

          <TerminalLog stage={stage} lines={profile.terminalLines} waiting={waiting} />
        </motion.div>

        <p className="mt-5 text-center text-[11px] font-mono tracking-[0.2em] text-muted-foreground/70">
          {profile.footer}
        </p>
      </div>
    </main>
  );
}

function FloatingKeywords({ hue, keywords }: { hue: number; keywords: string[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {keywords.slice(0, 9).map((k, i) => {
        const left = (i * 37) % 90 + 5;
        const delay = (i % 5) * 0.7;
        return (
          <motion.span
            key={k}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: [0, 0.55, 0.55, 0], y: [40, -340] }}
            transition={{
              duration: 9 + (i % 3),
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
            className="absolute bottom-0 font-mono text-[10px] whitespace-nowrap"
            style={{
              left: `${left}%`,
              color: `oklch(0.85 0.10 ${hue} / 0.7)`,
              textShadow: `0 0 12px oklch(0.65 0.20 ${hue} / 0.5)`,
            }}
          >
            ▸ {k}
          </motion.span>
        );
      })}
    </div>
  );
}

function TerminalLog({
  stage,
  lines,
  waiting,
}: {
  stage: number;
  lines: string[];
  waiting?: boolean;
}) {
  const visible = Math.min(stage + 1, lines.length);
  const activeLine = waiting && visible === lines.length ? lines.length - 1 : visible - 1;

  return (
    <div className="mt-6 rounded-xl bg-[oklch(0.10_0.018_270_/_0.6)] border border-border/40 p-3 font-mono text-[11px] leading-[1.7] min-h-[110px]">
      {lines.slice(0, visible).map((l, i) => (
        <motion.div
          key={l}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className={
            i === activeLine ? "text-[oklch(0.82_0.14_200)]" : "text-foreground/55"
          }
        >
          {waiting && i === lines.length - 1 ? `${l} · 等待服务器` : l}
          {i === activeLine && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-1"
            >
              ▌
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
