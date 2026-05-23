# Supabase 密钥接入状态与缺口

作者：**Manus AI**  
日期：2026-05-23

## 一、已完成的安全处理

本轮已按用户要求完成 Supabase 环境变量边界调整。前端只读取公开级别的 Supabase URL 与 anon/publishable key，后端本地 `.env` 才允许保存服务端 secret。前后端 `.gitignore` 均已确认包含 `.env`，真实密钥不会进入源码、文档附件或公开仓库。

| 配置项 | 当前处理方式 | 是否可进前端 | 备注 |
|---|---|---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 前端公开变量，当前仍待补真实 URL | 是 | 只包含项目 URL，不是密钥 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 前端公开变量，本地 `.env` 已配置用户提供的 publishable key | 是 | 只用于浏览器端公开访问，受 RLS 保护 |
| `SUPABASE_SERVICE_ROLE_KEY` | 后端服务端变量，本地 `.env` 已配置用户提供的 secret key | 否 | 只允许服务端使用，严禁进入浏览器代码 |
| `DATABASE_URL` | 后端数据库连接串，当前仍待补 | 否 | 真库迁移与题库导入必须依赖它 |

## 二、仍缺少的信息

用户这次提供的是 Supabase API key，但还缺少 **Supabase 项目 URL** 与 **PostgreSQL 数据库连接串**。因此目前可以完成密钥边界、代码读取规则和模板整理，但还不能执行真实数据库迁移或题库导入。

| 缺口 | 示例格式 | 用途 |
|---|---|---|
| Supabase URL | `https://YOUR_PROJECT_REF.supabase.co` | 前端登录、浏览器端 Supabase client、后端管理 client 都需要 |
| DATABASE_URL | `postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres` | 后端迁移、导入题库、FastAPI 直连 PostgreSQL |

## 三、当前代码边界

前端 `src/integrations/supabase/client.ts` 与认证中间件已调整为优先兼容 `NEXT_PUBLIC_SUPABASE_*` 命名，同时保留 `VITE_*` 与 Lovable 原命名。服务端 `client.server.ts` 只从服务端环境读取 `SUPABASE_SERVICE_ROLE_KEY`，不会把 secret 暴露给浏览器。

后续一旦补齐 `NEXT_PUBLIC_SUPABASE_URL` 与 `DATABASE_URL`，即可继续执行数据库迁移、题库导入和 Supabase Auth/RLS 联调。
