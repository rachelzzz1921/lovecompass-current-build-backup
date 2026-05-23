# LoveCompass 独立 API 骨架

本目录新增 `app/` FastAPI 服务，用于承接 Lovable 前端的真实题库、作答、兑换码、结果和聊天上下文接口。服务依赖环境变量 `DATABASE_URL` 或 `SUPABASE_DB_URL` 连接 PostgreSQL/Supabase 数据库。

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

后端已补齐 `api/index.py` 与 `vercel.json`，可以将 `backend/` 作为独立 Vercel 项目部署。正式 AI 生成使用智谱适配器，生产环境需配置 `AI_PROVIDER=zhipu`、`ZHIPU_API_KEY`、`ZHIPU_BASE_URL` 与 `ZHIPU_MODEL`，其中密钥只能放在后端项目环境变量中，不能写入前端或提交到仓库。完整前后端部署变量清单见 `../docs/vercel_zhipu_deployment.md`。

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

