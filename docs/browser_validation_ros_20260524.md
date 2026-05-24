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
| POST /ros/story/analyze | ⚠️ | 旧部署缺 `mode:template`；fe9ad53+ 应有 |
| 发起人 POST /attempts | ✅ | `next:/result/ros/{id}`，`relationCode` ROS-XXXX-XXXX |
| GET /ros/attempts/{id}/single | ✅ | 五维 `dims`；`layerDetails` 需新后端 |
| GET /ros/couple/{code} 等待态 | ✅ | 409「等待伴侣完成测评」 |
| 伴侣 POST /attempts + couple | 🔧 | 旧版 submit 内 merge 500；已改为 lazy merge，需 redeploy |

样例关系码（E2E 产生）：`ROS-5GW8-SNF5` → attempt `b8e5210a-9342-405a-ae6b-3d0ca71225c3`

## 发起人流程（浏览器）

1. [ ] 登录 → `/ros/start`
2. [ ] 选性别 + 关系阶段 → 完成 60 题
3. [ ] 提交后跳转 `/result/ros/{attemptId}`（不经 `/analyzing`）
4. [ ] 五维分数与 API `dims` 一致
5. [ ] 手风琴文案来自 `layerDetails`（非 mock）
6. [ ] Hero 显示 `timeLabel`（由 `timeTag` 映射）
7. [ ] 关系码可复制；`/ros/invite/{code}` 可打开

## 伴侣流程

1. [ ] 邀请链接 → 免兑换码答题
2. [ ] 提交 → `/result/ros/couple/{code}`
3. [ ] 单方完成时 couple 页「等待 TA 完成测评」

## 后端脚本

```bash
cd backend && python3 scripts/test_ros_scoring.py
```

## 部署注意

- **前端/后端 Vercel 生产仍可能停在 `7bb0731`**，需 redeploy 到 `fe9ad53+` 才生效 Phase 2 UI + `layerDetails`
- 后端 Root Directory：`backend/`；前端：`frontend/`

## 通过标准

- 单人 + 双人链路 API E2E `ros_e2e_flow=ok`
- 结果页无假 SUB 维度条
- `POST /attempts` ROS 返回 `next: /result/ros/{id}`
