import { lovecompassApi } from "@/lib/lovecompassApi";
import {
  stashResultPrefetch,
  type MateCouplePrefetch,
  type MateSinglePrefetch,
  type RosCouplePrefetch,
  type RosSinglePrefetch,
  type SelfAttemptPrefetch,
} from "@/lib/resultPrefetchCache";
import type { ProductSet } from "@/lib/resultRoutes";

const POLL_MS = 400;
const TIMEOUT_MS = 120_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function selfAttemptRenderable(attempt: Record<string, unknown>): boolean {
  if (attempt.status === "completed") return true;
  const scores = attempt.dimension_scores;
  if (scores && typeof scores === "object" && Object.keys(scores as object).length > 0) {
    return true;
  }
  const payload = attempt.result_payload;
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  return Boolean(p.archetype_code || p.attachment_type || p.dimensions);
}

/** SELF：提交后分数已写入，不必等后台 finalize 才展示结果。 */
export async function waitForSelfAttemptReady(attemptId: string): Promise<Record<string, unknown>> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await lovecompassApi.getAttemptResult(attemptId);
    const attempt = (res.attempt ?? {}) as Record<string, unknown>;
    if (selfAttemptRenderable(attempt)) return attempt;
    await sleep(POLL_MS);
  }
  throw new Error("结果生成超时，请稍后在历史记录中查看。");
}

const ROS_LAYER_KEYS = new Set(["AT", "IN", "CO", "EV", "RK"]);

export function normalizeRosSinglePayload(attempt: Record<string, unknown>): Record<string, unknown> {
  const payload = {
    ...(((attempt.result_payload ?? {}) as Record<string, unknown>) || {}),
  };
  if (!Array.isArray(payload.dims) && Array.isArray(payload.layers)) {
    payload.dims = (payload.layers as Array<Record<string, unknown>>).map((layer) => ({
      key: String(layer.code ?? "").toLowerCase(),
      label: String(layer.name ?? ""),
      value: Number(layer.displayScore ?? layer.score ?? 0),
      color: String(layer.color ?? ""),
    }));
  }
  const code = attempt.relation_code ?? payload.relationCode;
  if (code && !payload.relationCode) payload.relationCode = code;
  return payload;
}

export function rosSingleDisplayReady(single: Record<string, unknown>): boolean {
  if (Array.isArray(single.dims) && single.dims.length > 0) return true;
  return Boolean(
    Array.isArray(single.layers) &&
      single.layers.length > 0 &&
      single.relationshipType,
  );
}

export function rosAttemptRenderable(attempt: Record<string, unknown>): boolean {
  if (attempt.status === "completed") return true;
  const payload = attempt.result_payload;
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (p.layers || p.layerDetails || p.rosIndex || p.relationshipType || p.dims) {
      return true;
    }
  }
  const scores = attempt.dimension_scores;
  if (scores && typeof scores === "object") {
    return Object.keys(scores as object).some((k) => ROS_LAYER_KEYS.has(k.toUpperCase()));
  }
  return false;
}

export function mateAttemptRenderable(attempt: Record<string, unknown>): boolean {
  if (attempt.status === "completed") return true;
  const payload = attempt.result_payload;
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  return Boolean(
    p.positionType ||
      p.computedLayers ||
      p.axisX ||
      (p.identityCard && typeof p.identityCard === "object"),
  );
}

export async function waitForRosAttemptReady(attemptId: string): Promise<Record<string, unknown>> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await lovecompassApi.getAttemptResult(attemptId);
    const attempt = (res.attempt ?? {}) as Record<string, unknown>;
    if (rosAttemptRenderable(attempt)) return attempt;
    await sleep(POLL_MS);
  }
  throw new Error("关系画像生成超时，请稍后在历史记录中查看。");
}

export async function waitForMateAttemptReady(attemptId: string): Promise<Record<string, unknown>> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await lovecompassApi.getAttemptResult(attemptId);
    const attempt = (res.attempt ?? {}) as Record<string, unknown>;
    if (mateAttemptRenderable(attempt)) return attempt;
    await sleep(POLL_MS);
  }
  throw new Error("择偶档案生成超时，请稍后在历史记录中查看。");
}

/** @deprecated use waitForRosAttemptReady / waitForMateAttemptReady / waitForSelfAttemptReady */
export async function waitForAttemptCompleted(attemptId: string): Promise<Record<string, unknown>> {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await lovecompassApi.getAttemptResult(attemptId);
    const attempt = (res.attempt ?? {}) as Record<string, unknown>;
    if (attempt.status === "completed") return attempt;
    await sleep(POLL_MS);
  }
  throw new Error("结果生成超时，请稍后在历史记录中查看。");
}

async function prefetchMateSingle(attemptId: string, attempt: Record<string, unknown>): Promise<void> {
  const payload = (attempt.result_payload ?? {}) as Record<string, unknown>;
  const relationCode = String(attempt.relation_code ?? payload.relationCode ?? "") || undefined;

  const stash = (single: Record<string, unknown>, extra?: { relationCode?: string; coupleUnlocked?: boolean }) => {
    stashResultPrefetch(attemptId, {
      kind: "mate-single",
      attemptId,
      data: {
        single,
        relationCode: extra?.relationCode ?? relationCode,
        coupleUnlocked: extra?.coupleUnlocked,
        suiteSlug: String(attempt.test_id ?? ""),
      },
    } satisfies MateSinglePrefetch);
  };

  if (mateAttemptRenderable(attempt) && Object.keys(payload).length > 0) {
    stash(payload);
    return;
  }

  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_MS);
    const res = await lovecompassApi.getAttemptResult(attemptId);
    attempt = (res.attempt ?? {}) as Record<string, unknown>;
    const nextPayload = (attempt.result_payload ?? {}) as Record<string, unknown>;
    if (mateAttemptRenderable(attempt) && Object.keys(nextPayload).length > 0) {
      stash(nextPayload);
      return;
    }
    try {
      const singleRes = await lovecompassApi.getMateSingleResult(attemptId);
      stash(singleRes.single, {
        relationCode: singleRes.relationCode,
        coupleUnlocked: singleRes.coupleUnlocked,
      });
      return;
    } catch {
      // keep polling attempt until renderable or timeout
    }
  }
  throw new Error("择偶档案加载超时，请刷新或从历史记录进入。");
}

async function prefetchRosSingle(attemptId: string, attempt: Record<string, unknown>): Promise<void> {
  const relationCode = String(
    attempt.relation_code ??
      (attempt.result_payload as Record<string, unknown> | undefined)?.relationCode ??
      "",
  ) || undefined;

  const stash = (single: Record<string, unknown>, extra?: { relationCode?: string; coupleUnlocked?: boolean }) => {
    stashResultPrefetch(attemptId, {
      kind: "ros-single",
      attemptId,
      data: {
        single,
        relationCode:
          extra?.relationCode ??
          relationCode ??
          (String(single.relationCode ?? "") || undefined),
        coupleUnlocked: extra?.coupleUnlocked,
        suiteSlug: String(attempt.test_id ?? ""),
      },
    } satisfies RosSinglePrefetch);
  };

  const tryStashAttempt = (row: Record<string, unknown>): boolean => {
    const single = normalizeRosSinglePayload(row);
    if (!rosAttemptRenderable(row) || !rosSingleDisplayReady(single)) return false;
    stash(single);
    return true;
  };

  // POST 后 result_payload 已含 layers/dims，不必等 finalize 或重 GET /ros/.../single
  if (tryStashAttempt(attempt)) return;

  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_MS);
    const res = await lovecompassApi.getAttemptResult(attemptId);
    attempt = (res.attempt ?? {}) as Record<string, unknown>;
    if (tryStashAttempt(attempt)) return;
  }
  throw new Error("关系画像加载超时，请刷新或从历史记录进入。");
}

async function prefetchSelfAttempt(attemptId: string, attempt: Record<string, unknown>): Promise<void> {
  const entry: SelfAttemptPrefetch = {
    kind: "self-attempt",
    attemptId,
    data: attempt,
  };
  stashResultPrefetch(attemptId, entry);
}

async function prefetchMateCouple(code: string): Promise<void> {
  const deadline = Date.now() + TIMEOUT_MS;
  const normalized = code.trim().toUpperCase();
  while (Date.now() < deadline) {
    try {
      const res = await lovecompassApi.getMateCoupleReport(normalized);
      const entry: MateCouplePrefetch = {
        kind: "mate-couple",
        code: normalized,
        data: res.couple as Record<string, unknown>,
      };
      stashResultPrefetch(`couple:${normalized}`, entry);
      return;
    } catch {
      await sleep(POLL_MS);
    }
  }
  throw new Error("双人报告加载超时，请稍后再试。");
}

async function prefetchRosCouple(code: string): Promise<void> {
  const deadline = Date.now() + TIMEOUT_MS;
  const normalized = code.trim().toUpperCase();
  while (Date.now() < deadline) {
    try {
      const res = await lovecompassApi.getRosCoupleReport(normalized);
      const entry: RosCouplePrefetch = {
        kind: "ros-couple",
        code: normalized,
        data: res.couple as Record<string, unknown>,
      };
      stashResultPrefetch(`couple:${normalized}`, entry);
      return;
    } catch {
      await sleep(POLL_MS);
    }
  }
  throw new Error("双人报告加载超时，请稍后再试。");
}

/** Block until the destination result page can render without another load screen. */
export async function waitForResultReady(opts: {
  attemptId: string;
  productSet: ProductSet;
  partnerRelationCode?: string | null;
}): Promise<void> {
  const attempt =
    opts.productSet === "SELF"
      ? await waitForSelfAttemptReady(opts.attemptId)
      : opts.productSet === "ROS"
        ? await waitForRosAttemptReady(opts.attemptId)
        : await waitForMateAttemptReady(opts.attemptId);

  if (opts.partnerRelationCode) {
    const code = opts.partnerRelationCode.trim().toUpperCase();
    if (opts.productSet === "MATE") {
      await prefetchMateCouple(code);
    } else {
      await prefetchRosCouple(code);
    }
    return;
  }

  if (opts.productSet === "MATE") {
    await prefetchMateSingle(opts.attemptId, attempt);
    return;
  }
  if (opts.productSet === "ROS") {
    await prefetchRosSingle(opts.attemptId, attempt);
    return;
  }
  await prefetchSelfAttempt(opts.attemptId, attempt);
}
