# ROS 浏览器验收清单 · Phase 2

日期：2026-05-24（更新）  
环境：生产 — `lovecompass-web.vercel.app` + `lovecompass-api-backend.vercel.app`

## 前置（API / DB 已验）

- [x] `ros_relation_sessions` 表已存在
- [x] `s02_ros_female` / `s02_ros_male` 各 62 题（60 + 2 PRE）
- [x] 兑换码 `LC-ROS-F-20260524` / `LC-ROS-M-20260524`
- [x] 测试账号 `lovecompass.test@example.com` / `lovecompass.partner.test@example.com`（密码见 `scripts/supabase-setup-test-auth.sh`）

## API E2E（`backend/scripts/validate_ros_e2e_flow.py`）

```bash
cd backend && LOVECOMPASS_API_BASE=https://lovecompass-api-backend.vercel.app python3 scripts/validate_ros_e2e_flow.py
```

| 步骤 | 状态 | 备注 |
|------|------|------|
| GET /health | ✅ | |
| POST /ros/story/analyze | ✅ | `mode:template` |
| 发起人 POST /attempts | ✅ | `next:/result/ros/{id}`，`relationCode` ROS-XXXX-XXXX |
| GET /ros/attempts/{id}/single | ✅ | 五维 `dims`；`layerDetails` 已返回 |
| GET /ros/codes/{code} | ⚠️ | 生产缺 `suiteTier`/`suiteSlug`；redeploy 后伴侣 tier 对齐生效 |
| GET /ros/couple/{code} 等待态 | ✅ | 409「等待伴侣完成测评」 |
| 伴侣 POST /attempts + couple | 🔧 | 伴侣 submit ✅；`GET /ros/couple/{code}` merge 仍 500（需 redeploy + 排查 merge） |

样例关系码（E2E 2026-05-25）：`ROS-F6RH-FQ2Q` → attempt `4774dd77-a0e0-4bd2-ae7d-0cd5b03afd58`

## 发起人流程（浏览器）

1. [x] 登录 → `/ros/start`（生产 + 本地 dev `:5174`）
2. [ ] 选性别 + 关系阶段 → 完成 60 题（未跑全量答题）
3. [x] 提交后跳转 `/result/ros/{attemptId}`（API E2E 已验 `next` 字段）
4. [x] 五维分数与 API `dims` 一致（结果页 AT/IN/CO/EV/RK 手风琴）
5. [x] 手风琴文案来自 `layerDetails`（非 mock）
6. [x] Hero 显示阶段标签（`timeTag` → 暧昧中等）
7. [x] 关系码可复制；`/ros/invite/{code}` 可打开

## 伴侣流程

1. [x] 邀请链接 → 免兑换码答题入口（生产 + 本地 invite 页）
2. [ ] 提交 → `/result/ros/couple/{code}`（couple merge 500 阻塞）
3. [x] 单方完成时 couple 页「等待 TA 完成测评」（API 409 已验）

## Tier 对齐（2026-05-25 新增）

- 后端 `GET /ros/codes/{code}` 返回 `suiteTier` + `suiteSlug`（代码已写，待 redeploy）
- 伴侣 `ros.start` / `ros.invite` 读取 preview 并对齐 tier（本地 invite 显示「与 TA 对齐 · 完整版 · 62 题」）
- `link_partner_to_session` 校验 initiator/partner tier 一致

## 后端脚本

```bash
cd backend && python3 scripts/test_ros_scoring.py
```

`test_ros_scoring.py`：`insights` 条数断言需与当前 scoring 输出同步（本地 2026-05-25 失败）。

## 部署注意

- **前端/后端 Vercel 生产需 redeploy** 才生效：`suiteTier` API、tier 对齐 UI、couple merge 修复
- 本地 dev：`frontend/.env` 需 Supabase + `VITE_LOVECOMPASS_API_BASE_URL`；默认端口可能为 `5174`
- 后端 Root Directory：`backend/`；前端：`frontend/`

## 通过标准

- 单人 + 双人链路 API E2E `ros_e2e_flow=ok`（当前 couple merge 500 未达标）
- 结果页无假 SUB 维度条
- `POST /attempts` ROS 返回 `next: /result/ros/{id}`
