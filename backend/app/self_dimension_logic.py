"""套一六维「底层逻辑」Layer B：分数带 × 维度词库 → 结构化解读。"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

LOGIC_LIBRARY_PATH = Path(__file__).resolve().parents[1] / "data" / "self_dimension_logic_v1.json"

POSITION_LABELS: dict[str, tuple[str, str]] = {
    "SA2": ("高焦虑", "低焦虑"),
    "SA3": ("高回避", "低回避"),
}


@lru_cache(maxsize=1)
def load_dimension_logic_library() -> dict[str, Any]:
    try:
        return json.loads(LOGIC_LIBRARY_PATH.read_text(encoding="utf-8"))
    except OSError:
        return {"dimensions": {}}


def score_band_key(score: float) -> str:
    s = max(0, min(100, round(float(score))))
    if s <= 30:
        return "emerging"
    if s <= 50:
        return "developing"
    if s <= 65:
        return "steady"
    if s <= 80:
        return "asset"
    return "strength"


def position_labels(code: str) -> tuple[str, str]:
    return POSITION_LABELS.get(code, ("还在展开", "更成熟"))


def build_underlying_logic(code: str, score: float) -> dict[str, Any] | None:
    lib = load_dimension_logic_library()
    dim = (lib.get("dimensions") or {}).get(code)
    if not dim:
        return None
    band_key = score_band_key(score)
    band = (dim.get("bands") or {}).get(band_key)
    if not band:
        return None
    return {
        "measure": str(dim.get("measure") or ""),
        "headline": str(band.get("headline") or ""),
        "interpretation": str(band.get("interpretation") or ""),
        "inRelationship": str(band.get("inRelationship") or ""),
        "growthHint": band.get("growthHint"),
        "bandKey": band_key,
    }


def enrich_dimension_summary(
    code: str,
    score: float,
    meta: dict[str, str],
    *,
    label: str,
) -> dict[str, Any]:
    """Merge scoring metadata with Layer B underlying-logic copy."""
    raw = max(0, min(100, round(float(score))))
    low, high = position_labels(code)
    logic = build_underlying_logic(code, raw)
    headline = (logic or {}).get("headline") or ""
    return {
        "label": label,
        "detail": headline,
        "position": raw,
        "position_label_low": low,
        "position_label_high": high,
        "name": meta.get("name") or code,
        "coreQuestion": meta.get("core") or "",
        "underlying_logic": logic,
    }
