import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { lovecompassApi, type ChatContext } from "@/lib/lovecompassApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import {
  buildCounselorGreeting,
  counselorActiveRing,
  counselorAvatarGradient,
  COUNSELORS,
  getCounselor,
  type Counselor,
} from "@/lib/counselors";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Sparkles } from "lucide-react";

const searchSchema = z.object({
  attemptId: z.string().optional(),
  analystId: z.string().optional(),
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

type Msg = { role: "user" | "ai"; text: string; ts: number };

function ChatPage() {
  const nav = useNavigate();
  const { pending: authPending } = useRequireAuth();
  const { attemptId: attemptIdFromUrl, analystId: analystIdFromUrl } = Route.useSearch();
  const [active, setActive] = useState<Counselor>(() => getCounselor(analystIdFromUrl));
  const [boundAttemptId, setBoundAttemptId] = useState<string | undefined>(attemptIdFromUrl);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(getCounselor(analystIdFromUrl));
  }, [analystIdFromUrl]);

  useEffect(() => {
    let ignore = false;
    const counselor = getCounselor(analystIdFromUrl);
    setContextLoading(true);
    lovecompassApi
      .getChatContext(attemptIdFromUrl)
      .then((res) => {
        if (ignore) return;
        if (res.context?.attemptId) setBoundAttemptId(res.context.attemptId);
        setChatContext(res.bound ? res.context : null);
        setMessages([
          {
            role: "ai",
            text: buildCounselorGreeting(counselor, res.bound, res.context),
            ts: Date.now(),
          },
        ]);
      })
      .catch(() => {
        if (ignore) return;
        setChatContext(null);
        setMessages([
          {
            role: "ai",
            text: buildCounselorGreeting(counselor, false, null),
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
  }, [attemptIdFromUrl, analystIdFromUrl]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

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
    setMessages([{ role: "ai", text: buildCounselorGreeting(c, Boolean(chatContext), chatContext), ts: Date.now() }]);
    nav({
      to: "/chat",
      search: { analystId: c.id, attemptId: boundAttemptId },
      replace: true,
    });
  };

  if (authPending) return <AuthChecking />;

  const profileBound = Boolean(chatContext);
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

            <div className="bg-glass rounded-2xl p-4 mt-4">
              <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground mb-2">// CONTEXT</div>
              {contextLoading ? (
                <p className="text-[12px] text-muted-foreground">正在读取你的测试画像…</p>
              ) : profileBound && chatContext ? (
                <div className="space-y-2 text-[12px] text-foreground/75 leading-relaxed">
                  <p>
                    <span className="text-muted-foreground">画像 · </span>
                    <span className="text-foreground">{chatContext.archetype}</span>
                    {chatContext.attachmentType ? ` · ${chatContext.attachmentType}` : ""}
                  </p>
                  {chatContext.tagline ? <p className="italic">「{chatContext.tagline}」</p> : null}
                  {chatContext.suiteName ? (
                    <p>
                      <span className="text-muted-foreground">来源 · </span>
                      {chatContext.suiteName}
                    </p>
                  ) : null}
                  {chatContext.dimensions?.length ? (
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {chatContext.dimensions.length} 维 SELF 数据已注入
                      {chatContext.hasAiReport ? " · 含 AI 报告" : ""}
                    </p>
                  ) : null}
                  {boundAttemptId ? (
                    <button
                      type="button"
                      onClick={() => nav({ to: "/result/$attemptId", params: { attemptId: boundAttemptId } })}
                      className="text-[11px] text-[oklch(0.82_0.14_200)] hover:underline"
                    >
                      查看完整结果页 →
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2 text-[12px] text-foreground/70 leading-relaxed">
                  <p>尚未绑定测试画像。请先完成 SELF 测试，顾问才能基于你的六维分数与红楼人格原型作答。</p>
                  <button
                    type="button"
                    onClick={() => nav({ to: "/tests/self" })}
                    className="text-[11px] text-[oklch(0.82_0.14_200)] hover:underline"
                  >
                    去做 SELF 测试 →
                  </button>
                </div>
              )}
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
                {profileBound ? "PROFILE · BOUND" : "PROFILE · NONE"}
              </span>
            </div>

            <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 md:px-7 py-6 space-y-4">
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

              {messages.length === 1 && active.prompts.length > 0 && (
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
