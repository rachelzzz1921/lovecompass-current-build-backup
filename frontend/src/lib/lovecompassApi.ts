import type { AnswerDraft, TestQuestionsResponse } from "@/lib/questionTypes";

const API_BASE = (import.meta.env.VITE_LOVECOMPASS_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("lovecompass_token") : null;
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
    const message = payload?.message || payload?.error || payload?.detail || `请求失败：${res.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export const lovecompassApi = {
  getQuestions: (suiteSlug: string) => requestJson<TestQuestionsResponse>(`/tests/${encodeURIComponent(suiteSlug)}/questions`),
  verifyRedemption: (data: { code: string; product: string }) =>
    requestJson<{ ok: boolean; suiteSlug: string; redemptionEventId?: string; redirect?: string }>("/redemption/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  submitAttempt: (data: { suiteSlug: string; redemptionEventId?: string | null; answers: AnswerDraft[] }) =>
    requestJson<{ attemptId: string; status: "completed" | "in_progress"; next?: string }>("/attempts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAttemptResult: (attemptId: string) => requestJson<{ attempt: unknown }>(`/attempts/${encodeURIComponent(attemptId)}/result`),
  sendChatMessage: (data: { attemptId?: string; analystId?: string; message: string }) =>
    requestJson<{ message: string; conversationId?: string }>("/chat/message", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
