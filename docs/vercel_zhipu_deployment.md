# LoveCompass Vercel + 智谱部署说明

本文档记录当前代码库面向 **Vercel 永久网站** 与 **智谱 AI 正式报告生成** 的部署方式。当前仓库已补齐前端与后端的 Vercel 配置文件，但由于本地环境没有可复用的 Vercel 登录态或部署 Token，最终生产域名绑定与环境变量注入需要在 Vercel 控制台完成。

## 部署形态

LoveCompass 采用前后端分离部署。前端以用户上传的 `LoveCompass(2).zip` 设计稿视觉为准，使用 **TanStack Start + Nitro** 部署到 Vercel；后端以 FastAPI 形式部署为独立 Vercel Python Serverless 项目，并连接 Supabase/PostgreSQL 与智谱 AI。

| 项目 | Vercel Root Directory | 构建 / 入口 | 关键用途 |
|---|---:|---|---|
| 前端网站 | `frontend` | `NITRO_PRESET=vercel npm run build`，生成 `.vercel/output` | 展示首页、答题页、结果页、历史档案与聊天入口。 |
| 后端 API | `backend` | `api/index.py` 导出 FastAPI `app` | 提供测试、结果、历史、AI 深度报告和聊天等真实接口。 |

## 前端 Vercel 环境变量

前端项目只能配置公开变量，不得配置任何数据库密码、service role key 或智谱密钥。`VITE_LOVECOMPASS_API_BASE_URL` 应填写后端 Vercel 项目的公开域名，例如 `https://lovecompass-api.vercel.app`。

| 变量名 | 示例 | 说明 |
|---|---|---|
| `VITE_LOVECOMPASS_API_BASE_URL` | `https://YOUR_BACKEND_PROJECT.vercel.app` | 前端请求后端 API 的基础地址。 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | Supabase 公开 URL。 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xxx_or_anon_jwt` | Supabase 浏览器端 publishable/anon key。 |
| `VITE_SUPABASE_URL` | 同上 | 兼容 Vite 命名，可与 `NEXT_PUBLIC_SUPABASE_URL` 保持一致。 |
| `VITE_SUPABASE_ANON_KEY` | 同上 | 兼容旧命名。 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 同上 | 兼容旧命名。 |

## 后端 Vercel 环境变量

后端项目必须配置数据库、Supabase 服务端和智谱相关密钥。智谱调用逻辑已经在 `backend/app/ai_adapter.py` 中实现，正式部署时只需要把 `AI_PROVIDER` 设为 `zhipu` 并配置 `ZHIPU_API_KEY`。

| 变量名 | 示例 | 说明 |
|---|---|---|
| `DATABASE_URL` | `从 Supabase Project Settings 复制的 PostgreSQL 连接串` | 后端数据库连接串。请只在后端 Vercel 项目中配置真实值。 |
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | Supabase 项目 URL。 |
| `SUPABASE_PROJECT_ID` | `YOUR_PROJECT_REF` | Supabase 项目 ID。 |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_xxx_or_anon_jwt` | 后端校验用户时可用的公开 key。 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xxx_or_anon_jwt` | 兼容当前后端配置命名。 |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_xxx_or_service_role_key` | 服务端专用 key，严禁放入前端。 |
| `CORS_ORIGINS` | `https://YOUR_FRONTEND_PROJECT.vercel.app,http://localhost:5173` | 允许访问 API 的前端域名列表。 |
| `AI_PROVIDER` | `zhipu` | 正式 AI Provider。 |
| `ZHIPU_API_KEY` | `YOUR_ZHIPU_API_KEY` | 智谱 API Key。 |
| `ZHIPU_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4` | 智谱 OpenAI-compatible API 基础地址。 |
| `ZHIPU_MODEL` | `glm-4-flash` | 默认报告生成模型，可按账号权限调整。 |
| `LOVECOMPASS_DEMO_USER_ID` | `00000000-0000-0000-0000-000000000001` | 本地或早期生产兜底用户，后续可切换为完整 Supabase Auth。 |

## 推荐部署步骤

第一步，在 Vercel 中创建后端项目，Root Directory 选择 `backend`。导入环境变量后部署，部署成功后访问 `/health` 或 `/docs` 检查 API 是否启动。如果数据库还未执行迁移，需要先在 Supabase SQL Editor 中执行 `backend/migrations/202605230001_lovecompass_v1_core_schema.sql`。

第二步，在 Vercel 中创建前端项目，Root Directory 选择 `frontend`。当前前端 `vercel.json` 已配置 `NITRO_PRESET=vercel npm run build`，会生成 Vercel Build Output API 兼容的 `.vercel/output` 目录。将 `VITE_LOVECOMPASS_API_BASE_URL` 指向第一步得到的后端域名，并配置 Supabase 公开变量。部署成功后打开首页与结果页，确认网络请求指向后端 Vercel 域名而不是 `localhost`。

第三步，回到后端项目更新 `CORS_ORIGINS`，加入前端正式域名和需要保留的 Preview 域名。更新后重新部署后端，并在前端结果页触发一次 AI 报告生成，确认报告不再出现 `【智谱未配置】` 或 `【AI 占位回复】`。

## 当前无人值守进度

本轮已完成设计稿视觉恢复、本地真实接口联调、前端生产构建、后端语法检查和 API 抽样验收。前端已使用 `NITRO_PRESET=vercel npm run build` 验证可生成 `.vercel/output`，匹配 Vercel 对 Nitro/TanStack Start 的部署要求。由于当前环境没有 Vercel 登录态或 Token，`npx vercel whoami` 返回 `No existing credentials found`，我没有擅自创建或绑定 Vercel 生产项目；已先补齐可提交的一键部署配置和环境变量说明，便于你醒来后直接在 Vercel 控制台连接 GitHub 仓库部署。
