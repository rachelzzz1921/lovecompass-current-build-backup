#!/usr/bin/env python3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.chat_prompt_layers import triage_counselor
from app.ros_chat_layers import build_ros_inquiry_layer, classify_ros_intent


def test_layer_inquiry():
    msg = "我在看 ROS 报告里的「互动质量」层（IN · 65）。\n问诊问题：你们上一次…"
    layer = build_ros_inquiry_layer(
        msg,
        {"test_id": "s02_ros_female", "result_payload": {"layers": [{"code": "IN", "score": 65}]}},
    )
    assert "ROS 关系报告深探" in layer
    assert "互动" in layer or "互动质量" in layer


def test_blind_spot():
    layer = build_ros_inquiry_layer(
        "我想展开了解报告里的「盲区提示」。",
        {
            "test_id": "s02_ros_male",
            "result_payload": {"ai_content": {"blind_spot": {"title": "温差", "gap_summary": "自报偏高"}}},
        },
    )
    assert "盲区提示深探" in layer


def test_non_ros():
    assert build_ros_inquiry_layer("hello", {"test_id": "s01_self_female"}) == ""


def test_couple_gap():
    layer = build_ros_inquiry_layer(
        "我在看 ROS 双人报告里的层间差距。\n维度：关系走向",
        {"test_id": "s02_ros_female", "result_payload": {}},
    )
    assert "双人层间差距" in layer


def test_classify_intent():
    assert classify_ros_intent("", "我不想分手但很累")[0] != "couple_gap"
    intent, code = classify_ros_intent("", "为什么我总是遇到同一种人")
    assert intent in ("single_layer", "none", "light")


def test_triage_negation():
    res = triage_counselor("我不想分手，但不知道他怎么想的")
    assert res["counselorId"] != "haven" or res["confidence"] == "low"


def test_triage_template_haven():
    res = triage_counselor("我刚分手，很难受，睡不着")
    assert res["counselorId"] == "haven"


if __name__ == "__main__":
    test_layer_inquiry()
    test_blind_spot()
    test_couple_gap()
    test_non_ros()
    test_classify_intent()
    test_triage_negation()
    test_triage_template_haven()
    print("ok")
