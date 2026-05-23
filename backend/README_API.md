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

