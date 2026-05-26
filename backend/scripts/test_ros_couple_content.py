#!/usr/bin/env python3
"""ROS 双人报告 Layer B/C 单元测试（无 live API）。"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ros_couple import build_couple_payload  # noqa: E402
from app.ros_couple_ai_content import (  # noqa: E402
    attach_ros_couple_ai_content,
    couple_payload_is_legacy,
    couple_payload_needs_attach,
    couple_pattern_cache_key,
)
from app.ros_couple_content import build_layer_compare, build_couple_insights, diff_level  # noqa: E402


def test_diff_levels() -> None:
    assert diff_level(5)["color"] == "green"
    assert diff_level(15)["color"] == "blue"
    assert diff_level(25)["color"] == "amber"


def test_layer_compare_shape() -> None:
    you = {"AT": 82, "IN": 65, "CO": 70, "EV": 78, "RK": 25}
    ta = {"AT": 65, "IN": 78, "CO": 72, "EV": 58, "RK": 40}
    lc = build_layer_compare(you, ta)
    assert set(lc.keys()) == {"at", "in", "co", "ev", "rk"}
    assert lc["ev"]["gap"] == 20
    assert lc["ev"]["gap_text"]


def test_couple_insights_four_cards() -> None:
    you = {"AT": 82, "IN": 65, "CO": 70, "EV": 78, "RK": 25}
    ta = {"AT": 65, "IN": 78, "CO": 72, "EV": 58, "RK": 40}
    lc = build_layer_compare(you, ta)
    cards = build_couple_insights(
        layer_compare=lc,
        consensus_label="兼容程度",
        gap_label="关系走向",
        gap_value=20,
        you_attachment="焦虑型",
        ta_attachment="回避型",
    )
    assert len(cards) == 4
    kinds = {c["kind"] for c in cards}
    assert kinds == {"strength", "watch", "advice", "action"}


def test_legacy_detection() -> None:
    assert couple_payload_is_legacy({})
    assert couple_payload_is_legacy({"resonance": {"score": 80}})
    assert not couple_payload_is_legacy(
        {
            "layerCompare": {"ev": {}},
            "perspectives": {"you": {}, "ta": {}},
            "insights": [{"kind": "strength", "title": "t", "body": "b"}],
        }
    )


def test_attach_deterministic() -> None:
    payload = {
        "type": {"name": "温水同行"},
        "bond": {"you_type": "焦虑型", "ta_type": "回避型"},
        "dims": [
            {"key": "at", "you": 80, "ta": 70},
            {"key": "in", "you": 65, "ta": 72},
            {"key": "co", "you": 70, "ta": 71},
            {"key": "ev", "you": 78, "ta": 58},
            {"key": "rk", "you": 25, "ta": 40},
        ],
        "layerCompare": build_layer_compare(
            {"AT": 80, "IN": 65, "CO": 70, "EV": 78, "RK": 25},
            {"AT": 70, "IN": 72, "CO": 71, "EV": 58, "RK": 40},
        ),
        "insights": build_couple_insights(
            layer_compare=build_layer_compare(
                {"AT": 80, "IN": 65, "CO": 70, "EV": 78, "RK": 25},
                {"AT": 70, "IN": 72, "CO": 71, "EV": 58, "RK": 40},
            ),
            consensus_label="兼容程度",
            gap_label="关系走向",
            gap_value=20,
            you_attachment="焦虑型",
            ta_attachment="回避型",
        ),
        "prescription": {"warmup": "w", "chiefComplaint": "c", "rx": "r", "followUp": "三个月后"},
        "gap": {"dimKey": "ev", "dimLabel": "关系走向", "body": "gap"},
        "perspectives": {"you": {"score": 82, "label": "你的视角"}, "ta": {"score": 67, "label": "对方视角"}},
    }
    assert couple_payload_needs_attach(payload) is True
    enriched = attach_ros_couple_ai_content(payload, use_ai=False)
    assert enriched["ai_content"]["mode"] == "deterministic"
    assert enriched.get("assembledAiContext")
    assert couple_payload_needs_attach(enriched) is False


def test_pattern_cache_key_stable() -> None:
    you = {"AT": 80, "IN": 65, "CO": 70, "EV": 78, "RK": 25}
    ta = {"AT": 70, "IN": 72, "CO": 71, "EV": 58, "RK": 40}
    k1 = couple_pattern_cache_key("温水同行", "焦虑型", "回避型", you, ta)
    k2 = couple_pattern_cache_key("温水同行", "焦虑型", "回避型", you, ta)
    assert k1 == k2
    assert "焦虑型×回避型" in k1


if __name__ == "__main__":
    test_diff_levels()
    test_layer_compare_shape()
    test_couple_insights_four_cards()
    test_legacy_detection()
    test_attach_deterministic()
    test_pattern_cache_key_stable()
    print("ros_couple_content=ok")
