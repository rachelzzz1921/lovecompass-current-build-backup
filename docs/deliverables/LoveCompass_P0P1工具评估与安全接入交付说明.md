# LoveCompass P0/P1 工具评估与安全接入交付说明

作者：**Manus AI**  
日期：2026-05-23

## 一、本轮交付摘要

本轮任务围绕 LoveCompass 的 P0/P1 工具清单进行了兼容性评估、轻量依赖接入、安全边界复核和最终构建校验。根据当前项目形态，LoveCompass 仍保持 **Lovable/Vite + React + TypeScript + TanStack Router 前端、FastAPI 独立后端、Supabase PostgreSQL 数据库、SQL migration 作为数据模型真源** 的架构，不引入会破坏该边界的重型替代方案。

> 本轮结论是：**AI SDK、OpenAI-compatible provider 和 NanoID 已采用；Supabase 与 Recharts 继续沿用；Prisma、Upstash Redis、Langfuse、Refine/react-admin、PostHog、Sentry 暂缓**。最终安全扫描、前端构建和后端编译均已通过。当前唯一阻塞 Supabase 真库联调的关键缺口仍是 `DATABASE_URL`。

## 二、工具采用与暂缓决策

| 工具 | 本轮状态 | 处理结果 | 决策理由 |
|---|---|---|---|
| Vercel AI SDK | **已采用** | 前端安装 `ai`，并通过 `src/lib/ai/aiAdapter.server.ts` 建立服务端 AI 适配层。 | AI SDK 提供统一模型调用与流式生成抽象，适合承载智谱等 OpenAI-compatible 模型接入。[1] |
| `@ai-sdk/openai-compatible` | **已采用** | 与 AI SDK 一起用于预留智谱 OpenAI-compatible 接入。 | 让业务层调用 `generateAnalysis()`、`chat()`、`streamChat()`，避免业务代码直接判断 provider。[1] |
| NanoID | **已采用** | 新增 `src/lib/utils/codeGenerator.ts`，生成 `LOVE-AB12-XY89` 风格兑换码与匿名 token。 | NanoID 是轻量、安全、成熟的随机 ID 方案，优于手写随机逻辑。[2] |
| Supabase | **已采用并安全配置** | 前端仅保留公开 anon key；后端本地 `.env` 保存 service role key；`.gitignore` 阻止 `.env` 入库。 | Supabase 继续作为 PostgreSQL 与服务端数据访问基础设施，密钥必须分层隔离。[3] |
| Recharts | **已存在并沿用** | 当前前端依赖已有 `recharts`。 | 继续用于结果页雷达图和维度可视化，不重复安装。 |
| Vercel AI Chatbot | **只参考设计** | 不复制整仓代码。 | 可参考聊天消息结构、SSE 与多轮会话模式，但当前项目不应替换既有 UI 与后端边界。[4] |
| Prisma | **暂缓** | 未安装。 | 当前后端为 FastAPI + SQL migration，Prisma 会引入 Node ORM 与 Python 后端的双模型风险。 |
| Upstash Redis | **暂缓** | 未安装。 | 需要额外平台注册与环境变量，且当前还未进入缓存、限流或频控阶段。 |
| Langfuse | **暂缓** | 未安装。 | 需要 Langfuse 项目密钥，适合真实 AI 联调前后接入，而非当前阶段强行加入。 |
| Refine/react-admin | **暂缓** | 未安装。 | 后台系统尚未进入实现阶段，后续可在 `/admin` 独立评估成熟后台框架。 |
| PostHog | **暂缓** | 未安装。 | 需要项目 key，属于核心链路稳定后的产品分析阶段。 |
| Sentry | **暂缓** | 未安装。 | 需要 DSN；且附件中的 Next.js wizard 不直接适配当前 Vite + FastAPI 组合。 |

## 三、已新增或更新的关键文件

| 路径 | 变更说明 | 安全说明 |
|---|---|---|
| `/home/ubuntu/lovecompass_inspect/src/lib/ai/aiAdapter.server.ts` | 新增前端服务端侧 AI Adapter，基于 Vercel AI SDK 与 OpenAI-compatible provider，预留 `ZHIPU_API_KEY`。 | 只应在服务端导入，禁止从浏览器组件导入；不硬编码密钥。 |
| `/home/ubuntu/lovecompass_inspect/src/lib/utils/codeGenerator.ts` | 新增 NanoID 工具，生成兑换码与匿名 token。 | 不涉及外部密钥；使用安全随机 ID 方案。 |
| `/home/ubuntu/lovecompass_inspect/package.json` 与 lockfile | 新增 `ai`、`@ai-sdk/openai-compatible`、`nanoid`。 | 依赖安装不包含任何凭据。 |
| `/home/ubuntu/lovecompass_backend/docs/P0_P1工具清单评估与采用记录.md` | 写入 P0/P1 工具逐项评估、采用理由和暂缓理由。 | 文档只包含占位格式与原则说明，不包含真实 secret。 |

## 四、安全扫描结果

本轮执行了项目已有脱敏安全扫描脚本：

```bash
cd /home/ubuntu && python3.11 scan_lovecompass_secrets.py
```

扫描输出只发现 `.env.example` 与文档中的 **placeholder** 样例，例如 `postgresql***stgres`、`sb_publish***on_jwt`、`sb_secret_***le_key`，未发现新增源码文件中存在真实 Supabase JWT、service role key、AI Key 或数据库连接串。该结果符合当前密钥规则：真实密钥只保存在本地 `.env`，而 `.env` 已被 `.gitignore` 忽略。

| 检查项 | 结果 | 说明 |
|---|---|---|
| 新增 `codeGenerator.ts` | **通过** | 未包含任何密钥。 |
| 新增 `aiAdapter.server.ts` | **通过** | 仅通过环境变量读取 `ZHIPU_API_KEY`，无硬编码 key。 |
| 文档与模板 | **通过** | 只包含占位示例，无真实 secret。 |
| 前端公开变量边界 | **通过** | 前端只允许 `NEXT_PUBLIC_` / `VITE_` 公开 anon key。 |
| service role 使用边界 | **通过** | service role 仅应在后端或服务端上下文使用。 |

## 五、构建与编译校验结果

本轮执行了前端生产构建与后端 Python 编译校验。前端构建命令如下：

```bash
cd /home/ubuntu/lovecompass_inspect && npm run build
```

构建结果为 **通过**，Vite/TanStack Router 产物已成功生成，新增 `ai`、`@ai-sdk/openai-compatible` 与 `nanoid` 没有破坏现有构建链路。后端编译命令如下：

```bash
cd /home/ubuntu/lovecompass_backend && python3.11 -m py_compile app/main.py app/ai_adapter.py
```

后端编译结果为 **通过**，`app/main.py` 与 `app/ai_adapter.py` 语法校验无误。

| 校验项 | 命令 | 结果 |
|---|---|---|
| 密钥扫描 | `python3.11 scan_lovecompass_secrets.py` | **通过，仅 placeholder 命中** |
| 前端构建 | `npm run build` | **通过** |
| 后端编译 | `python3.11 -m py_compile app/main.py app/ai_adapter.py` | **通过** |

## 六、当前仍然阻塞的事项

当前 Supabase 项目 ref、URL、anon JWT 与 service role JWT 已经安全落地，但 **缺少 `DATABASE_URL`**，因此无法继续执行以下任务：

| 阻塞任务 | 需要的输入 | 原因 |
|---|---|---|
| 执行数据库迁移 | `DATABASE_URL` | 需要直连 Supabase PostgreSQL 才能运行 `migrations/202605230001_lovecompass_v1_core_schema.sql`。 |
| 导入真实题库 | `DATABASE_URL` | 题库导入脚本需要写入 `test_suites` 与 `test_questions`。 |
| 真库端到端联调 | `DATABASE_URL` | 答题、提交、结果、聊天都需要真实表结构与数据。 |
| Vercel 临时部署准备 | `DATABASE_URL` 与生产环境变量 | 部署前需要确认数据库和服务端环境变量。 |

需要用户提供的连接串格式如下：

```text
PostgreSQL 连接串示例已脱敏：使用 `协议 + 用户名 + 密码 + 主机 + 端口 + 数据库名` 的标准格式配置到本地或部署平台环境变量。
```

也可以只提供 Supabase 数据库密码，由我在本地 `.env` 中拼接连接串。该连接串不会写入源码或文档，只会进入后端本地 `.env`，未来生产环境应通过 Vercel Environment Variables 或后端部署平台的环境变量面板配置。

## 七、建议的下一阶段执行顺序

拿到 `DATABASE_URL` 后，建议立即进入 Supabase 真库联调阶段。合理顺序是先执行 SQL migration，再运行题库导入脚本，随后进行答题页到结果页再到 AI 聊天入口的端到端验证。智谱 API Key 可以等真实 AI 分析联调时再提供；在此之前，AI Adapter 保持无 Key 降级或占位响应即可。

| 顺序 | 任务 | 说明 |
|---|---|---|
| 1 | 写入后端 `.env` 的 `DATABASE_URL` | 仅本地保存，不入库。 |
| 2 | 执行核心 SQL migration | 创建测试、作答、兑换码、AI 作业、聊天等核心表。 |
| 3 | 导入题库 | 使用现有男女生题库 JSON 生成导入 SQL 或直接写库。 |
| 4 | 启动前后端本地联调 | 验证答题、提交、结果、历史和聊天入口。 |
| 5 | 接入真实智谱 Key | 通过 `AIAdapter` 统一接入，不在业务层判断 provider。 |
| 6 | 部署临时链接 | 前端优先走 Vercel 临时链接，后端按独立 FastAPI 服务部署。 |

## References

[1]: https://ai-sdk.dev/docs/introduction "Vercel AI SDK Documentation"
[2]: https://github.com/ai/nanoid "NanoID Repository"
[3]: https://supabase.com/docs "Supabase Documentation"
[4]: https://github.com/vercel/ai-chatbot "Vercel AI Chatbot Repository"
