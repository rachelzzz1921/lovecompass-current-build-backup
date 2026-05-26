import { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import type { AttemptReport } from "@/lib/lovecompassApi";
import { fetchAttemptReportIfNeeded, isPlaceholderReport } from "@/lib/attemptReport";
import { sanitizeResultReportMarkdown } from "@/lib/mapAttemptToSelfResult";

type Props = {
  attemptId: string;
  initialReport?: string | null;
  title?: string;
  className?: string;
  variant?: "light" | "dark";
};

export function AiReportSection({
  attemptId,
  initialReport,
  title = "AI 深度报告",
  className = "",
  variant = "light",
}: Props) {
  const [report, setReport] = useState<AttemptReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [softPending, setSoftPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (initialReport && !isPlaceholderReport(initialReport)) {
      setReport({
        attemptId,
        status: "succeeded",
        content: initialReport,
        cached: true,
      });
      return;
    }
    setLoading(true);
    setSoftPending(false);
    setError(null);
    const softTimer = window.setTimeout(() => {
      if (!ignore) setSoftPending(true);
    }, 12_000);
    void fetchAttemptReportIfNeeded(attemptId, initialReport, {
      maxWaitMs: 50_000,
      finalizeWaitMs: 25_000,
    }).then(({ report: next, error: err }) => {
      if (ignore) return;
      setReport(next);
      setError(err);
      setLoading(false);
      setSoftPending(false);
    });
    return () => {
      ignore = true;
      window.clearTimeout(softTimer);
    };
  }, [attemptId, initialReport]);

  const isDark = variant === "dark";
  const titleClass = isDark ? "text-white/95" : "text-foreground/95";
  const mutedClass = isDark ? "text-white/55" : "text-muted-foreground";
  const panelClass = isDark
    ? "rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
    : "rounded-2xl border border-border/60 bg-glass p-5 md:p-6";
  const proseClass = isDark ? "prose prose-invert prose-sm max-w-none text-white/85" : "prose prose-invert prose-sm max-w-none text-foreground/85";

  return (
    <section className={`scroll-mt-28 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Bot className="h-4 w-4 text-[oklch(0.82_0.14_200)]" />
        <h3 className={`font-display text-lg ${titleClass}`}>{title}</h3>
      </div>
      <div className={panelClass}>
        {loading && (
          <p className={`text-sm ${mutedClass} flex items-center gap-2`}>
            <Sparkles className="h-4 w-4 animate-pulse" />
            {softPending ? "深度报告仍在后台排队，可先阅读上方结果" : "正在加载深度解读…"}
          </p>
        )}
        {!loading && error && (
          <p className={`text-sm ${mutedClass}`}>报告暂不可用：{error}</p>
        )}
        {!loading && report?.content && (
          <div
            className={`${proseClass} leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: sanitizeResultReportMarkdown(report.content) }}
          />
        )}
        {!loading && !error && !report?.content && (
          <p className={`text-sm ${mutedClass}`}>暂无 AI 报告内容。</p>
        )}
      </div>
    </section>
  );
}
