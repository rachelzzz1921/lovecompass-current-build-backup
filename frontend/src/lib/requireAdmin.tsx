import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { KeyRound, Shield } from "lucide-react";
import { toast } from "sonner";
import { adminApi, classifyAdminAccessError } from "@/lib/adminApi";
import { formatApiErrorMessage } from "@/lib/apiErrors";
import {
  adminUnlockExpiresLabel,
  clearAdminUnlockToken,
  setAdminUnlockToken,
} from "@/lib/adminUnlock";
import { supabase } from "@/integrations/supabase/client";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminAccessMode = "role" | "password" | null;

function AdminUnlockScreen({
  email,
  onUnlocked,
}: {
  email?: string | null;
  onUnlocked: () => void;
}) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSql, setShowSql] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("请输入管理密码");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminApi.unlock(password.trim());
      if (res.unlockToken && res.expiresAt) {
        setAdminUnlockToken(res.unlockToken, res.expiresAt);
        toast.success(`已解锁后台（${res.ttlHours ?? 12} 小时内有效）`);
      } else {
        toast.success(res.message ?? "已进入后台");
      }
      onUnlocked();
    } catch (err) {
      const kind = classifyAdminAccessError(err);
      if (kind === "auth") {
        toast.error("登录已失效，请重新登录后再输入管理密码");
      } else {
        toast.error(formatApiErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">管理后台</h1>
          <p className="text-sm text-muted-foreground">
            已登录 {email ?? "当前账号"} · 输入管理密码即可进入
          </p>
        </div>

        <form onSubmit={(e) => void submit(e)} className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">管理密码</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入管理密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            <KeyRound className="mr-1.5 h-4 w-4" />
            {submitting ? "验证中…" : "进入后台"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
            onClick={() => setShowSql((v) => !v)}
          >
            {showSql ? "收起" : "需要永久管理员？"} Supabase SQL 开通
          </button>
          {showSql ? (
            <pre className="mt-3 text-left text-[11px] bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
{`UPDATE public.profiles
SET role = 'admin'
WHERE email = '${email ?? "你的登录邮箱"}';`}
            </pre>
          ) : null}
        </div>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            返回用户端
          </Link>
        </div>
      </div>
    </main>
  );
}

export function useRequireAdmin() {
  const auth = useRequireAuth();
  const [adminOk, setAdminOk] = useState<boolean | null>(null);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [accessMode, setAccessMode] = useState<AdminAccessMode>(null);
  const [adminUser, setAdminUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkTick, setCheckTick] = useState(0);

  useEffect(() => {
    if (auth.pending) return;
    if (!auth.authed) {
      setAdminOk(false);
      setNeedsUnlock(false);
      setNeedsAuth(true);
      setError(null);
      return;
    }

    let cancelled = false;
    void adminApi
      .me()
      .then((res) => {
        if (cancelled) return;
        setAdminOk(true);
        setNeedsUnlock(false);
        setNeedsAuth(false);
        setAccessMode((res.accessMode as AdminAccessMode) ?? "role");
        setAdminUser(res.user);
        setError(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        const kind = classifyAdminAccessError(err);
        if (kind === "auth") {
          clearAdminUnlockToken();
          setAdminOk(false);
          setNeedsUnlock(false);
          setNeedsAuth(true);
          setError(null);
          return;
        }
        if (kind === "unlock") {
          setAdminOk(false);
          setNeedsUnlock(true);
          setNeedsAuth(false);
          setError(null);
          return;
        }
        if (err.message.includes("404") && err.message.includes("资料")) {
          setError("账号资料未同步，请退出重新登录一次后再试");
          setAdminOk(false);
          setNeedsUnlock(false);
          setNeedsAuth(false);
          return;
        }
        setError(err.message);
        setAdminOk(false);
        setNeedsUnlock(false);
        setNeedsAuth(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.pending, auth.authed, auth.session, checkTick]);

  return {
    ...auth,
    adminOk,
    needsUnlock,
    needsAuth,
    accessMode,
    adminUser,
    error,
    pending: auth.pending || (auth.authed && adminOk === null),
    denied: adminOk === false && !error && !needsUnlock && !needsAuth,
    refreshAdmin: () => setCheckTick((n) => n + 1),
    unlockExpiresLabel: adminUnlockExpiresLabel(),
    clearUnlock: clearAdminUnlockToken,
  };
}

function AdminReauthScreen() {
  const nav = useNavigate();

  useEffect(() => {
    clearAdminUnlockToken();
    const timer = window.setTimeout(() => {
      void supabase.auth.signOut().finally(() => {
        void nav({ to: "/auth", search: { redirect: "/admin" } });
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [nav]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-semibold">请先重新登录</h1>
        <p className="text-sm text-muted-foreground">
          登录凭证已失效。重新登录后即可输入管理密码进入后台。
        </p>
        <Button
          className="w-full"
          onClick={() => {
            clearAdminUnlockToken();
            void supabase.auth.signOut().finally(() => {
              void nav({ to: "/auth", search: { redirect: "/admin" } });
            });
          }}
        >
          重新登录
        </Button>
        <p className="text-xs text-muted-foreground">正在自动跳转…</p>
      </div>
    </main>
  );
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { pending, needsUnlock, needsAuth, denied, error, session, refreshAdmin } = useRequireAdmin();
  const errorKind = error ? classifyAdminAccessError(new Error(error)) : null;

  if (pending) return <AuthChecking />;
  if (needsAuth || errorKind === "auth") return <AdminReauthScreen />;
  if (needsUnlock || errorKind === "unlock") {
    return <AdminUnlockScreen email={session?.user?.email} onUnlocked={refreshAdmin} />;
  }
  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">无法进入管理后台</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <p className="text-sm text-destructive">加载后台失败：{error}</p>
          <p className="text-xs text-muted-foreground">
            请确认后端 API 可访问，且已配置 LOVECOMPASS_ADMIN_PASSWORD。
          </p>
          <Link to="/auth" search={{ redirect: "/admin" }} className="text-sm text-primary hover:underline">
            重新登录
          </Link>
        </div>
      </main>
    );
  }
  return <>{children}</>;
}
