# Chat 案例库 — Phase 1 / Phase 2

## 为何先不用 pgvector

案例仍在迭代；向量相似度容易「话题像、人格不对」（Oracle vs Darwin 都会聊「值不值得」）。Phase 1 用 **顾问 slug + 套别 + scene_tags + 关键词** 更可控。

## Phase 1（已落地）

| 项 | 说明 |
|----|------|
| 表 | `chat_case_examples` |
| 标签 | `scene_tags` 与 `infer_scene_tags()` 一致，见 `chat_case_tags.SCENE_TAGS` |
| 检索 | SQL 预筛 ≤80 行 → Python 打分 → **最多注入 2 条** |
| 排序 | `priority` + `hit_rate` + `use_count` + 标签/关键词命中 |
| 注入 | 画像/详情之后、历史之前；assistant 锚定：不照搬内容 |
| 统计 | 每次注入 `use_count += 1` |

### scene_tags 词表（与 triage 对齐）

- **haven**: `breakup`, `emotional_crisis`, `grief_companion`
- **oracle**: `signal_judgment`, `worth_it`, `dignity`, `should_initiate`
- **darwin**: `sunk_cost`, `relationship_position`, `cognitive_dissonance`
- **sage**: `pattern_why_always`, `attachment_roots`

运营录入案例时 **只使用上述 tag**，不要另造平行分类。

## 案例规模大时怎么办

规则检索在 **上千条** 量级仍可用，前提是：

1. **GIN(`scene_tags`)** + `counselor_slug` 索引（迁移已建）
2. 每条案例至少 1 个 `scene_tags` 或 `trigger_keywords`（避免全靠 `priority` 硬排）
3. 用 `hit_rate` / `use_count` 自动抬优质案例，减少手调 `priority`
4. 仍只向模型注入 **1～2 条**（token 与「人格污染」上限不变）

当出现以下信号再开 Phase 2 向量：

- 同 tag 下候选 >50 且关键词难以区分
- 需要跨 tag / 跨顾问「语义相近」召回
- 运营愿意维护 embedding（或离线批算）

### Phase 2 草图

```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE chat_case_examples ADD COLUMN embedding vector(1536);
-- 检索：WHERE counselor_slug = ? AND scene_tags && ? ORDER BY embedding <=> query_vec LIMIT 10 → 再取 2 条注入
```

## 应用迁移

```bash
cd backend
python3 scripts/run_sql_file.py migrations/202605260002_chat_case_examples.sql
```

## 测试

```bash
cd backend
python3 scripts/test_chat_messages.py
```
