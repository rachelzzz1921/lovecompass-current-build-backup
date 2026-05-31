from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ros_couple import build_couple_payload
from app.ros_scoring import summarize_ros_scores


def _load_bank() -> dict:
    path = Path(__file__).resolve().parents[1] / "data" / "suite2_ros_female.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _sample_questions(bank: dict) -> list[dict]:
    rows = []
    for pre in bank.get("pre_questions") or []:
        rows.append(
            {
                "external_question_id": pre["id"],
                "dimension_code": "PRE",
                "question_type": pre.get("type"),
                "question_payload": {"source_question": pre, **pre},
                "scoring_payload": pre.get("scoring") or {},
                "weight": 0,
                "direction": "neutral",
            }
        )
    for question in bank.get("questions") or []:
        rows.append(
            {
                "external_question_id": question["id"],
                "dimension_code": question.get("layer") or question.get("dimension"),
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
        qtype = q["question_type"]
        payload = q["question_payload"]
        if qtype == "choice":
            options = payload.get("options") or []
            answers[ext] = {"optionKey": options[0]["key"] if options else "A", "optionIndex": 0}
        elif qtype == "slider":
            answers[ext] = {"value": 65}
        elif qtype == "scale":
            answers[ext] = {"value": 4}
        elif qtype == "binary":
            opts = payload.get("options") or []
            answers[ext] = {"optionKey": opts[0].get("key", "left") if opts else "left", "optionIndex": 0}
        elif qtype == "scenario":
            opts = payload.get("options") or []
            answers[ext] = {"optionKey": opts[1]["key"] if len(opts) > 1 else "A", "optionIndex": 1}
        elif qtype == "mood":
            opts = payload.get("options") or []
            answers[ext] = {"optionKey": opts[0]["key"] if opts else "A", "optionIndex": 0}
        elif qtype == "rank":
            items = payload.get("items") or payload.get("options") or []
            answers[ext] = {"orderedItemIds": [item.get("id") or item.get("key") for item in items][:4]}
        else:
            answers[ext] = {"value": 3}
    return answers


def test_ros_single_scoring_has_display_floor() -> None:
    bank = _load_bank()
    questions = _sample_questions(bank)
    answers = _mid_answers(questions)
    scoring_model = {
        "scoring_formula": bank["scoring_formula"],
        "type_rules": {
            "stage_rules": bank["stage_rules"],
            "relationship_type_rules": bank["relationship_type_rules"],
            "attachment_collision_map": bank["attachment_collision_map"],
            "prescription_rules": bank["prescription_rules"],
        },
    }
    scores = summarize_ros_scores(questions, answers, scoring_model)
    assert scores["ros_index"] >= 55, scores
    assert set(scores["dimension_scores"]) >= {"AT", "IN", "CO", "EV", "RK"}
    payload = scores["result_payload"]
    assert payload["productSet"] == "ROS"
    assert payload["relationCode"].startswith("ROS-")
    assert payload["relationshipType"]["name"]
    assert 1 <= payload["relationshipStage"]["id"] <= 9
    assert len(payload["insights"]) == 3
    assert payload.get("layerDetails") and "in" in payload["layerDetails"]
    assert payload["layers"][0].get("displaySummary")
    assert isinstance(payload.get("display_summaries"), dict)
    assert payload["display_summaries"].get("AT")
    print("ros single ok", {
        "ros_index": scores["ros_index"],
        "type": payload["relationshipType"]["name"],
        "stage": payload["relationshipStage"]["name"],
    })


def test_ros_lite_skips_relation_code() -> None:
    bank = _load_bank()
    questions = _sample_questions(bank)
    answers = _mid_answers(questions)
    scoring_model = {
        "scoring_formula": bank["scoring_formula"],
        "type_rules": {
            "stage_rules": bank["stage_rules"],
            "relationship_type_rules": bank["relationship_type_rules"],
            "attachment_collision_map": bank["attachment_collision_map"],
            "prescription_rules": bank["prescription_rules"],
        },
    }
    scores = summarize_ros_scores(
        questions,
        answers,
        scoring_model,
        suite_slug="s02_ros_female_lite",
    )
    assert scores.get("relation_code") is None
    assert scores["result_payload"].get("relationCode") is None
    print("ros lite no relation code ok")


def test_ros_couple_merge() -> None:
    bank = _load_bank()
    questions = _sample_questions(bank)
    answers = _mid_answers(questions)
    scoring_model = {
        "scoring_formula": bank["scoring_formula"],
        "type_rules": {
            "stage_rules": bank["stage_rules"],
            "relationship_type_rules": bank["relationship_type_rules"],
            "attachment_collision_map": bank["attachment_collision_map"],
        },
    }
    you = summarize_ros_scores(questions, answers, scoring_model)
    ta = summarize_ros_scores(questions, answers, scoring_model)
    couple = build_couple_payload(
        code="ROS-TEST-CODE",
        initiator={
            "id": "11111111-1111-1111-1111-111111111111",
            "user_id": "user-a",
            "dimension_scores": you["dimension_scores"],
            "ros_index": you["ros_index"],
            "result_payload": {**you["result_payload"], "attachment_type": "焦虑型"},
        },
        partner={
            "id": "22222222-2222-2222-2222-222222222222",
            "user_id": "user-b",
            "dimension_scores": ta["dimension_scores"],
            "ros_index": ta["ros_index"],
            "result_payload": {**ta["result_payload"], "attachment_type": "回避型"},
        },
        scoring_formula=bank["scoring_formula"],
        type_rules=scoring_model["type_rules"],
    )
    assert couple["resonance"]["score"] >= 55
    assert couple["collision"]["name"]
    assert len(couple["dims"]) == 5
    assert couple.get("layerCompare")
    assert couple.get("perspectives")
    assert couple.get("perceptionGap")
    assert len(couple.get("insights") or []) == 4
    print("ros couple ok", {"score": couple["resonance"]["score"], "tier": couple["resonance"]["tier"]})


if __name__ == "__main__":
    test_ros_single_scoring_has_display_floor()
    test_ros_couple_merge()
