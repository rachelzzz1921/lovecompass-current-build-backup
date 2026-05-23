import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Lock, KeyRound, Sparkles, ShieldCheck, Mail } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { isValidAccessCode } from "@/data/accessCodes";

const SearchSchema = z.object({
  product: z.enum(["self", "ros", "mate"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/access")({
  validateSearch: (s) => SearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "兑换码验证 · MIRROR" },
      { name: "description", content: "输入兑换码解锁你的 MIRROR 测试与 AI 分析师。" },
    ],
  }),
  component: AccessPage,
});

const LEN = 8;

function AccessPage() {
  const search = useSearch({ from: "/access" });
  const nav = useNavigate();
  const product = PRODUCTS.find((p) => p.id === search.product) ?? PRODUCTS[0];
  const [chars, setChars] = useState<string[]>(Array(LEN).fill(""));
  const [verifying, setVerifying] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setAt = (i: number, v: string) => {
    const next = [...chars];
    next[i] = v.slice(-1).toUpperCase();
    setChars(next);
    if (v && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").trim().toUpperCase().slice(0, LEN);
    if (!text) return;
    e.preventDefault();
    const next = Array(LEN).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setChars(next);
    refs.current[Math.min(text.length, LEN - 1)]?.focus();
  };

  const verify = async () => {
    const code = chars.join("").trim();
    if (code.length < 4) {
      toast.error("请输入完整的兑换码");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 700)); // 演示用：模拟校验
    if (isValidAccessCode(code)) {
      sessionStorage.setItem(`access:${product.id}`, "1");
      toast.success("解锁成功，正在进入测试…");
      const target = search.redirect ?? `/tests/${product.id}`;
      // navigate to test entry/run
      window.location.href = target;
    } else {
      setVerifying(false);
      toast.error("兑换码无效或已被使用");
      setChars(Array(LEN).fill(""));
      refs.current[0]?.focus();
    }
  };

  const filled = chars.filter(Boolean).length;
  const pct = Math.round((filled / LEN) * 100);

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-10">
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> 返回首页
      </Link>

      <div className="relative z-10 w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-glass-strong rounded-3xl p-8 md:p-10"
        >
          <div className="flex items-center justify-between mb-6">
            <span className="chip chip-violet font-mono">
              <Lock className="h-3 w-3" /> ACCESS GATE
            </span>
            <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
              {product.code}
            </span>
          </div>

          <div className="text-[10px] font-mono tracking-[0.4em] text-muted-foreground">
            UNLOCK · {product.title.toUpperCase()}
          </div>
          <h1 className="font-display text-3xl md:text-[36px] mt-2 leading-tight">
            <span className="text-gradient-violet">输入你的兑换码</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            兑换码用于解锁 <span className="text-foreground/90">{product.title}</span>
            。验证通过后可直接开始测试并获得 AI 分析师专属解读权限。
          </p>

          {/* OTP-style boxes */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
                REDEEM CODE
              </span>
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                {filled}/{LEN}
              </span>
            </div>
            <div className="flex gap-2 justify-between" onPaste={onPaste as never}>
              {chars.map((c, i) => (
                <input
                  key={i}
                  ref={(el) => { refs.current[i] = el; }}
                  value={c}
                  onChange={(e) => setAt(i, e.target.value)}
                  onKeyDown={(e) => onKey(i, e)}
                  onPaste={onPaste}
                  inputMode="text"
                  autoCapitalize="characters"
                  maxLength={1}
                  className={`w-full aspect-square max-w-[56px] rounded-xl text-center font-mono text-xl md:text-2xl uppercase
                    bg-secondary/30 border transition-all outline-none caret-[oklch(0.82_0.14_200)]
                    ${
                      c
                        ? "border-[oklch(0.68_0.18_285_/_0.7)] text-foreground glow-violet"
                        : "border-border/60 text-foreground/70 focus:border-[oklch(0.82_0.14_200_/_0.7)] focus:glow-cyan"
                    }`}
                />
              ))}
            </div>
            <div className="mt-4 h-[3px] rounded-full bg-secondary/40 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <Button
            onClick={verify}
            disabled={verifying || filled < 4}
            className="mt-7 w-full h-12 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-95 disabled:opacity-40"
          >
            {verifying ? (
              <span className="flex items-center gap-2 font-mono text-sm tracking-[0.2em]">
                <Sparkles className="h-4 w-4 animate-pulse-ring" /> VERIFYING…
              </span>
            ) : (
              <>
                <KeyRound className="mr-1.5 h-4 w-4" /> 验证并解锁
              </>
            )}
          </Button>

          <div className="mt-6 grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-secondary/30 rounded-xl border border-border/50 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <ShieldCheck className="h-3 w-3" />
                <span className="font-mono tracking-[0.2em]">SECURE</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                兑换码一码一用，验证记录加密保存。
              </p>
            </div>
            <div className="bg-secondary/30 rounded-xl border border-border/50 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Mail className="h-3 w-3" />
                <span className="font-mono tracking-[0.2em]">NO CODE?</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                联系顾问获取，或加入候补名单等待开放。
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            测试用兑换码示例：<span className="font-mono text-foreground/80">LOVE2026</span>
            <span className="mx-1.5">·</span>
            <span className="font-mono text-foreground/80">MATCH88</span>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
