#!/usr/bin/env python3
"""Smoke tests for SELF ai_content Layer B/C (no DB)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.self_ai_content import (  # noqa: E402
    build_dimension_summaries,
    build_growth_path_text,
    build_self_ai_content,
    build_self_insights,
    score_display_summary,
)


def main() -> None:
    scores = {"SA1": 68, "SA2": 38, "SA3": 72, "SA4": 55, "SA5": 62, "SA6": 74}
    summaries = build_dimension_summaries(scores)
    assert summaries["SA2"]["label"] == score_display_summary(38)
    assert "SA2" in summaries
    sa2_logic = summaries["SA2"].get("underlying_logic") or {}
    assert sa2_logic.get("bandKey") == "developing"
    assert sa2_logic.get("measure")
    assert "感知力" in (sa2_logic.get("headline") or "")
    assert sa2_logic.get("interpretation")
    assert sa2_logic.get("inRelationship")
    assert summaries["SA2"]["detail"] == sa2_logic.get("headline")
    assert summaries["SA2"]["position_label_low"] == "高焦虑"
    assert summaries["SA2"]["position_label_high"] == "低焦虑"

    insights = build_self_insights(attachment="焦虑型", dimension_scores=scores)
    assert len(insights) == 4
    kinds = {i["kind"] for i in insights}
    assert kinds == {"strength", "watch", "match", "growth"}

    growth = build_growth_path_text("林黛玉", scores)
    assert "史湘云" in growth

    payload = {
        "attachment_type": "焦虑型",
        "archetype_code": "林黛玉",
        "core_traits": [
            {
                "icon": "shield",
                "title": "测试",
                "body": "body",
                "evidence": [{"question_id": "SA2-F-01", "question_short": "题", "chosen_label": "选"}],
            }
        ],
    }
    ai = build_self_ai_content(result_payload=payload, dimension_scores=scores, use_ai=False)
    assert ai["status"] == "ready"
    assert ai["mode"] == "deterministic"
    assert ai.get("assembled_context")
    assert len(ai["insights"]) == 4
    assert ai["growth_path"]

    print("self_ai_content smoke test passed")


if __name__ == "__main__":
    main()
