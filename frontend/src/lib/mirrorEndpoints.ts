/**
 * 国内 / 镜像域访问：在 Vercel 主站不可达时，切换到镜像 API 与 Supabase 代理。
 *
 * 环境变量（均为公开 URL，可写入前端构建）：
 * - VITE_LOVECOMPASS_API_BASE_URL — 主 API（Vercel 后端）
 * - VITE_LOVECOMPASS_API_MIRROR_URL — 镜像后端（见 docs/CHINA_MIRROR.md）
 * - VITE_LOVECOMPASS_API_USE_LOCAL — dev 时额外尝试 http://localhost:8000
 * - VITE_SUPABASE_MIRROR_URL — Supabase 反向代理
 * - VITE_MIRROR_HOSTNAMES — 逗号分隔，访问这些域名时强制走镜像
 * - VITE_AUTO_MIRROR_FOR_CN — "true" 时，东八区时区优先尝试镜像 API
 */

const PRIMARY_API = (import.meta.env.VITE_LOVECOMPASS_API_BASE_URL as string | undefined)?.replace(
  /\/$/,
  "",
);

const MIRROR_API = (import.meta.env.VITE_LOVECOMPASS_API_MIRROR_URL as string | undefined)?.replace(
  /\/$/,
  "",
);

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

const USE_LOCAL_DEV_API =
  import.meta.env.DEV &&
  String(import.meta.env.VITE_LOVECOMPASS_API_USE_LOCAL ?? "false").toLowerCase() === "true";

const STORAGE_KEY = "mirror:prefer";

export type EndpointMode = "primary" | "mirror" | "auto";

export type EndpointProfile = {
  mode: EndpointMode;
  apiBase: string;
  supabaseUrl: string;
  label: string;
};

/** SSR / 首屏 hydration 用的稳定默认值，不读浏览器 API。 */
export function getSsrEndpointProfile(): EndpointProfile {
  return {
    mode: "primary",
    apiBase: PRIMARY_API ?? MIRROR_API ?? "",
    supabaseUrl: PRIMARY_SUPABASE ?? MIRROR_SUPABASE ?? "",
    label: "国际线路",
  };
}

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
  if (import.meta.env.DEV) return false;
  const stored = readPreferMirrorStorage();
  if (stored === true) return Boolean(MIRROR_API);
  if (stored === false) return false;
  if (isMirrorHostname()) return Boolean(MIRROR_API);
  if (AUTO_MIRROR_CN && likelyMainlandTimezone() && MIRROR_API) return true;
  return false;
}

function devLocalBase(): string | null {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;
  const host = window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
  return `http://${host}:8000`;
}

/** Ordered API bases to try. Dev 默认只打远程主站，除非显式开启 USE_LOCAL。 */
export function apiBaseCandidates(): string[] {
  const primary = PRIMARY_API;
  const mirror = MIRROR_API;
  const devLocal = devLocalBase();

  if (import.meta.env.DEV) {
    const ordered: string[] = [];
    if (primary) ordered.push(primary);
    if (USE_LOCAL_DEV_API && devLocal) ordered.push(devLocal);
    if (mirror) ordered.push(mirror);
    if (!ordered.length && devLocal) ordered.push(devLocal);
    return [...new Set(ordered.filter(Boolean))];
  }

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

function requestTimeoutMs(path: string, init?: RequestInit): number {
  const method = (init?.method ?? "GET").toUpperCase();
  if (method === "POST" && path === "/attempts") return 90_000;
  if (method === "POST" && path === "/chat/sync-profile") return 90_000;
  if (method === "POST" && path.includes("/report")) return 60_000;
  if (method === "GET" && path === "/profile/portrait") return 35_000;
  if (method === "GET" && path.startsWith("/chat/context")) return 35_000;
  if (method === "POST" && path === "/chat/message") return 120_000;
  return 20_000;
}

function shouldReturnClientErrorImmediately(base: string, status: number): boolean {
  if (status < 400 || status >= 500) return false;
  // 主站已明确拒绝（登录/校验），不要误试 localhost 或镜像
  return Boolean(PRIMARY_API && base === PRIMARY_API);
}

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
  let lastResponse: Response | null = null;
  const timeoutMs = requestTimeoutMs(path, init);

  for (const base of bases) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${base}${path}`, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) return res;
      if (shouldReturnClientErrorImmediately(base, res.status)) return res;
      if (res.status < 500) {
        lastResponse = res;
        continue;
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
    }
  }
  if (lastResponse) return lastResponse;
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
