#!/usr/bin/env python3
"""Smoke tests for deferred answer persistence helpers (no DB)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.attempt_helpers import parse_stored_answers  # noqa: E402
from app.core_traits import build_core_traits  # noqa: E402


def test_parse_stored_answers() -> None:
    raw = [
        {
            "questionId": "q1",
            "externalId": "ROS-F-01",
            "kind": "slider",
            "answerPayload": {"value": 72},
        },
        {
            "externalId": "ROS-F-02",
            "answer_payload": {"optionKey": "b", "optionIndex": 1},
        },
    ]
    parsed = parse_stored_answers(raw)
    assert parsed["ROS-F-01"] == {"value": 72}
    assert parsed["ROS-F-02"]["optionKey"] == "b"


def test_materialize_rows_shape() -> None:
    """Rows built from JSON must satisfy build_core_traits / evidence consumers."""
    rows = [
        {
            "external_question_id": "SA1-F-01",
            "answer_payload": {"value": 4},
            "numeric_score": 4.0,
            "dimension_code": "SA1",
            "question_type": "slider",
            "question_text": "测试题",
            "question_payload": {"slider": {"min": 0, "max": 100}},
            "scoring_payload": {"method": "slider_to_5"},
            "weight": 1,
            "direction": "forward",
        }
    ]
    traits = build_core_traits(rows, {"SA1": 80.0}, "安全型")
    assert len(traits) >= 1


def main() -> None:
    test_parse_stored_answers()
    test_materialize_rows_shape()
    print("test_attempt_answers: ok")


if __name__ == "__main__":
    main()
