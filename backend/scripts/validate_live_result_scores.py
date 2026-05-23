from __future__ import annotations

import sys
from typing import Any

import requests


def assert_score_range(name: str, value: Any) -> None:
    if not isinstance(value, (int, float)):
        raise AssertionError(f"{name} is not numeric: {value!r}")
    if not 0 <= float(value) <= 100:
        raise AssertionError(f"{name} out of range 0..100: {value!r}")


def main(attempt_ids: list[str]) -> None:
    if not attempt_ids:
        raise SystemExit("usage: python scripts/validate_live_result_scores.py <attempt_id> [attempt_id...]")
    for attempt_id in attempt_ids:
        resp = requests.get(f"http://127.0.0.1:8000/attempts/{attempt_id}/result", timeout=20)
        resp.raise_for_status()
        attempt = resp.json()["attempt"]
        scores = attempt.get("scores") or attempt.get("dimension_scores") or {}
        if not scores:
            raise AssertionError(f"{attempt_id} has no scores")
        for dim, value in scores.items():
            assert_score_range(f"{attempt_id}.{dim}", value)
        assert_score_range(f"{attempt_id}.ros_index", attempt.get("ros_index"))
        print(attempt_id, "ok", {"ros_index": attempt.get("ros_index"), "scores": scores})


if __name__ == "__main__":
    main(sys.argv[1:])
