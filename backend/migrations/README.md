# LoveCompass 数据库迁移（Supabase `wjfpglsygkbpubanylug`）

**不要新建数据库。** 在现有 Supabase 项目的 SQL Editor 或 `scripts/run_sql_file.py` 中按顺序执行。

| 顺序 | 文件 | 说明 |
|------|------|------|
| 1 | `202605230001_lovecompass_v1_core_schema.sql` | 核心表、RLS、触发器 |
| 2 | `202605230002_lovecompass_v1_seed_basics.sql` | 维度与默认分析师 |
| 3 | `202605230003_allow_reverse_question_direction.sql` | 题库 direction 约束 |
| 4 | `202605230004_seed_demo_auth_user.sql` | 可选 demo 用户 |
| 5 | `data/001_import_question_banks.sql` | 套一 SELF 男女题库（大文件） |
| 6 | **`data/004_import_s02_s03_question_banks.sql`** | **套二 ROS + 套三 MATE 男女题库与 scoring_models（必跑）** |
| 7 | **`data/005_import_lite_question_banks.sql`** | **三套精简版（各 20 题 × 男女 = 6 套件）** |
| 8 | `data/002_import_redemption_codes_e2e_20260523.sql` | E2E 兑换码（可选） |
| 9 | `data/003_import_redemption_codes_love_2026.sql` | 正式兑换码批次（可选） |
| 10 | `202605230005_lovecompass_security_hardening.sql` | 安全加固 |
| 11 | `202605230006_profiles_portrait_cache.sql` | 画像中心 `portrait_cache` 列 |
| 12 | `202605240001_lovecompass_counselor_personas.sql` | MIRROR 四位顾问 persona |
| 13 | `202605240002_universal_redemption_shadow_codes.sql` | 万能码 shadow redemption（`MIRROR-ALL-ACCESS`） |
| 14 | `202605250001_ros_relation_sessions.sql` | ROS 关系码双人会话表 |
| 15 | `202605240003_mate_relation_sessions.sql` | MATE 关系码双人会话表（与 ROS 分表，码格式共用） |
| 16 | `202605250002_self_ai_pattern_cache.sql` | SELF `ai_content` 分数 pattern 缓存 |

## 目标库状态（三套体系齐全后）

| 项 | 期望值 |
|----|--------|
| `test_suites` | 12 行：完整版 6 + 精简版 6（`*_lite`） |
| `test_questions` | 完整版 ~380 + 精简版 ~120（以 import SQL 为准） |
| `scoring_models` | 每套件至少 1 条活跃 `ROS_V3` / SELF 模型 |

## 校验命令

```bash
cd backend
# 需配置 DIRECT_URL 或 DATABASE_URL
python3 scripts/check_schema_counts.py
python3 scripts/check_env.py
```

## 导入大文件

```bash
cd backend
python3 scripts/run_sql_file.py migrations/202605230006_profiles_portrait_cache.sql
python3 scripts/run_sql_file.py data/004_import_s02_s03_question_banks.sql
```

`004_import_s02_s03_question_banks.sql` 由 `scripts/generate_import_sql.py` 从 `data/suite2_ros_*.json` 与 `data/suite3_mate_*.json` 生成；更新题库 JSON 后重新生成并执行。

## 体系文档索引

| 套 | 规范文档 | 机器 spec |
|----|---------|-----------|
| 套一 SELF | 前端 `selfSuiteSpec.ts` | `data/suite1_*.json` |
| 套二 ROS | `docs/套二_ROS关系测评体系_V2.0.md` | `data/ros_suite_spec_v2.json` |
| 套三 MATE | `docs/套三_MATE择偶坐标体系_V1.0.md` | `data/mate_suite_spec_v1.json` |
| 共用话术 | `docs/三套题分析话术与词库复用指南.md` | `data/analysis_phrase_library_v1.json` |
