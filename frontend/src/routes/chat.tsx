import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { lovecompassApi, type ChatContext, type ChatProfileSnapshot } from "@/lib/lovecompassApi";
import { resultRouteFromSuiteSlug } from "@/lib/resultRoutes";
import { formatApiErrorMessage, getApiErrorHint } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import {
  buildCounselorConnectionFallback,
  counselorActiveRing,
  counselorAvatarGradient,
  COUNSELORS,
  getCounselor,
  type Counselor,
} from "@/lib/counselors";
import { deriveChatFlags, isAiPlaceholderReply, loadChatState, type ChatUiMessage } from "@/lib/chatState";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, RefreshCw, Send, Sparkles } from "lucide-react";

const searchSchema = z.object({
  attemptId: z.string().optional(),
  analystId: z.string().optional(),
  prefill: z.string().optional(),
});

export const Route = createFileRoute("/chat")({
  validateSearch: (search) => searchSchema.parse(search),
  ssr: false,
  head: () => ({
    meta: [
      { title: "AI 关系顾问 · MIRROR" },
      { name: "description", content: "与 MIRROR 四位 AI 关系顾问对话，基于你的测试画像深度分析。" },
    ],
  }),
  component: ChatPage,
});

type Msg = ChatUiMessage;

function applyChatLoad(
  data: Awaited<ReturnType<typeof loadChatState>>,
  setters: {
    setBoundAttemptId: (v: string | undefined) => void;
    setChatContext: (v: ChatContext | null) => void;
    setProfileSnapshot: (v: ChatProfileSnapshot | null) => void;
    setMessages: (v: Msg[]) => void;
  },
) {
  setters.setBoundAttemptId(data.boundAttemptId);
  setters.setChatContext(data.chatContext);
  setters.setProfileSnapshot(data.profileSnapshot);
  setters.setMessages(data.messages);
}

function ChatPage() {
  const nav = useNavigate();
  const { pending: authPending } = useRequireAuth();
  const { attemptId: attemptIdFromUrl, analystId: analystIdFromUrl, prefill: prefillFromUrl } = Route.useSearch();
  const [active, setActive] = useState<Counselor>(() => getCounselor(analystIdFromUrl));
  const [boundAttemptId, setBoundAttemptId] = useState<string | undefined>(attemptIdFromUrl);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [profileSnapshot, setProfileSnapshot] = useState<ChatProfileSnapshot | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [profileSyncedAt, setProfileSyncedAt] = useState<number | null>(null);
  const [contextError, setContextError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [triageHint, setTriageHint] = useState<string | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [contextReloadKey, setContextReloadKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefillFromUrl?.trim()) {
      setInput(prefillFromUrl.trim());
    }
  }, [prefillFromUrl]);

  useEffect(() => {
    setActive(getCounselor(analystIdFromUrl));
  }, [analystIdFromUrl]);

  useEffect(() => {
    let ignore = false;
    setContextLoading(true);
    setContextError(null);
    setMessages([]);

    void loadChatState({ attemptId: attemptIdFromUrl, analystId: analystIdFromUrl })
      .then((data) => {
        if (ignore) return;
        applyChatLoad(data, {
          setBoundAttemptId,
          setChatContext,
          setProfileSnapshot,
          setMessages,
        });
        if (data.boundAttemptId && data.boundAttemptId !== attemptIdFromUrl) {
          nav({
            to: "/chat",
            search: { analystId: getCounselor(analystIdFromUrl).id, attemptId: data.boundAttemptId },
            replace: true,
          });
        }
      })
      .catch((error) => {
        if (ignore) return;
        const message = formatApiErrorMessage(error);
        setContextError(message);
        setChatContext(null);
        setProfileSnapshot(null);
        setMessages([
          {
            role: "ai",
            text: buildCounselorConnectionFallback(getCounselor(analystIdFromUrl), message),
            ts: Date.now(),
          },
        ]);
      })
      .finally(() => {
        if (!ignore) setContextLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [attemptIdFromUrl, analystIdFromUrl, nav, contextReloadKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const { profileBound, completedSuiteCount } = deriveChatFlags(profileSnapshot, chatContext);
  const showAiConfigHint = messages.some((m) => m.role === "ai" && isAiPlaceholderReply(m.text));
  const showQuickStarts = !messages.some((m) => m.role === "user") && active.prompts.length > 0;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed, ts: Date.now() }]);
    setThinking(true);
    try {
      const res = await lovecompassApi.sendChatMessage({
        attemptId: boundAttemptId,
        analystId: active.id,
        message: trimmed,
      });
      if (res.context) {
        setChatContext(res.context);
        if (res.context.attemptId) setBoundAttemptId(res.context.attemptId);
      }
      setMessages((m) => [...m, { role: "ai", text: res.message, ts: Date.now() }]);
    } catch (error) {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: formatApiErrorMessage(error),
          ts: Date.now(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const switchCounselor = (c: Counselor) => {
    setActive(c);
    setTriageHint(null);
    nav({
      to: "/chat",
      search: { analystId: c.id, attemptId: boundAttemptId },
      replace: true,
    });
  };

  const syncProfileToAi = async () => {
    if (syncingProfile || thinking) return;
    setSyncingProfile(true);
    try {
      const res = await lovecompassApi.syncChatProfile();
      setProfileSnapshot(res.profile ?? null);
      if (res.context) {
        setChatContext(res.context);
        if (res.context.attemptId) setBoundAttemptId(res.context.attemptId);
      }
      setProfileSyncedAt(Date.now());
      setMessages((m) => [
        ...m,
        { role: "user", text: "【同步我的全部测评画像】", ts: Date.now() },
        { role: "ai", text: res.acknowledgment, ts: Date.now() + 1 },
      ]);
    } catch (error) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: formatApiErrorMessage(error), ts: Date.now() },
      ]);
    } finally {
      setSyncingProfile(false);
    }
  };

  const runTriage = async () => {
    const text = input.trim() || "我不知道该找哪位顾问，你能帮我选吗？";
    setTriageLoading(true);
    setTriageHint(null);
    try {
      const res = await lovecompassApi.triageChat(text);
      const picked = getCounselor(res.counselorId);
      switchCounselor(picked);
      setTriageHint(`推荐 ${res.counselorName}：${res.reason}`);
    } catch (error) {
      setTriageHint(formatApiErrorMessage(error));
    } finally {
      setTriageLoading(false);
    }
  };

  if (authPending) return <AuthChecking />;

  const avatarGrad = counselorAvatarGradient(active.accent);

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-3.5 w-3.5" /> 返回
          </Link>
          <span className="chip chip-violet font-mono">AI · COUNSEL · LIVE</span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">4 PERSONAS</span>
        </div>

        <div className="flex flex-col-reverse md:grid md:grid-cols-[280px_1fr] gap-5">
          <aside className="space-y-3">
            <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground px-1">// SELECT COUNSELOR</div>
            {COUNSELORS.map((c) => {
              const isActive = c.id === active.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => switchCounselor(c)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                    isActive
                      ? counselorActiveRing(c.accent)
                      : "border-border/70 bg-glass hover:border-[oklch(0.68_0.18_285_/_0.5)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.30_0.04_270)] to-[oklch(0.20_0.03_270)] grid place-items-center text-xl shrink-0">
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-display text-sm text-foreground/95">{c.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{c.englishName}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{c.title}</p>
                      <p className="text-[11px] text-foreground/60 mt-1.5 leading-relaxed line-clamp-2">{c.tagline}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => void runTriage()}
              disabled={triageLoading || thinking}
              className="w-full text-left px-4 py-3 rounded-2xl border border-dashed border-border/70 bg-secondary/20 hover:border-[oklch(0.68_0.18_285_/_0.5)] transition text-[12px] text-foreground/80"
            >
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">// TRIAGE</span>
              <p className="mt-1">{triageLoading ? "正在匹配顾问…" : "不确定找谁？根据输入框内容推荐"}</p>
            </button>
            {triageHint ? (
              <p className="text-[11px] text-foreground/70 leading-relaxed px-1">{triageHint}</p>
            ) : null}

            <div className="bg-glass rounded-2xl p-4 mt-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">// CONTEXT</div>
                {profileSnapshot ? (
                  <span className="text-[10px] font-mono text-foreground/70 tabular-nums">
                    {profileSnapshot.completeness.percent}%
                  </span>
                ) : null}
              </div>

              {contextError ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">{contextError}</p>
                  {getApiErrorHint(contextError) ? (
                    <p className="text-[10px] text-foreground/55 leading-relaxed">{getApiErrorHint(contextError)}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setContextReloadKey((k) => k + 1)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono text-foreground/75 hover:text-foreground transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    重试连接
                  </button>
                </div>
              ) : null}

              {contextLoading ? (
                <p className="text-[12px] text-muted-foreground">正在读取你的测试画像…</p>
              ) : profileBound && profileSnapshot ? (
                <>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {profileSnapshot.completeness.label}
                    {completedSuiteCount > 0 ? ` · 已完成 ${completedSuiteCount} 套` : ""}
                  </p>
                  <div className="space-y-2">
                    {profileSnapshot.suites.map((suite) => (
                      <div
                        key={suite.productSet}
                        className={`rounded-xl border px-3 py-2 text-[11px] leading-relaxed ${
                          suite.status === "completed"
                            ? "border-[oklch(0.68_0.18_285_/_0.35)] bg-[oklch(0.50_0.20_285_/_0.06)]"
                            : "border-border/50 bg-secondary/10 text-muted-foreground"
                        }`}
                      >
                        <div className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground">
                          {suite.code ?? suite.productSet}
                        </div>
                        {suite.status === "completed" ? (
                          <>
                            <div className="text-foreground/90 mt-0.5">{suite.headline}</div>
                            {suite.metaLine ? (
                              <div className="text-muted-foreground mt-0.5">{suite.metaLine}</div>
                            ) : null}
                            <div className="text-[10px] font-mono text-muted-foreground mt-1">
                              {suite.dimensionCount} 维已就绪
                              {suite.hasAiReport ? " · 含 AI 报告" : ""}
                            </div>
                          </>
                        ) : (
                          <div className="mt-0.5">尚未完成</div>
                        )}
                      </div>
                    ))}
                  </div>
                  {chatContext ? (
                    <p className="text-[10px] text-muted-foreground font-mono">
                      当前主绑定 · {chatContext.suiteName ?? chatContext.productSet ?? "最新测评"}
                    </p>
                  ) : null}
                </>
              ) : (
                <div className="space-y-2 text-[12px] text-foreground/70 leading-relaxed">
                  <p>尚未绑定测试画像。完成 SELF / ROS / MATE 任一套后，可一键同步给 AI 顾问。</p>
                  <button
                    type="button"
                    onClick={() => nav({ to: "/tests/$id", params: { id: "self" } })}
                    className="text-[11px] text-[oklch(0.82_0.14_200)] hover:underline"
                  >
                    去做 SELF 测试 →
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => void syncProfileToAi()}
                disabled={syncingProfile || thinking || contextLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[oklch(0.68_0.18_285_/_0.45)] bg-[oklch(0.50_0.20_285_/_0.12)] px-3 py-2.5 text-[12px] font-medium text-foreground/90 hover:bg-[oklch(0.50_0.20_285_/_0.18)] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncingProfile ? "animate-spin" : ""}`} />
                {syncingProfile ? "正在同步…" : profileBound ? "同步全部测评到 AI" : "刷新画像状态"}
              </button>
              {profileSyncedAt ? (
                <p className="text-[10px] font-mono text-muted-foreground text-center">
                  上次同步 · {new Date(profileSyncedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              ) : profileBound ? (
                <p className="text-[10px] text-muted-foreground/80 leading-relaxed text-center">
                  完成新测试后点一次，确保顾问读到最新分数
                </p>
              ) : null}

              {boundAttemptId && chatContext ? (
                <button
                  type="button"
                  onClick={() => nav(resultRouteFromSuiteSlug(chatContext?.suiteSlug, boundAttemptId))}
                  className="block w-full text-center text-[11px] text-[oklch(0.82_0.14_200)] hover:underline"
                >
                  查看完整结果页 →
                </button>
              ) : null}
            </div>
          </aside>

          <section className="bg-glass-strong rounded-3xl flex flex-col h-[calc(100dvh-180px)] md:h-[calc(100vh-140px)] min-h-[400px] md:min-h-[560px] overflow-hidden relative">
            <div className="absolute inset-0 ring-grid opacity-20 pointer-events-none" />
            <div className="relative px-5 md:px-7 py-4 border-b border-border/40 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGrad} grid place-items-center text-lg`}>
                {active.emoji}
              </div>
              <div className="flex-1">
                <div className="font-display text-lg text-gradient-violet leading-tight">
                  {active.name}
                  <span className="text-sm text-muted-foreground font-mono ml-2">{active.englishName}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{active.title} · ONLINE</div>
              </div>
              <span className="hidden md:inline-flex chip chip-cyan font-mono">
                {profileBound
                  ? completedSuiteCount >= 3
                    ? "PROFILE · FULL"
                    : `PROFILE · ${completedSuiteCount}/3`
                  : "PROFILE · NONE"}
              </span>
            </div>

            <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 md:px-7 py-6 space-y-4">
              {showAiConfigHint ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100/90 leading-relaxed">
                  当前后端未配置正式 AI 模型（智谱 Key），回复为占位内容。画像同步与对话流程正常，配置密钥后将返回真实分析。
                </div>
              ) : null}
              {contextLoading && messages.length === 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <RefreshCw className="h-4 w-4 animate-spin opacity-70" />
                  <span>正在连接顾问并读取测评画像…</span>
                </div>
              ) : null}
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div
                    key={m.ts + "_" + i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "ai" && (
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGrad} grid place-items-center text-sm shrink-0 mr-2`}>
                        {active.emoji}
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-[oklch(0.50_0.20_285_/_0.55)] to-[oklch(0.42_0.18_285_/_0.55)] text-foreground border border-[oklch(0.68_0.18_285_/_0.35)]"
                          : "bg-[oklch(0.20_0.022_270_/_0.7)] text-foreground/95 border border-border/50"
                      }`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.68_0.18_285)] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.68_0.18_285)] animate-pulse [animation-delay:120ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.68_0.18_285)] animate-pulse [animation-delay:240ms]" />
                  <span className="ml-2 tracking-[0.2em]">{active.name} 正在思考…</span>
                </motion.div>
              )}

              {showQuickStarts && (
                <div className="pt-2">
                  <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground mb-2">// QUICK STARTS</div>
                  <div className="flex flex-wrap gap-2">
                    {active.prompts.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => send(p)}
                        className="text-[12px] px-3 py-1.5 rounded-full border border-border/60 bg-secondary/30 text-foreground/80 hover:border-[oklch(0.68_0.18_285_/_0.6)] hover:bg-[oklch(0.50_0.20_285_/_0.12)] transition"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative border-t border-border/40 p-3 md:p-4">
              <div className="flex items-end gap-2 bg-secondary/30 rounded-2xl border border-border/60 focus-within:border-[oklch(0.68_0.18_285_/_0.6)] transition-colors p-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={`告诉 ${active.name} 你此刻在想的事…(Enter 发送 / Shift+Enter 换行)`}
                  className="flex-1 min-h-[40px] max-h-[160px] resize-none border-0 bg-transparent focus-visible:ring-0 text-sm placeholder:text-muted-foreground/60"
                />
                <Button
                  onClick={() => send(input)}
                  disabled={!input.trim() || thinking}
                  className={`h-10 w-10 p-0 shrink-0 rounded-xl bg-gradient-to-br ${avatarGrad} text-primary-foreground disabled:opacity-40`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground/60 font-mono tracking-wide text-center">
                <Sparkles className="inline h-3 w-3 mr-1" />
                AI 回应可能不完全准确，重要决定请结合你自己的判断。
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
