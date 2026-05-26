import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { MateResult } from "@/data/mateTypes";
import { MateResultView } from "@/components/mate/MateResultView";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { mapApiSingleToMateResult, mapAttemptToMateResult } from "@/lib/mapMateResult";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { peekResultPrefetch, takeResultPrefetch } from "@/lib/resultPrefetchCache";
import { ResultDataLoading } from "@/components/ResultDataLoading";

export const Route = createFileRoute("/result/mate/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "择偶坐标档案 · MIRROR" },
      { name: "description", content: "MATE 择偶坐标 · 择偶市场档案室。" },
    ],
  }),
  component: MateResultRoute,
});

function MateResultRoute() {
  const { id } = useParams({ from: "/result/mate/$id" });
  const { pending: authPending, authed } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MateResult | null>(null);
  const [suiteSlug, setSuiteSlug] = useState<string | null>(null);
  const [relationCode, setRelationCode] = useState<string | null>(null);
  const [coupleUnlocked, setCoupleUnlocked] = useState(false);
  const [pairSupplementComplete, setPairSupplementComplete] = useState(false);
  const [accuracyNote, setAccuracyNote] = useState<string | null>(null);
  const hydratedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authPending || !authed) return;
    if (hydratedRef.current === id) return;
    let cancelled = false;

    const cached = peekResultPrefetch(id);
    if (cached?.kind === "mate-single" && cached.attemptId === id) {
      takeResultPrefetch(id);
      setResult(mapApiSingleToMateResult(id, cached.data.single));
      setRelationCode(cached.data.relationCode || null);
      setCoupleUnlocked(Boolean(cached.data.coupleUnlocked));
      setPairSupplementComplete(Boolean(cached.data.pairSupplementComplete));
      setSuiteSlug(cached.data.suiteSlug ?? null);
      const single = cached.data.single;
      setAccuracyNote(typeof single.accuracyNote === "string" ? single.accuracyNote : null);
      setLoading(false);
      hydratedRef.current = id;
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    lovecompassApi
      .getMateSingleResult(id)
      .then((res) => {
        if (cancelled) return;
        setResult(mapApiSingleToMateResult(id, res.single));
        setRelationCode(res.relationCode || null);
        setCoupleUnlocked(Boolean(res.coupleUnlocked));
        setPairSupplementComplete(Boolean(res.pairSupplementComplete));
        const single = res.single as Record<string, unknown>;
        setAccuracyNote(typeof single.accuracyNote === "string" ? single.accuracyNote : null);
        hydratedRef.current = id;
      })
      .catch(async (primaryError) => {
        if (cancelled) return;
        try {
          const fallback = await lovecompassApi.getAttemptResult(id);
          const mapped = mapAttemptToMateResult(
            id,
            (fallback.attempt ?? {}) as Record<string, unknown>,
          );
          if (mapped) {
            setResult(mapped);
            setSuiteSlug(String(fallback.attempt?.test_id ?? ""));
            hydratedRef.current = id;
            return;
          }
        } catch {
          // fall through to primary error
        }
        setError(formatApiErrorMessage(primaryError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    lovecompassApi
      .getAttemptResult(id)
      .then((res) => {
        if (!cancelled) setSuiteSlug(String(res.attempt?.test_id ?? ""));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [authPending, authed, id]);

  useEffect(() => {
    if (!result) return;
    const mode = result.aiContent?.mode;
    if (mode && mode !== "deterministic") return;
    let ignore = false;
    const timer = window.setTimeout(() => {
      lovecompassApi
        .getMateSingleResult(id)
        .then((res) => {
          if (ignore) return;
          const next = mapApiSingleToMateResult(id, res.single);
          if (next.aiContent?.mode && next.aiContent.mode !== mode) {
            setResult(next);
          }
        })
        .catch(() => undefined);
    }, 8000);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [id, result]);

  if (authPending) return <AuthChecking />;
  if (loading) return <ResultDataLoading label="读取择偶档案…" />;
  if (error || !result) {
    return (
      <ApiErrorPanel title="档案加载失败" message={error ?? "未找到结果"} backTo={{ to: "/", label: "返回首页" }} />
    );
  }

  return (
    <MateResultView
      result={result}
      attemptId={id}
      suiteSlug={suiteSlug}
      relationCode={relationCode}
      coupleUnlocked={coupleUnlocked}
      pairSupplementComplete={pairSupplementComplete}
      accuracyNote={accuracyNote}
    />
  );
}
