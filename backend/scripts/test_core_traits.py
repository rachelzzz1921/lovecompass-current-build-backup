#!/usr/bin/env python3
"""Smoke test for answer-based core trait cards (no DB)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core_traits import build_core_traits  # noqa: E402


def main() -> None:
    rows = [
        {
            "external_question_id": "SA1-F-02",
            "answer_payload": {"optionKey": "C", "optionIndex": 2},
            "numeric_score": 4.0,
            "dimension_code": "SA1",
            "question_type": "choice",
            "question_text": "你喜欢的人突然冷淡了，消息回得很慢，状态也不更新。你脑子里第一个冒出来的念头更接近哪个？",
            "question_payload": {
                "options": [
                    {"key": "A", "text": "是不是我哪里做错了", "sub": "第一反应是检讨自己", "score": 1},
                    {"key": "B", "text": "他可能最近有事", "sub": "理性但情绪在", "score": 2},
                    {"key": "C", "text": "他的状态和我的价值没有关系", "sub": "能区分事件和自我", "score": 4},
                    {"key": "D", "text": "他要是不珍惜", "sub": "自我价值感稳定", "score": 5},
                ]
            },
            "scoring_payload": {},
            "weight": 1.5,
            "direction": "positive",
        },
        {
            "external_question_id": "SA2-F-08",
            "answer_payload": {"optionKey": "D", "optionIndex": 3},
            "numeric_score": 1.0,
            "dimension_code": "SA2",
            "question_type": "choice",
            "question_text": "他说今晚想自己待着，不回消息。你会？",
            "question_payload": {
                "options": [
                    {"key": "A", "text": "好，给他时间", "sub": "低焦虑，尊重边界", "score": 5},
                    {"key": "B", "text": "忍着，但心里很不安", "sub": "中高焦虑，表面克制", "score": 3},
                    {"key": "C", "text": "过一会儿忍不住发消息", "sub": "高焦虑，难以等待", "score": 2},
                    {"key": "D", "text": "开始担心他是不是想分手", "sub": "极高焦虑，灾难化", "score": 1},
                ]
            },
            "scoring_payload": {},
            "weight": 1.5,
            "direction": "reverse",
        },
        {
            "external_question_id": "SA1-F-01",
            "answer_payload": {"value": 75},
            "numeric_score": 4.0,
            "dimension_code": "SA1",
            "question_type": "slider",
            "question_text": "你觉得自己有多值得被认真对待？",
            "question_payload": {
                "slider": {
                    "min": 0,
                    "max": 100,
                    "feedback": [
                        {"range": [0, 20], "text": "你可能习惯了把自己排在最后"},
                        {"range": [61, 80], "text": "你大多数时候知道自己的重量"},
                    ],
                }
            },
            "scoring_payload": {"method": "slider_to_5"},
            "weight": 1.2,
            "direction": "positive",
        },
    ]

    traits = build_core_traits(rows, {"SA1": 72, "SA2": 38, "SA3": 65}, "焦虑型")
    assert len(traits) == 3, traits
    assert traits[0]["icon"] == "shield"
    assert traits[1]["icon"] == "key"
    assert traits[2]["icon"] == "eye"
    assert "能区分事件和自我" in traits[0]["body"] or "第一反应" in traits[0]["body"]
    assert traits[0]["highlight"] is True

    print("core_traits smoke test passed")
    for trait in traits:
        print(f"- [{trait['icon']}] {trait['title']}")
        print(f"  {trait['body']}")


if __name__ == "__main__":
    main()
