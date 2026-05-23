# LoveCompass 兑换码与完整答题闭环联调日志（2026-05-23）

作者：**Manus AI**

## 一、当前结论

本轮在 Supabase 真库基础上完成了 **兑换码导入、兑换码验证、题库读取、完整答卷提交、结果读取、聊天接口响应** 的后端业务闭环联调。联调过程中发现 `redemption_events.user_id` 依赖 `auth.users` 外键，而当前 FastAPI 原型使用固定的 `LOVECOMPASS_DEMO_USER_ID` 写入测试事件；因此新增了一个幂等 demo 用户种子迁移，解决真库兑换事件写入阻塞。

| 项目 | 结果 | 说明 |
|---|---:|---|
| GitHub 安全备份 | 通过 | 已推送到私有仓库 `rachelzzz1921/lovecompass-current-build-backup`，并用新克隆副本复查。 |
| 测试兑换码导入 | 通过 | 已导入女性与男性两枚 common 测试码，均启用且可重复用于联调。 |
| 女性套件答题闭环 | 通过 | `s01_self_female` 成功读取 50 题、提交 50 个答案、生成 completed attempt。 |
| 男性套件答题闭环 | 通过 | `s01_self_male` 成功读取 50 题、提交 50 个答案、生成 completed attempt。 |
| 结果读取 | 通过 | 两个 attempt 均可通过 `/attempts/{attempt_id}/result` 读取画像结果。 |
| 聊天接口 | 通过 | `/chat/message` 可基于真实 attemptId 返回内容；当前 `AI_PROVIDER=mock`，因此返回占位回复。 |

## 二、本轮新增与修改文件

| 路径 | 类型 | 用途 |
|---|---|---|
| `lovecompass_backend/data/redemption_codes_e2e_20260523.csv` | 数据 | 本轮端到端联调用小批量测试兑换码 CSV。 |
| `lovecompass_backend/data/002_import_redemption_codes_e2e_20260523.sql` | 数据导入 SQL | 由 CSV 生成的幂等兑换码导入 SQL。 |
| `lovecompass_backend/migrations/202605230004_seed_demo_auth_user.sql` | 迁移 | 创建或更新固定 demo 用户，满足兑换事件和答题记录的 `auth.users` 外键。 |
| `lovecompass_backend/scripts/validate_e2e_attempt_flow.py` | 联调脚本 | 自动验证兑换码、题库、答题提交和结果读取闭环。 |
| `lovecompass_backend/scripts/validate_chat_endpoint.py` | 联调脚本 | 使用真实 completed attempt 验证聊天接口响应。 |
| `LoveCompass_兑换码与完整答题闭环联调日志_20260523.md` | 文档 | 记录本轮路径、问题、结果和下一步建议。 |

## 三、执行路径记录

首先，我在完成 GitHub 备份后复核了后端主服务接口，确认当前业务闭环涉及 `/redemption/verify`、`/tests/{suite_slug}/questions`、`/attempts`、`/attempts/{attempt_id}/result` 与 `/chat/message`。随后创建了女性与男性两个真实套件的测试兑换码 CSV，并用既有导入脚本生成 SQL 后写入 Supabase 真库。

随后，我编写了自动化闭环脚本，脚本会先调用兑换码验证接口得到 `redemptionEventId`，再读取题库并根据题型自动构造一份完整答卷，最后提交 attempt 并读取画像结果。第一次运行时，真库返回 `redemption_events_user_id_fkey` 外键错误，说明当前原型使用的固定 demo 用户尚未存在于 Supabase `auth.users`。为保持后端接口语义不变，我新增了幂等迁移 `202605230004_seed_demo_auth_user.sql`，只创建一个确定性的联调用 demo 用户。

迁移应用后，完整闭环脚本通过。女性套件 `s01_self_female` 读取到 50 道题并生成 attempt `c30ead86-3498-48a2-ad27-48bf9d0b1015`，男性套件 `s01_self_male` 读取到 50 道题并生成 attempt `05aed35c-a5a7-4aec-bb63-db832d08948d`。两者结果读取均返回 `balanced` 原型与 `SA1` 至 `SA6` 维度分数。

最后，我检查了 AI 适配层。当前 `.env` 中未配置正式智谱 Key，`AI_PROVIDER` 实际使用 `mock` 回退；因此 `/chat/message` 的闭环联调结果是接口可用、上下文可传入、响应非空，但内容仍为占位回复。后续若提供正式模型 Key，可以将该脚本作为回归测试继续验证真实模型输出。

## 四、关键联调输出

| 用例 | 输入兑换码 | 套件 | 题目数 | Attempt ID | 状态 | 结果摘要 |
|---|---|---|---:|---|---|---|
| 女性自测 | `LC-E2E-F-20260523` | `s01_self_female` | 50 | `c30ead86-3498-48a2-ad27-48bf9d0b1015` | completed | archetype=`balanced`, rosIndex=`128.01` |
| 男性自测 | `LC-E2E-M-20260523` | `s01_self_male` | 50 | `05aed35c-a5a7-4aec-bb63-db832d08948d` | completed | archetype=`balanced`, rosIndex=`132.62` |
| 聊天接口 | 绑定男性最新 attempt | `/chat/message` | 不适用 | `05aed35c-a5a7-4aec-bb63-db832d08948d` | ok | 当前为 mock 占位回复，长度 210 字符。 |

## 五、当前状态与下一步建议

当前后端真库闭环已经可以支撑前端接入，但前端仍存在一个重要差异：现有访问码页面此前仍偏 mock 逻辑，且测试入口可能使用 `self`、`ros`、`mate` 这类产品 ID，而后端真库套件 slug 是 `s01_self_female` 与 `s01_self_male`。下一步建议优先修正前端访问码页面，让它调用 `/redemption/verify` 并把返回的 `suiteSlug` 与 `redemptionEventId` 存入会话，再跳转到真实测试页；随后再做浏览器级端到端验收。

## 六、最终回归补充

在第二轮收尾回归中，完整闭环脚本曾触发 `DuplicatePreparedStatement` 错误。该问题与 Supabase transaction pooler 和 psycopg 自动 prepared statements 的组合有关，不是业务 SQL 或题库数据错误。已在 `app/db.py` 中将连接参数设置为 `prepare_threshold=None`，禁用自动 prepared statements。修正后，后端编译、完整答题闭环、聊天接口、密钥扫描与前端生产构建均通过。

最新一轮回归中，女性与男性套件仍均返回 50 道题并生成 completed attempt；聊天接口在 `AI_PROVIDER=mock` 状态下返回非空占位回复。当前后端闭环可作为前端接入真实兑换码流程的验收基线。
