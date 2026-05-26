"""Single-pass MATE analysis layers — feature vector, atoms, evidence index."""

from __future__ import annotations

from typing import Any

from app.mate_engine import extract_profile_engine, resolve_sub_type
from app.mate_express import load_human_express, match_evidence_triggers, resolve_sub_badges
from app.scoring import answer_to_numeric


def _option_text(question: dict[str, Any], answer: dict[str, Any]) -> str | None:
    payload = question.get("question_payload") or {}
    source = payload.get("source_question") or payload
    options = source.get("options") or payload.get("options") or []
    key = answer.get("optionKey")
    idx = answer.get("optionIndex")
    if key:
        for opt in options:
            if str(opt.get("key")) == str(key):
                return str(opt.get("text") or "")
    if idx is not None and 0 <= int(idx) < len(options):
        return str(options[int(idx)].get("text") or "")
    return None


def _evidence_snippet(question: dict[str, Any], answer: dict[str, Any]) -> str | None:
    stem = (question.get("question_text") or "")[:40]
    opt = _option_text(question, answer)
    if "value" in answer:
        return f"在「{stem}…」的自评倾向偏高"
    if opt:
        return f"在「{stem}…」中，你选择了「{opt[:36]}」"
    if stem:
        return f"「{stem}…」这道题给出了清晰信号"
    return None


def scan_module_evidence_once(
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
) -> dict[str, str]:
    best: dict[str, tuple[float, str]] = {}
    for question in questions:
        module_code = question.get("dimension_code")
        if not module_code:
            continue
        ext = question["external_question_id"]
        ans = answers.get(ext)
        if not ans:
            continue
        numeric = answer_to_numeric(question, ans)
        if numeric is None:
            continue
        snippet = _evidence_snippet(question, ans)
        if not snippet:
            continue
        weight = float(question.get("weight") or 1)
        score = float(numeric) * weight
        code = str(module_code)
        if code not in best or score > best[code][0]:
            best[code] = (score, snippet)
    return {
        code: f"{snippet}。这在模型里不是偶然，而是该模块的重要证据。"
        for code, (_, snippet) in best.items()
    }


def build_evidence_index(
    *,
    gender: str,
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    trait_atoms: list[str],
) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    triggers = ((load_human_express().get("evidence_triggers") or {}).get(gender) or [])
    q_by_ext = {q["external_question_id"]: q for q in questions}
    for trigger in triggers:
        qid = str(trigger.get("question_id") or "")
        ans = answers.get(qid) or {}
        expected = str(trigger.get("option_key") or "")
        if str(ans.get("optionKey") or "").upper() != expected.upper():
            continue
        trait = str(trigger.get("output") or trigger.get("trait") or "")
        if not trait:
            continue
        key = (trait, qid)
        if key in seen:
            continue
        seen.add(key)
        row = q_by_ext.get(qid) or {}
        opt = _option_text(row, ans) if row else None
        items.append(
            {
                "trait": trait,
                "question_id": qid,
                "answer": opt or str(trigger.get("output") or ""),
            }
        )

    for atom in trait_atoms:
        for item in items:
            if atom in item["trait"] or item["trait"] in atom:
                break
        else:
            items.append({"trait": atom, "question_id": "", "answer": atom})

    return items


def build_mate_precomputed_layers(
    *,
    position_name: str,
    axis_x: float,
    axis_y: float,
    module_scores: dict[str, float],
    sub_scores: dict[str, float],
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    scoring_formula: dict[str, Any],
    gender: str,
) -> dict[str, Any]:
    sub_type = resolve_sub_type(position_name, axis_x, axis_y, module_scores, gender)
    atoms = extract_profile_engine(
        position_name=position_name,
        sub_type=sub_type,
        axis_x=axis_x,
        axis_y=axis_y,
        module_scores=module_scores,
        gender=gender,
    )
    module_evidence = scan_module_evidence_once(questions, answers)
    for code in (module_scores or {}):
        trigger_evidence = match_evidence_triggers(
            gender=gender,
            questions=questions,
            answers=answers,
            module_code=str(code),
        )
        if trigger_evidence and str(code) not in module_evidence:
            module_evidence[str(code)] = trigger_evidence

    sub_badges_by_module = resolve_sub_badges(
        gender=gender,
        questions=questions,
        answers=answers,
        module_scores=module_scores,
        sub_scores=sub_scores,
        scoring_formula=scoring_formula,
    )
    trait_atoms = list(atoms.get("trait_atoms") or [])
    evidence_index = build_evidence_index(
        gender=gender,
        questions=questions,
        answers=answers,
        trait_atoms=trait_atoms,
    )

    return {
        "feature_vector": {str(k): float(v) for k, v in module_scores.items()},
        "sub_scores": {str(k): float(v) for k, v in sub_scores.items()},
        "atoms": atoms,
        "evidence_index": evidence_index,
        "sub_badges_by_module": sub_badges_by_module,
        "module_evidence": module_evidence,
    }
