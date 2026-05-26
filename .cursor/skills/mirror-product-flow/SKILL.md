---
name: mirror-product-flow
description: >-
  MIRROR 三套题（SELF / ROS / MATE）入口、兑换、答题、分析、结果跳转的唯一规范。
  修改 productRegistry、accessGate、productAccessFlow、productFlow、tests.*、ros.start、access
  路由或 sessionStorage 解锁逻辑时必读。
---

# MIRROR 产品动线 Skill

## 单一真相源（按优先级）

| 模块 | 路径 | 职责 |
|------|------|------|
| 流程配置 | `frontend/src/lib/productRegistry.ts` | 每套 entryPath、redeemLanding、tier、slug |
| 声明式步骤 | `frontend/src/lib/productFlow/flowGraph.ts` | auth → redeem → rosStage → run → analyze |
| 编排引擎 | `frontend/src/lib/productFlow/productFlowEngine.ts` | **所有跳转决策** |
| Session | `frontend/src/lib/productFlow/productSessionStore.ts` | tier / gender / suite / redemption 读写 |
| 解锁底层 | `frontend/src/lib/accessGate.ts` | slug 级 access + redemptionEventId |
| 兑换辅助 | `frontend/src/lib/productAccessFlow.ts` | API 兑换、unlockProductForRun |
| 结果路由 | `frontend/src/lib/resultRoutes.ts` | 提交完成后 result / analyzing |

## 用户旅程

```text
首页 CTA → 入口页 (/tests/$id 或 /ros/start)
         → [需登录] /auth
         → [需兑换] /access
         → 答题 /tests/$suiteSlug/run
         → /analyzing → /result/*
```

## 三套差异

| 产品 | 入口 | 兑换落地 | Lite 免费 | 特殊步骤 |
|------|------|----------|-----------|----------|
| SELF | `/tests/self` | tests-entry | 是 | 无 |
| ROS | `/ros/start` | ros-start | 否 | unlock → stage → setup |
| MATE | `/tests/mate` | tests-entry | 否 | 无 |

## Session 键约定

| 键 | 含义 |
|----|------|
| `access:${suiteSlug}` | slug 已解锁（lite/full 互认写两份） |
| `redemption:${suiteSlug}` | 兑换事件 ID（提交必填，套一 lite 除外） |
| `suite:${productId}` | 当前选用的 suite slug |
| `${productId}:tier` | `lite` \| `full` |
| `{product}:gender` key | 见 registry `genderStorageKey` |
| `ros:partnerCode` | 伴侣关系码（免兑换） |
| `ros:stageUi` / `ros:tier` | ROS 阶段与 tier UI 状态 |

## 硬规则（禁止违反）

1. **禁止**在 `routes/*.tsx` 内直接 `nav({ to: "/access" ... })` 或手写 redirect 字符串 — 使用 `productFlowEngine` 返回的 `ProductFlowRoute`。
2. **禁止**仅用 `access:${productId}` 判断付费套已解锁；必须用 `hasRedeemableSuiteAccess(productId, suiteSlug)`。
3. **禁止** lite 兑换后跑 full slug（或反之）而不经过 `compatibleSuiteSlugs` / `suites_redemption_compatible`。
4. 改 flow 必须跑验收脚本（见下）并在 PR 描述里列出受影响路径。

## 改代码检查清单

- [ ] 跳转是否只经过 `productFlowEngine`？
- [ ] tier / gender 切换是否调用 `clearProductUnlock` 或 `productSessionStore.clearUnlock`？
- [ ] ROS 是否仍走 `/ros/start` 而非 `/tests/ros`？
- [ ] 首页 CTA 是否用 `hasRunnableProductAccess`（非粗粒度 `hasProductAccess(id)`）？
- [ ] 后端 lite/full 是否仍兼容（`backend/app/suite_tier.py`）？

## 验收命令

```bash
# API 矩阵：3 产品 × lite/full × 兑换 + 提交 + 结果
cd backend && LOVECOMPASS_API_BASE=https://lovecompass-api-backend.vercel.app \
  python3 scripts/validate_all_suite_flows.py

# Lite 专项（旧脚本，仍可用）
cd backend && LOVECOMPASS_API_BASE=https://lovecompass-api-backend.vercel.app \
  python3 scripts/validate_lite_suites.py

# 前端 engine 单测
cd frontend && npm run test:flow

# 本地预览
cd frontend && npm run dev:preview
# → http://localhost:5173 （勿用 127.0.0.1，CORS）
```

## 本地手测矩阵

| 场景 | 路径 | 期望 |
|------|------|------|
| SELF lite 免费 | `/tests/self` → 开始 | 直达 run，无需兑换 |
| SELF full | 万能码 MIRROR-ALL-ACCESS | access → run → analyzing |
| ROS lite | `/ros/start` 三步 | 兑换 → 阶段 → run |
| MATE full | `/tests/mate` | 未兑换跳 access |
| 乱序切换 | 入口页 QuestionOrderToggle | run 页同步 presentation |

测试前清 `sessionStorage` 或用无痕窗口。

## 常见故障

| 症状 | 原因 | 修复方向 |
|------|------|----------|
| 已登录但 run 页踢回 access | redemptionEventId 丢失 | 重新 verify；检查 markProductAccess |
| ROS 入口循环 | 跳过 unlock 或 slug 未写入 | ros.start 走 unlockProductForRun |
| lite 提交 400 兑换不匹配 | 后端未部署 suite_tier | 部署 lovecompass-api-backend |
| 首页显示已解锁但 full 进不去 | 用了 access:mate 粗粒度 | productRoutes tier-aware |
