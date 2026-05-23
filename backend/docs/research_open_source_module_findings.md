# 开源模块参考调研摘录

作者：**Manus AI**  
日期：2026-05-23

## 已核实来源

| 序号 | 来源 | URL | 与 LoveCompass 的关系 |
|---|---|---|---|
| 1 | Vercel Chatbot GitHub 仓库 | https://github.com/vercel/chatbot | 聊天模板、AI SDK、消息持久化、多模型路由、环境变量处理 |
| 2 | Vercel AI SDK 文档 | https://ai-sdk.dev/docs/introduction | 统一模型接口、AI SDK Core、AI SDK UI、provider 抽象、流式能力 |
| 3 | React-admin Data Provider 文档 | https://marmelab.com/react-admin/DataProviders.html | 后台资源管理的数据访问抽象、CRUD 方法到 REST API 的映射 |
| 4 | Formbricks Database Model 文档 | https://formbricks.com/docs/development/technical-handbook/database-model | 问卷中心模型、Response 模型、多租户和 PostgreSQL/Prisma 数据组织参考 |

## 关键发现

Vercel Chatbot 官方仓库明确将其定位为基于 **Next.js 与 AI SDK** 的开源聊天模板，并包含数据持久化、聊天历史、用户数据、文件存储和多模型路由等能力。它的 README 还强调 `.env` 不应提交，环境变量建议通过 Vercel Environment Variables 管理。这与 LoveCompass 的 AI 系统高度相关，但当前项目不应整仓复制，只应参考 **消息表、聊天 API、SSE 流式响应、模型路由配置和环境变量纪律**。

Vercel AI SDK 文档明确其目标是标准化不同模型提供商的集成，并分为 **AI SDK Core** 与 **AI SDK UI** 两层。LoveCompass 当前后端已实现 Python 版本的 `AIAdapter.generate(prompt)` 占位，这一方向与 AI SDK 的 provider 抽象一致。若后续切入 Next.js 服务端 API 或需要更成熟的流式聊天 UI，可评估引入 AI SDK；在当前 FastAPI 后端阶段，优先保持轻量适配层，避免过早引入不必要工具栈。

React-admin 文档将 **Data Provider** 定义为后台前端与 API 之间的接口层，并通过 `getList`、`getOne`、`create`、`update`、`delete` 等方法映射到 REST API。LoveCompass 后台系统可以把 `test_suites`、`test_questions`、`redemption_codes`、`attempts`、`ai_jobs` 等实体设计成 Resource，而后端只需提供兼容这些 CRUD 语义的管理 API。

Formbricks 数据模型文档强调 Survey 是问卷中心模型，Response 记录用户答案，并使用 PostgreSQL 与 Prisma 管理 schema。LoveCompass 测试系统可借鉴其 **Survey/Question/Response** 拆分，但需要保留本项目自己的题型契约、评分结构、兑换码解锁和 AI 分析流程。

## 初步结论

LoveCompass 后续不应从参考项目中复制完整代码，而应复用成熟模式：测试系统借鉴 Formbricks 的问卷/响应模型；AI 系统借鉴 Vercel Chatbot 与 AI SDK 的流式聊天和 provider 抽象；后台系统借鉴 react-admin 的 Resource/Data Provider 模式；兑换码系统保留自研业务模型，但后台管理可接入 react-admin 资源。
