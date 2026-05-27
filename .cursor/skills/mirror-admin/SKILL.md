---
name: mirror-admin
description: >-
  MIRROR 管理后台（/admin）开发与运营规范。修改 admin.py、adminApi.ts、requireAdmin、
  /admin/* 路由、兑换码/用户/题库/监控/顾问配置时必读。涵盖权限、审计、CRUD 模式、
  表格可读性与外部 admin-dashboard 最佳实践在本项目的落地方式。
---

# MIRROR Admin Skill

## 可引入的外部 Skill（社区实践来源）

| Skill | 安装量 | 适用场景 | 安装命令 |
|-------|--------|----------|----------|
| [admin-dashboard](https://skills.sh/curiositech/some_claude_skills/admin-dashboard) | ~189+ | Tab 化概览、StatCard、审计、内部工具扩展 | `npx skills add curiositech/some_claude_skills@admin-dashboard -g -y` |
| [supabase-admin](https://skills.sh/curiositech/some_claude_skills/supabase-admin) | 配套 | RLS、迁移、Auth 用户创建/删除、profiles 触发器 | `npx skills add curiositech/some_claude_skills/supabase-admin -g -y` |
| [building-admin-dashboard-customizations](https://skills.sh/medusajs/medusa-agent-skills/building-admin-dashboard-customizations) | ~2K | 大型电商后台扩展模式（参考结构，非 Medusa 专用代码） | `npx skills add medusajs/medusa-agent-skills@building-admin-dashboard-customizations -g -y` |

**高效后台管理的共性（从上述 skill 提炼，已映射到 MIRROR）：**

1. **三层分区**：概览 / 运营监控 / 配置管理 — 不要全堆在一个页面
2. **每个写操作必审计**：`_log_admin_action` → `admin_audit_logs`
3. **列表页标准能力**：筛选、分页、搜索、导出/复制、状态 Badge
4. **危险操作二次确认**：AlertDialog + 说明不可恢复
5. **实时页轮询**：`useAdminLivePoll`（15s），概览与 monitor 分离
6. **RBAC 网关统一**：后端 `resolve_admin_user_id`，前端 `AdminGate` + `adminApi.me()`
7. **表格可读性**：邮箱 `break-all`、用户编号 `MR-000042`、宽布局 `max-w-[1600px]`

---

## MIRROR 单一真相源

| 层 | 路径 | 职责 |
|----|------|------|
| 后端路由 | `backend/app/admin.py` | 全部 `/admin/*` API、审计、Supabase Auth 管理 |
| Auth 辅助 | `backend/app/admin_supabase.py` | service role 创建/删除 Auth 用户 |
| API 客户端 | `frontend/src/lib/adminApi.ts` | Bearer 请求、类型定义 |
| 权限门 | `frontend/src/lib/requireAdmin.tsx` | 登录 + `GET /admin/me` |
| 布局壳 | `frontend/src/routes/admin.tsx` | 侧栏 NAV、`max-w-[1600px]` |
| 轮询 | `frontend/src/lib/useAdminLivePoll.ts` | monitor / 概览自动刷新 |
| 文档 | `backend/README_API.md` | 端点清单 |

### 现有页面

| 路由 | 分区 | 用途 |
|------|------|------|
| `/admin` | 运营 | 分组 KPI + 快捷入口 + 套件/兑换/审计摘要 |
| `/admin/monitor` | 运营 | 实时测评 / 双人关系码 / 兑换（15s） |
| `/admin/attempts` | 运营 | 测评记录 |
| `/admin/chat` | 运营 | AI 聊天会话分析（不含正文） |
| `/admin/codes` | 配置 | 兑换码 + 万能码 shadow + 指定码 |
| `/admin/questions` | 配置 | 在线题库 / 已淘汰题清理 |
| `/admin/users` | 配置 | 用户 MR 编号、提权、停用、邀请 |
| `/admin/analysts` | 配置 | AI 顾问配置 |
| `/admin/audit` | 系统 | 操作审计日志（只读） |

### 共用 UI 组件（新页必须复用）

- `frontend/src/components/admin/AdminStatCard.tsx` — KPI 卡片 + `AdminPageHeader`
- `frontend/src/components/admin/AdminEmailCell.tsx` — 完整显示邮箱
- `frontend/src/components/admin/AdminUserCode.tsx` — `MR-000001` 编号
- `frontend/src/components/admin/AdminTableShell.tsx` — 宽表横向滚动

---

## 添加新 Admin 功能（标准流程）

### 1. 后端 `admin.py`

```python
@router.get("/your-resource")
def admin_list_...(admin_user_id: AdminUser, ...):
    del admin_user_id
    # 分页：_clamp_limit(limit, default=50, maximum=200)
    ...

@router.post("/your-resource")
def admin_create_...(data: ..., admin_user_id: AdminUser):
    with get_conn() as conn:
        # 业务写库
        _log_admin_action(conn, admin_user_id, "action_name", target_table="...", after={...})
        conn.commit()
    return {"ok": True, ...}
```

**硬规则：**

- 所有路由依赖 `AdminUser`（`profiles.role = admin`）
- 写操作必须 `_log_admin_action`
- 破坏性删除：禁止删当前登录 admin；有 FK 引用时返回 409 而非强行 CASCADE
- Auth 用户创建/硬删走 `admin_supabase.py`（需 `SUPABASE_SERVICE_ROLE_KEY`）

### 2. 前端

1. `adminApi.ts` 增加 typed 方法
2. `frontend/src/routes/admin/your-page.tsx` — `createFileRoute("/admin/your-page")`
3. `admin.tsx` NAV 增加一项（icon + label）
4. 页面结构：**标题 + 说明 → 筛选 Card → Stat/Tab → AdminTableShell 表格 → Sheet/Dialog 详情**

### 3. 文档

更新 `backend/README_API.md` 端点表（一行即可）。

---

## 领域约定

### 用户编号

- 格式：`MR-{6位序号}`，按 `profiles.created_at ASC, id ASC` 全局排序
- 搜索支持 `MR-000042` 或 `42`
- 后端：`_format_user_code` / `_parse_user_code_query`

### 题库

- **在线** = `is_active=true`（用户端 `/tests/{slug}/questions` 只读在线题）
- **已淘汰** = `is_active=false`（测试版优化遗留）
- 删除条件：已淘汰 **且** 无 `test_attempt_answers` 引用
- 批量：`POST /admin/questions/purge-inactive?suiteSlug=`

### 兑换码

- 批量生成 / 指定 `customCode` / 万能码 `LOVECOMPASS_UNIVERSAL_CODE`
- Shadow 初始化：`POST /admin/redemption/universal/ensure-all`

### 万能码

- 环境变量：`LOVECOMPASS_UNIVERSAL_CODE`（默认 `MIRROR-ALL-ACCESS`）
- 逻辑：`backend/app/universal_redemption.py`

---

## 开通管理员

**方式 A — 管理密码（推荐运营临时进入）**

1. 后端 Vercel / `.env` 设置 `LOVECOMPASS_ADMIN_PASSWORD`（本地示例 `mirror123`）
2. 用户端登录 Supabase 账号
3. 打开 `/admin` → 输入管理密码 → 获得 12h 解锁会话（`X-Admin-Unlock` 令牌，存 sessionStorage）
4. 审计日志会记录 `admin_password_unlock`

**方式 B — 数据库永久管理员**

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = '你的邮箱';
```

密码仅存服务端；前端永不硬编码。生产环境请使用强密码。

---

## 改代码检查清单

- [ ] 新 API 是否走 `AdminUser` 依赖？
- [ ] 写操作是否写入 `admin_audit_logs`？
- [ ] 前端是否经 `adminApi` 而非裸 fetch？
- [ ] 表格邮箱/编号是否用共用组件（禁止 `truncate` 截邮箱）？
- [ ] 删除/批量清理是否有 AlertDialog？
- [ ] `backend/README_API.md` 是否更新？
- [ ] 本地 `cd frontend && npm run build` 是否通过？

---

## 参考：社区 Admin Tab 模式（admin-dashboard skill）

外部项目常用结构，MIRROR 已部分采用：

| 社区 Tab 类型 | MIRROR 对应 |
|---------------|-------------|
| Overview / Stats | `/admin` |
| Live / Health | `/admin/monitor` |
| Users + RBAC | `/admin/users` |
| Audit Logs | `/admin/audit` |
| Content / Questions | `/admin/questions` |
| Codes / Access | `/admin/codes` |
| AI Chat Analytics | `/admin/chat` |

**后续可增强：**

1. 审计日志导出 CSV
2. 聊天 token 用量聚合（若 `token_usage` 字段稳定写入）
3. 外部服务健康检查 Tab
