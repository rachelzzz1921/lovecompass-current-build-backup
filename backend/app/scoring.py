from __future__ import annotations
from statistics import mean
from typing import Any


def answer_to_numeric(question: dict[str, Any], answer_payload: dict[str, Any]) -> float | None:
    scoring = question.get("scoring_payload") or {}
    qpayload = question.get("question_payload") or {}
    qtype = question.get("question_type")

    if "value" in answer_payload:
        value = float(answer_payload["value"])
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
        ordered = answer_payload.get("orderedItemIds") or []
        score_map = scoring.get("score_map") or scoring.get("scoreMap") or {}
        vals = [float(score_map.get(str(item_id), len(ordered) - i)) for i, item_id in enumerate(ordered)]
        return mean(vals) if vals else None

    return None


def summarize_scores(rows: list[dict[str, Any]], answers: dict[str, dict[str, Any]]) -> dict[str, Any]:
    by_dim: dict[str, list[float]] = {}
    numeric_by_external_id: dict[str, float] = {}
    for q in rows:
        ext = q["external_question_id"]
        numeric = answer_to_numeric(q, answers.get(ext, {}))
        if numeric is None:
            continue
        numeric_by_external_id[ext] = numeric
        by_dim.setdefault(q["dimension_code"], []).append(numeric * float(q.get("weight") or 1))

    dimension_scores = {dim: round(mean(vals) * 20, 2) for dim, vals in by_dim.items() if vals}
    ros_index = round(mean(dimension_scores.values()), 2) if dimension_scores else 0
    return {
        "numeric_by_external_id": numeric_by_external_id,
        "dimension_scores": dimension_scores,
        "ros_index": ros_index,
        "archetype_code": "balanced",
        "ai_report": "## 你的关系画像正在生成\n\n系统已完成基础评分，正式 AI 报告可由后台任务继续生成。",
    }
