import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { RosSingleResult } from "@/data/rosTypes";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { RosResultView } from "@/components/RosResultView";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { mapApiSingleToRosResult } from "@/lib/mapRosResult";
import { lovecompassApi } from "@/lib/lovecompassApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

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
  const { pending: authPending } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [r, setR] = useState<RosSingleResult | null>(null);
  const [suiteSlug, setSuiteSlug] = useState<string | null>(null);
  const [coupleUnlocked, setCoupleUnlocked] = useState(false);
  const [accuracyNote, setAccuracyNote] = useState<string | null>(null);

  useEffect(() => {
    if (authPending) return;
    let cancelled = false;
    setLoading(true);
    lovecompassApi
      .getRosSingleResult(id)
      .then((res) => {
        if (cancelled) return;
        setR(mapApiSingleToRosResult(res.single, res.relationCode || ""));
        setCoupleUnlocked(Boolean(res.coupleUnlocked));
        const single = res.single as Record<string, unknown>;
        setAccuracyNote(typeof single.accuracyNote === "string" ? single.accuracyNote : null);
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
  }, [authPending, id]);

  // Layer C：后台 AI 升级后静默刷新
  useEffect(() => {
    if (!r) return;
    const mode = r.aiContent?.mode;
    if (mode && mode !== "deterministic") return;
    let ignore = false;
    const timer = window.setTimeout(() => {
      lovecompassApi
        .getRosSingleResult(id)
        .then((res) => {
          if (ignore) return;
          const next = mapApiSingleToRosResult(res.single, res.relationCode || "");
          if (next.aiContent?.mode && next.aiContent.mode !== mode) {
            setR(next);
          }
        })
        .catch(() => undefined);
    }, 8000);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [id, r]);

  if (authPending || loading) return <AuthChecking />;
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
