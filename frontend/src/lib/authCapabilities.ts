import { resolveSupabaseUrl } from "@/lib/mirrorEndpoints";

export type AuthCapabilities = {
  email: boolean;
  google: boolean;
  disableSignup: boolean;
  mailerAutoconfirm: boolean;
};

let cached: AuthCapabilities | null = null;

function supabaseAnonKey(): string {
  return (
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    ""
  );
}

/** Public Supabase Auth settings — used to hide/disable broken providers in UI. */
export async function fetchAuthCapabilities(): Promise<AuthCapabilities> {
  if (cached) return cached;
  const base = resolveSupabaseUrl();
  const anonKey = supabaseAnonKey();
  if (!base || !anonKey) {
    return {
      email: true,
      google: false,
      disableSignup: false,
      mailerAutoconfirm: true,
    };
  }
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    if (!res.ok) {
      return {
        email: true,
        google: false,
        disableSignup: false,
        mailerAutoconfirm: true,
      };
    }
    const payload = (await res.json()) as {
      external?: { email?: boolean; google?: boolean };
      disable_signup?: boolean;
      mailer_autoconfirm?: boolean;
    };
    cached = {
      email: payload.external?.email !== false,
      google: payload.external?.google === true,
      disableSignup: payload.disable_signup === true,
      mailerAutoconfirm: payload.mailer_autoconfirm === true,
    };
    return cached;
  } catch {
    return {
      email: true,
      google: false,
      disableSignup: false,
      mailerAutoconfirm: true,
    };
  }
}
