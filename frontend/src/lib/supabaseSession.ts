import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

function sessionAccessToken(session: Session | null | undefined): string | null {
  return session?.access_token?.trim() || null;
}

function sessionNearExpiry(session: Session | null | undefined): boolean {
  const expiresAt = session?.expires_at;
  if (!expiresAt) return false;
  return expiresAt * 1000 < Date.now() + 60_000;
}

/** Resolve a valid access token, refreshing the Supabase session when needed. */
export async function getRequiredAccessToken(): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("需要登录后才能继续，请先登录");
  }

  const { data: current } = await supabase.auth.getSession();
  const currentToken = sessionAccessToken(current.session);
  if (currentToken && !sessionNearExpiry(current.session)) {
    return currentToken;
  }

  const { data: refreshed, error } = await supabase.auth.refreshSession();
  if (error) {
    throw new Error("登录已过期，请重新登录后再提交");
  }
  const refreshedToken = sessionAccessToken(refreshed.session);
  if (refreshedToken) return refreshedToken;

  throw new Error("需要登录后才能继续，请先登录");
}

export async function getSessionWithRefresh(): Promise<Session | null> {
  const { data: current } = await supabase.auth.getSession();
  if (current.session) return current.session;

  const { data: refreshed } = await supabase.auth.refreshSession();
  return refreshed.session ?? null;
}

/** Complete Supabase OAuth return (PKCE code or implicit hash). */
export async function completeSupabaseAuthFromUrl(url: string): Promise<{ error?: string }> {
  const parsed = new URL(url);
  const code = parsed.searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { error: error.message };
    return {};
  }

  if (parsed.hash.includes("access_token") || parsed.hash.includes("error")) {
    const { error } = await supabase.auth.getSession();
    if (error) return { error: error.message };
    return {};
  }

  return {};
}
