# Supabase 迁移：德国 → 新加坡

| 项目 | Ref | Region |
|------|-----|--------|
| 旧（EU） | `wjfpglsygkbpubanylug` | eu-central-1 |
| 新（SG） | `busyjidkgfakqglldyye` | ap-southeast-1（lovecompass-sg） |

## 状态

- [x] 新加坡项目 `lovecompass-sg` 已创建
- [x] SG 库 schema 已跑完 migrations
- [x] 从 EU 导出全量数据（5712 行，含 11 用户 / 131 答题）
- [ ] 数据导入 SG（`backend/scripts/export_sg_import_sql.py` + MCP 或 pooler）
- [ ] SG 数据库密码与 Vercel 环境变量对齐
- [ ] Vercel 前后端 Redeploy
- [ ] Supabase Auth 回调 URL（SG 项目）
- [ ] 验收通过后停用 EU 项目

## 1. 重置 SG 数据库密码（必做）

SG 项目创建时的密码与 EU **不同**。为简化连接串维护，建议设为与 EU **相同**：

1. [Supabase Dashboard → lovecompass-sg → Settings → Database](https://supabase.com/dashboard/project/busyjidkgfakqglldyye/settings/database)
2. **Reset database password** → 设成与 EU 项目相同的密码
3. 本地执行：

```bash
SG_DB_PASSWORD='你的密码' node scripts/activate_supabase_sg.mjs
```

会更新 `backend/.env`、`frontend/.env.preview`，并生成 `docs/vercel-env-sg.txt`（含 Vercel 要粘贴的变量，**勿提交 Git**）。

## 2. 导入数据到 SG

**方式 A — pooler 直连（密码重置后）：**

```bash
cd backend
# SOURCE 仍指向 EU pooler（5432 session mode），TARGET 指向 SG
SOURCE_DIRECT_URL='postgresql://postgres.wjfpglsygkbpubanylug:...@aws-1-eu-central-1.pooler.supabase.com:5432/postgres' \
TARGET_DIRECT_URL='postgresql://postgres.busyjidkgfakqglldyye:...@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres' \
python3 scripts/migrate_supabase_region.py
```

**方式 B — 已导出的 SQL 批次：**

```bash
cd backend
python3 scripts/export_sg_import_sql.py   # 从 EU 重新导出
# 在 Supabase MCP / SQL Editor 按序执行 .migration_batch/sg_import/batch_*.sql
# 或 .migration_batch/sg_import/mcp_chunks/chunk_*.sql（48 个文件）
```

## 3. Vercel 环境变量

打开 `docs/vercel-env-sg.txt`，分别粘贴到：

- **lovecompass-api-backend** — `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_PROJECT_ID`
- **lovecompass-web** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `VITE_*`

保存后对 **后端 + 前端** 各 **Redeploy** 一次。

## 4. Supabase Auth（SG 项目）

[Authentication → URL Configuration](https://supabase.com/dashboard/project/busyjidkgfakqglldyye/auth/url-configuration)

- **Site URL**: `https://lovecompass-web.vercel.app`
- **Redirect URLs**:
  - `https://lovecompass-web.vercel.app/auth/callback`
  - `https://lovecompass-web.vercel.app/auth/callback/**`
  - `https://lovecompass-web.vercel.app/auth**`
  - `http://localhost:5173/auth**`

若启用 Google 登录：Authentication → Providers → Google（配置与 EU 项目相同 Client ID/Secret）。

## 5. 验收

```bash
curl "https://lovecompass-api-backend.vercel.app/health?db=1"
# 应 connected

cd backend && python3 scripts/check_schema_counts.py
# test_suites=12, test_questions≈506

# 用已有账号登录 lovecompass-web → 历史档案应仍在
```

## 6. 用户影响

- 迁移后 **JWT 密钥变化**，所有用户需 **重新登录**（密码不变）
- 旧 session / refresh token 失效，属正常现象
- 镜像 API（阿里云新加坡）无需改逻辑；若配了 Supabase 反代，upstream 改为 `busyjidkgfakqglldyye.supabase.co`（见 `mirror/nginx.conf`）

## 7. 停用 EU 项目

SG 稳定运行 1–2 天后，在 Dashboard 暂停或删除 `wjfpglsygkbpubanylug`。
