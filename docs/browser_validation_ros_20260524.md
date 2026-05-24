# ROS 浏览器验收清单 · Phase 2

日期：2026-05-24  
环境：生产或本地（需 Supabase + 后端 + 前端）

## 前置

- [ ] `ros_relation_sessions` 表已存在（迁移 `202605250001`）
- [ ] `test_suites` 含 `s02_ros_female` / `s02_ros_male`（各 60 题）
- [ ] 有效 ROS 兑换码

## 发起人流程

1. [ ] 登录 → `/ros/start`
2. [ ] 选性别 + 关系阶段 → 完成 60 题
3. [ ] 提交后跳转 `/result/ros/{attemptId}`（不经 `/analyzing`）
4. [ ] 结果页五维分数与后端 `result_payload.dims` 一致
5. [ ] 手风琴展开文案来自 API `layerDetails`（非固定 mock 子维度）
6. [ ] Hero 显示 `timeLabel`（如「在一起一到三年」），非硬编码时长
7. [ ] 关系码可复制；邀请链接 `/ros/invite/{code}` 可打开

## 伴侣流程

1. [ ] 伴侣打开邀请链接 → 免兑换码进入 ROS 答题
2. [ ] 提交后跳转 `/result/ros/couple/{code}`
3. [ ] 若仅一方完成：couple 页显示「等待 TA 完成测评」

## API 抽检

```bash
# 单人结果（需 token）
curl -H "Authorization: Bearer $TOKEN" \
  "$API/ros/attempts/$ATTEMPT_ID/single"

# 故事分析（模板模式）
curl -X POST "$API/ros/story/analyze" -H "Content-Type: application/json" \
  -d '{"timeline":[{"label":"A","value":60},{"label":"B","value":72}],"milestones":[],"stageName":"磨合阵痛"}'
# 期望含 "mode":"template"
```

## 后端脚本

```bash
cd backend && python3 scripts/test_ros_scoring.py
```

## 通过标准

- 单人 + 双人链路可走通
- 结果页无假数据子维度条
- `POST /attempts` ROS 返回 `next: /result/ros/{id}`
