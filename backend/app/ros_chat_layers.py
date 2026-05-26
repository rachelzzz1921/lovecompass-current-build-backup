"""ROS 结果页问诊追问（Prompt 5）聊天层注入。"""

from __future__ import annotations

import re
from typing import Any

from app.ros_scoring import is_ros_suite

_LAYER_INQUIRY_RE = re.compile(
    r"我在看 ROS 报告里的「(?P<label>[^」]+)」层（(?P<code>[A-Z]{2})\s*·\s*(?P<score>\d+)）"
)
_BLIND_SPOT_RE = re.compile(r"我想展开了解报告里的「盲区提示」")
_COUPLE_GAP_RE = re.compile(r"我在看 ROS 双人报告里的层间差距")


def build_ros_inquiry_layer(user_message: str, attempt: dict[str, Any] | None) -> str:
    if not attempt:
        return ""
    suite = str(attempt.get("test_id") or "")
    if not is_ros_suite(suite):
        return ""

    msg = (user_message or "").strip()
    if not msg:
        return ""

    if _BLIND_SPOT_RE.search(msg):
        return """
【ROS 盲区深探模式】
用户从结果页「盲区提示」进入对话。语气：好奇、不评判。
- 先承接用户对盲区的感受
- 结合报告里自报分 vs 行为暗示分的差距，给一个更深的洞察（80–120 字）
- 结尾留一个开放问题，引导继续对话
- 禁止指责「你错了」；用「你可能还没注意到…」
""".strip()

    if _COUPLE_GAP_RE.search(msg):
        return """
【ROS 双人层间差距模式 — Prompt 5】
用户从双人报告某维度的「差距解读」进入对话。

写作规范：
- 80–120 字；先承接「你们感受不同」这件事本身，不说谁对谁错
- 结合该层差值与双方视角差异，给一个更深的洞察
- 结尾留一个开放问题：「这个差距让你想到了什么？」
- 语气温暖、好奇；禁止分析报告腔与劝分
""".strip()

    match = _LAYER_INQUIRY_RE.search(msg)
    if not match and "问诊问题：" not in msg:
        return ""

    layer_label = match.group("label") if match else "该维度"
    layer_code = match.group("code") if match else ""
    layer_score = match.group("score") if match else ""

    payload = attempt.get("result_payload") or {}
    evidence = ""
    if isinstance(payload, dict):
        ai = payload.get("ai_content") or {}
        if isinstance(ai, dict):
            layer_exp = (ai.get("layer_expansion") or {}).get(layer_code.lower()) or {}
            if isinstance(layer_exp, dict):
                evidence = str(layer_exp.get("evidence_text") or "")[:200]

    evidence_line = f"\n- 该层答题证据（供参考）：{evidence}" if evidence else ""

    return f"""
【ROS 层问诊模式 — Prompt 5】
用户从 ROS 结果页展开「{layer_label}」({layer_code} {layer_score}) 的问诊追问。{evidence_line}

写作规范：
- 80–120 字；先承接用户说的内容（「你说的…」「听起来…」）
- 结合该维度得分与相处模式，给一个更深的洞察
- 结尾留一个开放性问题，引导继续对话
- 语气温暖、好奇、不评判；禁止分析报告腔
""".strip()
