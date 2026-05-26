#!/usr/bin/env python3
"""Unit smoke test for profile center aggregation (no DB)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.profile_center import (  # noqa: E402
    compute_completeness,
    resolve_product_set,
    summarize_attempt,
)


def main() -> None:
    assert resolve_product_set("s01_self_female", "自我关系模式", "s01_self_female") == "SELF"
    assert resolve_product_set("s02_ros_v1", "恋情评估", None) == "ROS"
    assert resolve_product_set("s03_mate", "择偶", None) == "MATE"

    summary = summarize_attempt(
        {
            "id": "abc-123",
            "test_id": "s01_self_female",
            "status": "completed",
            "archetype_code": "薛宝钗",
            "ros_index": 75.4,
            "dimension_scores": {"SA1": 72, "SA2": 68},
            "result_payload": {
                "archetype_code": "薛宝钗",
                "attachment_type": "安全型",
                "archetype_profile": {
                    "tagline": "你是关系里最稀有的人",
                    "description": "清醒但不冷漠",
                },
                "core_traits": [{"icon": "shield", "title": "测试", "body": "body"}],
            },
            "suite_slug": "s01_self_female",
            "suite_name": "自我关系模式测试",
            "suite_gender": "female",
            "completed_at": "2026-05-23T12:00:00Z",
        },
        include_detail=True,
    )
    assert summary["productSet"] == "SELF"
    assert summary["archetypeCode"] == "薛宝钗"
    assert summary["index"] == 75
    assert len(summary["coreTraits"]) == 1

    completeness = compute_completeness({"SELF": summary, "ROS": None, "MATE": None})
    assert completeness["percent"] == 40
    assert completeness["label"] == "基础底片已建立"

    print("profile_center smoke test passed")


if __name__ == "__main__":
    main()
