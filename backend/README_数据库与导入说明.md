# LoveCompass V1 后端数据库与数据导入说明

本文档说明本次交付的数据库 Schema、基础种子数据、题库导入脚本与兑换码导入模板。当前设计遵守一个核心原则：**题目、选项、评分公式、结果画像和运营兑换码不写死在业务代码里**。业务代码未来只负责读取数据库配置、执行计算、调用 AI 和返回 API 结果。

> 重要说明：`scripts/generate_import_sql.py` 和 `scripts/generate_redemption_code_sql.py` 不是用来“在代码里录入题目/兑换码”的文件。它们只是把外部 JSON 或 CSV 数据转换成可审查、可执行的 SQL。题目内容仍保存在 `data/*.json` 数据文件中，兑换码仍保存在运营 CSV 表格中。

## 一、本次交付文件

| 类型 | 文件 | 作用 |
|---|---|---|
| 核心迁移 | `migrations/202605230001_lovecompass_v1_core_schema.sql` | 创建 V1 核心表、枚举、索引、RLS 策略、用户 profile 触发器。 |
| 基础种子 | `migrations/202605230002_lovecompass_v1_seed_basics.sql` | 写入 SA1-SA6 基础维度和 V1 默认聊天分析师。 |
| 题库源数据 | `data/suite1_female.json`、`data/suite1_male.json` | 外部题库数据文件，来自你已提供的男女版题库 JSON。 |
| 题库导入 SQL | `data/001_import_question_banks.sql` | 由脚本从题库 JSON 生成，负责导入测试套件、题目、评分公式和结果画像。 |
| 题库导入脚本 | `scripts/generate_import_sql.py` | 将外部题库 JSON 转为 SQL，不硬编码题目内容。 |
| 兑换码模板 | `data/redemption_codes_template.csv` | 后台/运营维护兑换码的 CSV 模板。 |
| 兑换码导入脚本 | `scripts/generate_redemption_code_sql.py` | 将兑换码 CSV 转为 SQL，不把兑换码写入业务代码。 |

## 二、核心数据库范围

V1 数据库覆盖以下模块：用户资料、测试套件、维度、题目、评分模型、结果画像、兑换码批次、兑换码、兑换记录、测试尝试、答题记录、AI 结果分析、聊天分析师、聊天会话、聊天消息和后台审计日志。

| 模块 | 核心表 | 设计口径 |
|---|---|---|
| 用户体系 | `profiles` | 使用 Supabase Auth 的邮箱密码登录，业务资料放在 `profiles`，V1 暂不做微信登录。 |
| 测试配置 | `test_suites`、`test_questions` | 测试、题目、题型、选项和原始题目 payload 全部入库，不写死在前端。 |
| 量化模型 | `metric_dimensions`、`scoring_models` | SA1-SA6 维度和 ROS V3 评分公式以 JSONB 配置方式存储。 |
| 结果画像 | `result_archetypes` | 红楼梦人格、结果解释、标签、文案素材等作为结果画像 payload 存储。 |
| 兑换码 | `redemption_batches`、`redemption_codes`、`redemption_events` | 支持第一套通用码和后续一客一码；同一用户同一测试默认只兑换一次。 |
| 测试记录 | `test_attempts`、`test_attempt_answers` | 保存历史测试、答题明细、维度分数、结果类型和完整结果 payload。 |
| AI 结果分析 | `ai_result_reports` | 所有结果都可生成 AI 分析，这和聊天分析师不是同一个模块。 |
| 聊天分析师 | `chat_analysts`、`chat_sessions`、`chat_messages` | 聊天页可切换分析师；V1 可先启用默认分析师，后续扩展多分析师。 |
| 后台审计 | `admin_audit_logs` | 记录后台关键操作，便于排错和运营追踪。 |

## 三、建议执行顺序

如果使用 Supabase SQL Editor 或迁移工具，建议按以下顺序执行。执行前请先备份现有项目数据库，尤其是你之前 Lovable 项目已创建过部分表。

| 顺序 | 操作 | 文件/命令 |
|---|---|---|
| 1 | 执行核心 Schema | `migrations/202605230001_lovecompass_v1_core_schema.sql` |
| 2 | 执行基础种子 | `migrations/202605230002_lovecompass_v1_seed_basics.sql` |
| 3 | 生成题库 SQL | `python3.11 scripts/generate_import_sql.py --question-bank data/suite1_female.json --question-bank data/suite1_male.json --out data/001_import_question_banks.sql` |
| 4 | 执行题库导入 SQL | `data/001_import_question_banks.sql` |
| 5 | 准备兑换码 CSV | 复制并编辑 `data/redemption_codes_template.csv` |
| 6 | 生成兑换码 SQL | `python3.11 scripts/generate_redemption_code_sql.py --csv data/redemption_codes_template.csv --out data/002_import_redemption_codes.sql` |
| 7 | 执行兑换码导入 SQL | `data/002_import_redemption_codes.sql` |

## 四、兑换码数据填写规则

兑换码不建议手动写 SQL，也不建议写进业务代码。你可以复制 `data/redemption_codes_template.csv`，用表格软件维护后再生成 SQL。

| 字段 | 含义 | 示例 |
|---|---|---|
| `suite_slug` | 对应测试套件 slug，必须已存在于 `test_suites` | `suite1_female` |
| `code` | 用户输入的兑换码 | `LOVE-TEST-001` |
| `kind` | 兑换码类型 | `common` 或 `single_use` |
| `max_uses` | 该码最大使用次数；通用码可设大数，一客一码设 `1` | `999999`、`1` |
| `expires_at` | 过期时间，可留空 | `2026-12-31T23:59:59+08:00` |
| `is_active` | 是否启用 | `true` |
| `batch_name` | 批次名称，方便后台筛选 | `第一套通用码` |
| `note` | 运营备注 | `小红书首批` |

你之前确认的逻辑会由后端业务接口执行：**通用码可多人使用，但同一用户对同一测试默认只成功兑换一次；如果用户想重测，可以由你发放另一个可用兑换码，后端创建新的测试尝试记录。**

## 五、关于 ROS V3 白皮书的后端放置方式

ROS V3 白皮书应作为业务模型依据，而不是直接变成一堆硬编码函数。当前迁移和导入方案采用以下方式处理：评分公式、类型规则、题目结构和结果画像放入数据库 JSONB；后端评分服务读取 `scoring_models.scoring_formula` 与 `type_rules` 执行计算；AI 分析服务读取测试结果、维度分数、结果画像和 ROS 模型说明，生成面向用户的解释。

这种做法的好处是：后续改题目、改权重、改结果文案、改红楼人物解释时，优先改后台数据或导入文件，而不是改前端和业务代码。

## 六、下一步后端开发建议

数据库和导入文件准备好后，下一步不建议马上写大而全的后台，而应该先做最小可运行链路。推荐顺序如下。

| 阶段 | 目标 | 验收标准 |
|---|---|---|
| V1-1 | 邮箱密码登录与 profile 自动创建 | 用户注册后 `profiles` 自动出现记录。 |
| V1-2 | 测试列表与题目读取 API | 前端可以从 API 获取测试套件和题目，不再读 mock。 |
| V1-3 | 兑换码验证与测试解锁 API | 用户输入有效码后可开始对应测试，后台记录兑换事件。 |
| V1-4 | 提交答案与评分 API | 后端读取数据库评分配置，生成维度分数、类型和结果 payload。 |
| V1-5 | AI 结果分析 API | 完成测试后生成 `ai_result_reports`，结果页完整展示。 |
| V1-6 | 聊天分析师 API | 聊天页基于测试结果开场，可切换分析师配置。 |
| V1-7 | 后台管理 MVP | 管理用户、测试、题库、模型配置、兑换码和 AI 分析师。 |

## 七、防返工注意事项

第一，前端保留现有 Lovable 导出代码，但需要逐步替换 mock 数据源。不要一开始重写 UI，也不要让前端承担评分逻辑。第二，兑换码验证、评分计算、AI 生成和聊天上下文必须走后端接口，避免用户在浏览器里绕过规则。第三，题库和模型更新优先通过 JSON/CSV 导入或后台表单完成，业务代码只写“读取配置并执行”的通用逻辑。第四，聊天分析师和 AI 结果分析要保持边界：前者是聊天角色配置，后者是测试结果页的生成分析内容。
