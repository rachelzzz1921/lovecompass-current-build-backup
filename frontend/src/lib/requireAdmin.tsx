import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { adminApi } from "@/lib/adminApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

export function AdminDenied({ email }: { email?: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-xl font-semibold text-foreground">无管理员权限</h1>
        <p className="text-sm text-muted-foreground">
          当前账号未开通后台权限。请在 Supabase SQL Editor 执行：
        </p>
        <pre className="text-left text-[11px] bg-muted/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
{`UPDATE public.profiles
SET role = 'admin'
WHERE email = '${email ?? "你的登录邮箱"}';`}
        </pre>
        {email ? <p className="text-xs text-muted-foreground">当前登录：{email}</p> : null}
        <Link to="/" className="inline-flex text-sm text-primary hover:underline">
          返回首页
        </Link>
      </div>
    </main>
  );
}

export function useRequireAdmin() {
  const auth = useRequireAuth();
  const [adminOk, setAdminOk] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.pending) return;
    let cancelled = false;
    void adminApi
      .me()
      .then((res) => {
        if (cancelled) return;
        setAdminOk(true);
        setAdminUser(res.user);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.message.includes("404") && err.message.includes("资料")) {
          setError("账号资料未同步，请退出重新登录一次后再试");
          setAdminOk(false);
          return;
        }
        if (err.message.includes("403") || err.message.includes("管理员")) {
          setAdminOk(false);
          return;
        }
        setError(err.message);
        setAdminOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.pending, auth.session]);

  return {
    ...auth,
    adminOk,
    adminUser,
    error,
    pending: auth.pending || adminOk === null,
    denied: adminOk === false && !error,
  };
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { pending, denied, error, session } = useRequireAdmin();
  if (pending) return <AuthChecking />;
  if (denied) return <AdminDenied email={session?.user?.email} />;
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <p className="text-sm text-destructive">加载后台失败：{error}</p>
          <p className="text-xs text-muted-foreground">
            请确认已登录，且前端能访问后端 API（VITE_LOVECOMPASS_API_BASE_URL）。
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
