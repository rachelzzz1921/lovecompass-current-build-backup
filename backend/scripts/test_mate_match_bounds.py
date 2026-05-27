from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_match_bounds import build_match_bounds, compute_pair_compatibility_base, load_match_bounds_library


def test_library_loads() -> None:
    lib = load_match_bounds_library()
    assert lib.get("engine") == "MATE_MATCH_BOUNDS_V1"
    assert "被读懂之前的人" in (lib.get("bounds_by_position") or {})
    assert "male:mature_reader" in (lib.get("portraits") or {})


def test_pair_metrics() -> None:
    metrics = compute_pair_compatibility_base(
        module_scores={"FS1": 50, "FS2": 68, "FS3": 72, "FS4": 70, "FS5": 22},
        axis_x=45,
        axis_y=70,
        gender="female",
    )
    assert 50 <= metrics["base"] <= 85
    assert metrics["P1"] >= metrics["P6"] - 30


def test_p6_affects_base_score() -> None:
    low = compute_pair_compatibility_base(
        module_scores={"FS1": 50, "FS2": 68, "FS3": 72, "FS4": 70, "FS5": 22},
        axis_x=45,
        axis_y=70,
        gender="female",
    )
    high = compute_pair_compatibility_base(
        module_scores={"FS1": 90, "FS2": 68, "FS3": 72, "FS4": 70, "FS5": 22},
        axis_x=45,
        axis_y=70,
        gender="female",
    )
    delta = high["base"] - low["base"]
    assert 1.8 <= delta <= 2.2, f"P6 weight delta expected ~2, got {delta}"
    assert high["P6"] == 90.0
    assert low["P6"] == 50.0


def test_bounds_three_bands_with_portraits() -> None:
    profile = {
        "upper_match": "有阅历、不被表面吸引的男性",
        "sweet_spot": "务实、重视稳定的男性",
        "lower_match": "追求第一眼感觉的男性",
    }
    bounds = build_match_bounds(
        profile=profile,
        module_scores={"FS1": 48, "FS2": 68, "FS3": 72, "FS4": 70, "FS5": 22},
        axis_x=45,
        axis_y=70,
        gender="female",
        position_name="被读懂之前的人",
    )
    upper = bounds["upperMatch"]
    sweet = bounds["sweetSpot"]
    lower = bounds["lowerMatch"]

    assert upper["matchScore"] > sweet["matchScore"] > lower["matchScore"]
    assert len(upper["portraits"]) >= 1
    assert len(sweet["portraits"]) >= 1
    assert len(lower["portraits"]) >= 1
    assert upper["portraits"][0]["name"]
    assert upper["portraits"][0]["snapshot"]
    assert sweet.get("stableProbability", 0) >= 62
    assert "对你来说" in sweet["summary"]
    assert profile["sweet_spot"] in sweet["summary"]
    extras = bounds.get("matchZoneExtras") or {}
    assert extras.get("scoreScope", {}).get("label")
    assert "火花潜力" in upper["traits"]


def test_position_changes_portraits() -> None:
    scores = {"FS1": 72, "FS2": 78, "FS3": 70, "FS4": 75, "FS5": 25}
    a = build_match_bounds(
        profile={"upper_match": "a", "sweet_spot": "b", "lower_match": "c"},
        module_scores=scores,
        axis_x=65,
        axis_y=72,
        gender="female",
        position_name="让人想留下来的人",
    )
    b = build_match_bounds(
        profile={"upper_match": "a", "sweet_spot": "b", "lower_match": "c"},
        module_scores=scores,
        axis_x=65,
        axis_y=72,
        gender="female",
        position_name="需要被正确打开的人",
    )
    assert a["upperMatch"]["portraits"][0]["id"] != b["upperMatch"]["portraits"][0]["id"]


def test_male_targets_female_portraits() -> None:
    bounds = build_match_bounds(
        profile={"upper_match": "u", "sweet_spot": "s", "lower_match": "l"},
        module_scores={"MS1": 72, "MS2": 75, "MS3": 68, "MS4": 65, "MS5": 20},
        axis_x=62,
        axis_y=74,
        gender="male",
        position_name="让人想留下来的人",
    )
    ids = [p["id"] for p in bounds["sweetSpot"]["portraits"]]
    assert all(id.startswith("female:") for id in ids)


if __name__ == "__main__":
    test_library_loads()
    test_pair_metrics()
    test_p6_affects_base_score()
    test_bounds_three_bands_with_portraits()
    test_position_changes_portraits()
    test_male_targets_female_portraits()
    print("mate match bounds tests passed")
