# LoveCompass 数据库迁移（Supabase `wjfpglsygkbpubanylug`）

**不要新建数据库。** 在现有 Supabase 项目的 SQL Editor 或 `scripts/run_sql_file.py` 中按顺序执行。

| 顺序 | 文件 | 说明 |
|------|------|------|
| 1 | `202605230001_lovecompass_v1_core_schema.sql` | 核心表、RLS、触发器 |
| 2 | `202605230002_lovecompass_v1_seed_basics.sql` | 维度与默认分析师 |
| 3 | `202605230003_allow_reverse_question_direction.sql` | 题库 direction 约束 |
| 4 | `202605230004_seed_demo_auth_user.sql` | 可选 demo 用户 |
| 5 | `data/001_import_question_banks.sql` | 男女题库（大文件） |
| 6 | `data/002_import_redemption_codes_e2e_20260523.sql` | E2E 兑换码（可选） |
| 7 | `202605230005_lovecompass_security_hardening.sql` | 安全加固（真库已应用） |

真库当前状态（2026-05-23）：核心表齐全，`test_questions`=100，`test_suites`=2（`s01_self_female` / `s01_self_male`）。

校验：`python scripts/check_schema_counts.py`（需 `DIRECT_URL` 或 `DATABASE_URL`）。
