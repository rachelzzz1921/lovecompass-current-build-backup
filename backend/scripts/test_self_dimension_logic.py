#!/usr/bin/env python3
"""Unit tests for SELF dimension underlying-logic Layer B."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.self_dimension_logic import (  # noqa: E402
    build_underlying_logic,
    enrich_dimension_summary,
    score_band_key,
)


def main() -> None:
    assert score_band_key(38) == "developing"
    assert score_band_key(82) == "strength"

    logic = build_underlying_logic("SA2", 38)
    assert logic is not None
    assert logic["bandKey"] == "developing"
    assert "不确定" in logic["measure"]
    assert logic["growthHint"]

    summary = enrich_dimension_summary(
        "SA3",
        72,
        {"name": "依恋回避", "core": "我在关系里容易逃避亲密吗？"},
        label="这个维度表现稳定",
    )
    assert summary["underlying_logic"]["bandKey"] == "asset"
    assert summary["position_label_low"] == "高回避"
    assert summary["position_label_high"] == "低回避"

    print("self_dimension_logic tests passed")


if __name__ == "__main__":
    main()
