# Vercel preset 生产预览验收记录

时间：2026-05-23

## 验收对象

- 前端：TanStack Start + Nitro `vercel` preset 构建产物
- 预览地址：`http://localhost:4173/result/27776b4a-a44c-4df7-a754-711b46078358`
- 后端：本地 FastAPI，加载项目数据库环境变量，AI 使用 mock 模式用于无人值守验收

## 关键发现

生产构建第一次预览时，前端请求仍打到同源路径，原因是构建时未注入 `VITE_LOVECOMPASS_API_BASE_URL`。重新以 `VITE_LOVECOMPASS_API_BASE_URL=http://localhost:8000 NITRO_PRESET=vercel npm run build` 构建后，结果页可在 Vercel preset 产物预览中正常加载真实后端数据。

浏览器页面已显示用户上传设计稿的暗色墨樱视觉：顶部樱花装饰、深色渐变背景、中心人格标题、环形关系指数、画像卡片、能力雷达和 AI 画像故事。页面内容从真实结果接口读取，AI 画像故事从后端报告接口返回并展示。

## 视觉与数据状态

| 检查项 | 状态 | 说明 |
|---|---:|---|
| 设计稿视觉恢复 | 通过 | 结果页使用用户上传前端的墨樱暗色风格，而非先前暗黑星空卡片版。 |
| 真实结果数据 | 通过 | 页面展示样本 attempt 的人格、分数、报告内容。 |
| AI 报告展示 | 通过 | “画像故事”区域展示后端生成/缓存的 Markdown 报告内容。 |
| Vercel preset 构建 | 通过 | `.vercel/output` 已生成，可用于 Vercel 部署形态。 |
| 正式线上部署 | 待用户登录/配置 | 当前环境无可用 Vercel 登录态，不能无人值守发布到用户 Vercel 账号。 |

## 截图

- `/home/ubuntu/screenshots/localhost_2026-05-23_02-58-50_4649.webp`
