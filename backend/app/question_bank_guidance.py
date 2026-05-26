"""Slider guidance fields in question banks — merge, validate, prevent silent loss."""

from __future__ import annotations

import difflib
import re
from typing import Any

SLIDER_UI_KEYS = (
    "feedback",
    "footnote",
    "reference",
    "tierLabels",
    "tier_labels",
    "displayMode",
    "display_mode",
)

GUIDANCE_KEYS = ("feedback", "footnote", "reference")


def _normalize_key(key: str) -> str:
    if key == "tier_labels":
        return "tierLabels"
    if key == "display_mode":
        return "displayMode"
    return key


def slider_has_guidance(slider: dict[str, Any] | None) -> bool:
    if not slider:
        return False
    if slider.get("footnote"):
        return True
    if slider.get("reference"):
        return True
    feedback = slider.get("feedback")
    return isinstance(feedback, list) and len(feedback) > 0


def _normalize_text(text: str) -> str:
    return re.sub(r"[\s—\-，。！？、；：""''（）()…·]+", "", text or "")


def _text_overlap(a: str, b: str) -> float:
    a_norm = _normalize_text(a)
    b_norm = _normalize_text(b)
    if not a_norm or not b_norm:
        return 0.0
    if a_norm in b_norm or b_norm in a_norm:
        return 1.0
    return difflib.SequenceMatcher(None, a_norm, b_norm).ratio()


def _question_bucket(question: dict[str, Any]) -> str | None:
    qid = str(question.get("id") or "")
    if not qid:
        return None
    head = qid.split("-", 1)[0]
    return head or None


def _find_full_slider_source(
    lite_q: dict[str, Any],
    full_by_id: dict[str, dict[str, Any]],
    full_sliders: list[dict[str, Any]],
) -> dict[str, Any] | None:
    qid = str(lite_q.get("id") or "")
    if qid in full_by_id and full_by_id[qid].get("type") == "slider":
        return full_by_id[qid]

    text = str(lite_q.get("text") or "")
    bucket = _question_bucket(lite_q)
    scoped = [
        candidate
        for candidate in full_sliders
        if bucket is None or _question_bucket(candidate) == bucket
    ] or full_sliders

    best: dict[str, Any] | None = None
    best_score = 0.38
    for candidate in scoped:
        score = _text_overlap(text, str(candidate.get("text") or ""))
        if score > best_score:
            best_score = score
            best = candidate
    return best


def merge_slider_guidance(target: dict[str, Any], source: dict[str, Any]) -> bool:
    """Copy missing guidance keys from source slider into target. Returns True if changed."""
    if target.get("type") != "slider" or source.get("type") != "slider":
        return False
    t_slider = target.setdefault("slider", {})
    s_slider = source.get("slider") or {}
    changed = False
    for raw_key in SLIDER_UI_KEYS:
        key = _normalize_key(raw_key)
        val = s_slider.get(raw_key) if raw_key in s_slider else s_slider.get(key)
        if val is None or val == [] or val == "":
            continue
        if key not in t_slider or t_slider.get(key) in (None, [], ""):
            t_slider[key] = val
            changed = True
    return changed


def enrich_questions_slider_guidance(
    lite_questions: list[dict[str, Any]],
    *full_question_lists: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    for full_questions in full_question_lists:
        full_by_id = {str(q.get("id")): q for q in full_questions if q.get("id")}
        full_sliders = [q for q in full_questions if q.get("type") == "slider"]
        for question in lite_questions:
            if question.get("type") != "slider":
                continue
            if slider_has_guidance(question.get("slider") or {}):
                continue
            source = _find_full_slider_source(question, full_by_id, full_sliders)
            if source:
                merge_slider_guidance(question, source)
    return lite_questions


def validate_bank_slider_guidance(bank: dict[str, Any], *, suite_label: str) -> list[str]:
    errors: list[str] = []
    for question in bank.get("questions") or []:
        if question.get("type") != "slider":
            continue
        qid = question.get("id") or "?"
        slider = question.get("slider") or {}
        if slider_has_guidance(slider):
            continue
        errors.append(f"{suite_label}: slider {qid} missing feedback/footnote/reference")
    return errors
