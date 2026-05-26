#!/usr/bin/env python3
"""Unit tests for chat messages assembly and triage negation."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.chat_case_library import select_top_cases
from app.chat_case_tags import infer_scene_tags
from app.chat_context import (
    build_chat_messages,
    build_effective_profile_block,
    build_portrait_aggregate_profile_block,
)
from app.chat_prompt_layers import (
    TRIAGE_LLM_THRESHOLD,
    _triage_fused_scores,
    triage_counselor,
    triage_with_llm,
)


def test_messages_structure():
    analyst = {
        "system_prompt": "你是学者顾问。",
        "persona_prompt": "表达 DNA：结构清晰。",
    }
    attempt = {
        "id": "00000000-0000-4000-8000-000000000001",
        "suite_slug": "s02_ros_female",
        "test_id": "s02_ros_female",
        "result_payload": {"productSet": "ROS", "relationshipType": "并肩同行"},
        "completed_at": "2026-05-01",
    }
    history = [{"role": "user", "content": "你好"}, {"role": "assistant", "content": "你好，我在。"}]
    messages, injection = build_chat_messages(
        analyst,
        attempt,
        history,
        "我们还能走下去吗？",
        conn=None,
        user_id=None,
        crisis_level="none",
    )
    assert injection.has_profile_block
    assert messages[0]["role"] == "system"
    assert "学者顾问" in messages[0]["content"]
    assert "MIRROR" in messages[0]["content"]
    assert any(m["role"] == "user" and "ROS" in m["content"] for m in messages)
    assert any(m["role"] == "assistant" for m in messages)
    assert messages[-1]["role"] == "user"
    assert messages[-1]["role"] == "user"
    assert "我们还能走下去吗" in messages[-1]["content"]
    assert messages[-2]["content"] == "你好，我在。"


def test_triage_negation_haven():
    res = triage_counselor("我不想分手，但不知道他怎么想的")
    assert res["counselorId"] != "haven" or res["confidence"] == "low"


def test_triage_intent_haven():
    res = triage_counselor("我刚分手，很难受，睡不着")
    assert res["counselorId"] == "haven"


def test_unbound_aggregate_profile_block():
    portrait = {
        "completeness": {"percent": 40, "label": "基础底片已建立"},
        "products": [
            {
                "code": "SELF",
                "productSet": "SELF",
                "latest": {
                    "attachmentType": "焦虑型",
                    "archetypeCode": "探春",
                    "dimensions": [{"code": "SA1"}],
                },
            }
        ],
    }
    block = build_portrait_aggregate_profile_block(portrait)
    assert "真实测试画像" in block
    assert "SELF" in block
    assert "勿说「尚未接入数据」" in block


def test_infer_scene_tags_oracle():
    tags = infer_scene_tags("他到底喜不喜欢我，信号看不懂", counselor_slug="oracle")
    assert "signal_judgment" in tags


def test_case_scoring_prefers_tag_overlap():
    rows = [
        {
            "id": "a",
            "scene_tags": ["worth_it"],
            "trigger_keywords": [],
            "user_turn": "u1",
            "assistant_turn": "a1",
            "priority": 1,
            "use_count": 0,
            "hit_rate": None,
        },
        {
            "id": "b",
            "scene_tags": ["signal_judgment"],
            "trigger_keywords": [],
            "user_turn": "u2",
            "assistant_turn": "a2",
            "priority": 10,
            "use_count": 0,
            "hit_rate": None,
        },
    ]
    picked = select_top_cases(
        rows,
        scene_tags=["worth_it"],
        user_message="值不值得继续",
        max_cases=1,
    )
    assert picked[0]["id"] == "a"


def test_triage_llm_fallback_mock():
    fused, _ = _triage_fused_scores("嗯")
    assert max(fused.values()) < TRIAGE_LLM_THRESHOLD
    res = triage_with_llm("嗯")
    assert res is None or res["counselorId"] in ("haven", "oracle", "darwin", "sage")


if __name__ == "__main__":
    test_messages_structure()
    test_triage_negation_haven()
    test_triage_intent_haven()
    test_unbound_aggregate_profile_block()
    test_infer_scene_tags_oracle()
    test_case_scoring_prefers_tag_overlap()
    test_triage_llm_fallback_mock()
    print("ok")
