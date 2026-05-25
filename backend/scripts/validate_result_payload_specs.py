#!/usr/bin/env python3
"""Validate result_payload shape against result_page_specs_v1.json."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.mate_ai_content import build_mate_ai_content  # noqa: E402
from app.mate_scoring import _build_mate_result_payload  # noqa: E402
from app.result_page_specs import validate_result_payload  # noqa: E402
from app.ros_scoring import _build_ros_result_payload  # noqa: E402
from app.scoring import _build_result_payload  # noqa: E402


def _sample_self() -> dict:
    scores = {"SA1": 72, "SA2": 48, "SA3": 55, "SA4": 68, "SA5": 61, "SA6": 70}
    payload = _build_result_payload(scores, "薛宝钗", "安全型")
    payload["archetype_profile"] = {
        "attachment_type": "安全型",
        "tagline": "稳定而真诚",
        "description": "你在关系里既能独立，也懂得依赖。",
    }
    payload["ai_content"] = {
        "status": "ready",
        "mode": "deterministic",
        "generated_at": "2026-01-01T00:00:00Z",
        "insights": [{"kind": "strength", "title": "t", "body": "b"}] * 4,
    }
    payload["core_traits"] = [{"icon": "shield", "title": "t", "body": "b"}] * 3
    return payload


def _sample_ros() -> dict:
    layer_scores = {"AT": 78, "IN": 62, "CO": 70, "EV": 75, "RK": 45}
    payload = _build_ros_result_payload(
        layer_scores=layer_scores,
        display_index=72,
        raw_index=70,
        relationship_type={"key": "grow", "name": "彼此生长", "one_liner": "一起变好"},
        stage_id=4,
        resonance={"tier": "深度共鸣", "desc": "有真实联结"},
        relation_code="ABC123",
        time_tag="early",
        insights=[{"kind": "strength", "title": "t", "body": "b"}] * 4,
        type_rules={},
        stage_rules={},
    )
    payload["ai_content"] = {
        "status": "ready",
        "mode": "deterministic",
        "generated_at": "2026-01-01T00:00:00Z",
        "insights_list": payload["insights"],
    }
    return payload


def _sample_mate() -> dict:
    module_scores = {"FS1": 65, "FS2": 72, "FS3": 58, "FS4": 68, "FS5": 42}
    payload = _build_mate_result_payload(
        gender="female",
        module_scores=module_scores,
        axis_x=62,
        axis_y=58,
        position_name="让人想留下来的人",
        quadrant="Q1",
        profile={"tagline": "相处越久越值钱", "upper_match": "u", "sweet_spot": "s", "lower_match": "l"},
        scoring_formula={},
        appearance_label="外形资产：高辨识度",
    )
    ai = build_mate_ai_content(
        result_payload=payload,
        module_scores=module_scores,
        gender="female",
        use_ai=False,
    )
    payload["ai_content"] = ai
    payload["insights"] = ai["insights"]
    return payload


def main() -> None:
    cases = [("SELF", _sample_self()), ("ROS", _sample_ros()), ("MATE", _sample_mate())]
    failed = False
    for product_set, payload in cases:
        errors = validate_result_payload(product_set, payload, require_ai_content=True)
        if errors:
            failed = True
            print(f"FAIL {product_set}:")
            for err in errors:
                print(f"  - {err}")
        else:
            print(f"OK {product_set} ({len(payload)} top-level keys)")
    if failed:
        sys.exit(1)
    print(json.dumps({"ok": True, "suites": [c[0] for c in cases]}))


if __name__ == "__main__":
    main()
