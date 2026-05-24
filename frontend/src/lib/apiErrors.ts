/** Normalize fetch / FastAPI errors into user-facing Chinese messages. */
export function formatApiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "Failed to fetch" || err.name === "TypeError") {
      return "无法连接后端 API，请检查网络或部署配置";
    }
    return err.message;
  }
  return "请求失败，请稍后再试";
}

/** Optional hint for common deployment / auth misconfiguration. */
export function getApiErrorHint(message: string): string | null {
  if (message.includes("VITE_LOVECOMPASS_API_BASE_URL")) {
    return "前端需配置 VITE_LOVECOMPASS_API_BASE_URL，指向后端 Vercel 域名（无尾部斜杠）。";
  }
  if (/401|需要登录|登录已过期|登录令牌|未登录|无效或过期的登录令牌/.test(message)) {
    return "此功能需要登录。请先返回登录页重新登录；若仍失败，请确认后端已配置 SUPABASE_URL（用于 JWKS 校验用户令牌）。";
  }
  if (message.includes("SUPABASE_JWT_SECRET") || message.includes("SUPABASE_URL") || message.includes("服务端未配置")) {
    return "后端 Auth 配置不完整：生产环境需配置 SUPABASE_URL；旧版 HS256 令牌还需 SUPABASE_JWT_SECRET。";
  }
  if (/无法连接|Failed to fetch|CORS|NetworkError/.test(message)) {
    return "若刚部署完：确认后端 CORS_ORIGINS 含当前前端域名，或依赖默认的 *.vercel.app 预览规则；并确认后端 /health?db=1 可访问。";
  }
  return null;
}
