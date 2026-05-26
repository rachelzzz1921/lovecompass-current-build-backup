# LoveCompass Current Build Backup

本仓库是 LoveCompass 当前开发状态的 GitHub 备份。它采用单仓库结构保存前端、后端、数据库迁移、数据导入脚本与关键交付文档。

## 目录结构

| 路径 | 内容 |
|---|---|
| `frontend/` | LoveCompass 前端源码。已排除 `node_modules`、`dist` 等可再生成产物。 |
| `backend/` | LoveCompass 后端源码、迁移、题库 JSON、导入脚本与联调脚本。已排除本地 `.env`。 |
| `docs/deliverables/` | 历次交付说明与关键方案文档。 |
| `docs/WORK_LOG_20260523.md` | 从本轮任务开始至 Supabase 真库迁移联调完成的工作日志。 |
| `docs/BACKUP_MANIFEST_20260523.md` | 本次 GitHub 备份范围、排除项与恢复说明。 |

## 安全说明

本仓库不应包含真实 Supabase service role、数据库连接串、OpenAI Key 或任何生产密钥。真实运行环境需要在部署平台或后端本地 `.env` 中单独配置。

## 本地开发

**全链路本地（推荐）：** 见 **[docs/LOCAL_DEV.md](docs/LOCAL_DEV.md)** — `./scripts/dev-local.sh` 一键启动前后端。

## Vercel 部署

使用现有 Supabase 项目 `wjfpglsygkbpubanylug`，不新建数据库。完整步骤与环境变量见 **[docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)**。
