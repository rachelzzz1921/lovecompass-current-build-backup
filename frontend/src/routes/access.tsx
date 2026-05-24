import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { HintButton } from "@/components/HintButton";
import { toast } from "sonner";
import { ArrowLeft, Lock, KeyRound, Sparkles, ShieldCheck, Mail } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { markProductAccess } from "@/lib/accessGate";
import { lovecompassApi } from "@/lib/lovecompassApi";
import {
  getStoredMateGender,
  getStoredRosGender,
  getStoredSelfGender,
  MATE_SUITE_SLUGS,
  resolveProductId,
  resolveSuiteSlug,
  setStoredMateGender,
  setStoredSelfGender,
  SELF_SUITE_SLUGS,
  type MateGender,
  type SelfGender,
} from "@/lib/suiteSlugs";
import { getApiErrorHint } from "@/lib/apiErrors";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

const SearchSchema = z.object({
  product: z.enum(["self", "ros", "mate"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/access")({
  validateSearch: (s) => SearchSchema.parse(s),
  ssr: false,
  head: () => ({
    meta: [
      { title: "兑换码验证 · MIRROR" },
      { name: "description", content: "输入兑换码解锁你的 MIRROR 测试与 AI 分析师。" },
    ],
  }),
  component: AccessPage,
});

const CODE_MAX_LENGTH = 32;

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "").slice(0, CODE_MAX_LENGTH);
}

function AccessPage() {
  const search = useSearch({ from: "/access" });
  const nav = useNavigate();
  const { pending: authPending } = useRequireAuth();
  const product = PRODUCTS.find((p) => p.id === search.product) ?? PRODUCTS[0];
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [selfGender, setSelfGender] = useState<SelfGender | null>(() => getStoredSelfGender());
  const [mateGender, setMateGender] = useState<MateGender | null>(() => getStoredMateGender());
  const inputRef = useRef<HTMLInputElement | null>(null);

  const needsGenderPick = product.id === "self" || product.id === "mate";
  const pickedGender =
    product.id === "self" ? selfGender : product.id === "mate" ? mateGender : getStoredRosGender();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const verify = async () => {
    const normalized = normalizeCode(code);
    if (normalized.length < 4) {
      toast.error("请输入完整的兑换码");
      return;
    }
    if (needsGenderPick && !pickedGender) {
      toast.error("请先选择「女性版」或「男性版」题库");
      return;
    }
    setVerifying(true);
    try {
      if (product.id === "self" && selfGender) setStoredSelfGender(selfGender);
      if (product.id === "mate" && mateGender) setStoredMateGender(mateGender);
      const gender =
        product.id === "self"
          ? selfGender
          : product.id === "ros"
            ? getStoredRosGender()
            : mateGender;
      const suiteSlug = resolveSuiteSlug({
        productId: product.id,
        routeId: product.id,
        sessionSuiteSlug: sessionStorage.getItem(`suite:${product.id}`),
      });
      const res = await lovecompassApi.verifyRedemption({
        code: normalized,
        product: product.id,
        suiteSlug,
        gender: gender ?? undefined,
      });
      const verifiedSuiteSlug = res.suiteSlug || suiteSlug;
      const productId = resolveProductId(verifiedSuiteSlug);
      markProductAccess(productId, verifiedSuiteSlug, res.redemptionEventId);
      toast.success("解锁成功");

      if (productId === "ros") {
        nav({ to: "/ros/start" });
        return;
      }

      const target = search.redirect;
      if (target?.includes("/run") && pickedGender) {
        const slug =
          productId === "mate"
            ? MATE_SUITE_SLUGS[pickedGender as MateGender]
            : SELF_SUITE_SLUGS[pickedGender as SelfGender];
        nav({ to: "/tests/$id/run", params: { id: slug } });
        return;
      }

      nav({ to: "/tests/$id", params: { id: productId } });
    } catch (e) {
      const msg = (e as Error).message || "兑换码无效或已被使用";
      toast.error(msg, { description: getApiErrorHint(msg) ?? undefined });
      setCode("");
      inputRef.current?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const filled = Math.min(normalizeCode(code).length, CODE_MAX_LENGTH);
  const pct = Math.round((filled / CODE_MAX_LENGTH) * 100);

  if (authPending) return <AuthChecking />;

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
            。验证通过后会绑定真实测试套件，并保留本次兑换事件用于答题提交。
          </p>

          {needsGenderPick && (
            <div className="mt-8 rounded-2xl border border-border/50 bg-secondary/20 p-4 space-y-3">
              <div className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
                选择题库版本
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {(["female", "male"] as const).map((gender) => {
                  const selected =
                    product.id === "self" ? selfGender === gender : mateGender === gender;
                  return (
                    <button
                      key={gender}
                      type="button"
                      onClick={() =>
                        product.id === "self" ? setSelfGender(gender) : setMateGender(gender)
                      }
                      className={`h-11 rounded-xl border text-sm font-medium transition ${
                        selected
                          ? "border-[oklch(0.68_0.18_285_/_0.7)] bg-[oklch(0.50_0.20_285_/_0.12)] text-foreground"
                          : "border-border/60 bg-glass text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {gender === "female" ? "女性版" : "男性版"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground">
                REDEEM CODE
              </span>
              <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                {filled}/{CODE_MAX_LENGTH}
              </span>
            </div>
            <input
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(normalizeCode(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !verifying) void verify();
              }}
              inputMode="text"
              autoCapitalize="characters"
              maxLength={CODE_MAX_LENGTH}
              placeholder="例如 LOVE-COMPASS"
              className="w-full h-14 rounded-2xl px-4 text-center font-mono text-lg md:text-xl uppercase bg-secondary/30 border border-border/60 transition-all outline-none caret-[oklch(0.82_0.14_200)] focus:border-[oklch(0.82_0.14_200_/_0.7)] focus:glow-cyan placeholder:text-muted-foreground/45"
            />
            <div className="mt-4 h-[3px] rounded-full bg-secondary/40 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)]"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <HintButton
            onClick={verify}
            blocked={verifying || filled < 4}
            blockedHint={filled < 4 ? "请输入至少 4 位兑换码后再验证" : undefined}
            className="mt-7 w-full h-12 rounded-full bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-95 disabled:opacity-40 inline-flex items-center justify-center"
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
          </HintButton>

          <div className="mt-6 grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-secondary/30 rounded-xl border border-border/50 p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <ShieldCheck className="h-3 w-3" />
                <span className="font-mono tracking-[0.2em]">SECURE</span>
              </div>
              <p className="text-foreground/80 leading-relaxed">
                兑换码会在后端真库校验，一次兑换会关联到本次作答记录。
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
            当前页面已接入真实后端兑换码校验，测试码仅用于内部联调。
          </p>
        </motion.div>
      </div>
    </main>
  );
}
