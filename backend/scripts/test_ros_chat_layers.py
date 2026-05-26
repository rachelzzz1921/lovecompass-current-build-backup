#!/usr/bin/env python3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.ros_chat_layers import build_ros_inquiry_layer


def test_layer_inquiry():
    msg = "我在看 ROS 报告里的「互动质量」层（IN · 65）。\n问诊问题：你们上一次…"
    layer = build_ros_inquiry_layer(
        msg,
        {"test_id": "s02_ros_female", "result_payload": {}},
    )
    assert "ROS 层问诊模式" in layer
    assert "互动质量" in layer


def test_blind_spot():
    layer = build_ros_inquiry_layer(
        "我想展开了解报告里的「盲区提示」。",
        {"test_id": "s02_ros_male"},
    )
    assert "盲区深探" in layer


def test_non_ros():
    assert build_ros_inquiry_layer("hello", {"test_id": "s01_self_female"}) == ""


def test_couple_gap():
    layer = build_ros_inquiry_layer(
        "我在看 ROS 双人报告里的层间差距。\n维度：关系走向",
        {"test_id": "s02_ros_female"},
    )
    assert "双人层间差距" in layer


if __name__ == "__main__":
    test_layer_inquiry()
    test_blind_spot()
    test_couple_gap()
    test_non_ros()
    print("ok")
