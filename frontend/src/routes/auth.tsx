import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, Sparkles, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "登录 · MIRROR" },
      { name: "description", content: "登录 MIRROR，开启你的 AI 关系画像。" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("账号已建立，正在进入…");
        nav({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        toast.success("欢迎回到 MIRROR");
        nav({ to: "/" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) {
        toast.error("登录失败");
        return;
      }
      if (result.redirected) return;
      nav({ to: "/" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-10">
      {/* Top bar */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-glass-strong rounded-3xl p-8 md:p-9"
        >
          {/* Brand mark */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] grid place-items-center text-[oklch(0.12_0.018_270)] font-bold text-sm">
              M
            </div>
            <span className="font-display tracking-wide text-foreground/95">
              MIRROR<span className="text-muted-foreground/60 ml-1">/v1</span>
            </span>
            <span className="chip chip-cyan ml-auto font-mono">SECURE · TLS</span>
          </div>

          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">
            {mode === "login" ? "ACCESS · RETURNING" : "ACCESS · NEW IDENTITY"}
          </div>
          <h1 className="font-display text-3xl md:text-[34px] mt-2 leading-tight">
            <span className="text-gradient-violet">
              {mode === "login" ? "回到你的画像" : "建立你的画像"}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            登录后即可解锁 AI 关系分析师、画像档案与对话历史。
          </p>

          {/* Mode toggle */}
          <div className="mt-6 grid grid-cols-2 p-1 rounded-full bg-secondary/40 border border-border/50">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`h-9 rounded-full text-xs font-mono tracking-[0.18em] transition-all ${
                  mode === m
                    ? "bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-[oklch(0.10_0.018_270)] shadow-[0_4px_18px_-6px_oklch(0.50_0.20_285_/_0.7)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "登 录" : "注 册"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground" htmlFor="email">
                EMAIL
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-11 bg-secondary/30 border-border/60 focus-visible:ring-[oklch(0.68_0.18_285)]"
                  placeholder="you@domain.com"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground" htmlFor="pw">
                PASSWORD
              </label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pw"
                  type="password"
                  required
                  minLength={6}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="pl-9 h-11 bg-secondary/30 border-border/60 focus-visible:ring-[oklch(0.68_0.18_285)]"
                  placeholder="至少 6 位"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-95 font-medium"
            >
              {loading ? (
                "处理中…"
              ) : (
                <>
                  {mode === "login" ? "进入 MIRROR" : "建立账号"} <Sparkles className="ml-1.5 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 divider-line" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">OR</span>
            <div className="flex-1 divider-line" />
          </div>

          <Button
            onClick={google}
            disabled={loading}
            variant="outline"
            className="w-full h-11 rounded-full bg-glass border-border/60 hover:bg-secondary/40"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.2-5.5 4.2-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.6 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.1-1.5H12z"
              />
            </svg>
            使用 Google 继续
          </Button>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            你的数据仅用于生成专属画像，端到端加密
          </p>
        </motion.div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          继续即表示你同意 <span className="text-foreground/80 underline-offset-4 hover:underline cursor-pointer">服务条款</span>
          与 <span className="text-foreground/80 underline-offset-4 hover:underline cursor-pointer">隐私协议</span>
        </p>
      </div>
    </main>
  );
}
