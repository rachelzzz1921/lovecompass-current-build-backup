# LoveCompass 模块复用与 Supabase 安全接入交付说明

作者：**Manus AI**  
日期：2026-05-23

## 一、本轮结论

本轮已经把用户新增的核心约束固化为项目规则：**项目不从零开发，不整仓复制开源项目，只复用成熟模块的设计模式与边界**。后续实现将按 **测试系统、AI 系统、兑换码系统、后台系统** 四条业务线推进，并分别参考 Formbricks、Vercel AI Chatbot、Vercel AI SDK 与 react-admin 的成熟抽象。Vercel AI Chatbot 是基于 Next.js 与 AI SDK 的聊天模板，适合作为聊天消息、流式响应与多模型对话结构参考；Vercel AI SDK 提供统一模型接口与流式文本生成能力，适合抽象 LoveCompass 的 `AIAdapter.generate(prompt)`；react-admin 的 `dataProvider` 抽象适合作为后台管理的数据访问边界；Formbricks 的问卷与响应模型适合作为测试题、问题、作答与响应结构的参考。[1] [2] [3] [4]

同时，Supabase 密钥已按安全边界处理。用户提供的 publishable/anon key 已进入本地前端 `.env` 与后端 `.env`；用户提供的 secret key 只进入后端本地 `.env`，并且前后端 `.gitignore` 已覆盖 `.env` 文件。代码层面没有把密钥写死到 `src/lib`、`api`、`config` 或文档中。

## 二、已完成事项

| 模块 | 已完成内容 | 当前状态 |
|---|---|---|
| 开源复用约束 | 已写入 `lovecompass_backend/docs/开源模块复用约束与系统拆分.md` | 已固化 |
| 参考项目调研 | 已记录 `vercel/chatbot`、Vercel AI SDK、react-admin、Formbricks 的模块参考点 | 已完成 |
| 四系统拆分 | 已写入 `lovecompass_backend/docs/四系统模块复用映射方案.md` | 已完成 |
| Supabase 前端配置 | 前端 `.env.example` 改为优先使用 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，并保留 Vite 兼容变量 | 已完成 |
| Supabase 后端配置 | 后端 `.env.example` 明确 `SUPABASE_SERVICE_ROLE_KEY` 只允许服务端使用 | 已完成 |
| 本地真实密钥 | 已写入本地 `.env`，权限设为 `600`，且被 `.gitignore` 忽略 | 已完成 |
| AI Adapter | 继续保留可替换适配层，当前无智谱 Key 时使用 mock 降级 | 已完成 |
| 构建校验 | 后端 `compileall` 通过，前端 `npm run build` 通过 | 已通过 |

## 三、关键代码与文档变更

| 路径 | 作用 |
|---|---|
| `lovecompass_inspect/vite.config.ts` | 允许 Vite 同时兼容 `NEXT_PUBLIC_` 与 `VITE_` 前缀 |
| `lovecompass_inspect/src/integrations/supabase/client.ts` | 浏览器端 Supabase client 只读取公开 URL 与 anon/publishable key |
| `lovecompass_inspect/src/integrations/supabase/client.server.ts` | 服务端 Supabase client 才读取 `SUPABASE_SERVICE_ROLE_KEY` |
| `lovecompass_inspect/src/integrations/supabase/auth-middleware.ts` | 认证中间件同步公开变量命名兼容，不读取服务端 secret |
| `lovecompass_inspect/.env.example` | 前端环境变量模板已更新，不含真实密钥 |
| `lovecompass_backend/.env.example` | 后端环境变量模板已更新，不含真实密钥 |
| `lovecompass_backend/docs/Supabase_密钥接入状态与缺口.md` | 记录本轮安全接入状态与仍缺少的信息 |
| `lovecompass_backend/docs/四系统模块复用映射方案.md` | 记录四系统与开源参考项目的映射关系 |

## 四、安全校验结果

本轮执行了脱敏安全扫描，重点确认 `sb_secret_*` 没有出现在真实 `.env` 之外的源码与文档中。扫描结果显示，真实服务端 secret 未进入源码、模板或文档；模板中仅保留占位符。随后执行了后端 Python 编译与前端构建，均通过。

| 校验项 | 命令/方式 | 结果 |
|---|---|---|
| 服务端 secret 扫描 | 脱敏扫描脚本，排除真实 `.env` | 通过 |
| 后端语法编译 | `python3.11 -m compileall -q app` | 通过 |
| 前端构建 | `npm run build` | 通过 |
| Git 状态检查 | 尝试检查仓库状态 | 当前目录不是 Git 仓库，因此无需提交层面处理；若后续放入 Git 仓库，`.gitignore` 已具备基础保护 |

## 五、需要用户补充的信息

目前你发的两段 Supabase key 是有用的，但还不足以执行真库迁移。下一步如果要真正把数据落到 Supabase，需要你再提供以下信息。

| 信息 | 是否必须 | 获取位置 | 用途 |
|---|---:|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 必须 | Supabase Project Settings / API | 前端和后端 Supabase client 都需要项目 URL |
| `DATABASE_URL` | 必须 | Supabase Project Settings / Database / Connection string | 执行数据库迁移、导入题库、后端直连 PostgreSQL |
| 智谱 API Key | 暂不必须 | 智谱开放平台 | 进入真实 AI 对话联调时再需要 |
| Vercel 项目权限 | 部署前必须 | Vercel 控制台或 CLI 登录 | 生成临时预览链接、配置生产环境变量 |

> 当前我不会把 `SUPABASE_SERVICE_ROLE_KEY` 放入前端、Lovable 浏览器代码、public repo 或 client component。生产部署时，这个变量也只应配置在 Vercel 的服务端环境变量中。

## 六、下一步建议

建议下一步先补齐 `NEXT_PUBLIC_SUPABASE_URL` 与 `DATABASE_URL`。有了这两个值后，可以按顺序执行：第一，运行 Supabase 数据库迁移；第二，导入男女题库 JSON；第三，联调兑换码验证、答题提交、结果读取；第四，把聊天模块逐步替换为 SSE 与消息持久化结构；第五，再进入 react-admin 后台管理系统的模块化引入。这样可以保证每一步都围绕真实数据闭环，而不是继续扩大 mock 范围。

## References

[1]: https://github.com/vercel/chatbot "Vercel AI Chatbot GitHub Repository"  
[2]: https://ai-sdk.dev/docs/introduction "Vercel AI SDK Documentation"  
[3]: https://marmelab.com/react-admin/DataProviders.html "react-admin Data Providers Documentation"  
[4]: https://formbricks.com/docs/development/technical-handbook/database-model "Formbricks Database Model Documentation"
