# 套一 · SELF 结果页 · 完整设计系统 V3.0

> **产品名**：SELF 自我关系模式 · 套一  
> **版本**：V3.0（三幕叙事 + 三层内容生产 + 五段 AI Prompt）  
> **机器可读规范**：[`frontend/src/data/selfSuiteSpec.ts`](../../frontend/src/data/selfSuiteSpec.ts)  
> **共用词库**：[`../data/analysis_phrase_library_v1.json`](../data/analysis_phrase_library_v1.json)  
> **语气层 Skill**：[`.cursor/skills/mirror-tone/SKILL.md`](../../.cursor/skills/mirror-tone/SKILL.md)  
> **前端实现入口**：[`frontend/src/components/SelfResultView.tsx`](../../frontend/src/components/SelfResultView.tsx)  
> **结果映射**：[`frontend/src/lib/mapAttemptToSelfResult.ts`](../../frontend/src/lib/mapAttemptToSelfResult.ts)  
> **关联文档**：[`三套题分析话术与词库复用指南.md`](./三套题分析话术与词库复用指南.md)

---

## 0. 设计目标与全局约定

### 0.1 核心转变

| V2（现状） | V3（目标） |
|---|---|
| 5 个平级 Tab 功能堆砌 | **三幕叙事 + 渐进揭晓** 的故事流 |
| Hero 直接展示类型名 | Hero 展示**依恋类型**；红楼人格**独立仪式揭晓** |
| 静态 fallback 文案为主 | **Layer A/B 同步 + Layer C 异步 AI** 三层内容生产 |
| 雷达 + 长条维度 | 双轨雷达 + **档案卡** + 轴点击联动 |
| AI 洞察为 Tab 之一 | AI 洞察升级为 **ACT III 分析师报告** 区块 |
| 复制链接分享 | **分享卡片 Canvas** + 套间 Cross-sell |

### 0.2 与全局约定的对齐（必读）

1. **Hero 主结果 = 依恋类型**，不是红楼人物名（见 `resolvePrimaryAttachmentType`）。
2. **红楼人格**仅在 ACT II 揭晓，揭晓前 UI 为模糊剪影 + CTA。
3. **分数展示**走五档描述性语言（`scoreDisplaySummary` / `sharedScoreBands`），禁止裸分伤人。
4. **SA2/SA3** 已在题目层反向，后端 `dimension_scores` 越高 = 越安全，前端勿再取补数。
5. **AI 全文**注入 `tonePrinciples` + `forbiddenOutputs`，与四位顾问共用 mirror-tone。
6. **套间解锁区**复用 `SuiteCrossSell` / `SuiteUpgradeBanner`，置于 CODA 尾声。

### 0.3 叙事结构总览

```
序幕  OVERTURE   ──  情绪冲击，一眼锚定身份
第一幕 ACT I     ──  数据说服，理性理解自己
第二幕 ACT II    ──  仪式揭晓，情感共鸣高峰
第三幕 ACT III   ──  行动指引，从「我是谁」到「我能怎样」
尾声  CODA       ──  解锁钩子 + 传播出口
```

页面为**纵向滚动单页**，非 Tab 切换主导；ACT I 内部保留子视图横向切换。

---

## 一、交互架构 · 分幕详设

### 1.1 序幕 OVERTURE · 全屏 Hero

**设计目标：** 3 秒内让用户感到「被看见」，产生截图分享欲。

#### 视觉层次

```
[顶部] SET · 01 / SELF          PROFILE · V1.0

[中央核心]
        「你的依恋类型」← 小胶囊标签，有边框

        焦 虑 型 依 恋          ← 主标题，48px，渐入
        SELF-02 · SENSITIVE LOVER  ← 副标题，等宽字体

        ╭──────────────╮
        │      74      │  ← 分数球（ScoreOrb），带动态进度环
        │  OVERALL     │     进度环动画：0→74
        │   INDEX      │     颜色：按依恋类型映射渐变
        ╰──────────────╯

        「你的敏感是天赋，不是缺陷——
         你只是比任何人都更把感情当真。」
         ← 一句话 tagline，带引号，14px，有呼吸感

[底部] ▼ 探索你的画像  ← 滚动引导，缓慢上下浮动动画
```

#### 动画时序（页面进入）

| 时间 | 效果 |
|---|---|
| 0ms | 背景粒子/网格浮现（可选 Petals / 网格） |
| 200ms | 小标签从上方淡入 |
| 400ms | 主标题字母逐个出现（stagger 30ms/字） |
| 600ms | 副标题淡入 |
| 800ms | 分数球出现，进度环动画开始 |
| 1200ms | tagline 逐字出现 |
| 1600ms | 滚动引导出现 |

#### 趣味交互

| 交互 | 触发 | 效果 |
|---|---|---|
| 长按分数球 | long-press 600ms | 弹出「分数是怎么算出来的？」气泡，展示 SA1–SA6 各项贡献值 |
| 点击滚动引导 | click | smooth scroll 到 ACT I 锚点 |

#### 数据绑定

```typescript
// Hero 字段来源
archetype.badge      → "你的依恋类型"
archetype.name       → resolvePrimaryAttachmentType()  // 焦虑型依恋，非林黛玉
archetype.code       → SELF-0X · ENGLISH_CODE
archetype.tagline    → Layer A static_copy.types[character].tagline
overallScore         → scores.overall 或六维加权
```

#### 依恋类型 → 视觉 token

| 依恋类型 | Hero 渐变 | 进度环色 |
|---|---|---|
| 焦虑型 | violet → rose | `oklch(0.68 0.18 285)` → `oklch(0.72 0.18 360)` |
| 安全型 | cyan → violet | `oklch(0.82 0.14 200)` → `oklch(0.68 0.18 285)` |
| 回避型 | slate → cyan | `oklch(0.55 0.08 250)` → `oklch(0.82 0.14 200)` |
| 混合型 | rose → amber | `oklch(0.72 0.18 360)` → `oklch(0.82 0.14 75)` |
| 高边界安全型 | amber → slate | `oklch(0.82 0.14 75)` → `oklch(0.55 0.08 250)` |
| 低自我高投入型 | rose → violet | `oklch(0.72 0.18 360)` → `oklch(0.68 0.18 285)` |

---

### 1.2 第一幕 ACT I · 三面镜「了解自己」

**设计改变：** 原 5 Tab 中的 traits / radar / scenes → 合并为单一区块「了解自己」，内置 3 个子视图。

#### 子 Tab 文案（情绪化）

| 原 Tab | V3 子视图 |
|---|---|
| 核心特质 | **你的特质** |
| 六维画像 | **你的画像** |
| 行为模拟 | **你会怎样** |

区块标题：`// ACT I · 了解自己`  
锚点 id：`#act-i`

---

#### 1.2.1 子视图一：你的特质

3 张「证据式」特质卡——每张直接引用用户答题数据。

```
┌────────────────────────────────────┐
│  [图标]  你的感知雷达全天候在线      │
│                                    │
│  「他两小时没回消息」那题，你选了    │  ← 引用具体答题
│  「开始回想最近有没有说错什么」——    │
│  这不是多心，是你的感知系统比        │  ← 解读
│  别人灵敏一倍。                     │
│                                    │
│  ████████░░  82分  SA2得分        │  ← 维度来源（内部分析用，用户侧优先描述性语言）
│                      [答题依据 ↗]  │
└────────────────────────────────────┘
```

**证据标签互动**

- 右上角 `答题依据 ↗` → 展开 Sheet/Drawer
- 内容：该特质对应的 2–3 道原题 + 用户选项 + 题目简称
- 数据来源：`attempt_answers` 表 + 题库 JSON `question_id`

**Layer 分工**

| 内容 | Layer |
|---|---|
| 卡片标题、icon | Layer C（AI Prompt 1）或 Layer A fallback |
| 引用答题句式 | Layer C 必须 |
| 维度标注 | Layer B |
| AI 未就绪时 | Layer A 按 attachment 类型的 generic 3 条（现有 `core_traits` fallback） |

**Trait 数据结构扩展**

```typescript
type CoreTraitV3 = CoreTrait & {
  gift_line?: string;
  source_dimension?: SelfDimensionCode;
  evidence?: Array<{
    question_id: string;
    question_short: string;
    chosen_label: string;
  }>;
};
```

---

#### 1.2.2 子视图二：你的画像

**双轨雷达图**

| 轨道 | 含义 | 样式 |
|---|---|---|
| 外轨（虚线） | 该红楼类型的「平均画像」 | `archetype_profile.radar_baseline` |
| 内轨（实线填充） | 用户实际得分 | `dimensions[].value` |
| 差距区域 | 个性差异高亮 | 两轨差值 > 15 的轴 |

**交互**

- 点击雷达某轴 → 下方维度档案卡 scrollIntoView
- 实现：扩展 `RadarChart` 增加 `onAxisClick` + `baseline` prop

**维度详情 · 档案卡**

```
┌──────────────────────────────────┐
│ SA2  依恋焦虑                     │
│ ──────────────────────────────   │
│ 你在这段旅途里的位置              │
│                                  │
│ [低焦虑]●──────────○[高焦虑]     │  ← 位置指示条（scoreDirection 决定标签方向）
│                                  │
│ 「你对关系里细微变化的感知力       │
│  极强——这是你的礼物，              │
│  也是你需要照顾的部分。」          │
│                                  │
│ 底层逻辑 SA2测的是…  ▽           │  ← 可展开 coreQuestion
│                                  │
│  [「这个维度跟我聊聊」↗]          │
└──────────────────────────────────┘
```

**维度对话**

- 按钮触发 `navigate({ to: '/chat', search: chatRouteSearch({ prompt, attemptId }) })`
- prompt 模板：`我想聊聊我的「{dimensionLabel}」维度。我的测试显示{displaySummary}。`
- 禁止在 prompt 里裸传分数，传描述性摘要

---

#### 1.2.3 子视图三：你会怎样

3 个场景升级为「沉浸式情景剧」，水平滑动切换（非纵向堆叠）。

```
┌──────────────────────────────────┐
│  01  ·  第一次见面               │
│                                  │
│  [情景插画 · SVG 线条抽象]        │
│                                  │
│  你会先感受气场，                  │
│  再决定打不打开自己               │
│                                  │
│  （叙事体 body …）                │
│                                  │
│  ─────────────────────────────   │
│  「感知优先，安全再开放」          │  ← resonance 锚点
│                                  │
│  [完全是我 ✓]    [不太准 ✗]      │
└──────────────────────────────────┘
```

**场景回响**

| 按钮 | 效果 | 数据 |
|---|---|---|
| 完全是我 ✓ | 粒子动画 + toast | `scene_resonance` 事件，value=1 |
| 不太准 ✗ | 打开微对话 Sheet | 触发 Prompt 5，记录反馈 |

**Layer 分工**

- 静态：`BEHAVIORS_BY_ATTACHMENT` 或 `static_copy.scenes[character]`
- 个性化：Layer C 可选覆盖 body

---

### 1.3 第二幕 ACT II · 红楼揭晓

**独立区块**，非 Tab。视觉分界线：

```
── ── ── ── ── ── ── ── ── ── ── ──
      · 数据已经说完了 ·
      现在，换一种语言
── ── ── ── ── ── ── ── ── ── ── ──
```

锚点 id：`#act-ii`

#### 揭晓前

- 模糊剪影（3 个 `?` 人物轮廓）
- 主 CTA：`✦ 揭晓我的红楼人格`
- 禁止在揭晓前展示 `character.name`

#### 揭晓动画（全屏 overlay）

| 时间 | 效果 |
|---|---|
| 0ms | 深色遮罩淡入 |
| 300ms | 中心光晕扩散 |
| 600ms | 人物名放大出现（衬线体，金色） |
| 800ms | 拼音淡入 |
| 1000ms | 定语「焦虑型 · 深情敏感者」 |
| 1200ms | archetype_line 逐字显示 |
| 1800ms | 「查看详细解读 →」按钮 |

点击后：遮罩翻页收起 → 下方展开人物详解（保留在页面流中，非 Tab）。

#### 揭晓后 · 人物详解

```
· 你的人格原型 ·

林黛玉
LIN DAIYU · 焦虑型 · 深情敏感者

「她不是不够好——她只是把感情看得比任何人都重。」

── 为什么你是她 ──
[理由1] 同样的「感知过载」 …
[理由2] 同样的「确认需要」 …（可 highlight）
[理由3] 同样的「深情真实」 …

── 最适合你的伴侣类型 ──
┌──────────┐┌──────────┐┌──────┐
│ 最高匹配 ││          ││      │
│ 薛宝钗型 ││贾探春型  ││北静王│
│   92%   ││   78%   ││ 71% │
└──────────┘└──────────┘└──────┘
```

**人格配对深探**

- 点击匹配卡 → Accordion 展开 `match_combos["林黛玉×薛宝钗"]`
- 数据来源：`MATCH_BY_ATTACHMENT` + 静态词库 36 组合

**12 人物 × 6 依恋映射**

见 `selfSuiteSpec.ts` → `ATTACHMENT_BY_CHARACTER`、`CHARACTER_EMOJI`。

---

### 1.4 第三幕 ACT III · 看见方向

AI 洞察升级为「分析师报告」风格，4 张固定角度卡片 + 时光机模块。

锚点 id：`#act-iii`

#### 四卡结构

| kind | 标题 | 图标 | 数据来源 |
|---|---|---|---|
| strength | 你的高光 | ↑ TrendingUp | 最高维 + Layer C |
| watch | 可以温柔留意 | ○ AlertCircle | 最低维 + 正向包装 |
| match | 最适合你的关系模式 | ♥ Heart | 类型 + 分数 |
| growth | 下一段关系里 | → Compass | 可操作建议 |

区块标题：`// AI 分析师摘要`  
Tier 标签：`BASIC`（lite 卷）/ `FULL`（完整卷）

**加载态**

- AI 未就绪：骨架屏 + 「分析师正在整理你的报告…」
- 失败：fallback 到 `mapAttemptToSelfResult` 现有规则生成 4 条

**深度报告解锁**

- CTA：`解锁完整深度报告 →`
- 触发 Prompt 3，流式 Markdown（复用 `AiReportSection`）
- lite 卷：仅 4 卡 + 截断 teaser

#### 时光机模块

```
// 如果是三年后的你

你的 SA2 依恋焦虑如果降低 15 分，
你会从「林黛玉型」变成「史湘云型」。

这意味着：
· 你不再需要那么多确认
· 你能更快从冲突中恢复
· 你给的爱会更轻盈

[查看成长路径 →]  [找AI分析师]
```

**映射规则**（Layer B 预置 + Layer C 个性化描述）

```typescript
// GROWTH_PATHS 示例
{
  "林黛玉": { target: "史湘云", key_dimension: "SA2", delta: 15, changes: [...] },
  "妙玉":   { target: "柳湘莲", key_dimension: "SA3", delta: 12, changes: [...] },
  // … 12 类型各一条主路径
}
```

---

### 1.5 尾声 CODA · 解锁 + 传播

锚点 id：`#coda`

```
── 解锁更深层 · UNLOCK DEEPER ──

┌──────────────────────────────────┐
│  🔒 SET·02 / ROS — 这段关系的画像  │
└──────────────────────────────────┘
┌──────────────────────────────────┐
│  🔒 SET·03 / MATE — 你的择偶坐标  │
└──────────────────────────────────┘

[找AI分析师聊聊]    [生成分享卡片]
```

**分享卡片（Canvas 1080×1440，小红书比例）**

```
┌────────────────────────────────┐
│  MIRROR · 关系画像             │
│  林黛玉 / 焦虑型依恋 / SELF-02 │
│  tagline 一句话                │
│  # 高敏感  # 深情  # 把爱当真  │
│  SA6 投入健康度 ████████░░     │
│  mirror.app                    │
└────────────────────────────────┘
```

导出：`canvas.toBlob` → 下载或 Web Share API。

---

## 二、内容生产策略 · 三层架构

### 2.1 架构总览

```
Layer A  静态词库     按 type/attachment key 调取，CDN 永久缓存
Layer B  分数映射     按分区间同步计算，可预生成
Layer C  AI 实时生成   异步 + pattern 缓存，用户滑到时 Ready
```

### 2.2 Layer A · 静态词库

**何时用：** 固定文案、类型描述、场景叙事——与具体用户无关，只和「类型/人物」有关。

**存储建议：** `backend/data/self_static_copy_v1.json`（新建，与 `analysis_phrase_library_v1.json` 互补）

```javascript
const STATIC_COPY = {
  types: {
    "林黛玉": {
      gender: "female",
      attachment_type: "焦虑型",
      code: "SELF-02 · SENSITIVE LOVER",
      tagline: "你的敏感是天赋，不是缺陷——你只是比任何人都更把感情当真。",
      archetype_line: "她不是不够好——她只是把感情看得比任何人都重。",
      quote: "在一个真正懂她的人眼里，这是最珍贵的事。",
      gift_desc: "你是感情里最认真的那种人…"
    }
    // × 12 人物
  },
  scenes: {
    "林黛玉": {
      "第一次见面": { title, body, resonance },
      "发生冲突时": { … },
      "喜欢一个人时": { … }
    }
    // 6 attachment × 3 scenes 或 12 character × 3 scenes
  },
  match_combos: {
    "林黛玉×薛宝钗": { title, body, pct: 92 }
    // 36 组合（6×6 主匹配矩阵）
  },
  character_reasons: {
    "林黛玉": [
      { title: "同样的「感知过载」", body: "…", highlight?: true }
      // × 3
    ]
  }
};
```

**与现有代码关系**

| 现有 | V3 迁移 |
|---|---|
| `BEHAVIORS_BY_ATTACHMENT` | 迁入 `static_copy.scenes` 或保留 TS 作 fallback |
| `MATCH_BY_ATTACHMENT` | 保留 pct/tagline；深探文案进 `match_combos` |
| `positiveFramingForAttachment` | 已在 `analysis_phrase_library_v1.json` |

---

### 2.3 Layer B · 分数映射

**何时用：** 维度解读、档位描述——与具体分数有关，不需要 AI。

```javascript
const DIMENSION_COPY = {
  SA1: {
    ranges: [
      { min: 0, max: 30, label: "…", detail: "…" },
      // 五档，与 sharedScoreBands 一致
    ],
    position_labels: { low: "低自我价值感", high: "高自我价值感" }
  },
  SA2: { /* reverse 展示：分数高=低焦虑 */ },
  SA3: { /* reverse 展示：分数高=低回避 */ },
  SA4: {}, SA5: {}, SA6: {}
};

const SCORE_TIERS = [
  { min: 0, max: 40, tier: "探索期", desc: "…" },
  { min: 41, max: 55, tier: "成长期", desc: "…" },
  { min: 56, max: 70, tier: "稳定期", desc: "…" },
  { min: 71, max: 85, tier: "成熟期", desc: "…" },
  { min: 86, max: 100, tier: "整合期", desc: "…" }
];
```

**区间缓存键：** `{type}_{SA1_band}_{SA2_band}_…_{SA6_band}`，每维 5 分一档 → 约 12×6^6 理论组合，实际命中集中在 attachment 聚类，**可预生成 Top 500 pattern**。

**实现：** 优先复用 `scoreDisplaySummary()`；`detail` 文案扩展进 JSON。

---

### 2.4 Layer C · AI 实时生成

**生成时机：** 用户提交答题后，后端 scoring 完成即 **fire-and-forget** 异步任务。

**内容块**

| ID | 内容 | Prompt | 耗时 | 缓存 |
|---|---|---|---|---|
| C1 | 核心特质 3 段（含答题证据） | Prompt 1 | ~2s | pattern 缓存 |
| C2 | AI 洞察 4 卡 | Prompt 2 | ~2s | pattern 缓存 |
| C3 | 深度报告全文 | Prompt 3 | ~8s 流式 | attempt 级 |
| C4 | 时光机描述 | Prompt 4 | ~1s | pattern 缓存 |
| C5 | 场景反馈微对话 | Prompt 5 | 按需 | 不缓存 |

**前端策略**

- 结果页首屏只依赖 Layer A + B（<100ms）
- `ai_content` 字段轮询或 SSE；Ready 后局部 hydrate
- 骨架屏文案：「分析师正在整理你的报告…」

---

## 三、AI Prompt 完整设计

> 所有 Prompt 前置注入：`analysis_phrase_library_v1.json` → `tonePrinciples` + `forbiddenOutputs`  
> 后置校验：禁止心理学术语出现在用户可见正文（Prompt 3 尤其严格）

### Prompt 1 · 核心特质推导

```
SYSTEM:
你是 MIRROR 关系画像产品的分析引擎。
根据用户答题行为，推导关系里的 3 个核心特质。

写作规范：
- 必须引用具体答题选项：「你在「[题目简称]」那题选了「[选项内容]」」
- 每段 ≤150 字
- 语气：懂你的朋友，不是心理医生
- 正向包装，缺陷→特质
- 每段末尾点明「礼物面」
- 严禁：问题、缺点、不足、低分、得分低、建议改变

INPUT:
{
  "gender": "female",
  "character": "林黛玉",
  "attachment_type": "焦虑型",
  "key_answers": {
    "SA2_F_03": "C",
    "SA2_F_07": "B",
    "SA3_F_09": "B",
    "SA4_F_13": "B",
    "SA6_F_18": "A"
  },
  "scores": { "SA1": 68, "SA2": 38, "SA3": 72, "SA4": 55, "SA5": 62, "SA6": 74 },
  "dimension_summaries": { "SA2": "这个维度还在发展阶段", … }
}

OUTPUT (JSON):
{
  "traits": [
    {
      "icon": "antenna",
      "title": "你的感知雷达全天候在线",
      "body": "…",
      "gift_line": "这是礼物：…",
      "source_dimension": "SA2",
      "evidence": [{ "question_id": "SA2_F_03", "question_short": "…", "chosen_label": "…" }],
      "highlight": true
    }
  ]
}
```

**icon 枚举：** `shield` | `key` | `eye` | `antenna` | `heart` | `compass`（前端映射 lucide）

---

### Prompt 2 · AI 洞察四张卡

```
SYSTEM:
MIRROR AI 分析师。生成 4 条洞察，固定角度全部覆盖。

角度：
1. strength — 最高分维度的珍贵之处
2. watch — 最低分维度，正向语言
3. match — 适合的关系模式（不说具体人名，说特质）
4. growth — 「如果…就…」可操作句式，有场景感

规范：
- 每条 120–150 字
- strength/watch 引用维度名 + 描述性摘要（非裸分）
- 严禁空话

OUTPUT (JSON):
{
  "insights": [
    { "kind": "strength", "title": "你的高光", "body": "…" },
    { "kind": "watch", "title": "可以温柔留意", "body": "…" },
    { "kind": "match", "title": "最适合你的关系模式", "body": "…" },
    { "kind": "growth", "title": "下一段关系里", "body": "…" }
  ]
}
```

---

### Prompt 3 · 深度报告全文（付费 / 完整卷）

```
SYSTEM:
MIRROR 首席分析师。1500–2000 字 Markdown 深度报告。

结构（H2 顺序固定）：
## 你是谁
## 你是怎么爱人的
## 你需要什么才能真正安心
## 你最珍贵的地方
## 你值得的关系长什么样
## 给下一段关系的三件事

规范：
- 第二人称「你」
- 每章首句有情感锚点
- 引用答题 ≥5 次
- 严禁：依恋理论、焦虑型、回避型等术语
- 每章末留一句想停下来的话

INPUT: 完整答题 JSON + scores + type + gender + dimension_summaries
OUTPUT: Markdown string（支持流式）
```

---

### Prompt 4 · 时光机成长路径

```
SYSTEM:
成长路径顾问。100–150 字。

规范：
- 不说「努力」「改变」，说「当你…的时候，你会发现…」
- 行为层面具体描述
- 结尾有希望感

INPUT:
{
  "current_character": "林黛玉",
  "target_character": "史湘云",
  "key_change": "SA2 从发展阶段迈向稳定表现",
  "what_changes": ["…", "…", "…"]
}
```

---

### Prompt 5 · 场景回响反馈

```
触发：用户点击「不太准 ✗」

SYSTEM:
用户认为行为场景不准确。微对话流程：
1. 承认「每个人都是独特的」
2. 问「那在这个场景里，你通常会怎么做？」
3. 根据回答生成更贴合的场景描述
4. 记录 scene_id + user_correction 供模型优化

语气：轻松好奇，不像调查问卷。
```

---

## 四、后端实现架构

### 4.1 内容生产流水线

```
用户提交答题
    ↓
scoring.py 计算 SA1–SA6 + overall（<100ms）
    ↓
写入 attempts.result_payload（Layer A key + Layer B summaries）
    ↓ 同步返回 attempt_id → 前端跳转结果页
    ↓ 异步（BackgroundTasks / queue）
Claude API 并行：
  · Prompt 1 → result_payload.ai_content.traits
  · Prompt 2 → result_payload.ai_content.insights
  · Prompt 4 → result_payload.ai_content.growth_path
    ↓
用户滑到 ACT III / 解锁深度报告：
  · Prompt 3 流式 → ai_report 字段
```

### 4.2 数据接口（V3 扩展）

```typescript
interface SelfResultV3 extends SelfResult {
  attempt_id: string;
  gender: "female" | "male";
  attachment_type: string;
  character_code: string;  // 林黛玉 | 贾宝玉 | …

  scores: {
    SA1: number; SA2: number; SA3: number;
    SA4: number; SA5: number; SA6: number;
    overall: number;
  };

  static_copy: {
    tagline: string;
    archetype_line: string;
    quote: string;
    scenes: Behavior[];
    character_reasons: Reason[];
    match_types: MatchType[];
  };

  dimension_summaries: Record<SelfDimensionCode, {
    label: string;       // scoreDisplaySummary
    detail: string;      // Layer B detail
    position: number;    // 0–100 展示用
    position_label_low: string;
    position_label_high: string;
  }>;

  radar_baseline?: Record<SelfDimensionCode, number>;

  ai_content?: {
    traits: CoreTraitV3[];
    insights: Insight[];
    growth_path: string;
    deep_report?: string;
    generated_at: string;
    cached: boolean;
    status: "pending" | "ready" | "failed";
  };
}
```

### 4.3 缓存策略

| Layer | 策略 | TTL |
|---|---|---|
| A 静态词库 | CDN / 构建时打包 | 永久 |
| B 分数映射 | 内存 LRU，key=`dim_band` | 永久（词库不变） |
| C AI | DB `ai_content_cache`，key=`type_gender_score_pattern` | 90 天 |
| C3 深度报告 | `attempts.ai_report` | 永久 |

**score_pattern 计算：** 每维 `Math.floor(score / 5) * 5`，6 维拼接为 `"38_72_55_62_74_68"`。

---

## 五、有趣交互汇总

| 交互 | 触发 | 效果 | 难度 | 优先级 |
|---|---|---|---|---|
| 分数球进度动画 | 页面进入 | 0→分数动态增长 | 低 | P0 |
| 标题字母 stagger | 页面进入 | 冲击力 | 低 | P1 |
| 长按分数球 | long-press | SA1–SA6 贡献气泡 | 中 | P2 |
| 答题证据展开 | 点击答题依据 | Sheet 原题+选项 | 中 | P1 |
| 雷达轴点击 | 点击轴 | 档案卡跳转 | 中 | P1 |
| 维度深探 | 跟 AI 聊聊 | chatRouteSearch | 低 | P0 |
| 场景左右滑动 | swipe | 3 场景切换 | 低 | P1 |
| 场景共鸣 | 完全是我/不太准 | 粒子/反馈流 | 中 | P2 |
| 红楼揭晓动画 | 点击 CTA | 全屏仪式序列 | 高 | P0 |
| 人格配对深探 | 点击匹配卡 | Accordion 相处描述 | 低 | P1 |
| 时光机 | 滚到 ACT III | AI 成长描述 | 中 | P2 |
| 深度报告流式 | 解锁 | Markdown stream | 中 | P1 |
| 分享卡片 | 生成分享卡片 | Canvas 导出 | 高 | P2 |

---

## 六、前端组件拆分建议

| 组件 | 职责 | 基于 |
|---|---|---|
| `SelfResultOverture` | Hero + 动画时序 | 从 SelfResultView 拆出 |
| `SelfActOneMirror` | ACT I 三子视图 | 新 |
| `TraitEvidenceCard` | 特质卡 + 证据 Sheet | 新 |
| `DualTrackRadar` | 双轨雷达 + 轴点击 | 扩展 RadarChart |
| `DimensionProfileCard` | 档案卡 + AI 聊聊 | 新 |
| `BehaviorCarousel` | 场景滑动 + 共鸣 | 新 |
| `RedChamberReveal` | ACT II 揭晓 overlay | 从现有 overlay 增强 |
| `CharacterDeepDive` | 人物详解 + 匹配深探 | 新 |
| `AnalystReportCards` | ACT III 四卡 | 从 insight Tab 迁出 |
| `GrowthTimeMachine` | 时光机 | 新 |
| `SelfResultCoda` | Cross-sell + 分享 | SuiteCrossSell + 新 ShareCard |
| `ShareCardGenerator` | Canvas 分享图 | 新 |

**路由：** 保持 `result.$attemptId.tsx` → `mapAttemptToSelfResult` → `SelfResultView`（V3 重构为组合上述子组件）。

---

## 七、开发优先级 · 分期交付

### Phase 0 · 叙事骨架（1–2 天）

- [ ] SelfResultView 从 Tab 改为纵向滚动五幕结构
- [ ] Hero 依恋类型 / 红楼分离（已有逻辑，调整布局）
- [ ] ACT II 独立区块 + 现有 reveal overlay 增强
- [ ] CODA 复用 SuiteCrossSell

### Phase 1 · Layer A/B 内容（2–3 天）

- [ ] 新建 `self_static_copy_v1.json`
- [ ] 后端 scoring 写入 `dimension_summaries` + `static_copy` keys
- [ ] 双轨雷达 baseline 从 `archetype_profile.radar_baseline`
- [ ] 维度档案卡替换 DimensionBars

### Phase 2 · Layer C AI（3–4 天）

- [ ] 后端异步 Prompt 1/2/4 + 缓存表
- [ ] 前端 ai_content polling + 骨架屏
- [ ] TraitEvidenceCard + 答题依据 API
- [ ] AiReportSection 对接 Prompt 3 流式

### Phase 3 · 交互 polish（2–3 天）

- [ ] 动画时序（stagger、进度环、揭晓序列）
- [ ] BehaviorCarousel + 场景回响
- [ ] 时光机 + GROWTH_PATHS
- [ ] ShareCardGenerator Canvas

### Phase 4 · 数据闭环

- [ ] 场景共鸣 / 不太准 事件入库
- [ ] pattern 缓存命中率监控
- [ ] lite vs full 卷差异化（`inferSuiteTier`）

---

## 八、与 V2 现状差距清单

| 模块 | 现状（SelfResultView） | V3 目标 |
|---|---|---|
| 信息架构 | 5 Tab 平级 | 5 幕纵向流 + ACT I 内 3 子视图 |
| Hero | 已有 ScoreOrb + tagline | + stagger 动画 + 长按分数 + 滚动引导 |
| 特质 | 静态 3 卡 | 证据式 + 答题依据 Sheet |
| 雷达 | 单轨 RadarChart | 双轨 + 轴点击 + 档案卡 |
| 场景 | 纵向列表 | 横向 Carousel + 共鸣按钮 |
| 红楼 | Tab + 简单 overlay | 独立 ACT II + 增强动画 + 配对深探 |
| AI | insight Tab | ACT III 四卡 + 时光机 + 深度报告 |
| 分享 | 复制链接 | Canvas 分享卡片 |
| 后端 | mapAttempt fallback | 三层流水线 + 异步 AI |

---

## 九、验收标准

1. **3 秒测试：** 首屏 Hero 展示依恋类型 + tagline + 分数球动画，无红楼人名泄露。
2. **叙事测试：** 滚动路径 OVERTURE → ACT I → ACT II → ACT III → CODA，无 Tab 断流感。
3. **证据测试：** 至少 1 张特质卡可展开答题依据，题目与用户卷一致。
4. **语气测试：** 全文无裸分、无「低分/缺点」、无劝分，符合 mirror-tone。
5. **AI 测试：** 异步 5s 内四卡 ready 率 >95%；失败有 Layer B fallback。
6. **揭晓测试：** 红楼人格需主动点击才展示，动画可跳过（accessibility）。
7. **分享测试：** 分享卡片 1080×1440 可下载，含类型/tagline/一维条形。

---

## 修订记录

| 日期 | 版本 | 说明 |
|---|---|---|
| 2026-05-24 | V3.0 | 三幕叙事 + 三层内容 + 五 Prompt + 分期交付 |
