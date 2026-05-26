# MATE Lite × 双人匹配 · 拦截现状审计

> 用途：供 AI / 评审理解「Lite 双人能力」当前是前端藏按钮还是后端真拦截，以及 invite 链路实际行为。  
> 代码基准：lovecompass-sync @ 2026-05-27

---

## 结论（TL;DR）

- **不是「纯前端藏按钮」**，也 **不是「后端全链路堵死」** —— 两层都有，但都不完整。
- **主路径**（单人结果页 / invite 页 / 补充题）：前端 `coupleReportEligible()` 藏 UI。
- **写操作**（生成报告 / 绑伴侣 / 交补充题）：后端 `_assert_mate_couple_eligible()` 返回 **403**。
- **漏洞**：直访 couple URL、partner-code 深链开跑、已 completed 的 couple payload 读取 —— 后端入口未统一拦截。

---

## 1. 前端拦截（藏 UI / 提示）

### 1.1 核心函数

- 文件：`frontend/src/lib/coupleReport.ts`
- 函数：`coupleReportEligible(productId, suiteSlug)`
- 逻辑：`inferSuiteTier(suiteSlug) === "full"`，slug 含 `_lite` → `false`

### 1.2 各节点行为

| 路由 / 组件 | Lite 行为 |
|-------------|-----------|
| `/tests/mate`（Tier 选择） | Lite **仍可选**；仅显示 `tierSelectCoupleHint("mate","lite")` 一行小字提示，**未从 Tier 能力上移除双人** |
| `/result/mate/$id` · `MateResultView` | `canCoupleReport === false` → **不渲染**「邀请 TA / 补充题 / 关系码」区块；改显示 `CoupleReportUnavailableNotice`（升级 CTA） |
| `/mate/invite/$code` | 调 preview → `suiteTier === "lite"` → `liteBlocked=true` → **隐藏**性别选择与「开始测评」按钮；显示不可用说明 |
| `/mate/pair-supplement/$attemptId` | `singleRes.suiteTier === "lite"` → 设 error，**不进入答题** |
| `/result/mate/couple/$code` | **无 Lite 前置检查**；直接 `getMateCoupleReport()` |

### 1.3 单人结果页关键代码路径

```
MateResultView
  canCoupleReport = coupleReportEligible("mate", suiteSlug)
  relationCode && canCoupleReport     → 邀请 / 补充题 / 关系码 UI
  relationCode && !canCoupleReport    → CoupleReportUnavailableNotice（升级引导）
```

**注意**：Lite 用户 **仍会生成** `relationCode` 并写入 session/attempt；只是 UI 不展示邀请流程。

---

## 2. 后端拦截（403）

### 2.1 核心函数

- 文件：`backend/app/mate_router.py`
- 函数：`_assert_mate_couple_eligible(*attempts)`
- 条件：任一 attempt 的 suite_slug 推断为 `lite`
- 响应：`HTTP 403`，detail = `"MATE 双人匹配需完整版测评，快速版不支持生成双人报告"`

### 2.2 调用点（有硬拦截）

| 函数 | 时机 |
|------|------|
| `merge_and_store_couple_report` | GET `/mate/couple/{code}` 触发生成/刷新报告时 |
| `link_partner_to_session` | 伴侣 finalize 时绑定关系码 |
| `submit_pair_supplement` | POST 补充题 |

### 2.3 未拦截点（漏洞）

| 函数 / 路由 | 现状 |
|-------------|------|
| `create_relation_session` | Lite 发起人 **照常** 创建 session + 关系码 |
| `GET /mate/codes/{code}` | 只返回 `suiteTier`，**不 403** |
| `GET /mate/couple/{code}` | 若 `status=completed` 且 payload 已有 `verdict`，**直接返回缓存**，不再跑 `_assert` |
| 答题 submit（`main.py`） | 带 `partnerRelationCode` **不校验** 发起人是否 Lite；拦截推迟到 finalize → link |

---

## 3. Invite 链路（Lite 发起人 → 伴侣 B）

### 3.1 正常 UI 路径

1. B 打开 `/mate/invite/ROS-XXXX-XXXX` → 页面正常加载（HTTP 200，非 403）
2. `GET /mate/codes/{code}` → `suiteTier: "lite"`
3. 前端 `liteBlocked=true`
4. 显示关系码 + `CoupleReportUnavailableNotice`；**不渲染**「开始我的测评」
5. B **无法** 通过页面按钮进入答题

### 3.2 绕过 UI 的路径

1. 手动调用 `unlockProductForRun({ kind: "partner-code", code })`
   - 文件：`frontend/src/lib/productAccessFlow.ts`
   - **不拒绝** lite preview；仍可能解析出 `_lite` slug 并 `markPartnerMateAccess`
2. B 完成 lite 答题 → `finalize_attempt_background` → `link_mate_partner_to_session`
3. `_assert_mate_couple_eligible` 因 **发起人 attempt 为 lite** → **403**
4. 结果：B 可能白做一套题；session 无有效 partner 绑定；couple 页 GET → **409 等待伴侣** 或 merge 时 **403**

### 3.3 Couple 页最终表现

| 场景 | 结果 |
|------|------|
| 无 partner 绑定 | `409`「等待伴侣完成测评」→ 前端 waiting UI |
| 有 partner 但任一方 lite，触发 merge | `403` → `ApiErrorPanel` |
| 历史 session 已有 completed payload | **可能直接展示报告**（读路径未 re-assert） |

---

## 4. 推断表 vs 实测（纠正版）

| 节点 | 实测现状 | 产品期望（用户提出） | 差距 |
|------|----------|----------------------|------|
| Tier 选择 `/tests/mate` | Lite 可选 + 小字 hint | Lite 不展示双人能力 | ❌ 仅提示，未堵 Tier |
| 单人结果「邀请 TA」 | Lite 不渲染邀请区块，显示升级 notice | 不渲染邀请区块 | ✅ 基本符合（relationCode 仍生成） |
| `/mate/invite/:code` | 能开页；按钮藏；preview 不 403 | 入口堵死 | ⚠️ UI 半套，API 未拦 |
| B 做完题 → couple 页 | 409/403，非正常报告；缓存可读是洞 | 不应走到 | ⚠️ 多数拦截，非入口级 |

---

## 5. 两个关键问题的标准答案

### Q1：前端藏按钮还是后端真拦截？

**A：两层都有，都不完整。**

```
前端藏 UI：
  - MateResultView（邀请区块）
  - mate.invite（开始按钮）
  - pair-supplement（整页 error）
  - tests.mate tier hint（仅文案）

后端 403：
  - merge_and_store_couple_report
  - link_partner_to_session
  - submit_pair_supplement

未统一拦截：
  - create_relation_session
  - GET /mate/codes/{code}
  - GET /mate/couple/{code}（completed 缓存直出）
  - unlockProductForRun partner-code 路径
  - submit 带 partnerRelationCode
```

### Q2：Invite 链接（Lite 发起人）现在什么行为？

**A：**

- B **能打开** invite 页
- 看到关系码 + 「需完整版」说明
- **不能** 点「开始测评」（前端 `liteBlocked`）
- 后端 preview **不拒绝**
- 若 B 绕过 UI 用关系码跑完题 → finalize link **403**
- couple 页：**409 或 403**，不会正常出双人报告（除非历史 completed 缓存）

---

## 6. 建议改动清单（「正经堵死入口」）

优先级从高到低：

1. **`GET /mate/codes/{code}`** — lite initiator → **403**（invite 页无需靠 `liteBlocked`）
2. **`unlockProductForRun` partner-code** — preview lite → **throw**（防深链开跑）
3. **`GET /mate/couple/{code}`** — 读前对 initiator/partner attempts 跑 `_assert`（即使用缓存）
4. **`create_relation_session`** — lite initiator **禁止创建** couple session（或创建但不发 relationCode）
5. **Tier 选择页** — Lite 选项文案/能力描述去掉双人；或 Lite 根本不提 couple
6. **（可选）submit** — 带 partnerRelationCode 时提前校验 initiator tier

---

## 7. 关键文件索引

```
frontend/src/lib/coupleReport.ts              # coupleReportEligible
frontend/src/components/mate/MateResultView.tsx
frontend/src/routes/mate.invite.$code.tsx     # liteBlocked
frontend/src/routes/mate.pair-supplement.$attemptId.tsx
frontend/src/routes/result.mate.couple.$code.tsx  # 无 lite gate
frontend/src/lib/productAccessFlow.ts         # unlockProductForRun partner-code

backend/app/mate_router.py                    # _assert_mate_couple_eligible
backend/app/attempt_finalize.py               # link / create session
backend/app/main.py                           # submit + partnerRelationCode
```

---

*本文档由代码审计整理，供 AI 评审与改造规划使用。*
