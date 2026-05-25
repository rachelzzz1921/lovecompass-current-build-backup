#!/usr/bin/env python3
"""Semantic translation layer unit checks."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ai_context_assembler import assemble_mate_context  # noqa: E402
from app.mate_scoring import summarize_mate_scores  # noqa: E402
from app.semantic_translation import (  # noqa: E402
    contains_forbidden,
    guard_ai_output,
    sanitize_text,
    scores_to_user_traits,
    user_label,
)


def _load_bank(gender: str = "female") -> dict:
    name = "suite3_mate_female.json" if gender == "female" else "suite3_mate_male.json"
    return json.loads((ROOT / "data" / name).read_text(encoding="utf-8"))


def _sample_questions(bank: dict) -> list[dict]:
    rows = []
    for question in bank.get("questions") or []:
        module = question.get("module") or question.get("dimension")
        rows.append(
            {
                "external_question_id": question["id"],
                "dimension_code": module,
                "question_type": question.get("type"),
                "question_payload": {"source_question": question, **question},
                "scoring_payload": question.get("scoring") or {},
                "weight": question.get("weight") or 1,
                "direction": question.get("direction") or "positive",
            }
        )
    return rows


def _mid_answers(questions: list[dict]) -> dict[str, dict]:
    answers: dict[str, dict] = {}
    for q in questions:
        ext = q["external_question_id"]
        payload = q["question_payload"]
        qtype = q["question_type"]
        if qtype == "choice":
            options = payload.get("options") or []
            answers[ext] = {"optionKey": options[1]["key"] if len(options) > 1 else "A", "optionIndex": 1}
        elif qtype in {"slider", "scale"}:
            answers[ext] = {"value": 7 if qtype == "slider" else 4}
        else:
            opts = payload.get("options") or []
            answers[ext] = {"optionKey": opts[0].get("key", "left") if opts else "left", "optionIndex": 0}
    return answers


def test_user_label_maps_internal_codes() -> None:
    assert user_label("FS1") == "容易被注意到"
    assert user_label("AS") == "容易被注意到"
    assert user_label("P4") == "未来方向感"


def test_scores_to_user_traits_no_codes() -> None:
    traits = scores_to_user_traits({"FS1": 72, "FS2": 84, "FS3": 55}, product_set="MATE")
    joined = " ".join(traits)
    assert "FS1" not in joined and "FS2" not in joined
    assert "容易被注意到" in joined or "关系托底" in joined


def test_sanitize_replaces_internal_codes() -> None:
    raw = "你的AS偏高，SF较弱，P4长期规划存在偏移"
    cleaned = sanitize_text(raw)
    assert "AS" not in cleaned.upper().split()
    assert not contains_forbidden(cleaned)


def test_guard_ai_output() -> None:
    out = guard_ai_output("根据 FS1 得分，你在 P2 模块中表现突出。")
    assert "FS1" not in out
    assert "P2" not in out


def test_mate_context_model_safe() -> None:
    bank = _load_bank("female")
    questions = _sample_questions(bank)
    scored = summarize_mate_scores(
        questions,
        _mid_answers(questions),
        {"scoring_formula": bank.get("scoring_formula") or {}, "type_rules": {}},
        gender="female",
    )
    payload = scored["result_payload"]
    ctx = assemble_mate_context(payload, module_scores=scored["dimension_scores"], gender="female")
    safe = json.dumps(ctx.to_model_safe_prompt_dict(), ensure_ascii=False)
    assert "FS1" not in safe
    assert ctx.user_traits


if __name__ == "__main__":
    test_user_label_maps_internal_codes()
    test_scores_to_user_traits_no_codes()
    test_sanitize_replaces_internal_codes()
    test_guard_ai_output()
    test_mate_context_model_safe()
    print("semantic_translation=ok")
