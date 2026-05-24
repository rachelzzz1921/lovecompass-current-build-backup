---
name: portrait-reader
description: |
  MIRROR 画像解读层。将 SELF/ROS/MATE 与 portrait_cache 转为顾问可用的跨套联动上下文。
---

# portrait-reader · 画像解读

把「用户是谁、关系怎样、择偶定位如何」翻译成**一块**顾问能直接用的摘要，而不是裸 JSON。

## 数据来源

- `profiles.portrait_cache`（优先 rebuild）
- `profile_center.build_portrait()` 聚合最新 completed attempts
- `analysis_phrase_library_v1.json` 的 `crossSuiteTemplates`

## 输出结构

1. 画像完整度（% + 标签）
2. 套一 SELF / 套二 ROS / 套三 MATE 各一行摘要（未完成则标注）
3. 套间联动（SELF×MATE、SELF×ROS、三套齐全时展开）

## 规则

- 依恋类型优先于红楼原型名（对用户说话时不主打红楼人物名）
- 综合指数仅作内部参考，回答时用自然语言
- 有 ROS 时，聊天应能引用「这段具体关系」而不只谈 SELF 泛化
- 有 MATE 时，可谈市场定位与 SELF 依恋是否同向

## 与会话绑定 attempt 的关系

portrait-reader 给**全局最新画像**；`build_profile_context_block` 给**当前会话绑定的 attempt 细节**。两者同时存在时都要遵守。
