from __future__ import annotations

import re
import secrets
from statistics import mean
from typing import Any

from app.scoring import _clamp, answer_to_numeric
from app.chat_prompt_layers import score_band_label

ROS_LAYER_CODES = ("AT", "IN", "CO", "EV", "RK")
ROS_LAYER_LABELS = {
    "AT": "吸引基础",
    "IN": "互动质量",
    "CO": "兼容程度",
    "EV": "关系走向",
    "RK": "风险信号",
}
ROS_LAYER_COLORS = {
    "AT": "oklch(0.72 0.18 360)",
    "IN": "oklch(0.82 0.14 200)",
    "CO": "oklch(0.78 0.15 165)",
    "EV": "oklch(0.68 0.18 285)",
    "RK": "oklch(0.82 0.14 75)",
}
RELATIONSHIP_TYPE_KEYS = {
    "彼此生长": "grow",
    "难舍难分": "bond",
    "温水同行": "warm",
    "心甘情愿地累": "give",
    "烈火烹油": "fire",
    "此刻刚好": "now",
}
STAGE_NAMES = [
    "怦然相遇",
    "渐入佳境",
    "暗流初现",
    "磨合阵痛",
    "倦怠低谷",
    "十字路口",
    "重建信任",
    "深度联结",
    "并肩同行",
]
PRE_QUESTION_IDS = ("PRE-F-00A", "PRE-M-00A", "PRE-F-00B", "PRE-M-00B")


def is_ros_suite(suite_slug: str | None) -> bool:
    raw = (suite_slug or "").lower()
    return "ros" in raw or "s02" in raw


def generate_relation_code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    part = lambda: "".join(secrets.choice(alphabet) for _ in range(4))
    return f"ROS-{part()}-{part()}"


def _normalize_question_score_to_100(question: dict[str, Any], numeric: float) -> float:
    scoring = question.get("scoring_payload") or {}
    method = str(scoring.get("method") or scoring.get("type") or "direct")
    qtype = question.get("question_type")
    direction = question.get("direction")

    if method == "direct_times_20":
        return _clamp(float(numeric) * 20)
    if method == "reverse_times_25":
        raw = (float(numeric) - 1) * 25
        return _clamp(100 - raw)
    if method == "distance_from_midpoint":
        return _clamp(100 - abs(float(numeric) - 50) * 1.5)
    if method in {"reverse", "reverse_slider"} or direction == "reverse":
        if float(numeric) <= 5:
            return _clamp(100 - float(numeric) * 20)
        return _clamp(100 - float(numeric))

    if qtype == "slider" and float(numeric) > 10:
        return _clamp(float(numeric))

    if float(numeric) <= 5:
        return _clamp(float(numeric) * 20)

    return _clamp(float(numeric))


def _is_auxiliary_question(question: dict[str, Any]) -> bool:
    scoring = question.get("scoring_payload") or {}
    method = str(scoring.get("method") or scoring.get("type") or "")
    if method == "auxiliary_type" or method == "auxiliary":
        return True
    if question.get("dimension_code") == "PRE":
        return True
    return question.get("direction") == "auxiliary"


def _extract_time_tag(
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
) -> str | None:
    row_by_id = {q["external_question_id"]: q for q in questions}
    for pre_id in PRE_QUESTION_IDS:
        if not pre_id.endswith("00A"):
            continue
        question = row_by_id.get(pre_id)
        if not question:
            continue
        answer = answers.get(pre_id, {})
        payload = question.get("question_payload") or {}
        source = payload.get("source_question") or payload
        options = source.get("options") or payload.get("options") or []
        key = answer.get("optionKey")
        idx = answer.get("optionIndex")
        if key:
            option = next((o for o in options if str(o.get("key")) == str(key)), None)
            if option and option.get("tag"):
                return str(option["tag"])
        if idx is not None and 0 <= int(idx) < len(options):
            tag = options[int(idx)].get("tag")
            if tag:
                return str(tag)
    return None


def _aggregate_layer_scores(
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
) -> tuple[dict[str, float], dict[str, float]]:
    numeric_by_external_id: dict[str, float] = {}
    normalized_by_external_id: dict[str, float] = {}

    for question in questions:
        ext = question["external_question_id"]
        numeric = answer_to_numeric(question, answers.get(ext, {}))
        if numeric is None:
            continue
        numeric_by_external_id[ext] = numeric
        normalized_by_external_id[ext] = _normalize_question_score_to_100(question, numeric)

    layer_scores: dict[str, float] = {}
    for layer in ROS_LAYER_CODES:
        weighted_sum = 0.0
        weight_sum = 0.0
        for question in questions:
            if question.get("dimension_code") != layer:
                continue
            if _is_auxiliary_question(question):
                continue
            ext = question["external_question_id"]
            normalized = normalized_by_external_id.get(ext)
            if normalized is None:
                continue
            weight = float(question.get("weight") or 1)
            weighted_sum += normalized * weight
            weight_sum += weight
        if weight_sum:
            layer_scores[layer] = round(_clamp(weighted_sum / weight_sum), 2)

    return layer_scores, numeric_by_external_id


def _raw_overall_index(layer_scores: dict[str, float], scoring_formula: dict[str, Any]) -> float:
    layers = scoring_formula.get("layers") or {}
    weights = {
        code: float((layers.get(code) or {}).get("weight") or 0)
        for code in ROS_LAYER_CODES
    }
    total_weight = sum(weights.values()) or 1.0
    rk = layer_scores.get("RK", 0)
    parts = [
        layer_scores.get("AT", 0) * weights["AT"],
        layer_scores.get("IN", 0) * weights["IN"],
        layer_scores.get("CO", 0) * weights["CO"],
        layer_scores.get("EV", 0) * weights["EV"],
        (100 - rk) * weights["RK"],
    ]
    return round(_clamp(sum(parts) / total_weight), 2)


def _apply_display_adjustment(raw_score: float, scoring_formula: dict[str, Any]) -> float:
    overall = scoring_formula.get("overall") or {}
    mapping = (overall.get("display_adjustment") or {}).get("mapping") or []
    for band in mapping:
        raw_min = float(band.get("raw_min", 0))
        raw_max = float(band.get("raw_max", 100))
        if raw_score < raw_min or raw_score > raw_max:
            continue
        display_min = float(band.get("display_min", raw_min))
        display_max = float(band.get("display_max", raw_max))
        if raw_max == raw_min:
            return round(display_min, 2)
        ratio = (raw_score - raw_min) / (raw_max - raw_min)
        return round(display_min + ratio * (display_max - display_min), 2)
    return round(_clamp(raw_score), 2)


def _resonance_tier(display_score: float, scoring_formula: dict[str, Any]) -> dict[str, str]:
    levels = scoring_formula.get("resonance_levels") or []
    for level in levels:
        if float(level.get("min", 0)) <= display_score <= float(level.get("max", 100)):
            return {"tier": str(level.get("name") or ""), "desc": str(level.get("desc") or "")}
    if display_score >= 88:
        return {"tier": "心有灵犀", "desc": "你们之间有一种很难被替代的默契"}
    if display_score >= 75:
        return {"tier": "深度共鸣", "desc": "真实的联结，值得好好珍惜"}
    if display_score >= 65:
        return {"tier": "温柔磨合", "desc": "你们在彼此靠近的路上，慢慢来"}
    return {"tier": "初见雏形", "desc": "关系还在成形，有空间，也有可能"}


def _eval_simple_condition(condition: str, layer_scores: dict[str, float]) -> bool:
    expr = condition.strip()
    if not expr:
        return False
    parts = re.split(r"\s*&&\s*", expr)
    for part in parts:
        match = re.match(r"^(AT|IN|CO|EV|RK)\s*(>=|<=|>|<|==)\s*(\d+(?:\.\d+)?)$", part.strip())
        if not match:
            return False
        code, op, raw_value = match.group(1), match.group(2), float(match.group(3))
        value = layer_scores.get(code, 0)
        if op == ">=" and not value >= raw_value:
            return False
        if op == "<=" and not value <= raw_value:
            return False
        if op == ">" and not value > raw_value:
            return False
        if op == "<" and not value < raw_value:
            return False
        if op == "==" and not value == raw_value:
            return False
    return True


def _resolve_relationship_type(
    layer_scores: dict[str, float],
    type_rules: dict[str, Any],
) -> dict[str, str]:
    for name, rule in (type_rules or {}).items():
        if name.startswith("_") or not isinstance(rule, dict):
            continue
        condition = str(rule.get("condition") or "")
        if condition and _eval_simple_condition(condition, layer_scores):
            return {
                "name": name,
                "key": RELATIONSHIP_TYPE_KEYS.get(name, name),
                "one_liner": str(rule.get("tagline") or ""),
                "description": str(rule.get("desc") or rule.get("description") or ""),
            }
    fallback = "温水同行"
    return {
        "name": fallback,
        "key": RELATIONSHIP_TYPE_KEYS[fallback],
        "one_liner": "不冷不热，舒适但缺少真正的联结",
        "description": "舒适但缺少真正的联结",
    }


def _resolve_stage_id(
    layer_scores: dict[str, float],
    time_tag: str | None,
    stage_rules: dict[str, Any],
) -> int:
    locked: set[str] = set()
    if time_tag:
        constraints = (stage_rules or {}).get("time_constraints") or {}
        locked.update((constraints.get(time_tag) or {}).get("locked_stages") or [])

    best_id = 4
    best_matches = -1
    mapping = (stage_rules or {}).get("score_mapping") or {}
    for idx, (stage_key, ranges) in enumerate(mapping.items(), start=1):
        stage_name = re.sub(r"^[①②③④⑤⑥⑦⑧⑨]", "", stage_key)
        if stage_name in locked:
            continue
        matches = 0
        for dim_key, band in (ranges or {}).items():
            code = dim_key.replace("_range", "").upper()
            if code not in layer_scores:
                continue
            low, high = float(band[0]), float(band[1])
            if low <= layer_scores[code] <= high:
                matches += 1
        if matches > best_matches:
            best_matches = matches
            best_id = idx

    if time_tag in {"secret_crush", "ambiguous"}:
        return min(best_id, 2)
    return max(1, min(9, best_id))


def _prescription_warmup(stage_id: int, time_tag: str | None, display_score: float) -> str:
    if time_tag == "married" and display_score < 70:
        return "在一起久了，有些东西会钝化——这很正常，不是感情出了问题。这张处方是帮你们重新找到彼此的频道——"
    if stage_id >= 7:
        return "你们走过了不容易的部分，能走到这里很不简单。下面这张处方，是给经历过风浪的你们用来继续走好的——"
    if stage_id <= 3:
        return "你们还在彼此发现的阶段，这是关系里最有生命力的时候。下面这张处方帮你们把这段时间过得更扎实一些——"
    return "能在这个阶段认真做这道题，说明你们都在认真对待这段关系。这张处方不是说你们有问题，是帮你们把问题说清楚——"


def _build_insights(layer_scores: dict[str, float], relationship_type: dict[str, str]) -> list[dict[str, str]]:
    positive_layers = [code for code in ("AT", "IN", "CO", "EV") if layer_scores.get(code) is not None]
    highest = max(positive_layers, key=lambda c: layer_scores.get(c, 0), default="IN")
    lowest = min(positive_layers, key=lambda c: layer_scores.get(c, 100), default="IN")
    highest_label = ROS_LAYER_LABELS[highest]
    lowest_label = ROS_LAYER_LABELS[lowest]
    highest_score = round(layer_scores.get(highest, 0))
    lowest_score = round(layer_scores.get(lowest, 0))

    advice_map = {
        "grow": "把「我们各自在成长什么」变成可以聊的话题——关系里的成长感，需要被说出来才会被看见。",
        "bond": "试着区分「需要 TA」和「选择 TA」——当依赖被看见，爱才更容易变得轻盈。",
        "warm": "约一次只有你们两个人的散步，不谈任务，只谈最近一件小事——温水也需要偶尔加热。",
        "give": "下一次觉得委屈时，先说「我现在很难受」，而不是直接列出对方做错了什么。",
        "fire": "争执后 24 小时内主动靠近一次——不一定要道歉，一个拥抱、一句「我们刚才有点凶」就够。",
        "now": "诚实聊一次「这段关系对我们各自意味着什么」——舒适也需要方向感。",
    }
    return [
        {
            "kind": "edge",
            "title": "你们之间最珍贵的",
            "body": f"{highest_label}（{highest_score}）相对突出——这是你们关系里最难伪装的部分，值得被认真看见。",
        },
        {
            "kind": "watch",
            "title": "需要温柔留意",
            "body": f"{lowest_label}（{lowest_score}）还有提升空间。日常里的小摩擦如果没有及时修复，会慢慢消耗彼此的好感。",
        },
        {
            "kind": "advice",
            "title": "给你的一句建议",
            "body": advice_map.get(relationship_type.get("key", ""), "下一次沟通里，先把情绪落地，再谈事情本身。"),
        },
    ]


def _build_layer_details(layer_scores: dict[str, float]) -> dict[str, dict[str, Any]]:
    """Per-layer narrative for UI — no fabricated sub-dimension scores."""
    details: dict[str, dict[str, Any]] = {}
    for code in ROS_LAYER_CODES:
        key = code.lower()
        score = round(layer_scores.get(code, 0))
        summary = score_band_label(score)
        label = ROS_LAYER_LABELS[code]
        if code == "RK":
            if score >= 65:
                watch = "风险信号偏高——争执容易升级，需要先降温度再谈事。"
                bright = "你愿意正视问题，而不是假装没事。"
            elif score >= 45:
                watch = "有些敏感点还没被双方真正看见，容易反复触发。"
                bright = "整体仍在可控区间，适合建立修复仪式。"
            else:
                watch = "留意小摩擦累积，但不必过度警觉。"
                bright = "安全感基础相对稳，可以慢慢加深联结。"
        elif score >= 75:
            watch = f"{label}还有微调空间，别把它当成永远不变。"
            bright = f"{label}（{summary}）是你们现在最稳的支点。"
        elif score >= 55:
            watch = f"{label}在消耗与滋养之间摇摆，值得单独聊一次。"
            bright = f"{label}不算差——{summary}。"
        else:
            watch = f"{label}是当前最需要温柔补强的区域。"
            bright = "你愿意认真看这段关系，这本身就是投入。"
        details[key] = {
            "displaySummary": summary,
            "read": f"{label}：{summary}。",
            "watch": watch,
            "bright": bright,
            "tags": [label, summary.split("，")[0][:8]],
        }
    return details


def _build_ros_result_payload(
    *,
    layer_scores: dict[str, float],
    display_index: float,
    raw_index: float,
    relationship_type: dict[str, str],
    stage_id: int,
    resonance: dict[str, str],
    relation_code: str | None,
    time_tag: str | None,
    insights: list[dict[str, str]],
    type_rules: dict[str, Any],
    stage_rules: dict[str, Any],
) -> dict[str, Any]:
    dims = [
        {
            "key": code.lower(),
            "label": ROS_LAYER_LABELS[code],
            "value": round(layer_scores.get(code, 0)),
            "color": ROS_LAYER_COLORS[code],
        }
        for code in ROS_LAYER_CODES
    ]
    stage_name = STAGE_NAMES[stage_id - 1] if 1 <= stage_id <= 9 else STAGE_NAMES[3]
    layer_details = _build_layer_details(layer_scores)
    layers = [
        {
            "code": code,
            "name": ROS_LAYER_LABELS[code],
            "score": layer_scores.get(code, 0),
            "displayScore": round(layer_scores.get(code, 0)),
            "displaySummary": score_band_label(layer_scores.get(code, 0)),
        }
        for code in ROS_LAYER_CODES
    ]
    display_summaries = {str(item["code"]): str(item["displaySummary"]) for item in layers}
    return {
        "model": "ROS_V3",
        "productSet": "ROS",
        "relationCode": relation_code,
        "relationshipType": relationship_type,
        "relationshipStage": {
            "id": stage_id,
            "name": stage_name,
            "caption": STAGE_NAMES[stage_id - 1] if 1 <= stage_id <= 9 else "",
        },
        "timeTag": time_tag,
        "resonance": {
            "score": round(display_index),
            "tier": resonance["tier"],
            "desc": resonance["desc"],
            "rawScore": raw_index,
        },
        "dims": dims,
        "layers": layers,
        "display_summaries": display_summaries,
        "layerDetails": layer_details,
        "insights": insights,
        "prescription": {
            "warmup": _prescription_warmup(stage_id, time_tag, display_index),
            "chiefComplaint": _chief_complaint(layer_scores),
            "rx": _prescription_rx(layer_scores, relationship_type),
            "followUp": "三个月后",
        },
        "typeRulesRef": bool(type_rules),
        "stageRulesRef": bool(stage_rules),
    }


def _chief_complaint(layer_scores: dict[str, float]) -> str:
    rk = layer_scores.get("RK", 0)
    in_score = layer_scores.get("IN", 0)
    if rk >= 60:
        return "风险信号偏高"
    if in_score < 55:
        return "联结感不均衡"
    if layer_scores.get("EV", 0) < 55:
        return "未来感待对齐"
    return "日常磨合中的细节"


def _prescription_rx(layer_scores: dict[str, float], relationship_type: dict[str, str]) -> str:
    if layer_scores.get("IN", 0) < 60:
        return "每周一次\n不带手机的\n两小时对话"
    if layer_scores.get("RK", 0) >= 55:
        return "争执后 24 小时内\n一次主动靠近"
    if relationship_type.get("key") == "fire":
        return "约定一个\n只属于你们的暂停词"
    return "每周一次\n不带手机的\n两小时散步"


def summarize_ros_scores(
    rows: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    scoring_model: dict[str, Any] | None = None,
    *,
    gender: str = "female",
    relation_code: str | None = None,
) -> dict[str, Any]:
    type_rules = (scoring_model or {}).get("type_rules") or {}
    scoring_formula = (scoring_model or {}).get("scoring_formula") or {}
    if not isinstance(type_rules, dict):
        type_rules = {}
    if not isinstance(scoring_formula, dict):
        scoring_formula = {}

    layer_scores, numeric_by_external_id = _aggregate_layer_scores(rows, answers)
    time_tag = _extract_time_tag(rows, answers)
    raw_index = _raw_overall_index(layer_scores, scoring_formula)
    display_index = _apply_display_adjustment(raw_index, scoring_formula)
    resonance = _resonance_tier(display_index, scoring_formula)
    relationship_type = _resolve_relationship_type(layer_scores, type_rules.get("relationship_type_rules") or type_rules)
    stage_id = _resolve_stage_id(layer_scores, time_tag, type_rules.get("stage_rules") or {})
    insights = _build_insights(layer_scores, relationship_type)
    code = relation_code or generate_relation_code()

    result_payload = _build_ros_result_payload(
        layer_scores=layer_scores,
        display_index=display_index,
        raw_index=raw_index,
        relationship_type=relationship_type,
        stage_id=stage_id,
        resonance=resonance,
        relation_code=code,
        time_tag=time_tag,
        insights=insights,
        type_rules=type_rules,
        stage_rules=type_rules.get("stage_rules") or {},
    )

    ai_report = (
        f"## 你们的关系画像：{relationship_type['name']}\n\n"
        f"共鸣指数 **{round(display_index)}** · {resonance['tier']}。"
        f"当前阶段接近「{STAGE_NAMES[stage_id - 1]}」。"
        "正式 AI 深度报告可由后台任务继续生成。"
    )

    return {
        "numeric_by_external_id": numeric_by_external_id,
        "dimension_scores": layer_scores,
        "ros_index": display_index,
        "rk_score": layer_scores.get("RK"),
        "archetype_code": relationship_type["name"],
        "attachment_type": relationship_type["one_liner"],
        "result_payload": result_payload,
        "ai_report": ai_report,
        "relation_code": code,
        "relationship_type": relationship_type,
        "stage_id": stage_id,
        "time_tag": time_tag,
        "raw_ros_index": raw_index,
    }
