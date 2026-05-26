"""ROS 结果页问诊追问（Prompt 5）聊天层注入。"""

from __future__ import annotations

import re
from typing import Any

from app.atom_natural_map import naturalize_atoms
from app.chat_prompt_layers import score_band_label
from app.ros_scoring import ROS_LAYER_LABELS, is_ros_suite

_LAYER_INQUIRY_RE = re.compile(
    r"我在看 ROS 报告里的「(?P<label>[^」]+)」层（(?P<code>[A-Z]{2})\s*·\s*(?P<score>\d+)）"
)

ROS_TRIGGER_PATTERNS: dict[str, Any] = {
    "couple_gap": [
        r"层间差距",
        r"双人报告",
        r"他/她的.*和我的",
        r"我们俩.*不同",
        r"我在看 ROS 双人报告",
    ],
    "blind_spot": [
        r"盲区提示",
        r"我想展开了解报告里的「盲区",
        r"自报.*行为",
        r"行为暗示",
    ],
    "single_layer": {
        "AT": [r"吸引", r"喜欢我吗", r"有没有感觉", r"化学反应"],
        "IN": [r"互动", r"沟通", r"说话方式", r"相处质量"],
        "CO": [r"兼容", r"合不合适", r"价值观", r"生活习惯"],
        "EV": [r"演化", r"未来", r"发展", r"走向", r"下一步"],
        "RK": [r"风险", r"红旗", r"危险信号", r"该不该继续", r"红线"],
    },
}

ROS_SINGLE_LAYER_TEMPLATE = """
【ROS 关系报告深探层 · 当前聚焦：{layer_label}】
禁止重算分数 / 禁止暴露层级编号（AT/IN/CO/EV/RK）给用户

--- 本层画像原子 ---
{layer_atoms}

--- 跨层关联线索（用于纵深追问，不主动全报） ---
{cross_layer_hints}

--- 本轮回答规范 ---
1. 开头用一句话承接用户在这一层的具体感受，不泛泛共情
2. 用本层原子作为依据给洞察，禁止逐字复读报告
3. 得分区间（{score_band}）用自然语言描述倾向，不报具体数字
4. 以一个开放问题收尾，问题引导用户往相邻层延伸
5. 字数 80–140；短句为主
""".strip()

ROS_BLIND_SPOT_TEMPLATE = """
【ROS 盲区提示深探层】
禁止重算分数 / 禁止暴露维度编号

--- 用户盲区原子 ---
{blind_spot_atoms}

--- 自报与行为暗示的落差证据 ---
{gap_evidence}

--- 本轮回答规范 ---
1. 先说「你自己说的」和「行为暗示」之间的具体落差是什么
2. 不评判对错，给一个「为什么会有这个落差」的解读
3. 提一个可观察的验证点（用户自己能在接下来一周内看到的）
4. 字数 80–140；禁止说「你在骗自己」等评判性用语
""".strip()

ROS_COUPLE_GAP_TEMPLATE = """
【ROS 双人层间差距深探层 · 层级：{layer_label}】
禁止重算分数 / 禁止暴露层级编号 / 不做道德裁判

--- 用户本层线索 ---
{user_layer_atoms}

--- 伴侣侧线索（来自用户描述或报告） ---
{partner_layer_atoms}

--- 差距核心 ---
{gap_summary}

--- 本轮回答规范 ---
1. 描述两人在这一层的「不同语言」是什么（不是谁对谁错）
2. 给一个差距为什么会产生的结构性解读
3. 提一个双方都能尝试的具体沟通动作
4. 字数 100–160；禁止说「你们不合适」等绝对结论
""".strip()

ROS_LIGHT_TEMPLATE = """
【ROS 关系上下文 · 轻量补充】
用户已完成 ROS 测评；仅在与关系质量相关时织入以下线索，勿主动五层全报：
{cross_layer_hints}
""".strip()


def classify_ros_intent(prefill: str | None, user_message: str) -> tuple[str, str | None]:
    """返回 (intent_type, layer_code | None)。intent: couple_gap | blind_spot | single_layer | light | none"""
    text = f"{prefill or ''}\n{user_message or ''}"
    if _LAYER_INQUIRY_RE.search(text) or "问诊问题：" in text:
        match = _LAYER_INQUIRY_RE.search(text)
        code = (match.group("code") if match else "").upper()
        return "single_layer", code or None

    for pattern in ROS_TRIGGER_PATTERNS["couple_gap"]:
        if re.search(pattern, text):
            return "couple_gap", None
    for pattern in ROS_TRIGGER_PATTERNS["blind_spot"]:
        if re.search(pattern, text):
            return "blind_spot", None

    for layer_code, patterns in ROS_TRIGGER_PATTERNS["single_layer"].items():
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return "single_layer", layer_code

    return "none", None


def _payload(attempt: dict[str, Any]) -> dict[str, Any]:
    raw = attempt.get("result_payload") or {}
    return raw if isinstance(raw, dict) else {}


def _layer_score(payload: dict[str, Any], code: str) -> float | None:
    code_u = code.upper()
    for layer in payload.get("layers") or []:
        if isinstance(layer, dict) and str(layer.get("code", "")).upper() == code_u:
            try:
                return float(layer.get("score"))
            except (TypeError, ValueError):
                return None
    dims = attempt_dimension_scores(payload)
    if code_u in dims:
        return dims[code_u]
    return None


def attempt_dimension_scores(payload: dict[str, Any]) -> dict[str, float]:
    out: dict[str, float] = {}
    for layer in payload.get("layers") or []:
        if isinstance(layer, dict) and layer.get("code") is not None:
            try:
                out[str(layer["code"]).upper()] = float(layer.get("score"))
            except (TypeError, ValueError):
                continue
    return out


def _ros_atoms_from_payload(payload: dict[str, Any]) -> list[str]:
    atoms: list[str] = []
    rel = payload.get("relationshipType") or {}
    if isinstance(rel, dict) and rel.get("name"):
        atoms.append(str(rel["name"]))
    stage = payload.get("relationshipStage") or {}
    if isinstance(stage, dict) and stage.get("name"):
        atoms.append(f"阶段·{stage['name']}")
    resonance = payload.get("resonance") or {}
    if isinstance(resonance, dict) and resonance.get("tier"):
        atoms.append(f"共鸣·{resonance['tier']}")
    ai = payload.get("ai_content") or {}
    if isinstance(ai, dict):
        blind = ai.get("blind_spot")
        if isinstance(blind, dict) and blind.get("title"):
            atoms.append(str(blind.get("title")))
    return atoms


def _layer_atoms(payload: dict[str, Any], code: str) -> list[str]:
    code_l = code.lower()
    code_u = code.upper()
    atoms: list[str] = []
    ai = payload.get("ai_content") or {}
    if isinstance(ai, dict):
        exp = (ai.get("layer_expansion") or {}).get(code_l) or {}
        if isinstance(exp, dict):
            for sub in exp.get("subdims") or []:
                if isinstance(sub, dict) and sub.get("label"):
                    atoms.append(str(sub["label"]))
            if exp.get("evidence_text"):
                atoms.append(str(exp["evidence_text"])[:80])
    for layer in payload.get("layers") or []:
        if isinstance(layer, dict) and str(layer.get("code", "")).upper() == code_u:
            if layer.get("displaySummary"):
                atoms.append(str(layer["displaySummary"]))
            elif layer.get("name"):
                atoms.append(str(layer["name"]))
    return atoms


def _cross_layer_hints(payload: dict[str, Any]) -> str:
    scores = attempt_dimension_scores(payload)
    hints: list[str] = []
    at, inn = scores.get("AT"), scores.get("IN")
    if at is not None and inn is not None:
        if at >= 65 and inn < 50:
            hints.append("高吸引低亲密")
        if inn >= 65 and at < 50:
            hints.append("互动投入高但吸引面相对弱")
    co, ev = scores.get("CO"), scores.get("EV")
    if co is not None and ev is not None and co >= 65 and ev < 50:
        hints.append("高协作低成长")
    if scores.get("RK", 0) >= 65:
        hints.append("风险敏感")
    if not hints:
        hints = _ros_atoms_from_payload(payload)[:4]
    return naturalize_atoms(hints)


def _blind_spot_bundle(payload: dict[str, Any]) -> tuple[str, str]:
    ai = payload.get("ai_content") or {}
    blind = ai.get("blind_spot") if isinstance(ai, dict) else None
    if not isinstance(blind, dict):
        return "（报告未生成盲区模块）", "（暂无落差证据）"
    atoms = [
        str(blind.get("title") or ""),
        str(blind.get("gap_summary") or blind.get("blind_spot_text") or ""),
    ]
    atoms = [a for a in atoms if a]
    gap = str(
        blind.get("gap_evidence")
        or blind.get("evidence")
        or blind.get("description")
        or "自报感受与相处中的行为暗示存在温差"
    )[:300]
    return naturalize_atoms(atoms), gap


def build_ros_inquiry_layer(
    user_message: str,
    attempt: dict[str, Any] | None,
    *,
    prefill: str | None = None,
) -> str:
    if not attempt:
        return ""
    suite = str(attempt.get("test_id") or attempt.get("suite_slug") or "")
    if not is_ros_suite(suite):
        return ""

    msg = (user_message or "").strip()
    if not msg and not (prefill or "").strip():
        return ""

    payload = _payload(attempt)
    intent, layer_code = classify_ros_intent(prefill, msg)

    if intent == "couple_gap":
        label = "关系互动"
        if _LAYER_INQUIRY_RE.search(msg):
            label = _LAYER_INQUIRY_RE.search(msg).group("label")  # type: ignore[union-attr]
        code = layer_code or "IN"
        return ROS_COUPLE_GAP_TEMPLATE.format(
            layer_label=label,
            user_layer_atoms=naturalize_atoms(_layer_atoms(payload, code)),
            partner_layer_atoms="（伴侣数据未在本次会话绑定；以用户描述与双人报告语境为准）",
            gap_summary=_cross_layer_hints(payload),
        )

    if intent == "blind_spot":
        atoms, gap = _blind_spot_bundle(payload)
        return ROS_BLIND_SPOT_TEMPLATE.format(
            blind_spot_atoms=atoms,
            gap_evidence=gap,
        )

    if intent == "single_layer":
        match = _LAYER_INQUIRY_RE.search(msg)
        code = (layer_code or (match.group("code") if match else "") or "IN").upper()
        label = ROS_LAYER_LABELS.get(code, match.group("label") if match else "该维度")
        score = None
        if match:
            try:
                score = float(match.group("score"))
            except (TypeError, ValueError):
                score = _layer_score(payload, code)
        else:
            score = _layer_score(payload, code)
        band = score_band_label(score) if score is not None else "需要结合更多相处经验继续观察"
        return ROS_SINGLE_LAYER_TEMPLATE.format(
            layer_label=label,
            layer_atoms=naturalize_atoms(_layer_atoms(payload, code)),
            cross_layer_hints=_cross_layer_hints(payload),
            score_band=band,
        )

    if intent == "none" and payload:
        hints = _cross_layer_hints(payload)
        if hints and hints != "（暂无结构化线索）":
            return ROS_LIGHT_TEMPLATE.format(cross_layer_hints=hints)

    return ""
