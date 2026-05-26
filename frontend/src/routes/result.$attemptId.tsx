import { createFileRoute, redirect, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { lovecompassApi, type AttemptReport } from "@/lib/lovecompassApi";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { SelfResultView } from "@/components/SelfResultView";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import {
  mapAttemptToSelfResult,
  sanitizeResultReportMarkdown,
  type AttemptResultInput,
} from "@/lib/mapAttemptToSelfResult";
import { dedicatedResultRouteFromAttempt } from "@/lib/resultRoutes";
import { fetchAttemptReportWhenReady, isPlaceholderReport } from "@/lib/attemptReport";
import { peekResultPrefetch, takeResultPrefetch } from "@/lib/resultPrefetchCache";
import { ResultDataLoading } from "@/components/ResultDataLoading";
import { waitForSelfAttemptReady } from "@/lib/waitForResultReady";

const PRODUCT_RESULT_SLUGS = {
  mate: "/tests/mate",
  ros: "/ros/start",
  self: "/tests/self",
} as const;

export const Route = createFileRoute("/result/$attemptId")({
  beforeLoad: ({ params }) => {
    const slug = params.attemptId as keyof typeof PRODUCT_RESULT_SLUGS;
    if (slug in PRODUCT_RESULT_SLUGS) {
      throw redirect({ to: PRODUCT_RESULT_SLUGS[slug] });
    }
  },
  ssr: false,
  head: () => ({
    meta: [
      { title: "你的关系画像 · MIRROR" },
      { name: "description", content: "MIRROR 为你生成的自我关系模式画像。" },
    ],
  }),
  component: ResultPage,
});

function applySelfAttempt(
  attemptId: string,
  attempt: AttemptResultInput & Record<string, unknown>,
  setters: {
    setData: (v: AttemptResultInput | null) => void;
    setReport: (v: AttemptReport | null) => void;
    setReportLoading: (v: boolean) => void;
    setReportError: (v: string | null) => void;
    ignoreRef: () => boolean;
  },
) {
  setters.setData(attempt);
  if (!isPlaceholderReport(attempt.ai_report)) {
    setters.setReport({
      attemptId,
      status: "succeeded",
      content: attempt.ai_report ?? "",
      cached: true,
    });
    return;
  }
  setters.setReportLoading(true);
  void fetchAttemptReportWhenReady(attemptId)
    .then(({ report: nextReport, error }) => {
      if (setters.ignoreRef()) return;
      if (nextReport) {
        setters.setReport(nextReport);
        setters.setData((current) =>
          current ? { ...current, ai_report: nextReport.content } : current,
        );
      }
      if (error) setters.setReportError(error);
    })
    .finally(() => {
      if (!setters.ignoreRef()) setters.setReportLoading(false);
    });
}

function ResultPage() {
  const { attemptId } = useParams({ from: "/result/$attemptId" });
  const nav = useNavigate();
  const { pending: authPending, authed } = useRequireAuth();
  const [data, setData] = useState<AttemptResultInput | null>(null);
  const [report, setReport] = useState<AttemptReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [deepReportRequesting, setDeepReportRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hydratedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authPending || !authed) return;
    if (hydratedRef.current === attemptId) return;

    let ignore = false;
    setLoading(true);
    setError(null);
    setData(null);
    setReport(null);
    setReportError(null);
    setReportLoading(false);

    const cached = peekResultPrefetch(attemptId);
    if (cached?.kind === "self-attempt" && cached.attemptId === attemptId) {
      const attempt = cached.data as AttemptResultInput & Record<string, unknown>;
      const dedicated = dedicatedResultRouteFromAttempt(attemptId, attempt);
      if (dedicated) {
        void nav({ ...dedicated, replace: true });
        return () => {
          ignore = true;
        };
      }
      takeResultPrefetch(attemptId);
      applySelfAttempt(attemptId, attempt, {
        setData,
        setReport,
        setReportLoading,
        setReportError,
        ignoreRef: () => ignore,
      });
      setLoading(false);
      hydratedRef.current = attemptId;
      return () => {
        ignore = true;
      };
    }

    void waitForSelfAttemptReady(attemptId)
      .then((attempt) => {
        if (ignore) return;
        const typed = attempt as AttemptResultInput & Record<string, unknown>;
        const dedicated = dedicatedResultRouteFromAttempt(attemptId, typed);
        if (dedicated) {
          void nav({ ...dedicated, replace: true });
          return;
        }
        applySelfAttempt(attemptId, typed, {
          setData,
          setReport,
          setReportLoading,
          setReportError,
          ignoreRef: () => ignore,
        });
        hydratedRef.current = attemptId;
      })
      .catch((e) => {
        if (!ignore) setError(formatApiErrorMessage(e));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [attemptId, nav, authPending, authed]);

  useEffect(() => {
    if (!data) return;
    const mode = (data.result_payload as { ai_content?: { mode?: string } } | undefined)?.ai_content?.mode;
    if (mode && mode !== "deterministic") return;
    let ignore = false;
    const timer = window.setTimeout(() => {
      lovecompassApi
        .getAttemptResult(attemptId)
        .then((r) => {
          if (ignore) return;
          const next = r.attempt as AttemptResultInput;
          const nextMode = next.result_payload?.ai_content?.mode;
          if (nextMode && nextMode !== mode) {
            setData(next);
          }
        })
        .catch(() => undefined);
    }, 8000);
    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [attemptId, data]);

  const mapped = useMemo(() => (data ? mapAttemptToSelfResult(data) : null), [data]);
  const rawReportMarkdown =
    report?.content ?? (isPlaceholderReport(data?.ai_report) ? "" : data?.ai_report ?? "");
  const reportMarkdown = useMemo(() => {
    if (!rawReportMarkdown || !mapped) return rawReportMarkdown;
    return sanitizeResultReportMarkdown(
      rawReportMarkdown,
      mapped.archetype.name,
      mapped.character.name,
    );
  }, [rawReportMarkdown, mapped]);

  if (authPending) return <AuthChecking />;
  if (loading) return <ResultDataLoading />;

  if (error) {
    return (
      <ApiErrorPanel
        title="画像加载失败"
        message={error}
        backTo={{ to: "/", label: "返回首页" }}
      />
    );
  }

  if (!data || !mapped) {
    return (
      <ApiErrorPanel
        title="画像数据为空"
        message="请从历史记录重试。"
        backTo={{ to: "/", label: "返回首页" }}
      />
    );
  }

  const requestDeepReport = () => {
    if (deepReportRequesting || reportLoading) return;
    setDeepReportRequesting(true);
    setReportError(null);
    void fetchAttemptReportWhenReady(attemptId)
      .then(({ report: nextReport, error }) => {
        if (nextReport) {
          setReport(nextReport);
          setData((current) => (current ? { ...current, ai_report: nextReport.content } : current));
        }
        if (error) setReportError(error);
      })
      .finally(() => setDeepReportRequesting(false));
  };

  return (
    <SelfResultView
      result={mapped}
      attemptId={attemptId}
      suiteSlug={data.test_id}
      accuracyNote={
        typeof (data.result_payload as Record<string, unknown> | undefined)?.accuracyNote === "string"
          ? String((data.result_payload as Record<string, unknown>).accuracyNote)
          : null
      }
      reportMarkdown={reportMarkdown || undefined}
      reportLoading={reportLoading}
      reportError={reportError}
      onRequestDeepReport={requestDeepReport}
      deepReportRequesting={deepReportRequesting}
    />
  );
}

