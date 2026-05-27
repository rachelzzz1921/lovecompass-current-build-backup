# MIRROR Admin — 外部 Skill 要点摘要

> 来源：[curiositech/some_claude_skills — admin-dashboard](https://github.com/curiositech/some_claude_skills/tree/main/.claude/skills/admin-dashboard)

## 高效后台管理的 7 条原则

1. **Overview 先行**：首屏只放 KPI（用户、转化、进行中任务），明细下钻到子页
2. **Tab 或侧栏分区**：Users / Codes / Content / Monitor 不混排
3. **Admin API 四步**：鉴权 →（可选）限流 → 审计日志 → 返回 JSON
4. **StatCard 统一**：label + 大数字 + 可选 trend/status
5. **列表页 SWR/轮询**：监控类 15–30s refresh；配置类手动刷新
6. **敏感数据展示**：聚合展示，列表避免暴露完整 PII 除非运营必要（MIRROR 后台需完整邮箱则用 `AdminEmailCell`）
7. **测试 mock admin**：API 测试 mock `requireAdmin` 返回 403/200

## Admin Panel Builder 模式（shadcn 生态）

适用于 Next/shadcn 项目；MIRROR 为 TanStack Router + 同款 shadcn/ui，可对照：

- 新页：Dashboard Card → Filter Bar → Data Table → Sheet 详情
- RPC/REST：`adminApi` 等价于 TanStack Query fetcher 封装
- 导航：在 shell layout 注册路由（MIRROR：`admin.tsx` NAV 数组）

## Supabase Admin 配对使用

用户邀请/硬删、RLS、`profiles.role` 变更时，配合 `supabase-admin` skill：

- Service role 仅服务端（`admin_supabase.py`）
- 新用户：`POST /auth/v1/admin/users` + upsert `profiles`
- RLS：admin 读全量靠 `public.is_admin()` SECURITY DEFINER

## 安装外部 Skill（可选，全局）

```bash
npx skills add curiositech/some_claude_skills@admin-dashboard -g -y
npx skills add curiositech/some_claude_skills@supabase-admin -g -y
```

项目内规范以 `.cursor/skills/mirror-admin/SKILL.md` 为准；外部 skill 提供通用模式，不直接套用其文件路径。
