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

const REPORT_PENDING_RE = /尚未完成|暂不能生成报告/;

const FAST_POLL_MS = 350;
const MID_POLL_MS = 600;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pollDelay(elapsedMs: number): number {
  if (elapsedMs < 8_000) return FAST_POLL_MS;
  return MID_POLL_MS;
}

export type FetchReportOptions = {
  maxWaitMs?: number;
  /** Max time to wait for attempt finalize before trying report anyway. */
  finalizeWaitMs?: number;
  pollMs?: number;
};

/** Wait for attempt finalize, then fetch deep report. Avoids racing in_progress status. */
export async function fetchAttemptReportWhenReady(
  attemptId: string,
  options?: FetchReportOptions,
): Promise<{ report: AttemptReport | null; error: string | null }> {
  const maxWaitMs = options?.maxWaitMs ?? 60_000;
  const finalizeWaitMs = options?.finalizeWaitMs ?? 35_000;
  const started = Date.now();
  const deadline = started + maxWaitMs;
  const finalizeDeadline = started + finalizeWaitMs;

  while (Date.now() < finalizeDeadline) {
    try {
      const res = await lovecompassApi.getAttemptResult(attemptId);
      const status = (res.attempt as Record<string, unknown> | undefined)?.status;
      if (status === "completed") break;
    } catch {
      // keep polling through transient API errors
    }
    await sleep(options?.pollMs ?? pollDelay(Date.now() - started));
  }

  while (Date.now() < deadline) {
    try {
      const res = await lovecompassApi.getAttemptReport(attemptId);
      return { report: res.report, error: null };
    } catch (e) {
      const message = (e as Error).message || "报告加载失败";
      if (REPORT_PENDING_RE.test(message)) {
        await sleep(options?.pollMs ?? pollDelay(Date.now() - started));
        continue;
      }
      return { report: null, error: message };
    }
  }

  return { report: null, error: null };
}

export async function fetchAttemptReportIfNeeded(
  attemptId: string,
  initialReport?: string | null,
  options?: FetchReportOptions,
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
  return fetchAttemptReportWhenReady(attemptId, options);
}
