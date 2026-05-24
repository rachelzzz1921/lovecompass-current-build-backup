#!/usr/bin/env python3
"""Unit tests for suite-aware context mapping (SELF / ROS / MATE)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.suite_context import (  # noqa: E402
    build_suite_profile_context_block,
    build_suite_report_prompt,
    extract_suite_dimensions,
    fallback_suite_report,
    summarize_suite_context,
)


def test_self_context_keeps_attachment_type() -> None:
    attempt = {
        "id": "a1",
        "test_id": "s01_self_female",
        "suite_slug": "s01_self_female",
        "suite_name": "自我关系模式",
        "archetype_code": "薛宝钗",
        "ros_index": 72,
        "dimension_scores": {"SA1": 70, "SA2": 65},
        "result_payload": {
            "productSet": "SELF",
            "archetype_code": "薛宝钗",
            "attachment_type": "安全型",
            "archetype_profile": {"tagline": "你是关系里最稀有的人"},
        },
        "completed_at": "2026-05-24",
    }
    summary = summarize_suite_context(attempt)
    assert summary["productSet"] == "SELF"
    assert summary["attachmentType"] == "安全型"
    assert summary["primaryMetric"] == "安全型"
    block = build_suite_profile_context_block(attempt)
    assert "套一 SELF" in block
    assert "依恋类型" in block
    assert "六维自我" in block
    assert "红楼人格" in block


def test_ros_context_uses_five_layers() -> None:
    attempt = {
        "id": "a2",
        "test_id": "s02_ros_female",
        "suite_slug": "s02_ros_female",
        "suite_name": "ROS关系测评",
        "archetype_code": "温水同行",
        "ros_index": 78,
        "dimension_scores": {"AT": 80, "IN": 75, "RK": 40},
        "result_payload": {
            "productSet": "ROS",
            "relationshipType": {"name": "温水同行", "one_liner": "舒适但缺少真正联结", "description": "平行相处"},
            "relationshipStage": {"id": 2, "name": "渐入佳境"},
            "resonance": {"tier": "深度共鸣", "score": 82},
            "layers": [
                {"code": "AT", "name": "吸引基础", "score": 80, "displaySummary": "这个维度是你的重要资产"},
                {"code": "IN", "name": "互动质量", "score": 75, "displaySummary": "这个维度表现稳定"},
            ],
            "display_summaries": {"AT": "这个维度是你的重要资产"},
        },
        "completed_at": "2026-05-24",
    }
    summary = summarize_suite_context(attempt)
    assert summary["productSet"] == "ROS"
    assert summary["relationshipType"] == "温水同行"
    assert summary["attachmentType"] is None
    assert summary["primaryMetric"] == "温水同行"
    dims = extract_suite_dimensions(attempt)
    assert dims[0]["name"] == "吸引基础"
    block = build_suite_profile_context_block(attempt)
    assert "套二 ROS" in block
    assert "五层关系线索 AT–RK" in block
    assert "禁止劝分" in block or "不要暴露编号" in block


def test_mate_context_uses_market_position() -> None:
    attempt = {
        "id": "a3",
        "test_id": "s03_mate_female",
        "suite_slug": "s03_mate_female",
        "suite_gender": "female",
        "suite_name": "MATE择偶坐标",
        "archetype_code": "让人想留下来的人",
        "ros_index": 68,
        "dimension_scores": {"FS1": 72, "FS2": 66},
        "result_payload": {
            "productSet": "MATE",
            "quadrant": "Q1",
            "axisX": 70,
            "axisY": 65,
            "positionType": {
                "name": "让人想留下来的人",
                "tagline": "你更适合被慢慢留下",
                "marketRead": "高留存型",
            },
            "modules": [
                {"code": "FS1", "label": "吸引力资产", "displaySummary": "这个维度是你的重要资产"},
            ],
            "matchmaker": {
                "upper_match": "上限：值得争取的方向",
                "sweet_spot": "经济适用：日常省心",
                "lower_match": "下限：不建议消耗",
            },
        },
        "completed_at": "2026-05-24",
    }
    summary = summarize_suite_context(attempt)
    assert summary["productSet"] == "MATE"
    assert summary["matePosition"] == "让人想留下来的人"
    assert summary["attachmentType"] is None
    block = build_suite_profile_context_block(attempt)
    assert "套三 MATE" in block
    assert "红娘三区" in block
    prompt, payload, version = build_suite_report_prompt(attempt)
    assert payload["productSet"] == "MATE"
    assert "mate_v1" in version
    report, one_line, meta = fallback_suite_report(attempt)
    assert meta["productSet"] == "MATE"
    assert "你的牌面" in report
    assert "让人想留下来的人" in one_line


def main() -> None:
    test_self_context_keeps_attachment_type()
    test_ros_context_uses_five_layers()
    test_mate_context_uses_market_position()
    print("suite_context tests passed")


if __name__ == "__main__":
    main()
