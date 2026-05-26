import { lovecompassApi, type ChatContext, type ChatProfileSnapshot } from "@/lib/lovecompassApi";
import { buildCounselorGreeting, getCounselor, type Counselor } from "@/lib/counselors";

export type ChatLoadResult = {
  boundAttemptId: string | undefined;
  chatContext: ChatContext | null;
  profileSnapshot: ChatProfileSnapshot | null;
  conversationId: string | null;
  messages: ChatUiMessage[];
  profileBound: boolean;
  completedSuiteCount: number;
};

function mapHistoryMessages(
  raw: Array<{ role: "user" | "ai"; content: string }> | undefined,
): ChatUiMessage[] {
  if (!raw?.length) return [];
  const base = Date.now() - raw.length * 1000;
  return raw.map((m, i) => ({
    role: m.role,
    text: m.content,
    ts: base + i * 1000,
  }));
}

function greetingMessage(
  counselor: Counselor,
  context: ChatContext | null,
  profile: ChatProfileSnapshot | null,
): ChatUiMessage {
  return {
    role: "ai",
    text: buildCounselorGreeting(counselor, context, profile),
    ts: Date.now(),
  };
}

export function deriveChatFlags(
  profile: ChatProfileSnapshot | null,
  context: ChatContext | null,
): { profileBound: boolean; completedSuiteCount: number } {
  const completedSuiteCount =
    profile?.suites.filter((s) => s.status === "completed").length ?? (context ? 1 : 0);
  const profileBound = Boolean(
    profile?.suites.some((s) => s.status === "completed") ||
      (profile?.completeness.percent ?? 0) > 0 ||
      context,
  );
  return { profileBound, completedSuiteCount };
}

/** 拉取聊天上下文；无效 attemptId 时自动降级为「最新画像 + 历史会话」。 */
export async function loadChatState(options: {
  attemptId?: string;
  analystId?: string;
}): Promise<ChatLoadResult> {
  const counselor = getCounselor(options.analystId);

  const fetchContext = (attemptId?: string) =>
    lovecompassApi.getChatContext({
      attemptId,
      analystId: counselor.id,
    });

  let res;
  let lastError: unknown;
  try {
    res = await fetchContext(options.attemptId);
  } catch (firstError) {
    lastError = firstError;
    if (options.attemptId) {
      try {
        res = await fetchContext(undefined);
        lastError = undefined;
      } catch (retryError) {
        lastError = retryError;
      }
    }
    if (!res) {
      throw lastError ?? new Error("无法读取测评画像，请检查网络或稍后重试");
    }
  }

  const profileSnapshot = res.profile ?? null;
  const chatContext = res.bound ? res.context : null;
  const boundAttemptId = res.context?.attemptId ?? options.attemptId;
  const { profileBound, completedSuiteCount } = deriveChatFlags(profileSnapshot, chatContext);

  const history = mapHistoryMessages(res.messages);
  const messages =
    history.length > 0
      ? history
      : [greetingMessage(counselor, chatContext, profileSnapshot)];

  return {
    boundAttemptId,
    chatContext,
    profileSnapshot,
    conversationId: res.conversationId ?? null,
    messages,
    profileBound,
    completedSuiteCount,
  };
}

export function isAiPlaceholderReply(text: string): boolean {
  return /【AI 占位回复】|【智谱未配置】|尚未配置正式模型 Key/.test(text);
}
