import { getRequiredAccessToken } from "@/lib/supabaseSession";
import { fetchWithMirrorFallback } from "@/lib/mirrorEndpoints";
import type { ChatContext, ChatInjectionMeta, ChatMessageResponse } from "@/lib/lovecompassApi";

const API_BASE =
  (import.meta.env.VITE_LOVECOMPASS_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export type ChatStreamHandlers = {
  onMeta?: (
    partial: Pick<ChatMessageResponse, "conversationId" | "context" | "bound" | "crisis" | "injection">,
  ) => void;
  onDelta: (chunk: string) => void;
  onDone: (response: ChatMessageResponse) => void;
};

function parseSseLine(line: string): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return null;
  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function streamChatMessage(
  data: { attemptId?: string; analystId?: string; message: string },
  handlers: ChatStreamHandlers,
): Promise<void> {
  if (!API_BASE && !import.meta.env.VITE_LOVECOMPASS_API_MIRROR_URL) {
    throw new Error("未配置 VITE_LOVECOMPASS_API_BASE_URL");
  }

  const token = await getRequiredAccessToken();
  const res = await fetchWithMirrorFallback("/chat/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...data, stream: true }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = `请求失败：${res.status}`;
    try {
      const parsed = JSON.parse(body) as { detail?: string; message?: string };
      message = parsed.detail || parsed.message || message;
    } catch {
      if (body) message = body.slice(0, 300);
    }
    throw new Error(message);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("浏览器不支持流式响应");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let meta: Pick<
    ChatMessageResponse,
    "conversationId" | "context" | "bound" | "crisis" | "injection"
  > = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const event = parseSseLine(line);
      if (!event) continue;
      if (event.error) {
        throw new Error(String(event.error));
      }
      if (event.meta && typeof event.meta === "object") {
        meta = event.meta as typeof meta;
        handlers.onMeta?.(meta);
      }
      if (typeof event.delta === "string" && event.delta) {
        fullText += event.delta;
        handlers.onDelta(event.delta);
      }
      if (event.done === true) {
        if (typeof event.message === "string") {
          fullText = event.message;
        }
      }
    }
  }

  handlers.onDone({
    message: fullText,
    conversationId: meta.conversationId ?? null,
    context: (meta.context as ChatContext | null) ?? null,
    bound: meta.bound,
    crisis: meta.crisis,
    injection: meta.injection as ChatInjectionMeta | undefined,
  });
}
