import type { AttemptReport } from "@/lib/lovecompassApi";
import { lovecompassApi } from "@/lib/lovecompassApi";

export const REPORT_PLACEHOLDER_MARKERS = [
  "正式 AI 深度报告可由后台任务继续生成",
  "【AI 占位回复】",
  "【智谱未配置】",
];

export function isPlaceholderReport(report: string | null | undefined): boolean {
  if (!report?.trim()) return true;
  return REPORT_PLACEHOLDER_MARKERS.some((marker) => report.includes(marker));
}

export async function fetchAttemptReportIfNeeded(
  attemptId: string,
  initialReport?: string | null,
): Promise<{ report: AttemptReport | null; error: string | null }> {
  if (initialReport && !isPlaceholderReport(initialReport)) {
    return {
      report: {
        attemptId,
        status: "succeeded",
        content: initialReport,
        cached: true,
      },
      error: null,
    };
  }
  try {
    const res = await lovecompassApi.getAttemptReport(attemptId);
    return { report: res.report, error: null };
  } catch (e) {
    return { report: null, error: (e as Error).message || "报告加载失败" };
  }
}
