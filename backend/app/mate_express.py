"""MATE human express dictionary — score/b badge/evidence/lens/footer mappings."""

from __future__ import annotations

import json
import random
from functools import lru_cache
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

FEMALE_RISK_CODES = frozenset({"FS5"})
MALE_RISK_CODES = frozenset({"MS5"})


@lru_cache(maxsize=1)
def load_human_express() -> dict[str, Any]:
    path = DATA_DIR / "mate_human_express_v1.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _band_match(value: float, bands: list[dict[str, Any]], *, key: str = "text") -> str | None:
    for band in bands:
        lo = float(band.get("min", 0))
        hi = float(band.get("max", 100))
        if lo <= value <= hi:
            return str(band.get(key) or band.get("badge") or "")
    return None


def asset_module_label(score: float) -> str:
    cfg = load_human_express().get("score_mapping_config") or {}
    bands = cfg.get("asset_dimensions") or []
    return _band_match(score, bands) or "表现稳定"


def risk_module_label(score: float) -> dict[str, str]:
    cfg = load_human_express().get("score_mapping_config") or {}
    bands = cfg.get("risk_dimension") or []
    for band in bands:
        lo = float(band.get("min", 0))
        hi = float(band.get("max", 100))
        if lo <= score <= hi:
            text = str(band.get("text") or "")
            note = str(band.get("system_note") or "")
            display = f"{text}（{note}）" if note else text
            return {
                "label": text,
                "display": display,
                "systemNote": note,
                "action": str(band.get("action") or "normal"),
            }
    return {"label": "中性", "display": "中性", "systemNote": "", "action": "normal"}


def module_display_label(code: str, score: float) -> str:
    if code in FEMALE_RISK_CODES or code in MALE_RISK_CODES:
        return risk_module_label(score)["display"]
    return asset_module_label(score)


def _answer_value(questions: list[dict[str, Any]], answers: dict[str, dict[str, Any]], question_id: str) -> float | None:
    row = next((q for q in questions if q.get("external_question_id") == question_id), None)
    if not row:
        return None
    ans = answers.get(question_id)
    if not ans:
        return None
    if "value" in ans:
        try:
            return float(ans["value"])
        except (TypeError, ValueError):
            return None
    return None


def _wealth_tier_from_answer(questions: list[dict[str, Any]], answers: dict[str, dict[str, Any]], question_id: str) -> str | None:
    value = _answer_value(questions, answers, question_id)
    if value is None:
        return None
    level = max(1, min(6, round(value)))
    return chr(ord("A") + level - 1)


SUB_BADGE_KEYS: dict[str, dict[str, str]] = {
    "female": {
        "FS1_A": "FS1_appearance",
        "FS1_B": "FS1_presence",
        "FS1_C": "FS1_freshness",
        "FS2_A": "FS2_emotion_stability",
        "FS2_C": "FS2_empathy_supply",
        "FS3_A": "FS3_wealth",
        "FS5_B": "FS5_friction",
    },
    "male": {
        "MS1_A": "MS1_wealth_tier",
        "MS1_B": "MS2_career_certainty",
        "MS2_A": "MS2_life_discipline",
        "MS3_B": "MS3_care",
    },
}


def resolve_sub_badges(
    *,
    gender: str,
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    module_scores: dict[str, float],
    sub_scores: dict[str, float],
    scoring_formula: dict[str, Any],
) -> dict[str, list[str]]:
    cfg = ((load_human_express().get("badge_desensitization_config") or {}).get(gender) or {})
    modules_cfg = scoring_formula.get("modules") or {}
    out: dict[str, list[str]] = {}

    for module_code, module_def in modules_cfg.items():
        if not isinstance(module_def, dict):
            continue
        badges: list[str] = []
        for sub_code, sub_def in (module_def.get("sub") or {}).items():
            if not isinstance(sub_def, dict):
                continue
            sub_label = str(sub_def.get("label") or sub_code)
            badge = _badge_for_sub(
                gender=gender,
                module_code=module_code,
                sub_code=str(sub_code),
                cfg=cfg,
                questions=questions,
                answers=answers,
                module_scores=module_scores,
                sub_scores=sub_scores,
            )
            if badge:
                badges.append(f"{sub_label} · {badge}")
        module_key = "MS4_social" if gender == "male" and module_code == "MS4" else None
        if module_key and module_key in cfg:
            badge = _badge_for_entry(
                cfg[module_key],
                questions=questions,
                answers=answers,
                module_scores=module_scores,
                sub_scores=sub_scores,
            )
            if badge:
                badges.append(f"{module_def.get('label', module_code)} · {badge}")
        if badges:
            out[module_code] = badges
    return out


def _badge_for_sub(
    *,
    gender: str,
    module_code: str,
    sub_code: str,
    cfg: dict[str, Any],
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    module_scores: dict[str, float],
    sub_scores: dict[str, float],
) -> str | None:
    key = (SUB_BADGE_KEYS.get(gender) or {}).get(sub_code)
    if not key or key not in cfg:
        return None
    return _badge_for_entry(
        cfg[key],
        questions=questions,
        answers=answers,
        module_scores=module_scores,
        sub_scores=sub_scores,
    )


def _badge_for_entry(
    entry: dict[str, Any],
    *,
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    module_scores: dict[str, float],
    sub_scores: dict[str, float],
) -> str | None:
    source = entry.get("source") or {}
    value_type = source.get("value_type")

    if value_type == "wealth_level_A_F":
        qid = str(source.get("question_id") or "")
        tier = _wealth_tier_from_answer(questions, answers, qid)
        tier_map = entry.get("tier_map") or {}
        if tier and tier in tier_map:
            return str(tier_map[tier])
        return None

    if value_type == "slider_1_10":
        qid = str(source.get("question_id") or "")
        raw = _answer_value(questions, answers, qid)
        if raw is not None:
            return _band_match(raw, entry.get("bands") or [], key="badge")
        return None

    raw_score: float | None = None
    src_sub = source.get("sub_code")
    src_module = source.get("module_code")
    if src_sub:
        raw_score = sub_scores.get(str(src_sub))
    elif src_module:
        raw_score = module_scores.get(str(src_module))
    if raw_score is not None:
        return _band_match(float(raw_score), entry.get("bands") or [], key="badge")
    return None


def match_evidence_triggers(
    *,
    gender: str,
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    module_code: str,
) -> str | None:
    triggers = ((load_human_express().get("evidence_triggers") or {}).get(gender) or [])
    for trigger in triggers:
        qid = str(trigger.get("question_id") or "")
        row = next((q for q in questions if q.get("external_question_id") == qid), None)
        if not row or row.get("dimension_code") != module_code:
            continue
        ans = answers.get(qid) or {}
        expected = str(trigger.get("option_key") or "")
        if str(ans.get("optionKey") or "").upper() == expected.upper():
            return str(trigger.get("output") or "")
    return None


def build_lens_cross_text(attachment_type: str | None) -> str | None:
    if not attachment_type:
        return None
    items = (load_human_express().get("lens_cross_model") or {}).get("SELF_attachment") or []
    normalized = attachment_type.strip()
    for item in items:
        match = str(item.get("match") or "")
        if match in normalized or normalized in match:
            return str(item.get("output") or "")
    return None


def footer_quotes_for_position(position_name: str, *, count: int = 3) -> list[str]:
    pools = load_human_express().get("footer_quote_pools") or {}
    quotes = list(pools.get(position_name) or [])
    if not quotes:
        for pool in pools.values():
            if isinstance(pool, list) and pool:
                quotes.extend(pool)
                break
    if len(quotes) <= count:
        return quotes
    return random.sample(quotes, count)


def risk_melt_down(score: float) -> bool:
    return risk_module_label(score).get("action") == "melt_down"
