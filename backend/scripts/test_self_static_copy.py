#!/usr/bin/env python3
"""Tests for score pattern + static copy loader."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.self_ai_content import compute_score_pattern, pattern_cache_key  # noqa: E402
from app.self_static_copy import attach_static_copy_to_payload, load_static_copy, scenes_for_attachment  # noqa: E402


def main() -> None:
    lib = load_static_copy()
    assert len(lib.get("types") or {}) == 12

    pattern = compute_score_pattern({"SA1": 68, "SA2": 38, "SA3": 72, "SA4": 55, "SA5": 62, "SA6": 74})
    assert pattern == "65_35_70_55_60_70"
    key = pattern_cache_key("林黛玉", "female", {"SA2": 38})
    assert key.startswith("林黛玉:female:")

    payload = attach_static_copy_to_payload(
        {"archetype_code": "林黛玉", "attachment_type": "焦虑型", "archetype_profile": {}}
    )
    assert payload.get("static_copy", {}).get("type", {}).get("tagline")
    scenes = scenes_for_attachment("焦虑型")
    assert len(scenes) == 3

    print("self_static_copy + pattern tests passed")


if __name__ == "__main__":
    main()
