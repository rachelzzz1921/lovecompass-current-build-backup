export type AnalyzingTimelineState = {
  stageIndex: number;
  overall: number;
  waiting: boolean;
  canComplete: boolean;
};

/** Minimum time on analyzing screen so the transition does not flash. */
export const MIN_ANALYZING_DWELL_MS = 0;

/** Tail loop: keep stages moving if the backend is still working. */
export const TAIL_STAGE_MS = 900;

export function totalStageDuration(stageDurations: number[]): number {
  return stageDurations.reduce((sum, dur) => sum + dur, 0);
}

export function stageIndexForElapsed(elapsedMs: number, stageDurations: number[]): number {
  let acc = 0;
  for (let i = 0; i < stageDurations.length; i++) {
    acc += stageDurations[i];
    if (elapsedMs < acc) return i;
  }
  return Math.max(0, stageDurations.length - 1);
}

export function computeAnalyzingTimeline(opts: {
  elapsedMs: number;
  stageDurations: number[];
  apiReady: boolean;
}): AnalyzingTimelineState {
  const { elapsedMs, stageDurations, apiReady } = opts;
  const last = Math.max(0, stageDurations.length - 1);
  const total = totalStageDuration(stageDurations);
  const timelineComplete = elapsedMs >= total;

  let stageIndex = stageIndexForElapsed(elapsedMs, stageDurations);
  let waiting = false;

  if (timelineComplete && !apiReady) {
    stageIndex = last;
    waiting = true;
  } else if (timelineComplete && apiReady) {
    stageIndex = last;
  }

  let overall: number;
  if (!apiReady) {
    if (elapsedMs <= total || total <= 0) {
      overall = total > 0 ? Math.min(82, (elapsedMs / total) * 82) : 0;
    } else {
      const pulse = 0.5 + 0.5 * Math.sin(elapsedMs / 1400);
      overall = 74 + pulse * 8;
    }
  } else {
    overall = 100;
  }

  const minDwellMet = elapsedMs >= MIN_ANALYZING_DWELL_MS;

  return {
    stageIndex,
    overall,
    waiting,
    canComplete: apiReady && minDwellMet,
  };
}

export function formatAnalyzingWaitMessage(opts: {
  elapsedMs: number;
  stageDurations: number[];
  waiting: boolean;
  estimatedWaitLabel: string;
  longWaitHint: string;
}): string {
  const { elapsedMs, stageDurations, waiting, estimatedWaitLabel, longWaitHint } = opts;
  if (!waiting) return estimatedWaitLabel;

  const total = totalStageDuration(stageDurations);
  const tailMs = Math.max(0, elapsedMs - total);
  if (tailMs > 45_000) {
    return "已超过 45 秒，若仍无结果请检查网络；也可返回测试页重新提交";
  }
  if (tailMs > 20_000) return longWaitHint;
  return "结果还在生成，完成后会直接进入，无需再等等待页";
}
