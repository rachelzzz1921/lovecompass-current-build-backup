from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_pair_supplement import (
    build_pair_supplement_analysis,
    extract_single_mapped_supplement_fields,
    normalize_supplement_answers,
    questions_for_gender,
    skip_question_ids_from_single,
)


def test_education_maps_from_single_question_id() -> None:
    attempt = {
        "id": "attempt-1",
        "result_payload": {},
    }

    class FakeConn:
        pass

    rows = [
        {
            "external_question_id": "FS3-A-F-38",
            "answer_payload": {"optionKey": "C"},
        }
    ]

    from app import mate_pair_supplement as mod

    original = mod.load_attempt_answer_rows
    mod.load_attempt_answer_rows = lambda _conn, _id: rows
    try:
        fields = extract_single_mapped_supplement_fields(FakeConn(), attempt)
        assert fields["education_level"] == 3
        skip = skip_question_ids_from_single(FakeConn(), attempt)
        assert "PR1-02" in skip
    finally:
        mod.load_attempt_answer_rows = original


def test_supplement_questions_skip_education_when_mapped() -> None:
    visible = questions_for_gender("female", skip_ids={"PR1-02"})
    ids = {str(q.get("id")) for q in visible}
    assert "PR1-02" not in ids
    assert "PR1-01" in ids


def test_pair_analysis_uses_merged_fields() -> None:
    initiator = {
        "id": "a1",
        "archetype_gender": "female",
        "result_payload": {
            "gender": "female",
            "pair_supplement": {
                "completed_at": "2026-05-24T00:00:00Z",
                "fields": {
                    "age": 28,
                    "huji": "local",
                    "target_city_plan": "current_fixed",
                    "want_children": "want",
                    "children_timing": 2,
                    "female_work_plan": "fulltime",
                    "childcare_plan": "couple",
                    "childcare_flexibility_score": 80,
                    "long_distance_tolerance": 2,
                    "financial_model": "partial_joint",
                    "housing_plan": "rent_then_buy",
                    "bride_price_attitude": "symbolic",
                    "living_with_parents": "nearby",
                },
            },
        },
        "dimension_scores": {"FS3": 70, "FS1": 72},
    }
    partner = {
        "id": "a2",
        "archetype_gender": "male",
        "result_payload": {
            "gender": "male",
            "pair_supplement": {
                "completed_at": "2026-05-24T00:00:00Z",
                "fields": {
                    "age": 30,
                    "education_level": 3,
                    "huji": "local",
                    "target_city_plan": "current_fixed",
                    "want_children": "want",
                    "children_timing": 2.5,
                    "male_expect_female_work": "fulltime",
                    "childcare_plan": "couple",
                    "childcare_flexibility_score": 75,
                    "long_distance_tolerance": 2,
                    "financial_model": "partial_joint",
                    "housing_plan": "buy_before",
                    "bride_price_attitude": "symbolic",
                    "living_with_parents": "independent",
                },
            },
        },
        "dimension_scores": {"MS1": 72, "MS4": 68},
    }

    payload = build_pair_supplement_analysis(initiator=initiator, partner=partner)
    assert payload["engine"] == "MATE_PAIR_SUPPLEMENT_V1.1"
    assert payload["supplementComplete"] is True
    labels = [row["label"] for row in payload["condition_compare_table"]]
    assert "年龄差" in labels
    deal_labels = [row["label"] for row in payload["deal_items_table"]]
    assert "要不要孩子" in deal_labels
    assert payload["rhythm_section"]["youScore"] == 80


def test_normalize_supplement_answers_binary_want_children() -> None:
    fields = normalize_supplement_answers(
        {"PR2-01": {"optionKey": "yes"}},
        gender="female",
    )
    assert fields["want_children"] == "want"


if __name__ == "__main__":
    test_education_maps_from_single_question_id()
    test_supplement_questions_skip_education_when_mapped()
    test_pair_analysis_uses_merged_fields()
    test_normalize_supplement_answers_binary_want_children()
    print("mate pair supplement tests passed")
