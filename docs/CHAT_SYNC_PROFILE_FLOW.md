# 「同步全部测评到 AI」按钮链路

## 用户可见入口

| 位置 | 按钮文案 | 行为 |
|------|----------|------|
| `/chat` 左侧 CONTEXT | **同步全部测评到 AI** | 主路径（本文） |
| `/history` 我的档案 | **同步** | 仅刷新 `GET /profile/portrait?refresh=1`，不写聊天缓存 |

## 主链路（聊天页）

```text
用户点击「同步全部测评到 AI」
  → frontend: lovecompassApi.syncChatProfile()
  → POST /chat/sync-profile  (Bearer JWT, 超时 90s)
  → backend: build_chat_profile_bundle(refresh=True)
       → rebuild_and_cache_portrait()  // 扫 completed attempts + 写 profiles.portrait_cache
       → 返回 profile / context / acknowledgment
  → 前端更新左侧 CONTEXT + 对话里插入确认条
  → 之后 POST /chat/message 会 load_portrait_for_chat() 读缓存并注入 LLM
```

## 与「问 AI」的区别

- 结果页 **问 AI** → 跳转 `/chat?attemptId=…&analystId=…`，只拉 `GET /chat/context`（`refresh=false`，读缓存）
- **同步按钮** → 强制 `refresh=true` 重建缓存，聊天才能用到最新交卷结果

## 常见失败原因

| 现象 | 原因 | 处理 |
|------|------|------|
| `请求超时` / AbortError | 前端默认 20s 太短（已改为 90s） | 拉最新前端；等待后重试 |
| `需要登录` / 401 | token 未就绪或过期 | 重新登录后再点同步 |
| `无法连接后端 API` | API 地址 / 镜像 / CORS | 查 `VITE_LOVECOMPASS_API_*` |
| `画像同步失败：…` | 后端 500（DB、迁移） | 看 Vercel 日志与 `DATABASE_URL` |
| 同步成功但顾问仍说未接入 | 未发消息或 injection 为 false | 同步后再发一条；看 SSE `meta.injection.profileReady` |

## 自检

```bash
cd backend
python3 scripts/verify_chat_profile_injection.py
# 需 .env 中 DATABASE_URL

# 带鉴权联调（本地替换 user_id）
python3 -c "
from fastapi.testclient import TestClient
from app.main import app
from app.auth import resolve_user_id
# app.dependency_overrides[resolve_user_id] = lambda: '<uuid>'
# print(TestClient(app).post('/chat/sync-profile').json())
"
```
