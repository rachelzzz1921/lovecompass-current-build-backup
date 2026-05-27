from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_couple import (
    aggregate_score,
    build_couple_payload,
    compute_P1,
    compute_P2,
    compute_P3,
    compute_P4,
    compute_P5,
    compute_P6,
    extract_profiles,
)


def test_mate_couple_payload_shape() -> None:
    initiator = {
        "id": "a1",
        "user_id": "u1",
        "suite_slug": "s03_mate_female",
        "archetype_gender": "female",
        "ros_index": 72,
        "dimension_scores": {"FS1": 70, "FS2": 75, "FS3": 68, "FS4": 65, "FS5": 35},
        "result_payload": {
            "gender": "female",
            "axisX": 68,
            "axisY": 72,
            "positionType": {"name": "让人想留下来的人"},
            "pair_supplement": {
                "fields": {
                    "age": 27,
                    "education_level": 4,
                    "huji": "local",
                    "target_city_plan": "current_fixed",
                    "want_children": "want",
                    "children_timing": 2.5,
                    "female_work_plan": "fulltime",
                    "financial_model": "full_joint",
                },
                "completed_at": "2026-01-01T00:00:00Z",
            },
        },
    }
    partner = {
        "id": "a2",
        "user_id": "u2",
        "suite_slug": "s03_mate_male",
        "archetype_gender": "male",
        "ros_index": 70,
        "dimension_scores": {"MS1": 72, "MS2": 68, "MS3": 74, "MS4": 66, "MS5": 40},
        "result_payload": {
            "gender": "male",
            "axisX": 65,
            "axisY": 70,
            "positionType": {"name": "让人想留下来的人"},
            "pair_supplement": {
                "fields": {
                    "age": 29,
                    "education_level": 3,
                    "huji": "nonlocal",
                    "target_city_plan": "current_fixed",
                    "want_children": "want",
                    "children_timing": 0,
                    "male_expect_female_work": "fulltime",
                    "financial_model": "aa_equal",
                    "childcare_flexibility_score": 55,
                },
                "completed_at": "2026-01-01T00:00:00Z",
            },
        },
    }

    profiles = extract_profiles(initiator, partner)
    male, female = profiles["male"], profiles["female"]
    modules = {
        "P1": compute_P1(male, female),
        "P2": compute_P2(male, female),
        "P3": compute_P3(male, female),
        "P4": compute_P4(male, female),
        "P5": compute_P5(male, female),
    }
    modules["P6"] = compute_P6(male, female, modules["P1"], modules["P2"], modules["P5"])
    score = aggregate_score(modules)
    assert 0 <= score <= 100
    assert all(mod.get("score") is not None for mod in modules.values())

    payload = build_couple_payload(code="MATE-TEST-0001", initiator=initiator, partner=partner)
    assert payload["model"] == "MATE_PAIR_V4"
    assert payload["verdict"]["score"] == score
    assert payload["verdict"]["title"]
    assert isinstance(payload["condition_table"], list)
    assert isinstance(payload["deal_items"]["highlight"], list)
    assert isinstance(payload["rhythm"], list)
    assert payload["conclusion"]["summary"]
    assert payload["ai_context"]["pair_atoms"]
    assert payload["modules"]["P4"]["score"] is not None


def test_p1_blends_hard_conditions() -> None:
    male = {
        "scores": {"MS1": 72},
        "fields": {"education_level": 5, "huji": "local", "age": 30},
        "derived": {"reality_score": 72},
        "context": {"income_level": "优质层", "housing_status": "自有/按揭房"},
    }
    female = {
        "scores": {"FS3": 70},
        "fields": {"education_level": 2, "huji": "nonlocal", "age": 26},
        "derived": {"reality_score": 70},
        "context": {"income_level": "半独立", "housing_status": "租房（积累中）"},
    }
    module_only = 100 - abs(72 - 70)
    p1 = compute_P1(male, female)
    assert p1["score"] < module_only - 5
    assert "硬条件有落差" in p1.get("atoms", [])


def test_p4_pending_without_planning_data() -> None:
    male = {
        "gender": "male",
        "scores": {"MS1": 70, "MS2": 68, "MS3": 72, "MS4": 66, "MS5": 40},
        "fields": {},
        "derived": {},
        "context": {},
    }
    female = {
        "gender": "female",
        "scores": {"FS1": 70, "FS2": 75, "FS3": 68, "FS4": 65, "FS5": 35},
        "fields": {},
        "derived": {},
        "context": {},
    }
    modules = {
        "P1": compute_P1(male, female),
        "P2": compute_P2(male, female),
        "P3": compute_P3(male, female),
        "P4": compute_P4(male, female),
        "P5": compute_P5(male, female),
    }
    modules["P6"] = compute_P6(male, female, modules["P1"], modules["P2"], modules["P5"])

    assert modules["P4"]["score"] is None
    assert modules["P4"]["pending"] is True
    assert modules["P4"]["level"] == "待评估"

    with_p4 = dict(modules)
    with_p4["P4"] = {"score": 70.0, "level": "中", "atoms": ["长期稳定"], "pending": False}
    assert aggregate_score(with_p4) != aggregate_score(modules)


if __name__ == "__main__":
    test_mate_couple_payload_shape()
    test_p1_blends_hard_conditions()
    test_p4_pending_without_planning_data()
    print("mate couple tests passed")
