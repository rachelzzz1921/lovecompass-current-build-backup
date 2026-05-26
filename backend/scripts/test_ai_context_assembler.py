#!/usr/bin/env python3
"""AI context assembler unit checks."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ai_context_assembler import (  # noqa: E402
    assemble_mate_context,
    assemble_ros_context,
    context_from_dict,
)
from app.dictionary_retrieval import retrieve_dictionary_snippets  # noqa: E402
from app.mate_scoring import summarize_mate_scores  # noqa: E402


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


def test_mate_context_has_atoms_not_raw_scores() -> None:
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
    block = ctx.to_compact_block()
    safe = json.dumps(ctx.to_model_safe_prompt_dict(), ensure_ascii=False)
    assert ctx.profile_atoms.get("trait_atoms"), "expected trait atoms"
    assert "FS1=" not in block and "FS2=" not in block
    assert "FS1" not in safe and "FS2" not in safe
    assert ctx.user_traits
    assert ctx.dictionary, "expected dictionary snippets"
    restored = context_from_dict(ctx.to_prompt_dict())
    assert restored.main_type == ctx.main_type


def test_dictionary_retrieval_by_atom() -> None:
    snippets = retrieve_dictionary_snippets(trait_atoms=["低显示"], pair_atoms=["推进速度差"])
    assert any("观察" in s or "热情" in s for s in snippets)
    assert any("确定" in s or "观察" in s for s in snippets)


def test_ros_context_patterns() -> None:
    payload = {
        "relationshipType": {"name": "温水同行"},
        "relationshipStage": {"name": "渐入佳境"},
        "resonance": {"tier": "深度共鸣"},
    }
    ctx = assemble_ros_context(payload, layer_scores={"AT": 72, "IN": 42, "CO": 60, "EV": 55, "RK": 48})
    assert ctx.main_type == "温水同行"
    assert ctx.profile_atoms.get("behavior_atoms")


def test_director_payload_is_compact_and_flat() -> None:
    bank = _load_bank("female")
    questions = _sample_questions(bank)
    scored = summarize_mate_scores(
        questions,
        _mid_answers(questions),
        {"scoring_formula": bank.get("scoring_formula") or {}, "type_rules": {}},
        gender="female",
    )
    ctx = assemble_mate_context(scored["result_payload"], module_scores=scored["dimension_scores"], gender="female")
    sliced = ctx.slice_for_task("mate-reverse")
    payload = sliced.to_director_payload("mate-reverse")
    assert "profile" in payload
    assert "profile_atoms" not in payload
    assert "evidence" not in payload
    assert "FS1" not in json.dumps(payload, ensure_ascii=False)

    from app.ai_director import build_director_prompt, estimate_director_prompt_size

    prompt = build_director_prompt(task="mate-reverse", context=ctx)
    assert estimate_director_prompt_size(task="mate-reverse", context=ctx) < 6000
    assert "profile" in prompt
    assert "hidden_dictionary" not in prompt


if __name__ == "__main__":
    test_mate_context_has_atoms_not_raw_scores()
    test_dictionary_retrieval_by_atom()
    test_ros_context_patterns()
    test_director_payload_is_compact_and_flat()
    print("ai_context_assembler=ok")
