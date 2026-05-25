#!/usr/bin/env python3
"""Smoke tests for MATE ai_content Layer B/C."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.mate_ai_content import build_mate_ai_content, build_mate_insights  # noqa: E402


def test_insights_four_cards():
    insights = build_mate_insights(
        position_name="让人想留下来的人",
        quadrant="Q1",
        module_scores={"FS1": 65, "FS2": 72, "FS3": 58, "FS4": 68, "FS5": 42},
        profile={"tagline": "test", "upper_match": "u", "sweet_spot": "s", "lower_match": "l"},
        gender="female",
    )
    assert len(insights) == 4
    kinds = {i["kind"] for i in insights}
    assert kinds == {"strength", "watch", "match", "growth"}


def test_build_ai_content_block():
    payload = {
        "productSet": "MATE",
        "positionType": {"name": "让人想留下来的人", "tagline": "tag"},
        "quadrant": "Q1",
        "identityCard": {"title": "让人想留下来的人"},
        "matchmakerRecords": [{"id": "001", "title": "第一次见面", "narrative": "n"}],
        "aiLens": [{"key": "weapon", "title": "隐藏武器", "tag": "t", "body": "b"}],
    }
    ai = build_mate_ai_content(
        result_payload=payload,
        module_scores={"FS1": 65, "FS2": 72, "FS3": 58, "FS4": 68, "FS5": 42},
        gender="female",
        use_ai=False,
    )
    assert ai["status"] == "ready"
    assert ai["mode"] == "deterministic"
    assert len(ai["insights"]) == 4


if __name__ == "__main__":
    test_insights_four_cards()
    test_build_ai_content_block()
    print("mate_ai_content smoke test passed")
