import type { AnswerDraft, TestQuestionsResponse } from "@/lib/questionTypes";
import { supabase } from "@/integrations/supabase/client";

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

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error("未配置 VITE_LOVECOMPASS_API_BASE_URL");
  }
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      payload?.message || payload?.error || payload?.detail || `请求失败：${res.status}`;
    throw new Error(message);
  }
  return payload as T;
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
    ),
  getAttemptResult: (attemptId: string) =>
    requestJson<{ attempt: unknown }>(`/attempts/${encodeURIComponent(attemptId)}/result`),
  getAttemptReport: (attemptId: string, refresh = false) =>
    requestJson<{ report: AttemptReport }>(
      `/attempts/${encodeURIComponent(attemptId)}/report${refresh ? "?refresh=true" : ""}`,
      { method: "POST" },
    ),
  getAttemptHistory: (limit = 20) =>
    requestJson<{ attempts: AttemptHistoryItem[] }>(
      `/attempts?limit=${encodeURIComponent(String(limit))}`,
    ),
  sendChatMessage: (data: { attemptId?: string; analystId?: string; message: string }) =>
    requestJson<{ message: string; conversationId?: string }>("/chat/message", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
