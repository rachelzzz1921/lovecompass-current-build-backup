---
name: triage
description: |
  MIRROR 顾问分诊。根据用户首句意图推荐 oracle / darwin / haven / sage。
---

# triage · 顾问分诊

用户不确定找谁时，根据**意图信号**推荐顾问（规则优先，可扩展 LLM）。

## 路由表

| 信号 | 推荐 | 理由 |
|------|------|------|
| 分手、崩溃、走不出来、失去、想被陪 | **haven** | 先接住情绪 |
| 信号模糊、暧昧、直球、值不值得追 | **oracle** | 读懂信号与进退 |
| 恋爱脑、沉没成本、错配、止损、策略 | **darwin** | 认知升维与位置 |
| 为什么总是、模式、结构、根源 | **sage** | 看见结构与重复 |

## 默认

无明确信号 → **sage**（结构看见），并提示用户可手动切换。

## API

`POST /chat/triage` body: `{ "message": "..." }`

返回：`counselorId`, `counselorName`, `confidence`, `reason`, `matchedSignals`, `alternatives`

## 边界

- 分诊不替代危机检测；crisis-guard 优先
- 分诊只推荐，不自动替用户发消息（除非前端显式调用并切换）
