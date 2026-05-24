/** Map Supabase Auth errors to clearer Chinese copy for the login UI. */
export function formatAuthError(message: string, mode: "login" | "signup"): string {
  const lower = message.toLowerCase();

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
    return "邮箱尚未验证。请查收验证邮件，或使用「忘记密码」重新设置。";
  }

  return message;
}

export function normalizeAuthEmail(raw: string): string {
  return raw.trim().toLowerCase();
}
