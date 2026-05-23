import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { getSessionWithRefresh } from "@/lib/supabaseSession";

/** Only allow in-app relative paths after login. */
export function safeReturnPath(path: string | undefined, fallback = "/"): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export function authRedirectUrl(returnPath: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/auth?redirect=${encodeURIComponent(safeReturnPath(returnPath))}`;
}

export async function getSessionOrNull() {
  return getSessionWithRefresh();
}

export function AuthChecking() {
  return (
    <main className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
      正在确认登录状态…
    </main>
  );
}

/** Redirect unauthenticated users to /auth?redirect=… */
export function useRequireAuth() {
  const nav = useNavigate();
  const { session, loading } = useAuth();
  const returnPath = useRouterState({
    select: (state) => `${state.location.pathname}${state.location.search}`,
  });
  const [redirecting, setRedirecting] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [resolvedSession, setResolvedSession] = useState(session);

  useEffect(() => {
    let cancelled = false;
    void getSessionWithRefresh().then((nextSession) => {
      if (cancelled) return;
      setResolvedSession(nextSession);
      setSessionReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (loading || !sessionReady) return;
    if (resolvedSession) return;
    setRedirecting(true);
    void nav({
      to: "/auth",
      search: { redirect: safeReturnPath(returnPath) },
    });
  }, [loading, sessionReady, resolvedSession, returnPath, nav]);

  return {
    session: resolvedSession,
    authed: Boolean(resolvedSession),
    pending: loading || !sessionReady || redirecting || !resolvedSession,
  };
}
