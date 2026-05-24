import { safeReturnPath } from "@/lib/requireAuth";

const STORAGE_KEY = "lovecompass:oauth_return";

export function stashOAuthReturn(path: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, safeReturnPath(path));
}

export function takeOAuthReturn(fallback = "/"): string {
  if (typeof window === "undefined") return fallback;
  const stored = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return safeReturnPath(stored, fallback);
}

/** Clean callback URL — register this exact path in Supabase Redirect URLs. */
export function oauthCallbackUrl(): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/auth/callback`;
}
