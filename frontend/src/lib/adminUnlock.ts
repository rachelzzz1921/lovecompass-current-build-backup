const TOKEN_KEY = "mirror:adminUnlockToken";
const EXP_KEY = "mirror:adminUnlockExp";

export function getAdminUnlockToken(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expRaw = sessionStorage.getItem(EXP_KEY);
  if (!token || !expRaw) return null;
  const expMs = Number(expRaw);
  if (!Number.isFinite(expMs) || Date.now() >= expMs) {
    clearAdminUnlockToken();
    return null;
  }
  return token;
}

export function setAdminUnlockToken(token: string, expiresAt: string) {
  if (typeof sessionStorage === "undefined") return;
  const expMs = new Date(expiresAt).getTime();
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EXP_KEY, String(expMs));
}

export function clearAdminUnlockToken() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXP_KEY);
}

export function adminUnlockExpiresLabel(): string | null {
  const expRaw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(EXP_KEY) : null;
  if (!expRaw) return null;
  const expMs = Number(expRaw);
  if (!Number.isFinite(expMs)) return null;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(expMs));
}
