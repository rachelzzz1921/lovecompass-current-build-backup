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
  if (/401|需要登录|登录令牌|未登录/.test(message)) {
    return "此功能需要登录。请返回首页完成 Supabase 登录后再试。";
  }
  if (/500.*JWT|SUPABASE_JWT_SECRET/.test(message)) {
    return "后端未配置 SUPABASE_JWT_SECRET，请在 Vercel 后端项目填入 JWT Secret 并重新部署。";
  }
  if (/无法连接|Failed to fetch|CORS|NetworkError/.test(message)) {
    return "若刚部署完：确认后端 CORS_ORIGINS 含当前前端域名，或依赖默认的 *.vercel.app 预览规则；并确认后端 /health?db=1 可访问。";
  }
  return null;
}
