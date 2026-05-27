/** Map Supabase Auth errors to clearer Chinese copy for the login UI. */
export function formatAuthError(message: string, mode: "login" | "signup"): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("unsupported provider") ||
    lower.includes("provider is not enabled") ||
    lower.includes("validation_failed")
  ) {
    return "Google 登录尚未在 Supabase 开启。请先用邮箱注册/登录，或联系管理员在 Supabase → Authentication → Providers 启用 Google。";
  }

  if (lower.includes("email_address_invalid") || lower.includes("email address") && lower.includes("invalid")) {
    return "邮箱格式不被接受。请使用常见邮箱（如 Gmail、Outlook、QQ 邮箱），不要使用 example.com 等测试域名。";
  }

  if (lower.includes("signup is disabled") || lower.includes("signups not allowed")) {
    return "当前已关闭新用户注册，请联系管理员。";
  }

  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "操作过于频繁，请稍后再试。";
  }

  if (lower.includes("invalid login credentials") || lower.includes("invalid_credentials")) {
    return mode === "login"
      ? "邮箱或密码不正确。若刚注册过，请确认密码；也可点「忘记密码」重置，或使用 Google 登录。"
      : message;
  }

  if (lower.includes("user already registered") || lower.includes("user_already_exists")) {
    return "该邮箱已注册，请切换到「登录」，或使用 Google 登录。";
  }

  if (lower.includes("email logins are disabled") || lower.includes("email_provider_disabled")) {
    return "邮箱登录尚未开启，请联系管理员或使用 Google 登录。";
  }

  if (lower.includes("email not confirmed")) {
    return "邮箱尚未验证。请查收验证邮件（含垃圾箱），验证后再登录；或使用「忘记密码」重新设置。";
  }

  return message;
}

export function normalizeAuthEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
