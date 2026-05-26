import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { RosSingleResult } from "@/data/rosTypes";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { RosResultView } from "@/components/RosResultView";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { mapApiSingleToRosResult } from "@/lib/mapRosResult";
import { fetchAiEnhancementEnabled } from "@/lib/aiCapabilities";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { peekResultPrefetch, takeResultPrefetch } from "@/lib/resultPrefetchCache";
import { rosSingleDisplayReady } from "@/lib/waitForResultReady";
import { ResultDataLoading } from "@/components/ResultDataLoading";

export const Route = createFileRoute("/result/ros/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "你们的关系画像 · MIRROR" },
      { name: "description", content: "ROS 关系测评 · 单边关系画像。" },
    ],
  }),
  component: RosResultPage,
});

function RosResultPage() {
  const { id } = Route.useParams();
  const { pending: authPending, authed } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [r, setR] = useState<RosSingleResult | null>(null);
  const [suiteSlug, setSuiteSlug] = useState<string | null>(null);
  const [coupleUnlocked, setCoupleUnlocked] = useState(false);
  const [accuracyNote, setAccuracyNote] = useState<string | null>(null);
  const hydratedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authPending || !authed) return;
    if (hydratedRef.current === id) return;
    let cancelled = false;

    const cached = peekResultPrefetch(id);
    if (cached?.kind === "ros-single" && cached.attemptId === id) {
      const single = cached.data.single;
      if (rosSingleDisplayReady(single)) {
        takeResultPrefetch(id);
        setR(mapApiSingleToRosResult(single, cached.data.relationCode || ""));
        setCoupleUnlocked(Boolean(cached.data.coupleUnlocked));
        setSuiteSlug(cached.data.suiteSlug ?? null);
        setAccuracyNote(typeof single.accuracyNote === "string" ? single.accuracyNote : null);
        setLoading(false);
        hydratedRef.current = id;
        return () => {
          cancelled = true;
        };
      }
    }

    setLoading(true);
    lovecompassApi
      .getRosSingleResult(id)
      .then((res) => {
        if (cancelled) return;
        setR(mapApiSingleToRosResult(res.single, res.relationCode || ""));
        setCoupleUnlocked(Boolean(res.coupleUnlocked));
        const single = res.single as Record<string, unknown>;
        setAccuracyNote(typeof single.accuracyNote === "string" ? single.accuracyNote : null);
        hydratedRef.current = id;
      })
      .catch((e) => {
        if (!cancelled) setError(formatApiErrorMessage(e));
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

  // 首屏用 POST 快照；仅在后端启用智谱时在后台补全 AI 升级
  useEffect(() => {
    if (!r) return;
    const mode = r.aiContent?.mode;
    if (mode && mode !== "deterministic" && r.aiContent?.layer_expansion) return;
    let ignore = false;
    let timer: number | undefined;

    void fetchAiEnhancementEnabled().then((enabled) => {
      if (!enabled || ignore) return;
      const delayMs = r.aiContent?.layer_expansion ? 10_000 : 400;
      timer = window.setTimeout(() => {
        lovecompassApi
          .getRosSingleResult(id)
          .then((res) => {
            if (ignore) return;
            const next = mapApiSingleToRosResult(res.single, res.relationCode || "");
            const upgraded = next.aiContent?.mode && next.aiContent.mode !== mode;
            const enriched = !r.aiContent?.layer_expansion && Boolean(next.aiContent?.layer_expansion);
            if (upgraded || enriched) {
              setR(next);
              if (res.relationCode) {
                setCoupleUnlocked(Boolean(res.coupleUnlocked));
              }
            }
          })
          .catch(() => undefined);
      }, delayMs);
    });

    return () => {
      ignore = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [id, r]);

  if (authPending) return <AuthChecking />;
  if (loading) return <ResultDataLoading label="读取关系画像…" />;
  if (error || !r) {
    return (
      <ApiErrorPanel title="关系画像加载失败" message={error ?? "未找到结果"} backTo={{ to: "/", label: "返回首页" }} />
    );
  }

  return (
    <RosResultView
      result={r}
      attemptId={id}
      coupleUnlocked={coupleUnlocked}
      suiteSlug={suiteSlug}
      accuracyNote={accuracyNote}
    />
  );
}
