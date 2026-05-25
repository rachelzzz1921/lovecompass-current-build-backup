/**
 * 国内 / 镜像域访问：在 Vercel 主站不可达时，切换到镜像 API 与 Supabase 代理。
 *
 * 环境变量（均为公开 URL，可写入前端构建）：
 * - VITE_LOVECOMPASS_API_MIRROR_URL — 镜像后端（如 https://api.mirror.example.com）
 * - VITE_SUPABASE_MIRROR_URL — Supabase 反向代理（如 https://sb.mirror.example.com）
 * - VITE_MIRROR_HOSTNAMES — 逗号分隔，访问这些域名时强制走镜像
 * - VITE_AUTO_MIRROR_FOR_CN — "true" 时，东八区时区优先尝试镜像 API
 */

const PRIMARY_API = (import.meta.env.VITE_LOVECOMPASS_API_BASE_URL as string | undefined)?.replace(
  /\/$/,
  "",
);

/** 新加坡 VPS 默认镜像（sslip.io + Nginx，见 mirror/install-on-server.sh） */
const BUILTIN_MIRROR_API = "https://47-237-68-213.sslip.io/api";

const MIRROR_API = (
  (import.meta.env.VITE_LOVECOMPASS_API_MIRROR_URL as string | undefined) || BUILTIN_MIRROR_API
)?.replace(/\/$/, "");

const PRIMARY_SUPABASE =
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const MIRROR_SUPABASE = import.meta.env.VITE_SUPABASE_MIRROR_URL as string | undefined;

const MIRROR_HOSTS = String(import.meta.env.VITE_MIRROR_HOSTNAMES ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

const AUTO_MIRROR_CN =
  String(import.meta.env.VITE_AUTO_MIRROR_FOR_CN ?? "true").toLowerCase() === "true";

const STORAGE_KEY = "mirror:prefer";

export type EndpointMode = "primary" | "mirror" | "auto";

export type EndpointProfile = {
  mode: EndpointMode;
  apiBase: string;
  supabaseUrl: string;
  label: string;
};

function readPreferMirrorStorage(): boolean | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "1") return true;
  if (raw === "0") return false;
  return null;
}

export function setPreferMirror(prefer: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, prefer ? "1" : "0");
}

export function isMirrorHostname(hostname?: string): boolean {
  const host = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
  if (!host) return false;
  return MIRROR_HOSTS.some((m) => host === m || host.endsWith(`.${m}`));
}

function likelyMainlandTimezone(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === "Asia/Shanghai" || tz === "Asia/Urumqi" || tz === "Asia/Chongqing";
  } catch {
    return false;
  }
}

export function shouldPreferMirror(): boolean {
  const stored = readPreferMirrorStorage();
  if (stored === true) return Boolean(MIRROR_API);
  if (stored === false) return false;
  if (isMirrorHostname()) return Boolean(MIRROR_API);
  if (AUTO_MIRROR_CN && likelyMainlandTimezone() && MIRROR_API) return true;
  return false;
}

export function apiBaseCandidates(): string[] {
  const primary = PRIMARY_API;
  const mirror = MIRROR_API;
  if (!mirror) return primary ? [primary] : [];
  if (!primary) return [mirror];
  return shouldPreferMirror() ? [mirror, primary] : [primary, mirror];
}

export function resolveSupabaseUrl(): string {
  const preferMirror = shouldPreferMirror();
  if (preferMirror && MIRROR_SUPABASE) return MIRROR_SUPABASE;
  return PRIMARY_SUPABASE ?? MIRROR_SUPABASE ?? "";
}

export function getEndpointProfile(): EndpointProfile {
  const preferMirror = shouldPreferMirror();
  const apiBase = apiBaseCandidates()[0] ?? "";
  const supabaseUrl = resolveSupabaseUrl();
  const mode: EndpointMode = isMirrorHostname()
    ? "mirror"
    : preferMirror && MIRROR_API
      ? "mirror"
      : "primary";
  const label =
    mode === "mirror" ? "国内镜像线路" : preferMirror && MIRROR_API ? "镜像优先" : "国际线路";
  return { mode, apiBase, supabaseUrl, label };
}

const PROBE_TIMEOUT_MS = 7000;

/** 依次尝试主站与镜像 API，首个成功响应即返回。 */
export async function fetchWithMirrorFallback(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const bases = apiBaseCandidates();
  if (!bases.length) {
    throw new Error("未配置 VITE_LOVECOMPASS_API_BASE_URL 或镜像 API 地址");
  }

  let lastError: unknown;
  for (const base of bases) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    try {
      const res = await fetch(`${base}${path}`, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok || res.status < 500) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
