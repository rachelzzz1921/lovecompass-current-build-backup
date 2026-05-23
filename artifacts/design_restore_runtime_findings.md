# 设计稿恢复后的本地运行验收记录

时间：2026-05-23 02:45

## 观察

恢复用户上传设计稿视觉后的结果页可以正常进入前端路由，页面标题为 `MIRROR · AI 关系画像系统`，背景与上传设计稿一致，为暗色渐变、中心加载/错误提示风格。

首次以错误环境变量 `VITE_API_BASE_URL` 启动时，前端 API 封装实际读取的是 `VITE_LOVECOMPASS_API_BASE_URL`，导致请求落到前端自身路径并返回 `请求失败：404`。

随后以 `VITE_LOVECOMPASS_API_BASE_URL=http://localhost:8000` 重新启动前端后，浏览器出现 `Failed to fetch`。这通常意味着浏览器侧无法完成跨源请求，下一步需要检查后端 CORS 允许源、后端服务状态以及 API 路径可用性。

## 下一步

1. 检查后端 CORS 配置是否允许 `http://localhost:5173`。
2. 用 curl 验证 `/attempts/{attempt_id}/result` 是否能从本地命令行正常返回。
3. 若命令行可用但浏览器失败，修正 CORS；若命令行也失败，修正后端环境或样本 attempt。
