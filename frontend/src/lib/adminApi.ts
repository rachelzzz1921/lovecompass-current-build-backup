import { formatApiErrorMessage } from "@/lib/apiErrors";
import { fetchWithMirrorFallback } from "@/lib/mirrorEndpoints";
import { getAdminUnlockToken } from "@/lib/adminUnlock";
import { getRequiredAccessToken } from "@/lib/supabaseSession";

export class AdminRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminRequestError";
    this.status = status;
  }
}

export function classifyAdminAccessError(err: unknown): "auth" | "unlock" | "other" {
  const message = err instanceof Error ? err.message : String(err);
  if (/管理密码不正确/.test(message)) {
    return "other";
  }
  if (err instanceof AdminRequestError) {
    if (err.status === 403) return "unlock";
    if (err.status === 401) return "auth";
  }
  if (
    /403/.test(message) ||
    /需要管理员权限/.test(message) ||
    (/管理员/.test(message) && !/管理密码/.test(message))
  ) {
    return "unlock";
  }
  if (
    /401/.test(message) ||
    /登录/.test(message) ||
    /令牌/.test(message) ||
    /需要登录/.test(message) ||
    /未提供登录/.test(message) ||
    /无效或过期的登录令牌/.test(message)
  ) {
    return "auth";
  }
  return "other";
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const unlockToken = getAdminUnlockToken();
  let res: Response;
  try {
    res = await fetchWithMirrorFallback(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getRequiredAccessToken()}`,
        ...(unlockToken ? { "X-Admin-Unlock": unlockToken } : {}),
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
  } catch (err) {
    const kind = classifyAdminAccessError(err);
    if (kind === "auth") {
      throw new AdminRequestError(formatApiErrorMessage(err), 401);
    }
    throw new Error(formatApiErrorMessage(err));
  }
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = payload?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : payload?.message || payload?.error || `请求失败：${res.status}`;
    throw new AdminRequestError(message, res.status);
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
    ros_couples_completed?: number;
    mate_couples_completed?: number;
    ros_couples_waiting?: number;
    mate_couples_waiting?: number;
    chat_messages?: number;
    chat_messages_today?: number;
    chat_sessions_today?: number;
  };
  attemptsBySuite: Array<{ slug: string; name: string; attempts: number }>;
  recentRedemptions: Array<{
    id: string;
    redeemed_at?: string;
    email?: string;
    suite_slug?: string;
    code?: string;
  }>;
  recentAuditLogs?: AdminAuditLogRow[];
  inProgressAttempts?: number;
  todayCompletedAttempts?: number;
};

export type AdminAuditLogRow = {
  id: string;
  action: string;
  target_table?: string | null;
  target_id?: string | null;
  before_payload?: Record<string, unknown> | null;
  after_payload?: Record<string, unknown> | null;
  created_at?: string;
  admin_user_id?: string | null;
  admin_email?: string | null;
  admin_name?: string | null;
};

export type AdminChatAnalytics = {
  summary: {
    total_sessions?: number;
    sessions_today?: number;
    total_messages?: number;
    messages_today?: number;
    unique_chat_users?: number;
  };
  byAnalyst: Array<{
    slug: string;
    name: string;
    session_count: number;
    message_count: number;
  }>;
  recentSessions: Array<{
    id: string;
    title?: string | null;
    created_at?: string;
    updated_at?: string;
    user_email?: string | null;
    analyst_slug?: string;
    analyst_name?: string;
    message_count?: number;
  }>;
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
  user_code?: string;
  registration_no?: number;
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

export type AdminQuestionRow = {
  id: string;
  external_question_id: string;
  display_order: number;
  dimension_code: string;
  question_type: string;
  weight?: number;
  direction?: string;
  question_text: string;
  question_payload?: Record<string, unknown>;
  is_active?: boolean;
  updated_at?: string;
  suite_slug?: string;
  suite_name?: string;
  answerRefCount?: number;
  canDelete?: boolean;
};

export type AdminQuestionStats = {
  slug: string;
  name: string;
  total_questions?: number;
  active_count: number;
  inactive_count: number;
  deletable_inactive_count: number;
};

export const adminApi = {
  me: () => adminRequest<{ ok: boolean; accessMode?: string; user: AdminUser }>("/admin/me"),
  unlock: (password: string) =>
    adminRequest<{
      ok: boolean;
      accessMode: string;
      unlockToken?: string | null;
      expiresAt?: string | null;
      ttlHours?: number;
      message?: string;
    }>("/admin/unlock", { method: "POST", body: JSON.stringify({ password }) }),
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
    customCode?: string;
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
  universalRedemption: () =>
    adminRequest<{
      configuredCode: string | null;
      isConfigured: boolean;
      description: string;
      allProvisioned: boolean;
      suites: Array<{
        suiteSlug: string;
        shadowCode: string;
        provisioned: boolean;
        isActive?: boolean;
        status?: string | null;
        usedCount?: number;
      }>;
    }>("/admin/redemption/universal"),
  ensureUniversalShadows: () =>
    adminRequest<{
      ok: boolean;
      universalCode: string;
      allOk: boolean;
      results: Array<{ suiteSlug: string; ok: boolean; codeId?: string; error?: string }>;
    }>("/admin/redemption/universal/ensure-all", { method: "POST" }),
  inviteUser: (data: { email: string; password?: string; displayName?: string; role?: string }) =>
    adminRequest<{
      ok: boolean;
      created: boolean;
      promoted: boolean;
      user: AdminUserRow;
      temporaryPassword?: string | null;
    }>("/admin/users/invite", { method: "POST", body: JSON.stringify(data) }),
  patchUser: (userId: string, data: { role?: string; status?: string; displayName?: string }) =>
    adminRequest<{ ok: boolean; user: AdminUserRow }>(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteUser: (userId: string, hard = false) =>
    adminRequest<{ ok: boolean; hard: boolean; user?: AdminUserRow; deletedUserId?: string }>(
      `/admin/users/${userId}${hard ? "?hard=true" : ""}`,
      { method: "DELETE" },
    ),
  listQuestions: (params: {
    suiteSlug: string;
    q?: string;
    activeOnly?: boolean;
    inactiveOnly?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const search = new URLSearchParams({ suiteSlug: params.suiteSlug });
    if (params.q) search.set("q", params.q);
    if (params.activeOnly) search.set("activeOnly", "true");
    if (params.inactiveOnly) search.set("inactiveOnly", "true");
    if (params.limit != null) search.set("limit", String(params.limit));
    if (params.offset != null) search.set("offset", String(params.offset));
    return adminRequest<{ total: number; questions: AdminQuestionRow[] }>(`/admin/questions?${search}`);
  },
  questionStats: (suiteSlug: string) =>
    adminRequest<{ stats: AdminQuestionStats }>(`/admin/questions/stats?suiteSlug=${encodeURIComponent(suiteSlug)}`),
  deleteQuestion: (questionId: string) =>
    adminRequest<{ ok: boolean; deletedQuestionId: string }>(`/admin/questions/${questionId}`, { method: "DELETE" }),
  purgeInactiveQuestions: (suiteSlug: string) =>
    adminRequest<{
      ok: boolean;
      suiteSlug: string;
      deletedCount: number;
      blockedWithAnswers: number;
    }>(`/admin/questions/purge-inactive?suiteSlug=${encodeURIComponent(suiteSlug)}`, { method: "POST" }),
  questionDetail: (questionId: string) =>
    adminRequest<{ question: AdminQuestionRow & { scoring_payload?: Record<string, unknown> } }>(
      `/admin/questions/${questionId}`,
    ),
  patchQuestion: (
    questionId: string,
    data: {
      questionText?: string;
      questionPayload?: Record<string, unknown>;
      isActive?: boolean;
      displayOrder?: number;
      weight?: number;
      direction?: string;
    },
  ) =>
    adminRequest<{ ok: boolean; question: AdminQuestionRow }>(`/admin/questions/${questionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  listAuditLogs: (params?: { action?: string; q?: string; limit?: number; offset?: number }) => {
    const search = new URLSearchParams();
    if (params?.action) search.set("action", params.action);
    if (params?.q) search.set("q", params.q);
    if (params?.limit != null) search.set("limit", String(params.limit));
    if (params?.offset != null) search.set("offset", String(params.offset));
    const qs = search.toString();
    return adminRequest<{
      total: number;
      logs: AdminAuditLogRow[];
      actionTypes: Array<{ action: string; count: number }>;
    }>(`/admin/audit/logs${qs ? `?${qs}` : ""}`);
  },
  chatAnalytics: (limit = 30) =>
    adminRequest<AdminChatAnalytics>(`/admin/chat/analytics?limit=${limit}`),
};
