# LoveCompass 上线核对清单

部署地址（当前）：

| 项目 | URL |
|------|-----|
| 前端 | https://lovecompass-web.vercel.app |
| 后端 | https://lovecompass-api-backend.vercel.app |
| Supabase | https://wjfpglsygkbpubanylug.supabase.co |

---

## 你需要在控制台完成的（代码无法代做）

### 1. 后端 Vercel — `SUPABASE_URL`（**必做，JWKS 校验登录令牌**）

Supabase 用户 access token 现为 **ES256** 签名。后端通过  
`{SUPABASE_URL}/auth/v1/.well-known/jwks.json` 验签，**必须**配置：

```text
SUPABASE_URL=https://wjfpglsygkbpubanylug.supabase.co
```

可选（仅 legacy HS256 令牌）：`SUPABASE_JWT_SECRET` — Project Settings → API → JWT Secret

Redeploy 后端后验证：

```bash
curl "https://lovecompass-api-backend.vercel.app/health?config=1"
# 应含 "jwtVerifyJwks": true
```

### 2. Supabase — Redirect URLs（Google / 邮箱登录）

Authentication → **URL Configuration**：

- **Site URL**：`https://lovecompass-web.vercel.app`
  - **Redirect URLs** 增加：
    - `https://lovecompass-web.vercel.app/auth/callback`
    - `https://lovecompass-web.vercel.app/auth/callback/**`
    - `https://lovecompass-web.vercel.app/auth**`（邮箱登录备用）
  - `http://localhost:5173/auth**`

Google Provider 启用后，在 Google Cloud Console 的 Authorized redirect URI 与 Supabase 保持一致。

### 3. 前端 Vercel — Root Directory（**必为 `frontend`**）

Settings → General → **Root Directory** 必须是 `frontend`，不能是 `backend` 或仓库根目录。

Settings → Build & Development → **Install Command / Build Command** 留空（由 `frontend/vercel.json` 接管），**不要**填 `pip install` 或 `python scripts/check_env.py`（那是后端命令）。

### 4. 前端 Vercel — 环境变量

| 变量 | 值 |
|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wjfpglsygkbpubanylug.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `VITE_LOVECOMPASS_API_BASE_URL` | `https://lovecompass-api-backend.vercel.app` |

### 5. 可选后端变量

| 变量 | 说明 |
|------|------|
| `CORS_ORIGINS` | `https://lovecompass-web.vercel.app,http://localhost:5173` |
| `ZHIPU_API_KEY` | AI 深度报告 |
| `LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK` | 生产必须为 `false` |

---

## 推荐用户流程（部署后自测）

1. `/auth` 登录（邮箱或 Google）
2. `/tests/self` → 选 **女性版/男性版** → 点「去解锁」
3. `/access` 输入兑换码（测试推荐：`LOVE-COMPASS`；女性 `LOVE-MIRROR-26` / 男性 `LOVE-NORTH-26`）
4. 答完 50 题 → **生成画像** → `/analyzing` → `/result/:attemptId`

---

## 一键 smoke test

```bash
chmod +x scripts/smoke-production.sh
FRONTEND_URL=https://lovecompass-web.vercel.app ./scripts/smoke-production.sh
```

---

## 常见问题

| 现象 | 原因 | 处理 |
|------|------|------|
| 提交报「需要登录」 | Token 未带 / 过期 / 未配 JWT Secret | 重新登录；配 `SUPABASE_JWT_SECRET` |
| Google 404 | 旧版回调 `/auth/callback` 未部署 | 拉最新代码 redeploy；Supabase 加 `/auth**` |
| 没进兑换码页 | 旧版 self=free 或未 redeploy | 拉最新 frontend redeploy |
| 点「开始」无反应 | 旧版 disabled 按钮 | 最新版会 toast + 跳转登录/兑换 |
| 前端构建跑 `pip install` | Root Directory 错选 `backend`，或 Build 设置误填后端命令 | Root 改为 `frontend`；清空 Install/Build 覆盖项后 Redeploy |
| 登录报 Invalid login credentials | 密码不对；或注册时 Email 登录未开启导致未真正完成注册 | 用「忘记密码」重置；或使用下方测试账号 / Google 登录 |
