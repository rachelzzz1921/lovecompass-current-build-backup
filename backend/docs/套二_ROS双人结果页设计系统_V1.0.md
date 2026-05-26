# ROS 套二双人结果页 · 完整设计系统 V1.0

> 与套二单人、套一 SELF 对齐：**Layer A 静态词库 → Layer B 分数映射 → Layer C AI 生成**

## 页面五区段

| 区段 | 代号 | 目的 | 前端组件 |
|------|------|------|----------|
| 一 | OVERVIEW | 情绪入口：天气、双视角、契合指数、感知差值、阶段 | `RosCoupleOverview` |
| 二 | COMPARE | 五层双轨对比 + 差距解读 + 答题证据 | `RosCoupleCompare` |
| 三 | BOND | 依恋碰撞（套一联动） | `RosCoupleBond` |
| 四 | SIGNAL | 双轨心跳线 + 分享 | `RosCoupleHeartbeat` |
| 五 | NEXT | AI 四卡 + 双人处方签 + CTA | `RosCoupleNext` |

编排入口：`frontend/src/components/RosCoupleResultView.tsx`

路由：`/result/ros/couple/{code}`

## Layer A · 静态词库

- 依恋碰撞：`ros_suite_spec_v2.json` → `attachment_collision_map`
- 层间追问：`backend/app/ros_couple_content.py` → `LAYER_PROBE`
- 碰撞建议：`BOND_ADVICE`（焦虑×回避等组合）
- 感知差值文案：`perception_gap_message` / `build_gap_text`

## Layer B · 分数映射（同步）

实现：`backend/app/ros_couple.py` + `backend/app/ros_couple_content.py`

| 输出 | 逻辑 |
|------|------|
| 双人契合指数 | 五层均值加权 − 层差>20 惩罚 |
| 感知差值 | \|你视角 − 对方视角\| + 绿/蓝/琥珀档位 |
| 层间 compare | `build_layer_compare(you_layers, ta_layers)` |
| 洞察四卡（兜底） | `build_couple_insights(...)` |
| 关系天气 | `resolve_weather(display, rk_avg)` |

## Layer C · AI 生成（异步 + 缓存）

实现：`backend/app/ros_couple_ai_content.py`

| 内容 | 生成方式 |
|------|----------|
| 层间答题证据 | 双方 attempt 答题行 → `you_evidence` / `ta_evidence` |
| 差距解读 AI | 可选 AI 覆盖 `gap_text`（最大差距层） |
| 洞察四卡 | strength / watch / advice / action |
| 双人处方签 | 确定性 + 可选 AI |
| highlights / bridge / shareLine | 可选 AI |

缓存表：`ros_couple_ai_pattern_cache`（migration `202605250004_ros_couple_ai_pattern_cache.sql`）

pattern_key = `{关系类型}:{依恋组合}:{你分数带}:{对方分数带}`

### 流水线

1. 伴侣完成 ROS → `finalize_attempt_background` → `merge_and_store_couple_report`（Layer B + 确定性 attach）
2. 同线程或 GET 时触发 `enhance_ros_couple_session_background`（`AI_PROVIDER=zhipu`）
3. `GET /ros/couple/{code}`：
   - 旧 payload（缺 layerCompare/perspectives）→ 自动 re-merge
   - 缺 ai_content / gap_evidences → attach 并写回
   - mode=deterministic → 后台 AI 升级
4. 前端 8s 静默刷新（deterministic → ai/cached）

## API 关键字段

```typescript
interface RosCouplePayload {
  perspectives: { you: { score, label }, ta: { score, label } }
  perceptionGap: { value, level, color, label, message }
  layerCompare: Record<layer, {
    you, ta, gap, gap_text, you_evidence?, ta_evidence?, probe_question
  }>
  bond: { name, combo, body, gap_reason, advice_you, advice_ta, self_unlocked }
  insights: { kind, title, body }[]
  ai_content: { mode, insights_list, layer_compare, gap_evidences, generated_at }
}
```

## 聊天 Prompt 5

`backend/app/ros_chat_layers.py`：检测「ROS 双人报告里的层间差距」预填 → 注入双人层间差距模式。

## 分享导出

- 双轨心跳 PNG：`drawDualHeartbeatShareCard`
- 双人处方签：`drawCouplePrescriptionShareCard`（长按）
- 契合指数卡片：`drawRosCoupleSummaryShareCard`
