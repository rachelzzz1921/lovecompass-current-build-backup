# LoveCompass / MIRROR 前端题型契约与跳转修复方案

作者：**Manus AI**  
日期：2026-05-23

## 1. 当前结论

本轮复核确认，现有 Lovable 前端答题页只稳定支持 `kind = "scale"` 与 `kind = "choice"` 两类展示，其中 `binary` 仅在 TypeScript 类型里声明，并没有独立渲染分支。实际题库 JSON 并不使用 `kind` 字段，而是使用 `type` 字段，且已经出现 **slider、choice、likert、mood、rank、binary、card、scale、scenario** 共九类题型。因此，后端不能把数据库中的 `question_type` 原样直接交给当前页面渲染；必须在 API 层输出一个前端稳定消费的 `kind` 与 `ui` 契约，同时保留原始 `type` 用于评分、运营和后台管理。

> **关键原则：数据库保留真实题型 `type`，API 补充 UI 适配字段 `kind`。** 这样既不把题目和评分规则写死到前端，也不要求第一版立刻重写所有 Lovable UI。前端只根据 API 返回的 `kind` 与 `ui` 做展示，评分引擎只根据数据库中的 `question_type`、`question_payload` 与 `scoring_payload` 计算。

| 来源 | 字段 | 当前状态 | 结论 |
|---|---:|---|---|
| 题库 JSON | `type` | 真实题型字段，包含 9 类题型 | 继续作为后端与评分引擎的权威字段 |
| 数据库 | `test_questions.question_type` | 由导入脚本从 `type` 写入 | 继续保存原始题型，不迁就前端 UI |
| 当前答题页 | `kind` | 只支持 `scale` / `choice`，`binary` 未独立渲染 | 改为 API 适配字段，供前端选择组件 |
| API | `kind` + `ui` | 需要新增稳定契约 | 由后端按题型映射生成，不影响题库维护 |

## 2. 题库实际题型清单

男女题库合计 100 题。女生版包含 `slider`、`choice`、`likert`、`mood`、`rank` 五类题型；男生版包含 `binary`、`choice`、`slider`、`card`、`scale`、`mood`、`scenario`、`rank` 八类题型。当前需要优先支持这些类型，不建议引入前端未用到的新交互类型。

| 题型 `type` | 女生版数量 | 男生版数量 | 选项结构 | 评分方法特征 | V1 UI 建议 |
|---|---:|---:|---|---|---|
| `choice` | 19 | 8 | 4 个 `options` | 选项自带 `score` | 映射为 `kind: "choice"`，使用字母选项卡 |
| `slider` | 7 | 6 | 无 `options`，有 `slider.min/max` | `slider_to_5` / `reverse_slider` | 映射为 `kind: "slider"`，新增滑杆 UI |
| `likert` | 15 | 0 | 无 `options`，有 `scale.min/max` | `direct` / `reverse` | 映射为 `kind: "scale"`，使用 1–5 强度选择 |
| `scale` | 0 | 14 | 无 `options`，有 `scale.min/max` | `direct` / `reverse` | 映射为 `kind: "scale"`，使用 1–5 强度选择 |
| `binary` | 0 | 7 | 2 个 `options`，key 为 left/right | 选项自带 `score` | 映射为 `kind: "binary"`，新增左右二选一 UI |
| `card` | 0 | 4 | 4 个 `options`，含 `sub` | 选项自带 `score` | 映射为 `kind: "card"`，使用大卡片选项 |
| `scenario` | 0 | 4 | 4 个 `options`，含 `scene/sub` | 选项自带 `score` | 映射为 `kind: "choice"`，顶部展示情境说明 |
| `mood` | 5 | 3 | 8 个 `options`，含 `icon` | 选项自带 `score` | 映射为 `kind: "mood"`，新增情绪网格 UI |
| `rank` | 4 | 4 | 无 `options`，有 `items` | `rank_position` / `auxiliary_type` | V1 可先降级为 `kind: "rank"` 的排序 UI；若开发周期紧，可临时用选择式排序 |

## 3. 稳定题型到 UI 组件映射表

前端应建立一个 `QuestionRenderer`，不再在页面正文里用 `q.kind === "scale" ? ... : ...` 这种二分逻辑。渲染器只依赖 API 返回的 `kind`，并把答案统一写成结构化 `answerPayload`。这可以避免后续新增题型时大面积改动答题页。

| API `kind` | 适配原始 `type` | 前端组件名称建议 | 答案值结构 | 是否需要新增组件 | 说明 |
|---|---|---|---|---|---|
| `choice` | `choice`, `scenario` | `ChoiceQuestion` | `{ optionKey, optionIndex }` | 否，复用当前 choice UI | `scenario` 额外显示 `scene` 与 `sub` |
| `scale` | `likert`, `scale` | `ScaleQuestion` | `{ value }` | 否，可复用当前 scale 视觉 | 值为 1–5，显示 min/max label |
| `slider` | `slider` | `SliderQuestion` | `{ value }` | 是 | 值可能为 0–100 或配置范围，需要显示即时反馈文案 |
| `binary` | `binary` | `BinaryQuestion` | `{ optionKey, optionIndex }` | 是 | 左右对照卡片，适合男生版二择题 |
| `card` | `card` | `CardQuestion` | `{ optionKey, optionIndex }` | 是 | 四张卡片式展示，显示主文案与副文案 |
| `mood` | `mood` | `MoodQuestion` | `{ optionKey, optionIndex }` | 是 | 2×4 或自适应网格，图标可先做文本 fallback |
| `rank` | `rank` | `RankQuestion` | `{ orderedItemIds }` | 是 | V1 建议用“点击依次排序”而非拖拽，减少移动端 bug |

## 4. GET `/tests/:suiteSlug/questions` 返回契约

后端接口必须隐藏评分细节，只返回渲染需要的数据。`dimension_code`、`weight`、`scoring_payload`、`score` 等内容不应暴露给普通前端，避免用户通过前端推断评分模型。评分所需字段在数据库和后端内部使用即可。

```json
{
  "suite": {
    "id": "uuid",
    "slug": "suite1_female",
    "name": "自我关系模式测试",
    "gender": "female",
    "version": "v1",
    "totalQuestions": 50,
    "estimatedMinutes": 12
  },
  "questions": [
    {
      "id": "uuid",
      "externalId": "SA1-F-01",
      "order": 1,
      "type": "slider",
      "kind": "slider",
      "text": "不需要任何人告诉你……",
      "required": true,
      "ui": {
        "component": "slider",
        "min": 0,
        "max": 100,
        "step": 1,
        "minLabel": "我经常觉得自己不够好",
        "maxLabel": "我清楚地知道自己值得",
        "feedback": [
          { "range": [0, 20], "text": "你可能习惯了把自己排在最后" }
        ]
      },
      "options": []
    }
  ]
}
```

对于有选项的题目，建议统一返回以下结构。前端可以展示 `key`、`text`、`sub`、`icon`，但不能接收 `score`。

```json
{
  "id": "uuid",
  "externalId": "SA2-M-10",
  "order": 10,
  "type": "scenario",
  "kind": "choice",
  "text": "你们在一起两个月……你会怎么做？",
  "required": true,
  "ui": {
    "component": "choice",
    "scene": "关系稳定期，突然发现未知社交",
    "layout": "list",
    "showOptionKey": true
  },
  "options": [
    { "key": "A", "text": "没什么大不了，她有自己的社交", "sub": "低焦虑，边界清晰" }
  ]
}
```

## 5. POST `/attempts` 提交契约

前端提交答案时，不提交分数、不提交维度、不提交 scoring 信息，只提交题目 ID 与用户选择。后端根据数据库中的题目、评分模型和结果画像配置进行计算，生成真实 `attemptId`，并返回给前端进入分析页。

```json
{
  "suiteSlug": "suite1_female",
  "redemptionEventId": "uuid-or-null",
  "answers": [
    {
      "questionId": "uuid",
      "externalId": "SA1-F-01",
      "kind": "slider",
      "answerPayload": { "value": 72 },
      "durationMs": 6200
    },
    {
      "questionId": "uuid",
      "externalId": "SA2-F-07",
      "kind": "mood",
      "answerPayload": { "optionKey": "C", "optionIndex": 2 },
      "durationMs": 4100
    }
  ]
}
```

成功响应固定如下。前端只关心 `attemptId` 与下一跳地址，不再使用 `variant=demo`。

```json
{
  "attemptId": "uuid",
  "status": "completed",
  "next": "/analyzing?attemptId=uuid"
}
```

## 6. 跳转链路修复方案

当前流程的核心 bug 是答题页在完成后跳转 `/analyzing?variant=demo`，分析页再跳转 `/result/self/demo`，完全绕过真实 attempt 记录。修复后，所有正式测试都必须围绕 `attemptId` 流转。

| 场景 | 当前跳转 | 修复后跳转 | 后端动作 |
|---|---|---|---|
| 从测试详情页开始 | `/tests/$id/run` 或 `/access` | 未解锁先 `/access?product=...&redirect=/tests/.../run`，已解锁 `/tests/:id/run` | 详情页调用用户授权状态接口，替换 sessionStorage |
| 兑换码验证成功 | `window.location.href = target` | `nav({ to: "/tests/$id/run" })` 或 `window.location.assign(redirect)` | `POST /redemption/verify` 创建 redemption_event |
| 答题完成 | `/analyzing?variant=demo` | `/analyzing?attemptId=<uuid>` | `POST /attempts` 评分并生成 attempt |
| 分析动画完成 | `/result/self/demo` | `/result/<attemptId>` | 可在动画页轮询 `GET /attempts/:id/result` 或直接等待 |
| 结果页进入聊天 | 无稳定 attempt 上下文 | `/chat?attemptId=<uuid>&analystId=<id>` | 聊天接口加载 attempt/result 作为上下文 |
| 历史页查看结果 | `/result/self/$variant` | `/result/<attemptId>` | `GET /attempts` 返回用户历史 |
| 历史页继续聊天 | `/chat` | `/chat?attemptId=<uuid>` | `POST /chat/message` 带上下文 |

## 7. `/analyzing` 搜索参数修复

`/analyzing` 的 search schema 应从 `variant/to` 改为兼容模式。为降低迁移风险，可临时保留 `variant`，但正式路径优先使用 `attemptId`。

```ts
const searchSchema = z.object({
  attemptId: z.string().uuid().optional(),
  variant: z.string().optional(), // 仅 demo fallback 使用，后续删除
});
```

动画完成后的逻辑应改为：如果存在 `attemptId`，跳转 `/result/$attemptId`；否则才进入 demo fallback。

```ts
if (attemptId) {
  nav({ to: "/result/$attemptId", params: { attemptId } });
} else {
  nav({ to: "/result/self/$variant", params: { variant: variant ?? "demo" } });
}
```

## 8. 前端改造边界

为遵守“不重写 UI、继续使用 Lovable 导出代码”的约束，V1 前端不建议重做页面结构，而应新增薄封装层：`src/lib/api.ts` 负责 HTTP 请求，`src/lib/questionAdapter.ts` 负责类型安全，`src/components/questions/*` 负责题型组件。`tests.$id.run.tsx` 保留原有布局、进度条和动画，只把 `DEMO` 数据与二分渲染替换为 API 数据与 `QuestionRenderer`。

| 文件 | 当前问题 | 改造方式 |
|---|---|---|
| `src/routes/tests.$id.run.tsx` | 题目写死在 `DEMO`，完成后跳 demo result | 改为加载 `GET /tests/:id/questions`，提交 `POST /attempts` 后跳真实 `attemptId` |
| `src/routes/access.tsx` | `isValidAccessCode` 前端 mock，sessionStorage 解锁 | 改为 `POST /redemption/verify`，保存后端返回的 redemptionEventId |
| `src/routes/analyzing.tsx` | 只认识 `variant`，跳 `/result/self/$variant` | 增加 `attemptId` 参数，正式路径跳 `/result/$attemptId` |
| `src/routes/result.$attemptId.tsx` | 已存在真实结果路由，但未被主流程使用 | 作为正式结果页，读取 `GET /attempts/:id/result` |
| `src/routes/result.self.$variant.tsx` | demo 结果页 | 保留展示样例，不用于正式流程 |
| `src/routes/history.tsx` | 继续聊天跳 `/chat`，查看结果跳 demo | 使用真实 attemptId 跳 `/result/$attemptId` 与 `/chat?attemptId=...` |
| `src/routes/chat.tsx` | 没有 attempt 上下文 | 增加 search schema，调用 `POST /chat/message` 时传 attemptId/analystId |

## 9. 建议立即执行的代码改动顺序

第一步应先创建 API 与类型契约文件，避免直接改页面造成类型混乱。第二步改 `analyzing` 和 `result/history/chat` 的路由参数，因为这些改动风险低。第三步改 `tests.$id.run.tsx` 的题目加载和提交，此处是核心流程。第四步改 `access.tsx`，将 mock 兑换码替换为后端接口。最后再新增 `slider/binary/card/mood/rank` 等题型组件，保证题库 100 题可以完整渲染。

| 顺序 | 任务 | 验收标准 |
|---:|---|---|
| 1 | 新增 `api.ts`、`questionTypes.ts`、`QuestionRenderer` | TypeScript 可识别 API 返回题目结构 |
| 2 | 修改 `/analyzing` 支持 `attemptId` | 手动访问 `/analyzing?attemptId=<uuid>` 会跳 `/result/<uuid>` |
| 3 | 修改历史页与聊天页 search 参数 | 历史页链接都带真实 attemptId |
| 4 | 修改答题页加载后端题目 | 页面不再引用 `DEMO`，能渲染 9 类题型 |
| 5 | 修改提交逻辑 | `POST /attempts` 返回 attemptId 后进入分析页 |
| 6 | 修改兑换码验证 | 不再 import `@/data/accessCodes`，不再用 sessionStorage 作为授权真相 |

## 10. 需同步给后端的实现要求

后端在返回题目时要完成 `type → kind/ui` 适配，并在提交答案时使用原始 `question_type` 与 `scoring_payload` 计算。尤其要注意 `rank` 类型：`rank_position` 需要读取 `key_item` 和 `score_map`；`auxiliary_type` 不能作为主评分维度强行计算，应按题库规则作为辅助画像信号保存。

| 后端职责 | 具体要求 |
|---|---|
| 题型适配 | 数据库 `question_type` 原样保留；API 增加 `kind` 和 `ui.component` |
| 隐藏评分 | 不向前端返回 `score`、`dimension_code`、`weight`、`scoring_payload` |
| 统一答案 | 将前端答案保存到 `test_attempt_answers.answer_payload` 与 `numeric_score` 派生字段 |
| 可维护性 | 题库更新只改数据库/导入数据，不改前端业务代码 |
| 扩展性 | 后续新增题型时，只新增适配规则与组件，不影响历史题库 |
