import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { adminApi } from "@/lib/adminApi";
import { AuthChecking, useRequireAuth } from "@/lib/requireAuth";

export function AdminDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">无管理员权限</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          当前账号未开通后台权限。请在 Supabase 将 profiles.role 设为 admin。
        </p>
        <Link to="/" className="mt-6 inline-flex text-sm text-primary hover:underline">
          返回首页
        </Link>
      </div>
    </main>
  );
}

export function useRequireAdmin() {
  const auth = useRequireAuth();
  const nav = useNavigate();
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
  const { pending, denied, error } = useRequireAdmin();
  if (pending) return <AuthChecking />;
  if (denied) return <AdminDenied />;
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-sm text-muted-foreground">
        加载后台失败：{error}
      </main>
    );
  }
  return <>{children}</>;
}
