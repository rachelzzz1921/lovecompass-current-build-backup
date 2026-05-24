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
  if (current.session && !sessionNearExpiry(current.session)) {
    return current.session;
  }

  const { data: refreshed, error } = await supabase.auth.refreshSession();
  if (error) return current.session ?? null;
  return refreshed.session ?? current.session ?? null;
}

/** Complete Supabase OAuth return (PKCE code or implicit hash). Client-only. */
export async function completeSupabaseAuthFromUrl(url: string): Promise<{ error?: string }> {
  const parsed = new URL(url);

  const oauthError = parsed.searchParams.get("error") || parsed.searchParams.get("error_description");
  if (oauthError) {
    return { error: oauthError };
  }

  const code = parsed.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return {};

    // detectSessionInUrl may have already exchanged the code
    await new Promise((resolve) => setTimeout(resolve, 300));
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) return {};

    return { error: error.message };
  }

  if (parsed.hash.includes("access_token")) {
    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) return { error: error.message };
      return {};
    }
  }

  if (parsed.hash.includes("error")) {
    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
    const description = hashParams.get("error_description") || hashParams.get("error");
    return { error: description || "OAuth 登录失败" };
  }

  return {};
}
