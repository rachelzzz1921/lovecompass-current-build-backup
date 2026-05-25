# ROS 套二单人结果页 · 完整设计系统 V1.0

> 与套一 SELF V3.0 对齐的三层架构：**Layer A 静态词库 → Layer B 分数映射 → Layer C AI 生成**

## 页面四区段

| 区段 | 代号 | 目的 | 前端组件 |
|------|------|------|----------|
| 一 | NOW | 情绪锚定：关系天气、共鸣指数、九阶段 | `RelationshipWeatherHero` · `RosStageCurve` |
| 二 | HOW | 五维透视镜：手风琴 + 子维度 + 证据 + 问诊 | `RosFiveLayers` |
| 三 | SIGNAL | 心跳线可视化 + 盲区提示 | `RosHeartbeatLine` · `RosBlindSpot` |
| 四 | NEXT | AI 四卡 + 处方签 + 关系码邀请 | `RosResultNext` |

编排入口：`frontend/src/components/RosResultView.tsx`（PROFILE · ROS V1.0）

## Layer A · 静态词库

- 数据文件：`backend/data/ros_static_copy_v1.json`
- 构建脚本：`backend/scripts/build_ros_static_copy.py`
- 加载器：`backend/app/ros_static_copy.py`

包含：关系类型文案、九阶段描述、处方暖场、关系天气、维度档位、五层子维度定义、问诊追问问题。

## Layer B · 分数映射（同步）

实现：`backend/app/ros_scoring.py`

- 共鸣指数：原始加权 + display_adjustment 托底映射
- 关系天气：`resolve_weather(display_resonance, rk_score)`
- 九阶段 / 关系类型：现有 type_rules + stage_rules
- 处方复诊：`prescription_followup(rk, stage_id)`
- 输出字段：`result_payload.weather` · `result_payload.computed`

## Layer C · AI 生成（异步 + 缓存）

实现：`backend/app/ros_ai_content.py`

| 内容 | 生成方式 |
|------|----------|
| 五维答题证据 | 确定性（答题行推导）+ 可选 AI 增强 |
| AI 洞察四卡 | strength / watch / advice / action |
| 处方签主诉+建议 | 确定性 + 可选 AI |
| 盲区提示 | 自报分 vs 行为暗示分，gap≥15 触发 |
| 五层展开包 | subdims + probe + evidence |

缓存表：`ros_ai_pattern_cache`（migration `202605250003_ros_ai_pattern_cache.sql`）

流水线：
1. `POST /attempts` 提交 → `attach_ros_ai_content_to_payload(use_ai=False)` 写库
2. `AI_PROVIDER=zhipu` 时后台 `_enhance_ros_ai_background` 升级
3. `GET /ros/attempts/{id}/single` 补全 ai_content
4. 前端 8s 静默刷新（mode 从 deterministic → ai）

## API 数据结构

```typescript
interface RosSingleResultPayload {
  weather: { icon, label, sub }
  computed: { display_resonance, stage_index, highest_layer, ... }
  static_copy: { type, stage, layer_probe, ... }
  ai_content: {
    evidence: Record<AT|IN|CO|EV|RK, string>
    insights_list: { kind, title, body }[]
    prescription: { complaint, prescription_text, followup }
    blind_spot?: string
    layer_expansion: Record<layer, { subdims, probe_question, evidence_text }>
    mode: "deterministic" | "ai" | "cached"
  }
}
```

## Prompt 规范（Layer C）

与套一共用 `mirror-tone`：禁止裸低分、劝分；引用具体答题选项；正向包装。

五类 Prompt：① 五维证据 ② 洞察四卡 ③ 处方签 ④ 盲区 ⑤ 问诊追问回应（聊天流式，不缓存）

## 交互实现状态（P1 / P2）

| 交互 | 实现 |
|------|------|
| 问诊追问 sendPrompt | `rosLayerChatPrefill` → `/chat?prefill=…` |
| 如果对方来做 | 虚线框 + 邀请链接 + AI 差异 prefill |
| 心跳线视口搏动 | `useInView` + RK 颤抖 |
| 心跳线 PNG 分享 | `drawHeartbeatShareCard` 复制/下载 |
| 盲区展开 + 深聊 | 全文折叠 + `rosBlindSpotChatPrefill` |
| 处方签长按导出 | `useLongPress` + `drawPrescriptionShareCard` |
| 分享卡片对话框 | `RosShareCardDialog` |
| Prompt 5 聊天层 | `backend/app/ros_chat_layers.py` |

## 相关文档

- 测评体系：`backend/docs/套二_ROS关系测评体系_V2.0.md`
- 套一对照：`backend/docs/套一_SELF结果页设计系统_V3.0.md`
