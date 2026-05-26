from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_express import (
    asset_module_label,
    build_module_market_mapping,
    footer_quotes_for_position,
    match_evidence_triggers,
    module_display_label,
    risk_melt_down,
    risk_module_label,
)


def test_asset_mapping() -> None:
    assert asset_module_label(25) == "有较大的成长空间"
    assert asset_module_label(45) == "正处于发展阶段"
    assert asset_module_label(60) == "表现稳定"
    assert asset_module_label(75) == "是重要资产"
    assert asset_module_label(90) == "是核心竞争力"


def test_risk_mapping() -> None:
    low = risk_module_label(20)
    assert low["action"] == "normal"
    assert "长期稳健" in low["systemNote"]
    high = risk_module_label(70)
    assert high["action"] == "melt_down"
    assert risk_melt_down(70)


def test_module_display_risk() -> None:
    text = module_display_label("FS5", 68)
    assert "高风险" in text


def test_evidence_trigger_female() -> None:
    questions = [{"external_question_id": "FS1-B-F-07", "dimension_code": "FS1"}]
    answers = {"FS1-B-F-07": {"optionKey": "D"}}
    out = match_evidence_triggers(gender="female", questions=questions, answers=answers, module_code="FS1")
    assert out and "场域感" in out


def test_module_market_mapping_unique() -> None:
    fs1 = build_module_market_mapping(code="FS1", label="吸引力资产", display="是核心竞争力", score=82.0)
    fs2 = build_module_market_mapping(code="FS2", label="情感价值输出", display="是重要资产", score=72.0)
    fs3 = build_module_market_mapping(code="FS3", label="现实自主性", display="表现稳定", score=58.0)
    assert fs1 != fs2 != fs3
    assert "档案呈现" not in fs1
    assert "在「" not in fs3
    assert "婚恋市场" in fs3 or "独立" in fs3


def test_footer_quotes() -> None:
    quotes = footer_quotes_for_position("让人想留下来的人", count=3)
    assert len(quotes) == 3


if __name__ == "__main__":
    test_asset_mapping()
    test_risk_mapping()
    test_module_display_risk()
    test_evidence_trigger_female()
    test_module_market_mapping_unique()
    test_footer_quotes()
    print("mate express tests passed")
