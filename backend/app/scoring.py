from __future__ import annotations

from statistics import mean
from typing import Any


def _clamp(value: float, min_value: float = 0, max_value: float = 100) -> float:
    return max(min_value, min(max_value, value))


def _safe_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def answer_to_numeric(question: dict[str, Any], answer_payload: dict[str, Any]) -> float | None:
    """Convert one submitted answer into the canonical 1-5 question score.

    The question bank already stores reverse scoring in `scoring_payload` for reverse
    Likert/slider questions. Auxiliary rank questions are still converted and stored
    on `test_attempt_answers`, but they are excluded from dimension aggregation by
    `summarize_scores` when the active scoring model marks them as auxiliary.
    """
    scoring = question.get("scoring_payload") or {}
    qpayload = question.get("question_payload") or {}
    qtype = question.get("question_type")

    if "value" in answer_payload:
        value = _safe_float(answer_payload["value"])
        if value is None:
            return None
        method = scoring.get("method") or scoring.get("type")
        if method == "slider_to_5":
            slider = qpayload.get("slider") or {}
            min_v = float(slider.get("min", 0))
            max_v = float(slider.get("max", 100))
            return 1 + 4 * ((value - min_v) / max(max_v - min_v, 1))
        if method in {"reverse", "reverse_slider"}:
            scale = qpayload.get("scale") or qpayload.get("slider") or {}
            min_v = float(scale.get("min", 1))
            max_v = float(scale.get("max", 5))
            return max_v + min_v - value
        return value

    if "optionKey" in answer_payload:
        key = answer_payload.get("optionKey")
        idx = int(answer_payload.get("optionIndex", -1))
        options = qpayload.get("options") or []
        option = next((o for o in options if str(o.get("key")) == str(key)), None)
        if option is None and 0 <= idx < len(options):
            option = options[idx]
        if option is None:
            return None
        score = option.get("score")
        if isinstance(score, dict):
            vals = [float(v) for v in score.values() if isinstance(v, (int, float))]
            return mean(vals) if vals else None
        if isinstance(score, (int, float)):
            return float(score)
        return float(idx + 1)

    if qtype == "rank" and "orderedItemIds" in answer_payload:
        ordered = [str(x) for x in (answer_payload.get("orderedItemIds") or [])]
        method = scoring.get("method") or scoring.get("type")
        score_map = scoring.get("score_map") or scoring.get("scoreMap") or {}
        if ordered and score_map:
            first_id = ordered[0].lower()
            mapped = score_map.get(f"{first_id}_first")
            if mapped is None:
                for key, val in score_map.items():
                    if str(key).lower() == f"{first_id}_first":
                        mapped = val
                        break
            if mapped is not None:
                return float(mapped)
        if method == "rank_position":
            key_item = str(scoring.get("key_item") or "")
            score_map = scoring.get("score_map") or scoring.get("scoreMap") or {}
            if key_item and key_item in [str(item) for item in ordered]:
                position = [str(item) for item in ordered].index(key_item) + 1
                mapped = score_map.get(f"{position}st") or score_map.get(f"{position}nd") or score_map.get(f"{position}rd") or score_map.get(f"{position}th")
                if mapped is not None:
                    return float(mapped)
        score_map = scoring.get("score_map") or scoring.get("scoreMap") or {}
        vals = [float(score_map.get(str(item_id), len(ordered) - i)) for i, item_id in enumerate(ordered)]
        return mean(vals) if vals else None

    return None


def _normalize_scoring_formula(scoring_model: dict[str, Any] | None) -> dict[str, Any]:
    if not scoring_model:
        return {}
    formula = scoring_model.get("scoring_formula") or {}
    return formula if isinstance(formula, dict) else {}


def _primary_archetype_from_scores(dimension_scores: dict[str, float], gender: str = "female") -> tuple[str, str]:
    """Return (archetype_code, attachment_type) using the SELF V1 rule matrix.

    The threshold matrix is intentionally aligned with the user-supplied SELF spec
    and the DB seed `scoring_models.type_rules`: SA2/SA3 define the primary type,
    then SA1 and SA4 apply high-priority corrections.
    """
    sa1 = dimension_scores.get("SA1", 0)
    sa2 = dimension_scores.get("SA2", 0)
    sa3 = dimension_scores.get("SA3", 0)
    sa4 = dimension_scores.get("SA4", 0)

    primary_code = "史湘云"
    attachment_type = "混合型"
    if sa2 < 45 and sa3 < 45:
        primary_code, attachment_type = "史湘云", "混合型"
    elif sa2 < 45 and sa3 >= 60:
        primary_code, attachment_type = "林黛玉", "焦虑型"
    elif sa2 >= 60 and sa3 < 45:
        primary_code, attachment_type = "妙玉", "回避型"
    elif sa2 >= 60 and sa3 >= 60:
        primary_code, attachment_type = "薛宝钗", "安全型"
    else:
        # Grey-zone handling: keep the closest primary quadrant so the result is
        # always deterministic, while downstream report copy can mention the
        # boundary nature if needed.
        centers = [
            ("史湘云", "混合型", 35, 35),
            ("林黛玉", "焦虑型", 35, 70),
            ("妙玉", "回避型", 70, 35),
            ("薛宝钗", "安全型", 70, 70),
        ]
        primary_code, attachment_type, *_ = min(
            centers,
            key=lambda item: (sa2 - item[2]) ** 2 + (sa3 - item[3]) ** 2,
        )

    if sa1 < 40:
        primary_code, attachment_type = "袭人", "低自我高投入型"
    elif sa4 >= 80 and primary_code == "薛宝钗":
        primary_code, attachment_type = "王熙凤", "高边界安全型"

    if gender == "male":
        male_map = {
            "薛宝钗": "贾探春",
            "林黛玉": "贾宝玉",
            "妙玉": "柳湘莲",
            "史湘云": "贾雨村",
            "王熙凤": "北静王",
            "袭人": "蒋玉菡",
        }
        primary_code = male_map.get(primary_code, primary_code)
    return primary_code, attachment_type


def _build_result_payload(
    dimension_scores: dict[str, float],
    archetype_code: str,
    attachment_type: str,
) -> dict[str, Any]:
    dimension_meta = {
        "SA1": {"name": "自我吸引感知", "core": "我相信自己值得被爱吗？"},
        "SA2": {"name": "依恋焦虑", "core": "我在关系里容易不安全感吗？"},
        "SA3": {"name": "依恋回避", "core": "我在关系里容易逃避亲密吗？"},
        "SA4": {"name": "自我边界", "core": "我能守住自己吗？"},
        "SA5": {"name": "情绪调节", "core": "我能好好处理关系里的情绪吗？"},
        "SA6": {"name": "关系投入模式", "core": "我是怎么爱人的？"},
    }
    return {
        "model": "SELF_V1_ROS_V3",
        "productSet": "SELF",
        "attachment_type": attachment_type,
        "archetype_code": archetype_code,
        "dimensions": [
            {
                "code": code,
                "name": meta["name"],
                "core": meta["core"],
                "score": dimension_scores.get(code, 0),
            }
            for code, meta in dimension_meta.items()
        ],
    }


def summarize_scores(
    rows: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    scoring_model: dict[str, Any] | None = None,
    gender: str = "female",
) -> dict[str, Any]:
    scoring_formula = _normalize_scoring_formula(scoring_model)
    row_by_external_id = {q["external_question_id"]: q for q in rows}
    numeric_by_external_id: dict[str, float] = {}

    for q in rows:
        ext = q["external_question_id"]
        numeric = answer_to_numeric(q, answers.get(ext, {}))
        if numeric is not None:
            numeric_by_external_id[ext] = numeric

    dimension_scores: dict[str, float] = {}

    if scoring_formula:
        for dim, config in scoring_formula.items():
            if not isinstance(config, dict):
                continue
            weights = config.get("weights") or {}
            if not isinstance(weights, dict) or not weights:
                continue
            configured_weight_sum = _safe_float(config.get("weight_sum"))
            weighted_sum = 0.0
            fallback_weight_sum = 0.0
            for ext, weight_raw in weights.items():
                if ext not in row_by_external_id:
                    continue
                numeric = numeric_by_external_id.get(ext)
                weight = _safe_float(weight_raw)
                if numeric is None or weight is None:
                    continue
                weighted_sum += numeric * weight
                fallback_weight_sum += weight
            denominator = configured_weight_sum or fallback_weight_sum
            if denominator:
                dimension_scores[dim] = round(_clamp((weighted_sum / denominator) * 20), 2)
    else:
        weighted_by_dim: dict[str, dict[str, float]] = {}
        for q in rows:
            ext = q["external_question_id"]
            numeric = numeric_by_external_id.get(ext)
            if numeric is None:
                continue
            scoring = q.get("scoring_payload") or {}
            method = scoring.get("method") or scoring.get("type")
            if method == "auxiliary_type" or q.get("direction") == "auxiliary":
                continue
            weight = float(q.get("weight") or 1)
            dim = q["dimension_code"]
            bucket = weighted_by_dim.setdefault(dim, {"weighted_sum": 0.0, "weight_sum": 0.0})
            bucket["weighted_sum"] += numeric * weight
            bucket["weight_sum"] += weight
        dimension_scores = {
            dim: round(_clamp((bucket["weighted_sum"] / bucket["weight_sum"]) * 20), 2)
            for dim, bucket in weighted_by_dim.items()
            if bucket["weight_sum"]
        }

    ros_index = round(_clamp(mean(dimension_scores.values())), 2) if dimension_scores else 0
    archetype_code, attachment_type = _primary_archetype_from_scores(dimension_scores, gender)
    result_payload = _build_result_payload(dimension_scores, archetype_code, attachment_type)
    ai_report = (
        f"## 你的自我关系画像：{attachment_type}\n\n"
        f"系统已依据 SELF 六维模型完成基础评分。你的红楼人格原型为 **{archetype_code}**，可在结果页「红楼人格」Tab 揭晓。"
        "正式 AI 深度报告可由后台任务继续生成。"
    )
    return {
        "numeric_by_external_id": numeric_by_external_id,
        "dimension_scores": dimension_scores,
        "ros_index": ros_index,
        "archetype_code": archetype_code,
        "attachment_type": attachment_type,
        "result_payload": result_payload,
        "ai_report": ai_report,
    }
