# MIRROR 国内镜像部署指南

内地用户常无法稳定访问 `*.vercel.app` 与 `*.supabase.co`。推荐用 **独立域名 + 香港/新加坡 VPS 反代**，数据库仍用现有 Supabase，无需双写。

## 架构

```
用户（内地） → mirror.example.com（静态前端，OSS 或 VPS）
            → api.mirror.example.com（nginx → lovecompass-api-backend.vercel.app）
            → sb.mirror.example.com（nginx → busyjidkgfakqglldyye.supabase.co）
            → 同一 Postgres / 同一套测评数据
```

国际主站 `lovecompass-web.vercel.app` 保持不变；镜像站是额外入口。

## 一、准备域名与 VPS

1. 备案：若用 **内地 CDN + .cn 域名**，需 ICP 备案；**香港 VPS + .com** 通常无需备案，内地访问率更高但不如纯境内 CDN。
2. 子域建议：
   - `mirror.example.com` — 前端
   - `api.mirror.example.com` — API 反代
   - `sb.mirror.example.com` — Supabase 反代
3. 在 VPS 安装 nginx，复制 [`mirror/nginx.conf`](../mirror/nginx.conf)，替换 `example.com` 并配置 SSL。

## 二、后端 CORS

在 Vercel **lovecompass-api-backend** 环境变量 `CORS_ORIGINS` 中追加镜像前端域名：

```text
https://lovecompass-web.vercel.app,https://mirror.example.com,http://localhost:5173
```

保存后 Redeploy 后端。

也可设置 `CORS_MIRROR_ORIGIN_REGEX`（正则），与 `CORS_ORIGINS` 叠加，便于多个镜像子域。

## 三、Supabase Auth 回调

Supabase Dashboard → Authentication → URL Configuration：

- **Site URL** 可保留主站，或改为镜像域
- **Redirect URLs** 增加：
  - `https://mirror.example.com/auth/callback`
  - `https://mirror.example.com/auth/callback/**`
  - `https://mirror.example.com/auth**`

## 四、构建镜像版前端

```bash
cp mirror/.env.mirror.example frontend/.env.production.local
# 编辑 .env.production.local：填入真实镜像域名与 anon key

cd frontend
npm ci
npm run build:vercel

# 静态资源在 .output/public（或按 Nitro 输出目录）
rsync -av .output/public/ user@vps:/var/www/mirror/
```

环境变量说明见 [`mirror/.env.mirror.example`](../mirror/.env.mirror.example)。

前端已内置：

- 镜像域名 / 东八区时区自动走镜像 API
- 主站不可达时自动 fallback 到 `VITE_LOVECOMPASS_API_MIRROR_URL`
- `localStorage` 键 `mirror:prefer`（可在控制台 `localStorage.setItem('mirror:prefer','1')` 强制镜像）

## 五、验收

| 步骤 | 命令/操作 |
|------|-----------|
| API 反代 | `curl https://api.mirror.example.com/health` → `{"ok":true}` |
| Supabase | 浏览器打开镜像站 `/auth` 能注册/登录 |
| 完整链路 | 兑换码 → 答题 → 结果页 → `/chat` 同步画像 |

## 六、常见问题

**Q：能否只镜像前端，API 仍用 Vercel？**  
A：不行。内地往往连 `vercel.app` 本身都访问不了，必须 API 也走反代域名。

**Q：数据会两套吗？**  
A：不会。反代只改网络路径，数据库仍是 Supabase 真库。

**Q：智谱 AI / 报告生成？**  
A：走镜像 API 反代到同一 Vercel 后端，密钥仍在后端环境变量，无需改动。

**Q：要不要纯境内云（阿里云函数 + RDS）？**  
A：长期可选，但需迁移数据库与重新备案，成本高。香港反代是 MVP 最快方案。
