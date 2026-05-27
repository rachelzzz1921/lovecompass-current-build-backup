# MIRROR 顾问人格 Skills

去品牌化顾问人格 + 共用 prompt 层，供开发与运行时加载。

## 顾问人格（用户可选）

| 中文名 | 英文名 | 目录 | 气质关键词 |
|--------|--------|------|------------|
| 祖师爷 | Oracle | `oracle/` | 笃定、真诚、江湖清醒 |
| 进化论 | Darwin | `darwin/` | 犀利解构、认知升维 |
| 是妻子也是母亲 | Haven | `haven/` | 妻子懂你、母亲托住 |
| 学者 | Sage | `sage/` | 一句定锚、本质压缩 |

## 共用层（所有对话自动注入）

| 层 | 目录 | 运行时模块 | 作用 |
|----|------|------------|------|
| mirror-tone | `mirror-tone/` | `chat_prompt_layers.build_mirror_tone_layer()` | 词库语气、分数转述、禁止输出 |
| crisis-guard | `crisis-guard/` | `assess_crisis()` + 高危短路回复 | 自伤/自杀安全护栏 |
| portrait-reader | `portrait-reader/` | `build_portrait_reader_layer()` | SELF/ROS/MATE 跨套画像 |
| triage | `triage/` | `triage_counselor()` + `POST /chat/triage` | 推荐顾问 |
| mirror-product-flow | `mirror-product-flow/` | 前端 productFlowEngine + accessGate | 三套题动线唯一规范 |
| mirror-admin | `mirror-admin/` | `backend/app/admin.py` + `/admin/*` | 管理后台开发与运营规范 |

**词库数据源：** `backend/data/analysis_phrase_library_v1.json`

## Prompt 注入顺序

```
system (MIRROR_CHAT_BASE + 顾问气质层，代码合并，见 counselor_personas.py)
→ mirror-tone
→ crisis-guard（若触发）
→ portrait-reader（已登录用户）
→ Agent Skill（oracle/darwin/haven/sage）
→ 当前 attempt 详情
→ 历史 + 用户消息
```

## 部署副本

- 顾问：`backend/app/counselor_skills/{slug}/SKILL.md`
- 共用层：`backend/app/shared_skills/{slug}/SKILL.md`

## API

- `POST /chat/message` — `analystId`: `oracle` | `darwin` | `haven` | `sage`
- `POST /chat/triage` — `{ "message": "..." }` 返回推荐顾问
- 默认顾问：`sage`；旧 `mirror` → `sage`

前端：`frontend/src/lib/counselors.ts` · 分诊按钮：`/chat` 侧边栏
