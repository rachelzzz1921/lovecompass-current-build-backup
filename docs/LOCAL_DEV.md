# 本地全链路开发

架构：**本地前端 (5173) + 本地后端 (8000) + 远程 Supabase（数据库 & 登录）**。  
不需要 Vercel 预览，也不需要镜像 API。

## 一次性准备

### 1. 依赖

```bash
# 后端
cd backend && python3 -m pip install -r requirements.txt

# 前端
cd frontend && npm ci
```

### 2. 生成环境变量

```bash
node scripts/bootstrap-local-env.mjs
```

会写入：

| 文件 | 作用 |
|------|------|
| `frontend/.env.development.local` | 强制 `VITE_LOVECOMPASS_API_BASE_URL=http://localhost:8000` |
| `backend/.env` | 后端密钥（gitignore，不会提交） |

### 3. 补全 `backend/.env` 里两个必填项

打开 [Supabase Dashboard](https://supabase.com/dashboard/project/wjfpglsygkbpubanylug)：

1. **Database → Connection string → Transaction pooler (6543)**  
   复制 URI，填入 `DATABASE_URL=`（保留 `?pgbouncer=true`）

2. **Project Settings → API → JWT Secret**（Legacy）  
   填入 `SUPABASE_JWT_SECRET=`

也可一行注入后重新 bootstrap：

```bash
DATABASE_URL='postgresql://...' SUPABASE_JWT_SECRET='...' node scripts/bootstrap-local-env.mjs
```

验证：

```bash
cd backend
python3 scripts/check_env.py
python3 scripts/test_db_connection.py
curl http://127.0.0.1:8000/health   # 需先启动后端
```

## 日常启动（一条命令）

```bash
chmod +x scripts/dev-local.sh   # 首次
./scripts/dev-local.sh
```

或分开两个终端：

```bash
# 终端 A — 后端
cd backend && python3 -m uvicorn app.main:app --reload --port 8000

# 终端 B — 前端（必须用 localhost，不要用 127.0.0.1 打开浏览器）
cd frontend && npm run dev:preview
```

浏览器打开：**http://localhost:5173**

## 快速走通套一

1. 注册/登录 `/auth`
2. 打开 `/tests/self` → 选性别 → **开始测试**（lite 免费，无需兑换码）
3. 答完 → 分析页 → `/result/{attemptId}`

开发用万能兑换码（套二/套三完整版）：`MIRROR-ALL-ACCESS`

## 环境说明

| 变量 | 位置 | 本地值 |
|------|------|--------|
| `VITE_LOVECOMPASS_API_BASE_URL` | `frontend/.env.development.local` | `http://localhost:8000` |
| `DATABASE_URL` | `backend/.env` | Supabase pooler 6543 |
| `AI_PROVIDER` | `backend/.env` | 默认 `mock`（无需智谱 Key） |
| `LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK` | `backend/.env` | `true`（仅本地） |

`npm run env:sync` 会从 Vercel 拉远程变量，但 **`.env.development.local` 会覆盖 API 地址**，本地 dev 仍指向 8000。

## 常见问题

**分析页报「无法连接后端 API」**  
→ 确认后端在跑：`curl http://127.0.0.1:8000/health`  
→ 浏览器地址栏用 `localhost:5173`，不是 `127.0.0.1`

**401 / 需要登录**  
→ 重新登录 `/auth`；确认 `SUPABASE_JWT_SECRET` 与项目一致

**题库为空**  
→ 真库未导入题集，按 `backend/migrations/README.md` 执行 import SQL

**想要 AI 报告（非 mock）**  
→ `backend/.env` 设 `AI_PROVIDER=zhipu` 并填 `ZHIPU_API_KEY`
