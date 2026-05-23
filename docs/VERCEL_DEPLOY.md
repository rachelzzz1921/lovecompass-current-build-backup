# LoveCompass · Vercel 部署说明（现有 Supabase 真库）

本文档面向 **不新建数据库**、继续使用项目 `wjfpglsygkbpubanylug` 的部署。  
仓库为 monorepo，需在 Vercel 创建 **两个项目**（前端 + 后端）。

---

## 一、架构

| Vercel 项目 | Root Directory | 构建命令 | 说明 |
|-------------|----------------|----------|------|
| `lovecompass-web`（示例名） | `frontend` | `NITRO_PRESET=vercel npm run build`（已在 `frontend/vercel.json`） | TanStack Start + Nitro |
| `lovecompass-api`（示例名） | `backend` | 自动（FastAPI + `app/main.py` + `pyproject.toml`） | FastAPI 单 Function |

数据库：**仅使用现有 Supabase**，连接串配置在后端 Vercel 环境变量，**勿提交 `.env` 到 GitHub**。

---

## 二、数据库（迁移与真库状态）

真库已具备 LoveCompass V1 表结构与题库，一般 **无需重复跑全量迁移**。  
若新环境恢复，按 `backend/migrations/README.md` 顺序执行 SQL。

| 检查项 | 预期 |
|--------|------|
| `test_suites` | 2 条（`s01_self_female`, `s01_self_male`） |
| `test_questions` | 100 |
| `redemption_codes` | 至少 E2E 测试码（可选） |

**连接串建议：**

| 变量 | 用途 | 端口 / 主机 |
|------|------|-------------|
| `DATABASE_URL` | Vercel 后端运行时 | Pooler **6543**，可加 `?pgbouncer=true` |
| `DIRECT_URL` | 本地跑迁移 / 大 SQL | 直连 `db.wjfpglsygkbpubanylug.supabase.co` **5432**（推荐，勿用 pooler 跑 DDL） |

---

## 三、部署步骤

### 步骤 1：部署后端 API

1. Vercel → **Add New Project** → 导入 GitHub 仓库 `lovecompass-current-build-backup`。
2. **Root Directory** 选 `backend`。
3. Framework Preset：**FastAPI**（必须；不要用 Other + `functions.api/*`，会报 pattern 不匹配）。
4. 在 **Environment Variables** 填入 [第四节](#四环境变量清单) 中后端变量（Production）。
5. Deploy 完成后访问：  
   `https://<你的后端域名>/health` → 应返回 `{"ok":true}`。  
   可选：`/health?db=1` 验证数据库连通。

### 步骤 2：部署前端

1. 再建一个 Vercel 项目，**Root Directory** 选 `frontend`。
2. 构建命令已由 `frontend/vercel.json` 指定为 `NITRO_PRESET=vercel npm run build`。
3. 配置前端环境变量（见下表），其中：  
   `VITE_LOVECOMPASS_API_BASE_URL` = **步骤 1 的后端域名**（无尾部 `/`）。
4. Deploy 后打开首页，浏览器 Network 应请求后端域名而非 `localhost:8000`。

### 步骤 3：回写 CORS 并重新部署后端

在后端项目更新：

```text
CORS_ORIGINS=https://<前端正式域名>,https://<前端>-<team>.vercel.app,http://localhost:5173
```

保存后 **Redeploy** 后端。

### 步骤 4：验收

| 检查 | 操作 |
|------|------|
| 题库 | 打开 `/tests/self` → 选女性/男性版 → 能加载 50 题 |
| 登录 | `/auth` 注册/登录后，答题提交带 Bearer |
| 兑换码 | `/access` 输入 `LC-E2E-F-20260523`（若已导入） |
| AI 报告 | 完成测试后结果页生成报告（需 `ZHIPU_API_KEY`） |

---

## 四、环境变量清单

### 4.1 前端 Vercel（仅公开变量）

| 变量名 | 你已提供 | 说明 |
|--------|:--------:|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://wjfpglsygkbpubanylug.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ **缺失** | Supabase → Project Settings → API → `anon` 或 **publishable** key |
| `VITE_LOVECOMPASS_API_BASE_URL` | ❌ **缺失** | 填后端 Vercel 域名，部署后端后才有 |
| `VITE_SUPABASE_URL` | 可选 | 可与 `NEXT_PUBLIC_SUPABASE_URL` 相同 |
| `VITE_SUPABASE_ANON_KEY` | 可选 | 可与 anon key 相同 |

**不要**在前端配置：`DATABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`ZHIPU_API_KEY`、`SUPABASE_JWT_SECRET`。

### 4.2 后端 Vercel（服务端密钥）

| 变量名 | 你已提供 | 说明 |
|--------|:--------:|------|
| `DATABASE_URL` | ✅ | Pooler 6543 + `pgbouncer=true` |
| `DIRECT_URL` | ✅ | 仅本地迁移用；Vercel 运行时不必配 |
| `SUPABASE_URL` | ✅（同前端 URL） | `https://wjfpglsygkbpubanylug.supabase.co` |
| `SUPABASE_PROJECT_ID` | 建议填 | `wjfpglsygkbpubanylug` |
| `SUPABASE_JWT_SECRET` | ❌ **缺失** | Settings → API → **JWT Secret**（校验用户 token） |
| `CORS_ORIGINS` | ❌ **缺失** | 前端域名列表，逗号分隔 |
| `AI_PROVIDER` | 建议填 | `zhipu` |
| `ZHIPU_API_KEY` | ❌ **缺失** | 智谱开放平台 |
| `ZHIPU_BASE_URL` | 可选 | 默认 `https://open.bigmodel.cn/api/paas/v4` |
| `ZHIPU_MODEL` | 可选 | 默认 `glm-4-flash` |
| `LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK` | 生产必设 | **`false`**（勿用 demo 用户绕过登录） |
| `LOVECOMPASS_DEMO_USER_ID` | 可选 | 仅本地调试 |
| `SUPABASE_PUBLISHABLE_KEY` | 可选 | 与 anon key 相同即可 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 可选 | 兼容命名 |
| `SUPABASE_SERVICE_ROLE_KEY` | 可选 | 当前 FastAPI 未强制使用；若后续管理端可再配 |

### 4.3 你仍需补全的名称（汇总）

1. `NEXT_PUBLIC_SUPABASE_ANON_KEY`（前端）  
2. `VITE_LOVECOMPASS_API_BASE_URL`（前端，后端部署后填写）  
3. `SUPABASE_JWT_SECRET`（后端）  
4. `CORS_ORIGINS`（后端，前端部署后填写）  
5. `ZHIPU_API_KEY`（后端，若要正式 AI 报告）  

---

## 五、本地开发 `.env`（勿提交）

在 `backend/.env`、`frontend/.env` 复制各自 `.env.example`。  
密码只放本地与 Vercel 控制台，**不要 push**。

本地后端示例（无真实密码）：

```bash
# backend/.env
DATABASE_URL="postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true"
SUPABASE_URL="https://wjfpglsygkbpubanylug.supabase.co"
SUPABASE_JWT_SECRET="从 Supabase Dashboard 复制"
LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK="true"
CORS_ORIGINS="http://localhost:5173,http://localhost:4173"
AI_PROVIDER="zhipu"
ZHIPU_API_KEY="你的智谱 Key"
```

```bash
# frontend/.env
NEXT_PUBLIC_SUPABASE_URL="https://wjfpglsygkbpubanylug.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="你的 anon/publishable key"
VITE_LOVECOMPASS_API_BASE_URL="http://localhost:8000"
```

本地启动：

```bash
# 后端
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend && npm install && npm run dev
```

---

## 六、Supabase Dashboard 手动项

- **Authentication → Email → Leaked password protection**：建议开启（MCP 无法代配）。

---

## 七、推送到 GitHub

本地仓库路径：`/Users/chenzhiwei/lovecompass-sync`（`main` 可能超前于 GitHub，需 push）：

```bash
cd /Users/chenzhiwei/lovecompass-sync
git push origin main
```

然后在 Vercel 连接该仓库并选择对应 Root Directory。

---

## 八、相关文档

- `docs/vercel_zhipu_deployment.md` — 智谱与变量补充说明  
- `backend/migrations/README.md` — SQL 迁移顺序  
- `docs/SUPABASE_SECURITY_SYNC_20260523.md` — 真库安全加固记录  
- `backend/README_API.md` — API 与认证说明  
