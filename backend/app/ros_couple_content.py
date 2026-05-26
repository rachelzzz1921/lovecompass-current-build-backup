"""ROS 双人报告 Layer B/C：差值解读、洞察四卡、层展开文案。"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.ros_scoring import ROS_LAYER_CODES, ROS_LAYER_LABELS

COLLISION_MAP_PATH = Path(__file__).resolve().parents[1] / "data" / "suite2_ros_female.json"

ATTACHMENT_NORMALIZE = {
    "安全型": "安全型",
    "焦虑型": "焦虑型",
    "回避型": "回避型",
    "混合型": "混合型",
    "高边界安全型": "高边界安全型",
    "低自我高投入型": "低自我高投入型",
}

BOND_ADVICE: dict[str, dict[str, str]] = {
    "焦虑型×回避型": {
        "gap_reason": (
            "EV 层差值常见于焦虑×回避：焦虑型更容易从靠近里感到「我们在变好」，"
            "回避型则更容易感受到距离感——不是谁错，是感受频道不同。"
        ),
        "advice_you": "说需求，而不是等确认。",
        "advice_ta": "说「我需要时间」，而不是直接消失。",
    },
    "安全型×焦虑型": {
        "gap_reason": "一方稳定、一方需要确认时，IN/EV 层容易出现「一个觉得够，一个觉得不够」。",
        "advice_you": "把「我需要确认」说成一句话，而不是一连串试探。",
        "advice_ta": "看见对方的需要，也记得照顾自己的节奏。",
    },
    "安全型×安全型": {
        "gap_reason": "整体差值通常不大；若有差距，多半在具体事件上的解读不同。",
        "advice_you": "把小事说具体，比猜更有用。",
        "advice_ta": "约定一个固定的复盘时刻，让小情绪有出口。",
    },
}

ATTACHMENT_ADVICE_HINTS: dict[str, str] = {
    "安全型": "把小事说具体，比猜更有用。",
    "焦虑型": "说需求，而不是等确认。",
    "回避型": "说「我需要时间」，而不是直接消失。",
    "混合型": "识别自己此刻要的是空间还是连接。",
    "高边界安全型": "边界清晰，也留一句「我在」。",
    "低自我高投入型": "付出之前先问自己是否也被照顾。",
}


@lru_cache(maxsize=1)
def _attachment_collision_map() -> dict[str, dict[str, str]]:
    try:
        data = json.loads(COLLISION_MAP_PATH.read_text(encoding="utf-8"))
        raw = data.get("attachment_collision_map") or {}
        return {str(k): dict(v) for k, v in raw.items() if isinstance(v, dict)}
    except OSError:
        return {}


def _build_full_bond_advice() -> dict[str, dict[str, str]]:
    merged = dict(BOND_ADVICE)
    for key, entry in _attachment_collision_map().items():
        if key in merged:
            continue
        parts = key.split("×")
        you_type = parts[0] if parts else "你"
        ta_type = parts[1] if len(parts) > 1 else "对方"
        merged[key] = {
            "gap_reason": str(entry.get("desc") or ""),
            "advice_you": ATTACHMENT_ADVICE_HINTS.get(you_type, "先把感受说具体，再谈事情本身。"),
            "advice_ta": ATTACHMENT_ADVICE_HINTS.get(ta_type, "留一句回应，而不是用沉默代替表达。"),
        }
    return merged


FULL_BOND_ADVICE = _build_full_bond_advice()


def get_bond_advice(you_attachment: str | None, ta_attachment: str | None) -> dict[str, str]:
    you = normalize_attachment(you_attachment)
    ta = normalize_attachment(ta_attachment)
    key = f"{you}×{ta}"
    if key in FULL_BOND_ADVICE:
        return FULL_BOND_ADVICE[key]
    if you == "低自我高投入型" and "低自我高投入型×任意" in FULL_BOND_ADVICE:
        return FULL_BOND_ADVICE["低自我高投入型×任意"]
    return FULL_BOND_ADVICE.get("焦虑型×回避型", BOND_ADVICE["焦虑型×回避型"])

LAYER_PROBE = {
    "AT": "当初让你心动的那件事，最近还发生过类似的吗？",
    "IN": "你们上一次把一件矛盾真正说清楚，是什么时候？",
    "CO": "有没有一件事，你们谈过但始终没达成一致？",
    "EV": "你能想象三年后你们是什么样子吗？",
    "RK": "有没有一句话，一直想说但没说？",
}

PERSPECTIVE_SNIPPETS: dict[str, list[tuple[int, str]]] = {
    "AT": [(75, "吸引感很稳，起点扎实"), (55, "吸引还在，但不如最初浓烈"), (0, "吸引感需要被重新点亮")],
    "IN": [(75, "相处轻松，修复在发生"), (55, "量够，但质还有空间"), (0, "互动里有一些悬着的地方")],
    "CO": [(75, "大方向一致"), (55, "有些话题还没对齐"), (0, "生活节奏还需要磨合")],
    "EV": [(75, "在变好，越来越懂彼此"), (55, "有些消退感"), (0, "未来感还在模糊地带")],
    "RK": [(40, "低风险"), (55, "有一些信号值得聊"), (100, "风险信号需要被正视")],
}


def normalize_attachment(raw: str | None) -> str:
    text = (raw or "混合型").strip()
    return ATTACHMENT_NORMALIZE.get(text, text)


def diff_level(gap: float) -> dict[str, str]:
    g = abs(float(gap))
    if g < 10:
        return {
            "level": "consistent",
            "color": "green",
            "label": "感知高度一致",
            "dots": 1,
        }
    if g < 20:
        return {
            "level": "moderate",
            "color": "blue",
            "label": "有一些不同的感受",
            "dots": 2,
        }
    return {
        "level": "significant",
        "color": "amber",
        "label": "感知差距较大，值得聊",
        "dots": 3,
    }


def perception_gap_message(gap: float) -> str:
    g = abs(float(gap))
    if g < 10:
        return "你们对这段关系的感受比较接近——这是很难得的同频。"
    if g < 20:
        return (
            "你们对这段关系的感受有一些不同——"
            "这不代表谁对谁错，更可能是你们感受和表达爱的方式不太一样。"
        )
    return (
        "你们对这段关系的感受差距比较明显——"
        "值得找一次不被打扰的对话，各自说说「我感受到的是什么」。"
    )


def _snippet(code: str, score: float) -> str:
    bands = PERSPECTIVE_SNIPPETS.get(code, [(75, "表现稳定"), (0, "还在展开")])
    for threshold, text in bands:
        if score >= threshold:
            return text
    return bands[-1][1]


def build_gap_text(code: str, you: float, ta: float, gap: float) -> str:
    label = ROS_LAYER_LABELS.get(code, code)
    if abs(gap) < 10:
        return f"你们在「{label}」上感受接近——这是关系很稳的一块地基。"
    if code == "EV" and gap > 0:
        return (
            f"你感到关系在变好（{round(you)}），对方有消退感（{round(ta)}）——"
            "不是谁对谁错，可能是你在做的事对方还没有充分感受到。"
        )
    if gap > 0:
        return (
            f"你在「{label}」上的感受（{round(you)}）比对方（{round(ta)}）更积极——"
            "这不代表对方不在意，更可能是表达方式不同。"
        )
    return (
        f"对方在「{label}」上的感受（{round(ta)}）比你（{round(you)}）更积极——"
        "你感受到的联结，可能比你自己打出来的分更多。"
    )


def build_layer_compare(
    you_layers: dict[str, float],
    ta_layers: dict[str, float],
) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for code in ROS_LAYER_CODES:
        key = code.lower()
        you = float(you_layers.get(code, 0))
        ta = float(ta_layers.get(code, 0))
        if code == "RK":
            gap = ta - you
        else:
            gap = you - ta
        level = diff_level(gap)
        out[key] = {
            "code": code,
            "label": ROS_LAYER_LABELS[code],
            "you": round(you),
            "ta": round(ta),
            "gap": round(abs(gap)),
            "gap_signed": round(gap),
            "diff_level": level["level"],
            "diff_color": level["color"],
            "diff_dots": level["dots"],
            "you_perspective": _snippet(code, you),
            "ta_perspective": _snippet(code, ta),
            "gap_text": build_gap_text(code, you, ta, gap),
            "probe_question": LAYER_PROBE.get(code, ""),
            "you_highlight": f"你对{ROS_LAYER_LABELS[code]}的觉察很细腻" if gap > 5 else "",
            "ta_highlight": f"TA 在{ROS_LAYER_LABELS[code]}上给了更积极的信号" if gap < -5 else "",
        }
    return out


def find_extreme_layers(layer_compare: dict[str, Any]) -> tuple[str, str]:
    positive = [c for c in ROS_LAYER_CODES if c != "RK"]
    gaps = {
        c.lower(): float((layer_compare.get(c.lower()) or {}).get("gap") or 0)
        for c in positive
    }
    if not gaps:
        return "co", "ev"
    min_key = min(gaps, key=gaps.get)
    max_key = max(gaps, key=gaps.get)
    return min_key, max_key


def build_couple_insights(
    *,
    layer_compare: dict[str, Any],
    consensus_label: str,
    gap_label: str,
    gap_value: float,
    you_attachment: str | None,
    ta_attachment: str | None,
) -> list[dict[str, str]]:
    min_key, max_key = find_extreme_layers(layer_compare)
    min_layer = layer_compare.get(min_key) or {}
    max_layer = layer_compare.get(max_key) or {}
    bond_key = f"{normalize_attachment(you_attachment)}×{normalize_attachment(ta_attachment)}"
    advice = get_bond_advice(you_attachment, ta_attachment)

    return [
        {
            "kind": "strength",
            "title": "你们的共同高光",
            "body": (
                f"{consensus_label}差值最小（{min_layer.get('gap', 0)} 分）——"
                f"你们在生活/相处上的一致感是关系扎实的底色。"
            ),
        },
        {
            "kind": "watch",
            "title": "最值得用心的差距",
            "body": (
                f"{max_layer.get('label', gap_label)}层差值达 {max_layer.get('gap', round(gap_value))} 分——"
                f"{max_layer.get('gap_text', '')[:80]}"
            ),
        },
        {
            "kind": "advice",
            "title": "给你们两个人的话",
            "body": (
                f"对你：{advice.get('advice_you', '先把感受说具体，再谈事情本身。')}\n"
                f"对方：{advice.get('advice_ta', '试着用一句话回应，而不是用沉默代替表达。')}"
            ),
        },
        {
            "kind": "action",
            "title": "这周可以做的一件事",
            "body": (
                "各自写下「我觉得我们做得很好的一件事」和「我希望我们更用心的一件事」，"
                "然后交换着读。不用当场讨论，先让对方知道你在想什么。"
            ),
        },
    ]


def enrich_bond(
    collision: dict[str, str],
    you_attachment: str | None,
    ta_attachment: str | None,
    biggest_gap_layer: str,
) -> dict[str, Any]:
    key = f"{normalize_attachment(you_attachment)}×{normalize_attachment(ta_attachment)}"
    extra = get_bond_advice(you_attachment, ta_attachment)
    return {
        **collision,
        "you_type": normalize_attachment(you_attachment),
        "ta_type": normalize_attachment(ta_attachment),
        "gap_reason": extra.get(
            "gap_reason",
            f"{biggest_gap_layer}层的感知差，往往和你们的依恋组合如何解读「靠近」有关。",
        ),
        "advice_you": extra.get("advice_you", "先把情绪落地，再谈事情本身。"),
        "advice_ta": extra.get("advice_ta", "留一句「我在」，而不是直接消失。"),
        "self_unlocked": bool(you_attachment),
        "partner_unlocked": bool(ta_attachment),
    }
