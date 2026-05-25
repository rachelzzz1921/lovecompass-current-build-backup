#!/usr/bin/env python3
"""Smoke tests for ROS Layer C content."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ros_ai_content import (
    build_blind_spot,
    build_ros_insights,
    build_prescription_content,
    compute_score_pattern,
    pattern_cache_key,
)
from app.ros_scoring import resolve_weather, prescription_followup


def test_weather():
    w = resolve_weather(86, 25)
    assert w["label"] == "晴天", w
    w2 = resolve_weather(55, 70)
    assert w2["label"] == "暴风雨前", w2


def test_pattern_key():
    scores = {"AT": 82, "IN": 65, "CO": 70, "EV": 78, "RK": 48}
    key = pattern_cache_key("彼此生长", "female", scores)
    assert "彼此生长" in key
    assert compute_score_pattern(scores) == "80_65_70_75_45"


def test_insights_four_cards():
    insights = build_ros_insights(
        layer_scores={"AT": 82, "IN": 65, "CO": 70, "EV": 78, "RK": 48},
        relationship_type={"name": "彼此生长", "key": "grow"},
        stage_name="重建信任",
        display_resonance=82,
    )
    assert len(insights) == 4
    kinds = {i["kind"] for i in insights}
    assert kinds == {"strength", "watch", "advice", "action"}


def test_prescription():
    rx = build_prescription_content(
        layer_scores={"AT": 70, "IN": 50, "CO": 70, "EV": 78, "RK": 48},
        relationship_type={"name": "温水同行"},
        followup="三个月后",
    )
    assert "complaint" in rx and "prescription_text" in rx


def test_blind_spot_none_without_rows():
    assert build_blind_spot({"IN": 65}, []) is None


if __name__ == "__main__":
    test_weather()
    test_pattern_key()
    test_insights_four_cards()
    test_prescription()
    test_blind_spot_none_without_rows()
    print("ok")
