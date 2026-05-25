#!/usr/bin/env python3
"""Couple AI context smoke tests (no live API)."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ai_context_assembler import assemble_pair_context, assemble_ros_pair_context  # noqa: E402
from app.mate_couple_ai_content import attach_mate_couple_ai_content  # noqa: E402
from app.ros_couple_ai_content import attach_ros_couple_ai_content  # noqa: E402


def test_ros_pair_context() -> None:
    payload = {
        "type": {"name": "温水同行"},
        "keywords": ["真实", "安稳"],
        "gap": {"dimLabel": "亲密"},
        "perceptionGap": {"label": "感知高度一致"},
        "collision": {"body": "你们的依恋组合需要更多真实沟通"},
        "bridge": "你先说我现在很慌",
        "insights": [{"kind": "strength", "title": "t", "body": "b"}] * 4,
    }
    ctx = assemble_ros_pair_context(payload)
    assert ctx.product_set == "ROS"
    assert ctx.pair_atoms.get("pair_atoms")
    enriched = attach_ros_couple_ai_content(payload, use_ai=False)
    assert enriched.get("assembledAiContext")
    assert enriched["ai_content"]["mode"] == "deterministic"


def test_mate_pair_context() -> None:
    payload = {
        "relationship_summary": {"relationship_status": "值得认真推进", "relationship_spark": "现实同频"},
        "ai_context": {"pair_atoms": ["现实差距小", "推进速度差"], "problem": "推进速度差", "spark": "现实同频"},
        "relationship_portrait": {"common": ["稳定感"], "difference": ["推进速度差"]},
        "matchmaker_advice": {"goodNews": "ok", "caution": "c", "oneChange": "o"},
    }
    ctx = assemble_pair_context(payload)
    assert ctx.product_set == "MATE"
    enriched = attach_mate_couple_ai_content(payload, use_ai=False)
    assert enriched.get("assembledAiContext")


if __name__ == "__main__":
    test_ros_pair_context()
    test_mate_pair_context()
    print("couple_ai_content=ok")
