import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { lovecompassApi, type AttemptReport } from "@/lib/lovecompassApi";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { SelfResultView } from "@/components/SelfResultView";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { mapAttemptToSelfResult, type AttemptResultInput } from "@/lib/mapAttemptToSelfResult";

export const Route = createFileRoute("/result/$attemptId")({
  head: () => ({
    meta: [
      { title: "你的关系画像 · MIRROR" },
      { name: "description", content: "MIRROR 为你生成的自我关系模式画像。" },
    ],
  }),
  component: ResultPage,
});

const REPORT_PLACEHOLDER_MARKERS = ["正式 AI 深度报告可由后台任务继续生成", "【AI 占位回复】", "【智谱未配置】"];

function ResultPage() {
  const { attemptId } = useParams({ from: "/result/$attemptId" });
  const { pending: authPending } = useRequireAuth();
  const [data, setData] = useState<AttemptResultInput | null>(null);
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
        const attempt = r.attempt as AttemptResultInput;
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

  const mapped = useMemo(() => (data ? mapAttemptToSelfResult(data) : null), [data]);
  const reportMarkdown = report?.content ?? (isPlaceholderReport(data?.ai_report) ? "" : data?.ai_report ?? "");

  if (authPending) return <AuthChecking />;

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
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">读取你的画像…</div>;
  }

  return (
    <SelfResultView
      result={mapped}
      attemptId={attemptId}
      reportMarkdown={reportMarkdown || undefined}
      reportLoading={reportLoading}
      reportError={reportError}
    />
  );
}

function isPlaceholderReport(report?: string | null) {
  if (!report) return true;
  return REPORT_PLACEHOLDER_MARKERS.some((marker) => report.includes(marker));
}
