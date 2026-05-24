# LoveCompass 顾问人格 Skills

四个去品牌化顾问人格，供开发与 prompt 迭代使用。

| 中文名 | 英文名 | 目录 | 定位 |
|--------|--------|------|------|
| 祖师爷 | Oracle | `.cursor/skills/oracle/` | 直球真话、街头智慧、信号与边界 |
| 进化论 | Darwin | `.cursor/skills/darwin/` | 关系策略、价值 clarity、长期主义 |
| 是妻子也是母亲 | Haven | `.cursor/skills/haven/` | 失落陪伴、哀伤、温柔稳定 |
| 学者 | Sage | `.cursor/skills/sage/` | 五层结构分析、模式觉察 |

## 路径

```
.cursor/skills/oracle/SKILL.md
.cursor/skills/darwin/SKILL.md
.cursor/skills/haven/SKILL.md
.cursor/skills/sage/SKILL.md
```

## 触发词

- Oracle：`祖师爷` `Oracle` `直球分析` `说真话`
- Darwin：`进化论` `Darwin` `关系策略` `值不值得继续`
- Haven：`Haven` `港湾` `陪陪我` `走不出来`
- Sage：`学者` `Sage` `关系结构` `为什么总是这样`

| LoveCompass 角色 | Skill 目录 | DB slug |
|------------------|------------|---------|
| 祖师爷 / Oracle | `.cursor/skills/oracle/` | `oracle` |
| 进化论 / Darwin | `.cursor/skills/darwin/` | `darwin` |
| 是妻子也是母亲 / Haven | `.cursor/skills/haven/` | `haven` |
| 学者 / Sage | `.cursor/skills/sage/` | `sage` |

前端配置：`frontend/src/lib/counselors.ts`（与 DB slug 一致）

## 与产品集成

- 聊天 API：`POST /chat/message` 传 `analystId`: `oracle` | `darwin` | `haven` | `sage`
- 默认顾问：`sage`（旧 `mirror` 自动映射到 `sage`）
- 迁移：`backend/migrations/202605240001_lovecompass_counselor_personas.sql`
