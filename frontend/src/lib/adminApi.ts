import { formatApiErrorMessage } from "@/lib/apiErrors";
import { getRequiredAccessToken } from "@/lib/supabaseSession";

const API_BASE =
  (import.meta.env.VITE_LOVECOMPASS_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new Error("未配置 VITE_LOVECOMPASS_API_BASE_URL");
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getRequiredAccessToken()}`,
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } catch (err) {
    throw new Error(formatApiErrorMessage(err));
  }
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = payload?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : payload?.message || payload?.error || `请求失败：${res.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export type AdminUser = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  role?: string;
};

export type AdminStats = {
  stats: {
    users?: number;
    completed_attempts?: number;
    redemption_events?: number;
    active_codes?: number;
    ai_reports?: number;
    chat_sessions?: number;
  };
  attemptsBySuite: Array<{ slug: string; name: string; attempts: number }>;
  recentRedemptions: Array<{
    id: string;
    redeemed_at?: string;
    email?: string;
    suite_slug?: string;
    code?: string;
  }>;
  inProgressAttempts?: number;
  todayCompletedAttempts?: number;
};

export type AdminLiveMonitor = {
  generatedAt: string;
  stats: {
    users?: number;
    completed_attempts?: number;
    in_progress_attempts?: number;
    redemption_events?: number;
    chat_sessions?: number;
    ros_couples_completed?: number;
    mate_couples_completed?: number;
    ros_couples_waiting?: number;
    mate_couples_waiting?: number;
  };
  recentAttempts: AdminAttemptRow[];
  rosCoupleSessions: AdminCoupleSessionRow[];
  mateCoupleSessions: AdminCoupleSessionRow[];
  recentRedemptions: Array<{ redeemed_at?: string; email?: string; suite_slug?: string; code?: string }>;
};

export type AdminAttemptRow = {
  id: string;
  user_id?: string;
  status?: string;
  archetype_code?: string | null;
  ros_index?: number | null;
  relation_code?: string | null;
  partner_relation_code?: string | null;
  created_at?: string;
  completed_at?: string | null;
  email?: string | null;
  suite_slug?: string | null;
  suite_name?: string | null;
};

export type AdminCoupleSessionRow = {
  id: string;
  code: string;
  status?: string;
  created_at?: string;
  completed_at?: string | null;
  initiator_email?: string | null;
  partner_email?: string | null;
};

export type RedemptionCodeRow = {
  id: string;
  code: string;
  code_kind?: string;
  status?: string;
  max_uses?: number | null;
  used_count?: number;
  is_active?: boolean;
  expires_at?: string | null;
  created_at?: string;
  batch_name?: string;
  suite_slug?: string;
  suite_name?: string;
};

export type AdminUserRow = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
  attempt_count?: number;
  chat_session_count?: number;
};

export type AdminAnalystRow = {
  id: string;
  slug: string;
  name: string;
  title?: string | null;
  description?: string | null;
  model_name?: string;
  is_default?: boolean;
  is_active?: boolean;
  display_order?: number;
  persona_preview?: string;
  updated_at?: string;
};

export const adminApi = {
  me: () => adminRequest<{ ok: boolean; user: AdminUser }>("/admin/me"),
  stats: () => adminRequest<AdminStats>("/admin/stats"),
  liveMonitor: (limit = 25) =>
    adminRequest<AdminLiveMonitor>(`/admin/monitor/live?limit=${limit}`),
  suites: () =>
    adminRequest<{
      suites: Array<{
        id: string;
        slug: string;
        name: string;
        gender?: string;
        total_questions?: number;
        is_free?: boolean;
        is_active?: boolean;
        attempt_count?: number;
      }>;
    }>("/admin/suites"),
  listCodes: (params?: { suiteSlug?: string; q?: string; activeOnly?: boolean; limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.suiteSlug) search.set("suiteSlug", params.suiteSlug);
    if (params?.q) search.set("q", params.q);
    if (params?.activeOnly) search.set("activeOnly", "true");
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    return adminRequest<{ total: number; codes: RedemptionCodeRow[] }>(`/admin/redemption/codes${qs ? `?${qs}` : ""}`);
  },
  createCodes: (data: {
    suiteSlug: string;
    batchName: string;
    kind: string;
    count: number;
    maxUses?: number;
    expiresAt?: string;
    prefix?: string;
    note?: string;
  }) =>
    adminRequest<{ ok: boolean; batchId: string; codes: Array<{ id: string; code: string }> }>(
      "/admin/redemption/codes",
      { method: "POST", body: JSON.stringify(data) },
    ),
  patchCode: (codeId: string, data: { isActive?: boolean; status?: string; maxUses?: number }) =>
    adminRequest<{ ok: boolean; code: RedemptionCodeRow }>(`/admin/redemption/codes/${codeId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  listEvents: (params?: { limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    return adminRequest<{ total: number; events: unknown[] }>(`/admin/redemption/events${qs ? `?${qs}` : ""}`);
  },
  listUsers: (params?: { q?: string; limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.q) search.set("q", params.q);
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    return adminRequest<{ total: number; users: AdminUserRow[] }>(`/admin/users${qs ? `?${qs}` : ""}`);
  },
  userDetail: (userId: string) =>
    adminRequest<{ user: AdminUserRow; attempts: unknown[]; redemptions: unknown[] }>(`/admin/users/${userId}`),
  listAttempts: (params?: { userId?: string; suiteSlug?: string; limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.userId) search.set("userId", params.userId);
    if (params?.suiteSlug) search.set("suiteSlug", params.suiteSlug);
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    return adminRequest<{ total: number; attempts: AdminAttemptRow[] }>(`/admin/attempts${qs ? `?${qs}` : ""}`);
  },
  listAnalysts: () => adminRequest<{ analysts: AdminAnalystRow[] }>("/admin/analysts"),
  analystDetail: (slug: string) =>
    adminRequest<{
      analyst: AdminAnalystRow & { persona_prompt?: string; system_prompt?: string; model_params?: Record<string, unknown> };
    }>(`/admin/analysts/${slug}`),
  patchAnalyst: (
    slug: string,
    data: {
      name?: string;
      title?: string;
      description?: string;
      personaPrompt?: string;
      systemPrompt?: string;
      modelName?: string;
      isActive?: boolean;
      isDefault?: boolean;
      displayOrder?: number;
    },
  ) =>
    adminRequest<{ ok: boolean; analyst: AdminAnalystRow }>(`/admin/analysts/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
