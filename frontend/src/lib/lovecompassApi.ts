import type { AnswerDraft, TestQuestionsResponse } from "@/lib/questionTypes";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { fetchWithMirrorFallback, getEndpointProfile } from "@/lib/mirrorEndpoints";
import { getRequiredAccessToken } from "@/lib/supabaseSession";

export type { AnswerDraft } from "@/lib/questionTypes";

export type ChatContext = {
  attemptId: string;
  productSet?: "SELF" | "ROS" | "MATE" | string;
  suiteSlug?: string | null;
  suiteName?: string | null;
  archetype: string;
  attachmentType?: string | null;
  tagline?: string | null;
  description?: string | null;
  matchingLogic?: string | null;
  rosIndex?: number | null;
  completedAt?: string | null;
  dimensions?: Array<{ code?: string; name?: string; score?: number; displaySummary?: string }>;
  hasAiReport?: boolean;
};

export type ChatProfileSuite = {
  productSet: string;
  productId?: string;
  code?: string;
  title?: string;
  status: "completed" | "locked";
  attemptId?: string | null;
  headline?: string | null;
  metaLine?: string | null;
  dimensionCount: number;
  hasAiReport?: boolean;
  completedAt?: string | null;
};

export type ChatProfileSnapshot = {
  completeness: UserPortrait["completeness"];
  suites: ChatProfileSuite[];
  updatedAt?: string | null;
};

export type ChatContextResponse = {
  ok: boolean;
  bound: boolean;
  context: ChatContext | null;
  profile?: ChatProfileSnapshot | null;
  conversationId?: string | null;
  messages?: Array<{ role: "user" | "ai"; content: string }>;
};

export type ChatSyncProfileResponse = ChatContextResponse & {
  acknowledgment: string;
};

export type ChatInjectionMeta = {
  hasPortraitLayer?: boolean;
  hasProfileBlock?: boolean;
  hasCompletedTests?: boolean;
  profileReady?: boolean;
  boundProductSet?: string | null;
};

export type ChatMessageResponse = {
  message: string;
  conversationId?: string | null;
  bound?: boolean;
  context?: ChatContext | null;
  crisis?: boolean;
  injection?: ChatInjectionMeta;
};

export type TriageResponse = {
  ok: boolean;
  counselorId: string;
  counselorName: string;
  confidence: "low" | "medium" | "high";
  reason: string;
  matchedSignals: string[];
  alternatives: Array<{ counselorId: string; label: string; score?: number }>;
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

export type PortraitAttemptSummary = {
  attemptId: string;
  productSet: "SELF" | "ROS" | "MATE" | string;
  suiteSlug?: string | null;
  suiteName?: string | null;
  suiteGender?: string | null;
  status?: string | null;
  archetypeCode?: string | null;
  attachmentType?: string | null;
  tagline?: string | null;
  description?: string | null;
  index?: number | null;
  rkScore?: number | null;
  dimensionScores?: Record<string, number>;
  coreTraits?: Array<{
    icon: "shield" | "key" | "eye" | string;
    title: string;
    body: string;
    highlight?: boolean;
  }>;
  dimensions?: Array<{ code?: string; name?: string; score?: number }>;
  completedAt?: string;
  hasAiReport?: boolean;
  relationshipType?: string | null;
  relationshipStage?: string | null;
  resonanceTier?: string | null;
  matePosition?: string | null;
  quadrant?: string | null;
};

export type PortraitProduct = {
  id: "self" | "ros" | "mate";
  productSet: "SELF" | "ROS" | "MATE";
  code: string;
  title: string;
  subtitle: string;
  status: "completed" | "locked";
  attemptCount: number;
  latest?: PortraitAttemptSummary | null;
  history: PortraitAttemptSummary[];
};

export type UserPortrait = {
  user: {
    id: string;
    email?: string | null;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
  completeness: {
    percent: number;
    label: string;
    breakdown: Array<{
      productSet: string;
      productId: string;
      code: string;
      title: string;
      weight: number;
      status: string;
      attemptId?: string | null;
      completedAt?: string | null;
    }>;
  };
  primary: {
    attemptId?: string | null;
    productSet?: string | null;
    archetypeCode?: string | null;
    attachmentType?: string | null;
    tagline?: string | null;
    description?: string | null;
    index?: number | null;
    suiteName?: string | null;
    completedAt?: string | null;
  };
  selfProfile: {
    attemptId?: string | null;
    archetypeCode?: string | null;
    attachmentType?: string | null;
    tagline?: string | null;
    index?: number | null;
    dimensionScores?: Record<string, number>;
    dimensions?: Array<{ code?: string; name?: string; score?: number }>;
    coreTraits?: PortraitAttemptSummary["coreTraits"];
  };
  products: PortraitProduct[];
  timeline: PortraitAttemptSummary[];
  stats: {
    totalAttempts: number;
    chatSessions: number;
    lastChatAt?: string | null;
    boundAttemptId?: string | null;
  };
  updatedAt?: string | null;
};

const API_BASE =
  (import.meta.env.VITE_LOVECOMPASS_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export function getApiEndpointProfile() {
  return getEndpointProfile();
}

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
  if (!API_BASE && !import.meta.env.VITE_LOVECOMPASS_API_MIRROR_URL) {
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
    res = await fetchWithMirrorFallback(path, {
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
  verifyRedemption: (data: {
    code: string;
    product: string;
    suiteSlug?: string;
    gender?: "female" | "male";
  }) =>
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
    partnerRelationCode?: string | null;
    answers: AnswerDraft[];
  }) =>
    requestJson<{
      attemptId: string;
      status: "completed" | "in_progress";
      next?: string;
      relationCode?: string;
      productSet?: string;
    }>(
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
  submitSceneFeedback: (
    attemptId: string,
    data: { scene: string; resonated: boolean; note?: string },
  ) =>
    requestJson<{ ok: boolean; count: number }>(
      `/attempts/${encodeURIComponent(attemptId)}/scene-feedback`,
      { method: "POST", body: JSON.stringify(data) },
      true,
    ),
  getAttemptHistory: (limit = 20) =>
    requestJson<{ attempts: AttemptHistoryItem[] }>(
      `/attempts?limit=${encodeURIComponent(String(limit))}`,
      undefined,
      true,
    ),
  getProfilePortrait: (refresh = false) =>
    requestJson<{ portrait: UserPortrait }>(
      `/profile/portrait${refresh ? "?refresh=1" : ""}`,
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
  getChatContext: (options?: { attemptId?: string; analystId?: string }) => {
    const params = new URLSearchParams();
    if (options?.attemptId) params.set("attemptId", options.attemptId);
    if (options?.analystId) params.set("analystId", options.analystId);
    const qs = params.toString();
    return requestJson<ChatContextResponse>(
      `/chat/context${qs ? `?${qs}` : ""}`,
      undefined,
      true,
    );
  },
  syncChatProfile: () =>
    requestJson<ChatSyncProfileResponse>(
      "/chat/sync-profile",
      { method: "POST" },
      true,
    ),
  triageChat: (message: string) =>
    requestJson<TriageResponse>(
      "/chat/triage",
      {
        method: "POST",
        body: JSON.stringify({ message }),
      },
      true,
    ),
  getRosSingleResult: (attemptId: string) =>
    requestJson<{
      ok: boolean;
      attemptId: string;
      single: Record<string, unknown>;
      relationCode?: string;
      partnerStatus?: string;
      coupleUnlocked?: boolean;
      invitePath?: string;
    }>(`/ros/attempts/${encodeURIComponent(attemptId)}/single`, undefined, true),
  getMateSingleResult: (attemptId: string) =>
    requestJson<{
      ok: boolean;
      attemptId: string;
      single: Record<string, unknown>;
      gender?: string;
      suiteTier?: "lite" | "full";
      relationCode?: string;
      partnerStatus?: string;
      coupleUnlocked?: boolean;
      pairSupplementComplete?: boolean;
      pairSupplementPath?: string;
      invitePath?: string;
    }>(`/mate/attempts/${encodeURIComponent(attemptId)}/single`, undefined, true),
  getMatePairSupplementQuestions: (gender: "female" | "male", attemptId?: string) =>
    requestJson<{
      ok: boolean;
      gender: string;
      questions: import("@/lib/questionTypes").ApiQuestion[];
      totalQuestions: number;
      skipQuestionIds?: string[];
      prefilledFromSingle?: Record<string, unknown>;
      singleMappedNote?: string | null;
    }>(
      `/mate/pair-supplement/questions?gender=${encodeURIComponent(gender)}${
        attemptId ? `&attemptId=${encodeURIComponent(attemptId)}` : ""
      }`,
      undefined,
      true,
    ),
  submitMatePairSupplement: (
    attemptId: string,
    answers: Array<{ questionId: string; optionKey?: string; value?: number }>,
  ) =>
    requestJson<{ ok: boolean; attemptId: string; fields: Record<string, unknown> }>(
      `/mate/attempts/${encodeURIComponent(attemptId)}/pair-supplement`,
      { method: "POST", body: JSON.stringify({ answers }) },
      true,
    ),
  previewMateRelationCode: (code: string) =>
    requestJson<{
      ok: boolean;
      code: string;
      productSet?: string;
      status: string;
      suiteTier?: "lite" | "full";
      suiteSlug?: string | null;
      preview: Record<string, unknown>;
      invitePath: string;
      coupleUnlocked: boolean;
    }>(`/mate/codes/${encodeURIComponent(code.trim().toUpperCase())}`, undefined, true),
  getMateCoupleReport: (code: string) =>
    requestJson<{ ok: boolean; code: string; couple: Record<string, unknown> }>(
      `/mate/couple/${encodeURIComponent(code.trim().toUpperCase())}`,
      undefined,
      true,
    ),
  previewRelationCode: (code: string) =>
    requestJson<{
      ok: boolean;
      code: string;
      status: string;
      suiteTier?: "lite" | "full";
      suiteSlug?: string | null;
      preview: Record<string, unknown>;
      invitePath: string;
      coupleUnlocked: boolean;
    }>(`/ros/codes/${encodeURIComponent(code.trim().toUpperCase())}`, undefined, true),
  getRosCoupleReport: (code: string) =>
    requestJson<{ ok: boolean; code: string; couple: Record<string, unknown> }>(
      `/ros/couple/${encodeURIComponent(code.trim().toUpperCase())}`,
      undefined,
      true,
    ),
  analyzeRosStory: (data: {
    timeline: Array<{ label: string; value: number; note?: string | null }>;
    milestones: Array<{ when: string; title: string; tone: "spark" | "warm" | "cool" }>;
    stageName: string;
  }) =>
    requestJson<{
      curveInsight: string;
      milestoneInsight: string;
      trend: { label: string };
    }>("/ros/story/analyze", { method: "POST", body: JSON.stringify(data) }, true),
};
