import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthChecking, safeReturnPath } from "@/lib/requireAuth";

/** Legacy OAuth redirect target — forwards to /auth so old Supabase redirect URLs keep working. */
export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackRedirect,
});

function AuthCallbackRedirect() {
  useEffect(() => {
    const current = new URL(window.location.href);
    const redirect = safeReturnPath(current.searchParams.get("redirect") ?? undefined);
    const next = new URL(`${window.location.origin}/auth`);
    next.searchParams.set("redirect", redirect);
    for (const key of ["code", "error", "error_description"]) {
      const value = current.searchParams.get(key);
      if (value) next.searchParams.set(key, value);
    }
    if (current.hash) {
      next.hash = current.hash;
    }
    window.location.replace(next.toString());
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      <AuthChecking />
      <p className="sr-only">正在跳转到登录页…</p>
    </main>
  );
}
