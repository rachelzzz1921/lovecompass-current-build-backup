from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_scoring import is_mate_suite, summarize_mate_scores
from app.scoring import answer_to_numeric


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


def test_rank_first_scoring() -> None:
    question = {
        "question_type": "rank",
        "scoring_payload": {
            "method": "rank_self_awareness",
            "score_map": {"a_first": 85, "b_first": 75, "c_first": 70, "d_first": 50},
        },
    }
    assert answer_to_numeric(question, {"orderedItemIds": ["b", "a", "c", "d"]}) == 75.0
    assert answer_to_numeric(question, {"orderedItemIds": ["a", "b", "c", "d"]}) == 85.0


def test_mate_suite_detection() -> None:
    assert is_mate_suite("s03_mate_female")
    assert is_mate_suite("s03_mate_male")
    assert not is_mate_suite("s01_self_female")


def test_mate_scoring_produces_v4_payload() -> None:
    bank = _load_bank("female")
    questions = _sample_questions(bank)
    answers = _mid_answers(questions)
    scoring_model = {
        "scoring_formula": bank.get("scoring_formula") or {},
        "type_rules": bank.get("type_rules") or {},
    }
    result = summarize_mate_scores(questions, answers, scoring_model, gender="female")
    payload = result["result_payload"]
    assert payload["model"] == "MATE_V4"
    assert payload["engine"] == "MATE_ENGINE_V4.1"
    assert payload["productSet"] == "MATE"
    assert payload["positionType"]["name"]
    assert payload["identityCard"]["title"]
    assert len(payload["matchmakerRecords"]) >= 3
    assert len(payload["loveTimeline"]) >= 4
    assert payload["upperMatch"]["traits"]
    assert payload["upperMatch"].get("matchScore", 0) >= 68
    assert len(payload["upperMatch"].get("portraits") or []) >= 1
    assert payload["sweetSpot"]["successRate"] >= 55
    assert len(payload["sweetSpot"].get("portraits") or []) >= 1
    assert payload["lowerMatch"].get("matchScore", 100) <= 65
    assert len(payload["lowerMatch"].get("portraits") or []) >= 1
    assert len(payload["secularAdvice"]) >= 4
    assert len(payload["aiLens"]) == 3
    assert "axisX" in payload and "axisY" in payload
    assert payload.get("relationCode", "").startswith("ROS-")
    assert isinstance(payload.get("display_summaries"), dict)
    assert payload["display_summaries"]
    assert payload.get("profileEngine", {}).get("main_type")
    assert len(payload.get("moduleAccordions") or []) >= 3
    mappings = [a.get("marketMapping") for a in payload.get("moduleAccordions") or []]
    assert len(set(mappings)) == len(mappings), "module marketMapping must be unique per module"
    assert payload.get("reverse", {}).get("front", {}).get("title")
    assert len(payload.get("observeSlices") or []) >= 3
    assert len(payload.get("rehearseEpisodes") or []) >= 3
    rehearse = payload.get("rehearseEpisodes") or []
    assert all(len(str(ep.get("plot") or "")) >= 15 for ep in rehearse)
    assert all(ep.get("partnerPsychology") for ep in rehearse)
    assert all(ep.get("suggestion") for ep in rehearse)
    assert len({ep.get("plot") for ep in rehearse}) == 3
    assert payload.get("simulator", {}).get("title")
    assert payload.get("simulator", {}).get("peerAxis")
    assert payload.get("simulator", {}).get("leverEvidence")
    assert payload.get("simulator", {}).get("projectedDisplay") is not None
    assert payload.get("adviceV4", {}).get("goodNews")
    assert payload.get("matchZone", {}).get("userZone") in {
        "风险区",
        "最佳适配区",
        "挑战上限区",
    }
    assert len(payload.get("insights") or []) >= 4
    assert len(payload.get("lensGrid") or []) == 3
    assert len(payload.get("footerMarquee", {}).get("marquee") or []) >= 1


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


def test_mate_skip_enrich_layers() -> None:
    bank = _load_bank("female")
    questions = _sample_questions(bank)
    answers = _mid_answers(questions)
    scoring_model = {
        "scoring_formula": bank.get("scoring_formula") or {},
        "type_rules": bank.get("type_rules") or {},
    }
    result = summarize_mate_scores(
        questions, answers, scoring_model, gender="female", skip_enrich=True
    )
    payload = result["result_payload"]
    layers = payload.get("computedLayers") or {}
    assert layers.get("feature_vector")
    assert layers.get("atoms", {}).get("main_type")
    assert isinstance(layers.get("evidence_index"), list)
    assert payload.get("moduleAccordions") is None


def test_mate_lite_bank_scoring() -> None:
    path = Path(__file__).resolve().parents[1] / "data" / "suite3_mate_female_lite.json"
    if not path.exists():
        return
    bank = json.loads(path.read_text(encoding="utf-8"))
    questions = _sample_questions(bank)
    answers = _mid_answers(questions)
    scoring_model = {
        "scoring_formula": bank.get("scoring_formula") or {},
        "type_rules": bank.get("type_rules") or {},
    }
    result = summarize_mate_scores(questions, answers, scoring_model, gender="female")
    payload = result["result_payload"]
    assert payload.get("positionType", {}).get("name")
    assert len(payload.get("rehearseEpisodes") or []) >= 3
    assert payload.get("simulator", {}).get("baselineDisplay") is not None


if __name__ == "__main__":
    test_mate_suite_detection()
    test_mate_scoring_produces_v4_payload()
    test_appearance_calibration_pulls_down_high_self_rating()
    test_mate_scoring_includes_appearance_asset_label()
    test_mate_skip_enrich_layers()
    test_mate_lite_bank_scoring()
    print("mate scoring tests passed")
