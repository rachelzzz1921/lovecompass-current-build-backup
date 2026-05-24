from __future__ import annotations

from typing import Any

from app.scoring import answer_to_numeric

DIMENSION_META: dict[str, dict[str, str]] = {
    "SA1": {"name": "自我吸引感知", "core": "我相信自己值得被爱吗？", "positive": "你知道自己值得被认真对待"},
    "SA2": {"name": "依恋焦虑", "core": "我在关系里容易不安全感吗？", "positive": "你的敏感是在保护这段关系，不是「太多」"},
    "SA3": {"name": "依恋回避", "core": "我在关系里容易逃避亲密吗？", "positive": "你的距离感是在筛选值得的人，不是冷漠"},
    "SA4": {"name": "自我边界", "core": "我能守住自己吗？", "positive": "你在学习把边界当成尊重，而不是拒绝"},
    "SA5": {"name": "情绪调节", "core": "我能好好处理关系里的情绪吗？", "positive": "你在冲突里仍有想把关系守住的意愿"},
    "SA6": {"name": "关系投入模式", "core": "我是怎么爱人的？", "positive": "你的付出方式里有真实温度"},
}

TRAIT_SLOTS: tuple[tuple[str, str, tuple[str, ...]], ...] = (
    ("shield", "highlight", ("SA1", "SA4", "SA5", "SA6")),
    ("key", "normal", ("SA2", "SA3", "SA6")),
    ("eye", "normal", ("SA2", "SA3", "SA1", "SA5", "SA4", "SA6")),
)

POSITIVE_FRAMING: dict[str, str] = {
    "混合型": "这不是不稳定，而是你足够真实。",
    "低自我高投入型": "这不是问题，而是你在关系里习惯性把自己排在后面——值得被温柔看见。",
}


def _shorten(text: str, limit: int = 42) -> str:
    text = (text or "").strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1] + "…"


def _slider_feedback(slider: dict[str, Any], value: float) -> str | None:
    for item in slider.get("feedback") or []:
        rng = item.get("range") or []
        if len(rng) == 2 and rng[0] <= value <= rng[1]:
            return str(item.get("text") or "").strip() or None
    return None


def _selected_option(qpayload: dict[str, Any], answer_payload: dict[str, Any]) -> dict[str, Any] | None:
    options = qpayload.get("options") or []
    key = answer_payload.get("optionKey")
    idx = int(answer_payload.get("optionIndex", -1))
    option = next((o for o in options if str(o.get("key")) == str(key)), None)
    if option is None and 0 <= idx < len(options):
        option = options[idx]
    return option


def _extract_evidence(row: dict[str, Any]) -> dict[str, Any] | None:
    qpayload = row.get("question_payload") or {}
    if not isinstance(qpayload, dict):
        qpayload = {}
    answer_payload = row.get("answer_payload") or {}
    if not isinstance(answer_payload, dict):
        answer_payload = {}

    qtype = row.get("question_type") or ""
    direction = str(row.get("direction") or "")
    dimension = str(row.get("dimension_code") or "")
    weight = float(row.get("weight") or 1.0)
    numeric = answer_to_numeric(row, answer_payload)
    if numeric is None:
        numeric = float(row.get("numeric_score") or 0)

    scene = str(qpayload.get("scene") or "").strip()
    question_text = str(row.get("question_text") or "").strip()
    evidence = ""
    behavior = ""

    if "value" in answer_payload:
        value = float(answer_payload["value"])
        slider = qpayload.get("slider") or {}
        evidence = _slider_feedback(slider, value) or ""
        if not evidence:
            evidence = f"你的回答落在 {int(value)} 这个位置"
        behavior = evidence
    elif "optionKey" in answer_payload or "optionIndex" in answer_payload:
        option = _selected_option(qpayload, answer_payload)
        if not option:
            return None
        evidence = str(option.get("sub") or option.get("text") or "").strip()
        behavior = str(option.get("text") or evidence).strip()
    elif qtype == "rank" and "orderedItemIds" in answer_payload:
        ordered = [str(x) for x in (answer_payload.get("orderedItemIds") or [])]
        items = qpayload.get("items") or []
        item_map = {str(item.get("id") or item.get("key")): item for item in items}
        first_id = ordered[0] if ordered else ""
        first_item = item_map.get(first_id) or {}
        evidence = str(first_item.get("text") or "").strip()
        behavior = evidence
        scoring = row.get("scoring_payload") or {}
        mapping = scoring.get("mapping") if isinstance(scoring, dict) else None
        if isinstance(mapping, dict) and first_id:
            hint_key = f"{first_id}_first"
            if hint_key in mapping:
                evidence = str(mapping[hint_key])
    else:
        return None

    if not evidence and not behavior:
        return None

    extremity = abs(float(numeric) - 3.0)
    importance = weight * (0.8 + extremity)
    if direction == "auxiliary":
        importance *= 0.85
    if str(row.get("external_question_id") or "").endswith("-50"):
        importance += 0.6

    return {
        "dimension": dimension,
        "direction": direction,
        "externalId": row.get("external_question_id"),
        "scene": scene,
        "questionText": question_text,
        "evidence": evidence,
        "behavior": behavior,
        "numeric": float(numeric),
        "weight": weight,
        "importance": importance,
    }


def _trait_title(item: dict[str, Any]) -> str:
    if item.get("scene"):
        return _shorten(str(item["scene"]), 36)
    evidence = str(item.get("evidence") or "")
    if evidence:
        return _shorten(evidence.split("，")[0].split("。")[0], 36)
    return _shorten(str(item.get("questionText") or "你在关系里的一个瞬间"), 36)


def _trait_body(item: dict[str, Any], attachment_type: str, slot: str) -> str:
    dim = str(item.get("dimension") or "")
    meta = DIMENSION_META.get(dim, {})
    scene = item.get("scene") or _shorten(str(item.get("questionText") or ""), 56)
    evidence = str(item.get("evidence") or item.get("behavior") or "").strip()
    positive = meta.get("positive") or POSITIVE_FRAMING.get(attachment_type) or "这不是缺陷，而是你在关系里形成的保护方式。"

    if slot == "eye":
        return f"在「{scene}」这类情境里，你更容易呈现「{evidence}」。{positive}"

    return f"在「{scene}」时，你的第一反应是：{evidence}。{positive}"


def _pick_for_slot(
    candidates: list[dict[str, Any]],
    preferred_dims: tuple[str, ...],
    used_ids: set[str],
    *,
    score_bias: str | None = None,
    dimension_scores: dict[str, float] | None = None,
) -> dict[str, Any] | None:
    pool = [c for c in candidates if c.get("externalId") not in used_ids]
    if not pool:
        return None

    def dim_rank(code: str) -> int:
        try:
            return preferred_dims.index(code)
        except ValueError:
            return len(preferred_dims) + 1

    if score_bias == "low" and dimension_scores:
        low_dim = min(dimension_scores, key=lambda k: float(dimension_scores.get(k, 0)))
        pool.sort(
            key=lambda c: (
                0 if c.get("dimension") == low_dim else 1,
                dim_rank(str(c.get("dimension") or "")),
                -float(c.get("importance") or 0),
            ),
        )
    elif score_bias == "high" and dimension_scores:
        high_dim = max(dimension_scores, key=lambda k: float(dimension_scores.get(k, 0)))
        pool.sort(
            key=lambda c: (
                0 if c.get("dimension") == high_dim else 1,
                dim_rank(str(c.get("dimension") or "")),
                -float(c.get("importance") or 0),
            ),
        )
    else:
        pool.sort(
            key=lambda c: (
                dim_rank(str(c.get("dimension") or "")),
                -float(c.get("importance") or 0),
            ),
        )
    return pool[0]


def build_core_traits(
    answer_rows: list[dict[str, Any]],
    dimension_scores: dict[str, float] | None = None,
    attachment_type: str = "",
) -> list[dict[str, Any]]:
    """Build three core trait cards from stored answers + question payloads."""
    candidates: list[dict[str, Any]] = []
    for row in answer_rows:
        item = _extract_evidence(row)
        if item:
            candidates.append(item)

    if not candidates:
        return []

    scores = {str(k): float(v) for k, v in (dimension_scores or {}).items()}
    used: set[str] = set()
    traits: list[dict[str, Any]] = []

    for icon, highlight_key, dims in TRAIT_SLOTS:
        prefer_low = icon == "eye"
        score_bias = "high" if icon == "shield" else "low" if icon == "eye" else None
        picked = _pick_for_slot(
            candidates,
            dims,
            used,
            score_bias=score_bias,
            dimension_scores=scores or None,
        )
        if not picked:
            continue
        used.add(str(picked.get("externalId") or ""))
        traits.append(
            {
                "icon": icon,
                "title": _trait_title(picked),
                "body": _trait_body(picked, attachment_type, icon),
                "highlight": highlight_key == "highlight",
                "sourceQuestionId": picked.get("externalId"),
                "dimensionCode": picked.get("dimension"),
            }
        )

    return traits[:3]


def load_attempt_answer_rows(conn: Any, attempt_id: str) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT
          taa.external_question_id,
          taa.answer_payload,
          taa.numeric_score,
          taa.dimension_code,
          tq.question_type,
          tq.question_text,
          tq.question_payload,
          tq.scoring_payload,
          tq.weight,
          tq.direction
        FROM public.test_attempt_answers taa
        JOIN public.test_questions tq ON tq.id = taa.question_id
        WHERE taa.attempt_id = %s
        ORDER BY tq.display_order ASC
        """,
        (attempt_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def attach_core_traits_to_payload(
    conn: Any,
    attempt_id: str,
    result_payload: dict[str, Any],
    dimension_scores: dict[str, float] | None,
) -> dict[str, Any]:
    payload = dict(result_payload)
    profile = payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}
    attachment = str(payload.get("attachment_type") or profile.get("attachment_type") or "")
    rows = load_attempt_answer_rows(conn, attempt_id)
    payload["core_traits"] = build_core_traits(rows, dimension_scores, attachment)
    return payload
