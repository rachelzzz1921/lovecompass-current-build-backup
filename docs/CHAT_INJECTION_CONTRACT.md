# Chat 画像注入契约

避免「前端显示画像已就绪，但模型说接入不了」类回归。

## 单一入口

| 函数 | 职责 |
|------|------|
| `load_portrait_for_chat()` | 读 `profiles.portrait_cache`，miss 才 rebuild |
| `load_portrait_bundle()` | 每轮对话只 load 一次 portrait |
| `build_chat_messages()` | 唯一组装 OpenAI messages 的路径 |
| `ChatInjectionState` | 记录本轮是否注入 portrait/profile |
| `guard_chat_output()` | 已注入时剥离「尚未接入」类幻觉 |

## 注入规则（必须同时满足测试）

1. **有 completed 测评** → 必须有 `profile_block` 或 `portrait_layer` 之一进入 messages。
2. **无 attemptId** → 用 `build_portrait_aggregate_profile_block`，禁止 `profile_block = ""`。
3. **有 attemptId** → `profile_block` = 该套详情；`portrait_layer` = 其他套摘要。
4. **禁止** 在热路径调用 `rebuild_and_cache_portrait`（仅 `/chat/sync-profile` 与用户主动同步）。

## 性能

- 进入 `/chat`：`GET /chat/context` 用 cache 读 portrait（快）。
- 发消息：`build_chat_messages` 复用同一次 `load_portrait_for_chat`（不 rebuild）。
- Skill 文件：`load_counselor_skill` 进程内 LRU 缓存。

## SSE meta

```json
"injection": {
  "hasPortraitLayer": true,
  "hasProfileBlock": true,
  "hasCompletedTests": true,
  "profileReady": true,
  "boundProductSet": "ROS"
}
```

前端若 `profileBound && !injection.profileReady`，提示用户点「同步全部测评」。

## 前端加载顺序

`/chat` 须在 `useRequireAuth` 完成（`authed === true`）后再调用 `GET /chat/context`，否则会在无 token 时失败并误显示「没连上画像服务」。

## 回归测试

```bash
cd backend && python3 scripts/test_chat_messages.py
```
