import type { AnswerDraft, TestQuestionsResponse } from "@/lib/questionTypes";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { getRequiredAccessToken } from "@/lib/supabaseSession";

export type ChatContext = {
  attemptId: string;
  suiteSlug?: string | null;
  suiteName?: string | null;
  archetype: string;
  attachmentType?: string | null;
  tagline?: string | null;
  description?: string | null;
  matchingLogic?: string | null;
  rosIndex?: number | null;
  completedAt?: string | null;
  dimensions?: Array<{ code?: string; name?: string; score?: number }>;
  hasAiReport?: boolean;
};

export type ChatMessageResponse = {
  message: string;
  conversationId?: string | null;
  bound?: boolean;
  context?: ChatContext | null;
};

export type AttemptReport = {
  attemptId: string;
  status: string;
  summary?: string | null;
  content: string;
  reportPayload?: Record<string, unknown> | null;
  generatedAt?: string | null;
  modelProvider?: string | null;
  modelName?: string | null;
  cached?: boolean;
};

export type AttemptHistoryItem = {
  id: string;
  test_id?: string | null;
  status?: string | null;
  archetype_code?: string | null;
  archetype_gender?: string | null;
  ros_index?: number | null;
  rk_score?: number | null;
  dimension_scores?: Record<string, number> | null;
  result_payload?: Record<string, unknown> | null;
  created_at?: string | null;
  completed_at?: string | null;
  suite_slug?: string | null;
  suite_name?: string | null;
  suite_gender?: string | null;
  total_questions?: number | null;
  estimated_minutes?: number | null;
};

const API_BASE =
  (import.meta.env.VITE_LOVECOMPASS_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = payload?.detail;
    const detailText =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join("；")
          : null;
    const message =
      payload?.message ||
      payload?.error ||
      detailText ||
      `请求失败：${res.status}`;
    throw new Error(message);
  }
  return payload as T;
}

async function requestJson<T>(path: string, init?: RequestInit, authRequired = false): Promise<T> {
  if (!API_BASE) {
    throw new Error("未配置 VITE_LOVECOMPASS_API_BASE_URL");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (authRequired) {
    headers.Authorization = `Bearer ${await getRequiredAccessToken()}`;
  } else {
    try {
      const token = await getRequiredAccessToken();
      headers.Authorization = `Bearer ${token}`;
    } catch {
      // Public endpoints may be called before login.
    }
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch (err) {
    throw new Error(formatApiErrorMessage(err));
  }
  return parseJsonResponse<T>(res);
}

export const lovecompassApi = {
  getQuestions: (suiteSlug: string) =>
    requestJson<TestQuestionsResponse>(`/tests/${encodeURIComponent(suiteSlug)}/questions`),
  verifyRedemption: (data: { code: string; product: string }) =>
    requestJson<{ ok: boolean; suiteSlug: string; redemptionEventId?: string; redirect?: string }>(
      "/redemption/verify",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),
  submitAttempt: (data: {
    suiteSlug: string;
    redemptionEventId?: string | null;
    answers: AnswerDraft[];
  }) =>
    requestJson<{ attemptId: string; status: "completed" | "in_progress"; next?: string }>(
      "/attempts",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),
  getAttemptResult: (attemptId: string) =>
    requestJson<{ attempt: unknown }>(`/attempts/${encodeURIComponent(attemptId)}/result`, undefined, true),
  getAttemptReport: (attemptId: string, refresh = false) =>
    requestJson<{ report: AttemptReport }>(
      `/attempts/${encodeURIComponent(attemptId)}/report${refresh ? "?refresh=true" : ""}`,
      { method: "POST" },
      true,
    ),
  getAttemptHistory: (limit = 20) =>
    requestJson<{ attempts: AttemptHistoryItem[] }>(
      `/attempts?limit=${encodeURIComponent(String(limit))}`,
      undefined,
      true,
    ),
  sendChatMessage: (data: { attemptId?: string; analystId?: string; message: string }) =>
    requestJson<ChatMessageResponse>(
      "/chat/message",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      true,
    ),
  getChatContext: (attemptId?: string) =>
    requestJson<{ ok: boolean; bound: boolean; context: ChatContext | null }>(
      `/chat/context${attemptId ? `?attemptId=${encodeURIComponent(attemptId)}` : ""}`,
      undefined,
      true,
    ),
};
