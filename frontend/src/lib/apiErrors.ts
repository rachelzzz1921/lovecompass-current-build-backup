import { apiBaseCandidates } from "@/lib/mirrorEndpoints";

function likelyMainlandTimezone(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz === "Asia/Shanghai" || tz === "Asia/Urumqi" || tz === "Asia/Chongqing";
  } catch {
    return false;
  }
}

/** Normalize fetch / FastAPI errors into user-facing Chinese messages. */
export function formatApiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "AbortError" || err.name === "AbortError") {
      return "请求超时，服务器仍在处理。请稍后在「历史记录」查看结果，或重试提交。";
    }
    if (err.message === "Failed to fetch" || err.name === "TypeError") {
      const primary = import.meta.env.VITE_LOVECOMPASS_API_BASE_URL as string | undefined;
      const mirror = import.meta.env.VITE_LOVECOMPASS_API_MIRROR_URL as string | undefined;
      const bases = apiBaseCandidates();

      if (!primary && !mirror && bases.length === 0) {
        return "未配置 VITE_LOVECOMPASS_API_BASE_URL";
      }

      if (import.meta.env.DEV) {
        if (primary && !import.meta.env.VITE_LOVECOMPASS_API_USE_LOCAL) {
          return `无法连接后端 API（${primary}）。若你在本地开发，请确认网络可访问该地址；或在本机启动 uvicorn 并设置 VITE_LOVECOMPASS_API_USE_LOCAL=true。`;
        }
        return "无法连接后端 API（本地请确认 uvicorn 已在 :8000 运行，且 frontend/.env.local 中 VITE_LOVECOMPASS_API_BASE_URL 已配置）";
      }

      if (likelyMainlandTimezone() && primary && !mirror) {
        return "无法连接国际线路后端 API。内地网络常无法直连 vercel.app，请配置 VITE_LOVECOMPASS_API_MIRROR_URL 或部署镜像，见 docs/CHINA_MIRROR.md。";
      }

      return "无法连接后端 API，请检查网络或部署配置";
    }
    return err.message;
  }
  return "请求失败，请稍后再试";
}

/** Optional hint for common deployment / auth misconfiguration. */
export function getApiErrorHint(message: string): string | null {
  if (message.includes("VITE_LOVECOMPASS_API_BASE_URL") || message.includes("未配置 VITE_LOVECOMPASS")) {
    return "前端需配置 VITE_LOVECOMPASS_API_BASE_URL，指向后端 Vercel 域名（无尾部斜杠）。若内地访问困难，请部署镜像并配置 VITE_LOVECOMPASS_API_MIRROR_URL，见 docs/CHINA_MIRROR.md。";
  }
  if (/401|需要登录|登录已过期|登录令牌|未登录|无效或过期的登录令牌/.test(message)) {
    return "此功能需要登录。请先返回登录页重新登录；若仍失败，请确认后端已配置 SUPABASE_URL（用于 JWKS 校验用户令牌）。";
  }
  if (message.includes("SUPABASE_JWT_SECRET") || message.includes("SUPABASE_URL") || message.includes("服务端未配置")) {
    return "后端 Auth 配置不完整：生产环境需配置 SUPABASE_URL；旧版 HS256 令牌还需 SUPABASE_JWT_SECRET。";
  }
  if (/VITE_LOVECOMPASS_API_USE_LOCAL|无法连接后端 API（https:\/\//.test(message)) {
    return "本地开发默认只连 .env.local 里的远程 API，不会自动探测 localhost:8000。需要本机后端时在 frontend/.env.local 加 VITE_LOVECOMPASS_API_USE_LOCAL=true。";
  }
  if (/内地网络|CHINA_MIRROR/.test(message)) {
    return "也可在 frontend/.env.local 设置 VITE_AUTO_MIRROR_FOR_CN=true，并配置可用的 VITE_LOVECOMPASS_API_MIRROR_URL。";
  }
  if (/无法连接|Failed to fetch|CORS|NetworkError/.test(message)) {
    return "本地预览请用 http://localhost:5173（不要用 127.0.0.1）；并确认后端 CORS_ORIGINS 含当前前端域名。";
  }
  if (/请求超时/.test(message)) {
    return "完整版题量较大时，提交与算分可能需要 30–90 秒。若多次超时，可改试快速版或检查后端日志。";
  }
  return null;
}
