# LoveCompass Supabase、Vercel 与 AI Adapter 准备交付说明

作者：**Manus AI**  
日期：2026-05-23

## 一、本轮完成内容

我已根据你的技术栈取向继续推进，没有擅自更换主框架，也没有引入需要额外注册或付费的新工具。当前策略是继续利用 Lovable 已经完成的前端呈现与交互设计，优先把 **Supabase 联调准备、Vercel 临时上线路径、智谱 AI 适配层和项目文档沉淀** 做好。

| 模块 | 已完成动作 | 文件位置 |
|---|---|---|
| 既有成果沉淀 | 将上一轮交付说明与题型契约文档复制进后端项目 `docs` 目录，方便随代码维护 | `lovecompass_backend/docs/交付说明_20260523.md`、`lovecompass_backend/docs/前端题型契约与跳转修复方案.md` |
| 前端环境模板 | 新增前端 `.env.example`，包含 Supabase publishable key 与独立后端 API 地址 | `lovecompass_inspect/.env.example` |
| 后端环境模板 | 新增后端 `.env.example`，区分数据库连接、Supabase 服务端配置、CORS、智谱 Key 与 demo user | `lovecompass_backend/.env.example` |
| 工具栈说明 | 记录当前为何不马上切到 Next.js/Prisma、哪些工具暂不需要注册、哪些工具即将需要 | `lovecompass_backend/docs/工具栈与上线准备清单.md` |
| AI Adapter | 新增统一 `generate(prompt)` 抽象，预留智谱接入；未配置 Key 时自动降级为 mock，占位但不断链路 | `lovecompass_backend/app/ai_adapter.py` |
| 聊天接口接入 | `/chat/message` 已改为调用统一 AI Adapter，业务层不直接绑定智谱实现 | `lovecompass_backend/app/main.py` |
| AI 设计文档 | 记录 Adapter 设计目标、环境变量、何时需要智谱 Key，以及为什么当前暂不新增 SDK | `lovecompass_backend/docs/AI_Adapter_设计说明.md` |

## 二、关于工具栈更新的判断

这次没有引入新 npm 包、Python 包或第三方 SDK。智谱适配层先用 Python 标准库 `urllib` 实现，目的是避免在 Key 尚未进入联调前增加依赖复杂度。等我们开始做真实 AI 报告生成、流式聊天、重试、超时策略或多模型路由时，我会再提前告诉你是否需要引入智谱官方 SDK、`httpx`、队列或缓存。

| 工具 | 本轮是否新增 | 判断 |
|---|---:|---|
| Next.js | 否 | 当前 Lovable 前端可构建，暂不重写。 |
| Prisma | 否 | 后端仍用 `psycopg` 对齐现有 PostgreSQL schema。 |
| 智谱 SDK | 否 | 先完成 Adapter 抽象，Key 到位后再决定是否使用 SDK。 |
| Vercel | 否 | 仅补齐临时部署环境变量路径，部署前再配置。 |
| Upstash Redis | 否 | MVP 暂不需要缓存/限流服务。 |
| Cloudflare R2 | 否 | 当前没有文件上传与录存需求。 |
| Supabase | 已准备接入 | 已有前端配置，下一步需要服务端连接信息执行迁移。 |

## 三、需要你协助准备的内容

你已经提供了 Supabase 项目的 publishable key，这对前端初始化足够；但如果要真正把我已经写好的数据库迁移和题库导入落入 Supabase，需要服务端连接信息。请注意，下面的高敏信息不要发到公开渠道，最好只放在后端 `.env` 或部署平台环境变量中。

| 优先级 | 需要内容 | 用途 | 备注 |
|---:|---|---|---|
| 高 | Supabase Database URL 或数据库密码 | 执行迁移、导入题库、后端 API 查询写入 | 这是下一步 Supabase 落库的关键。 |
| 中 | Supabase Service Role Key | 后端服务端管理操作、绕过 RLS 的任务 | 可以稍后再给；生产前必须严格保密。 |
| 中 | 智谱 API Key | 真实 AI 报告与聊天联调 | 现在还不急，需要时我会明确再要。 |
| 中 | Vercel 项目权限或部署方式 | 生成临时预览链接 | 等本地 Supabase 联调跑通后再做。 |
| 低 | 自定义域名、邮件模板、登录跳转 URL | 生产化体验 | 暂不阻塞 MVP。 |

## 四、校验结果

我已运行后端 Python 编译校验与前端构建校验，确认这次改动没有破坏现有工程。

| 校验项 | 命令 | 结果 |
|---|---|---|
| 后端 Python 语法 | `python3.11 -m py_compile app/*.py` | 通过 |
| 前端构建 | `npm run build` | 通过 |

## 五、建议的下一步

下一步建议进入 **Supabase 真库联调**。我会先把迁移 SQL 和题库导入脚本对准你的 Supabase 项目执行路径，确认 `test_suites`、`test_questions`、`attempts`、`attempt_answers` 等核心表可以真实写入。随后再把前端的 `VITE_LOVECOMPASS_API_BASE_URL` 指向后端，跑通“进入测试 → 兑换码/开始 → 作答提交 → 真实 attemptId → 分析页 → 结果页 → 聊天页”的完整链路。

在执行真库迁移前，我需要你提供 **Supabase 数据库连接串或数据库密码**。如果你希望我继续先做不依赖真库的工作，我也可以先完善 RLS 策略草案、兑换码后台导入脚本、Auth 登录流或 Vercel 部署说明。
