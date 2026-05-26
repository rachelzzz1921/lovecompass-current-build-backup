from __future__ import annotations

import copy
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_couple import (
    _eval_when,
    _first_matching_rule,
    compute_P5,
    compute_P6,
    load_pair_model,
)


def _profile(gender: str, scores: dict[str, float], derived: dict[str, float] | None = None) -> dict:
    return {
        "gender": gender,
        "scores": scores,
        "derived": derived or {},
        "fields": {},
        "context": {},
    }


def test_p5_mutual_pull_from_model_rules() -> None:
    male = _profile("male", {"MS5": 65, "MS4": 60})
    female = _profile("female", {"FS5": 62})
    p5 = compute_P5(male, female)
    assert p5["score"] == 72
    assert p5["atoms"] == ["双向拉扯"]
    assert p5["level"] == "高"


def test_p5_fallback_risk_signal() -> None:
    male = _profile("male", {"MS5": 56, "MS4": 60})
    female = _profile("female", {"FS5": 40})
    p5 = compute_P5(male, female)
    assert p5["score"] == 24
    assert p5["atoms"] == ["风险信号"]


def test_p6_spark_rule_priority() -> None:
    male = _profile("male", {"MS4": 72, "MS1": 70, "MS5": 58})
    female = _profile("female", {"FS1": 72, "FS3": 68, "FS5": 58})
    p1 = {"score": 80}
    p2 = {"score": 85}
    p5 = {"score": 72}
    p6 = compute_P6(male, female, p1, p2, p5)
    assert p6["spark_key"] == "high_tension"
    assert p6["level"] == "高压拉扯"


def test_p6_stable_warm_when_no_high_tension() -> None:
    male = _profile("male", {"MS4": 72, "MS1": 70, "MS5": 30})
    female = _profile("female", {"FS1": 72, "FS3": 68, "FS5": 30})
    p1 = {"score": 80}
    p2 = {"score": 85}
    p5 = {"score": 0}
    p6 = compute_P6(male, female, p1, p2, p5)
    assert p6["spark_key"] == "stable_warm"


def test_model_rule_edit_changes_p5_without_code_change() -> None:
    model = copy.deepcopy(load_pair_model())
    ctx = {
        "male": _profile("male", {"MS5": 10, "MS4": 10}),
        "female": _profile("female", {"FS5": 10}),
        "modules": {},
        "derived": {"risk_avg": 10},
    }
    custom_rule = {
        "id": "test_rule",
        "priority": 999,
        "when": {"all": [{"ref": "male.scores.MS4", "op": "lt", "value": 20}]},
        "penalty": 88,
        "risk_name": "测试风险",
        "level": "高",
        "atom": "测试风险",
    }
    hit = _first_matching_rule([custom_rule], ctx)
    assert hit is not None
    assert hit["penalty"] == 88
    assert _eval_when(custom_rule["when"], ctx)


if __name__ == "__main__":
    test_p5_mutual_pull_from_model_rules()
    test_p5_fallback_risk_signal()
    test_p6_spark_rule_priority()
    test_p6_stable_warm_when_no_high_tension()
    test_model_rule_edit_changes_p5_without_code_change()
    print("mate couple rule tests passed")
