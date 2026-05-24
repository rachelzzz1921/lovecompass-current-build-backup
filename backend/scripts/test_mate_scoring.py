from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_scoring import is_mate_suite, summarize_mate_scores


def _load_bank(gender: str = "female") -> dict:
    name = "suite3_mate_female.json" if gender == "female" else "suite3_mate_male.json"
    path = Path(__file__).resolve().parents[1] / "data" / name
    return json.loads(path.read_text(encoding="utf-8"))


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
        qtype = q["question_type"]
        payload = q["question_payload"]
        if qtype == "choice":
            options = payload.get("options") or []
            answers[ext] = {"optionKey": options[1]["key"] if len(options) > 1 else "A", "optionIndex": 1}
        elif qtype == "slider":
            answers[ext] = {"value": 7}
        elif qtype == "scale":
            answers[ext] = {"value": 4}
        elif qtype == "binary":
            opts = payload.get("options") or []
            answers[ext] = {"optionKey": opts[0].get("key", "left") if opts else "left", "optionIndex": 0}
        elif qtype == "scenario":
            opts = payload.get("options") or []
            answers[ext] = {"optionKey": opts[2]["key"] if len(opts) > 2 else "A", "optionIndex": 2}
        elif qtype == "mood":
            opts = payload.get("options") or []
            answers[ext] = {"optionKey": opts[0]["key"] if opts else "A", "optionIndex": 0}
        elif qtype == "card":
            opts = payload.get("options") or []
            answers[ext] = {"optionKey": opts[0]["key"] if opts else "A", "optionIndex": 0}
        elif qtype == "rank":
            items = payload.get("items") or payload.get("options") or []
            answers[ext] = {"orderedItemIds": [item.get("id") or item.get("key") for item in items][:4]}
        else:
            answers[ext] = {"value": 3}
    return answers


def test_mate_suite_detection() -> None:
    assert is_mate_suite("s03_mate_female")
    assert is_mate_suite("s03_mate_male")
    assert not is_mate_suite("s01_self_female")


def test_mate_scoring_produces_v3_payload() -> None:
    bank = _load_bank("female")
    questions = _sample_questions(bank)
    answers = _mid_answers(questions)
    scoring_model = {
        "scoring_formula": bank.get("scoring_formula") or {},
        "type_rules": bank.get("type_rules") or {},
    }
    result = summarize_mate_scores(questions, answers, scoring_model, gender="female")
    payload = result["result_payload"]
    assert payload["model"] == "MATE_V3"
    assert payload["productSet"] == "MATE"
    assert payload["positionType"]["name"]
    assert payload["identityCard"]["title"]
    assert len(payload["matchmakerRecords"]) >= 3
    assert len(payload["loveTimeline"]) >= 4
    assert payload["upperMatch"]["traits"]
    assert payload["sweetSpot"]["successRate"] >= 55
    assert len(payload["secularAdvice"]) >= 4
    assert len(payload["aiLens"]) == 3
    assert "axisX" in payload and "axisY" in payload
    assert isinstance(payload.get("display_summaries"), dict)
    assert payload["display_summaries"]


def test_appearance_calibration_pulls_down_high_self_rating() -> None:
    from app.mate_scoring import _calibrate_attractiveness, _appearance_asset_label

    adjusted = _calibrate_attractiveness(9, management=35, social=40, presence=42)
    assert adjusted < 9
    assert _appearance_asset_label(adjusted) in {
        "外形资产：高辨识度",
        "外形资产：中等辨识度",
    }


def test_mate_scoring_includes_appearance_asset_label() -> None:
    bank = _load_bank("female")
    questions = _sample_questions(bank)
    answers = _mid_answers(questions)
    answers["FS1-A-F-01"] = {"value": 9}
    answers["FS1-A-F-03"] = {"value": 2}
    answers["FS1-A-F-02"] = {"optionKey": "A", "optionIndex": 0}
    scoring_model = {
        "scoring_formula": bank.get("scoring_formula") or {},
        "type_rules": bank.get("type_rules") or {},
    }
    result = summarize_mate_scores(questions, answers, scoring_model, gender="female")
    payload = result["result_payload"]
    assert payload.get("appearanceAsset", {}).get("label", "").startswith("外形资产：")
    asset_labels = [item["label"] for item in payload["identityCard"]["assets"]]
    assert "外形资产" in asset_labels


if __name__ == "__main__":
    test_mate_suite_detection()
    test_mate_scoring_produces_v3_payload()
    test_appearance_calibration_pulls_down_high_self_rating()
    test_mate_scoring_includes_appearance_asset_label()
    print("mate scoring tests passed")
