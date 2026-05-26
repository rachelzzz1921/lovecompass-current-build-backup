# LoveCompass 独立 API 骨架

本目录新增 `app/` FastAPI 服务，用于承接 Lovable 前端的真实题库、作答、兑换码、结果和聊天上下文接口。服务依赖环境变量 `DATABASE_URL` 或 `SUPABASE_DB_URL` 连接 PostgreSQL/Supabase 数据库。

写操作与历史记录接口需要 `Authorization: Bearer <supabase_access_token>`。服务端用 `SUPABASE_JWT_SECRET` 校验 JWT；本地可设 `LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK=true` 在无 token 时回退到 `LOVECOMPASS_DEMO_USER_ID`。

## 启动

```bash
pip install -r requirements.txt
DATABASE_URL='<DATABASE_URL>' uvicorn app.main:app --reload --port 8000
```

前端设置：

```bash
VITE_LOVECOMPASS_API_BASE_URL=http://localhost:8000
```

## Vercel 与智谱部署

后端业务在 `app/main.py`。Vercel **FastAPI 框架模式**通过 `pyproject.toml` 的 `tool.vercel.entrypoint` 部署，**不要**在 `vercel.json` 里写 `functions.api/*`（会与框架模式冲突）。`maxDuration` 请在 Vercel 项目 Settings → Functions 里设为 60s。正式 AI 生成使用智谱适配器，生产环境需配置 `AI_PROVIDER=zhipu`、`ZHIPU_API_KEY`、`ZHIPU_BASE_URL` 与 `ZHIPU_MODEL`，其中密钥只能放在后端项目环境变量中，不能写入前端或提交到仓库。完整前后端部署变量清单见 `../docs/vercel_zhipu_deployment.md`。

## 已实现端点

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/health` | 健康检查 |
| GET | `/tests/{suite_slug}/questions` | 返回隐藏评分细节后的题型 UI 契约 |
| POST | `/redemption/verify` | 验证兑换码并返回 `redemptionEventId` |
| POST | `/attempts` | 保存答案、生成基础评分与真实 `attemptId` |
| GET | `/attempts/{attempt_id}/result` | 返回结果页读取的 attempt 数据 |
| POST | `/attempts/{attempt_id}/report` | 生成或读取 AI 深度画像故事，写入 `ai_result_reports` 并回填 `test_attempts.ai_report` |
| POST | `/chat/message` | 预留带 `attemptId` 的 AI 分析师对话入口 |

## 管理后台 API（需 `profiles.role = admin`）

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/admin/me` | 校验管理员身份 |
| GET | `/admin/stats` | 运营概览统计 |
| GET | `/admin/suites` | 测试套件列表 |
| GET | `/admin/redemption/codes` | 兑换码列表（筛选/分页） |
| POST | `/admin/redemption/codes` | 批量生成兑换码 |
| PATCH | `/admin/redemption/codes/{id}` | 启停/更新兑换码 |
| GET | `/admin/redemption/events` | 兑换记录 |
| GET | `/admin/users` | 用户列表 |
| GET | `/admin/users/{id}` | 用户详情 + 测试/兑换 |
| GET | `/admin/monitor/live` | 实时快照（测评/双人关系码/兑换，15s 轮询用） |
| GET | `/admin/attempts` | 测试记录列表 |
| GET | `/admin/analysts` | AI 顾问列表 |
| GET | `/admin/analysts/{slug}` | 顾问详情 |
| PATCH | `/admin/analysts/{slug}` | 更新顾问配置 |

前端管理页：`/admin`（概览）、`/admin/monitor`（实时监控）、`/admin/attempts`（测评记录）、`/admin/codes`、`/admin/users`、`/admin/analysts`。

开通管理员：在 Supabase SQL Editor 执行 `UPDATE public.profiles SET role = 'admin' WHERE email = '你的邮箱';`

