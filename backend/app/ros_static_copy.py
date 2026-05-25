"""ROS 结果页 Layer A 静态词库 —— ros_static_copy_v1.json"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

STATIC_COPY_PATH = Path(__file__).resolve().parents[1] / "data" / "ros_static_copy_v1.json"


@lru_cache(maxsize=1)
def load_static_copy() -> dict[str, Any]:
    try:
        return json.loads(STATIC_COPY_PATH.read_text(encoding="utf-8"))
    except OSError:
        return {"version": "0"}


def tier_label(layer: str, score: float) -> str:
    lib = load_static_copy()
    tiers = (lib.get("dimension_tiers") or {}).get(layer.upper()) or []
    s = max(0, min(100, round(float(score))))
    if layer.upper() == "RK":
        for tier in tiers:
            low = int(tier.get("min", 0))
            high = int(tier.get("max", 100))
            if low <= s <= high:
                return str(tier.get("label") or tier.get("summary") or "")
        return "留意"
    for tier in tiers:
        if s >= int(tier.get("min", 0)):
            return str(tier.get("label") or "")
    return "表现稳定"


def subdim_summary(score: float) -> str:
    lib = load_static_copy()
    s = max(0, min(100, round(float(score))))
    for item in lib.get("subdim_summaries") or []:
        if s >= int(item.get("min", 0)):
            return str(item.get("text") or "")
    return "还有可以一起打磨的空间"


def type_copy(type_name: str) -> dict[str, Any]:
    lib = load_static_copy()
    return dict((lib.get("relationship_types") or {}).get(type_name) or {})


def stage_copy(stage_name: str) -> dict[str, Any]:
    lib = load_static_copy()
    return dict((lib.get("stages") or {}).get(stage_name) or {})


def weather_sub(label: str) -> str:
    lib = load_static_copy()
    return str((lib.get("weather") or {}).get(label) or "")


def layer_probe(layer: str) -> str:
    lib = load_static_copy()
    return str((lib.get("layer_probe") or {}).get(layer.upper()) or "")


def layer_subdim_defs(layer: str) -> list[dict[str, Any]]:
    lib = load_static_copy()
    return list((lib.get("layer_subdims") or {}).get(layer.upper()) or [])


def attach_static_copy_to_payload(result_payload: dict[str, Any]) -> dict[str, Any]:
    payload = dict(result_payload)
    rel = payload.get("relationshipType") or {}
    if not isinstance(rel, dict):
        rel = {}
    type_name = str(rel.get("name") or "温水同行")
    stage = payload.get("relationshipStage") or {}
    if not isinstance(stage, dict):
        stage = {}
    stage_name = str(stage.get("name") or "")

    tc = type_copy(type_name)
    sc = stage_copy(stage_name)
    if tc.get("tagline") and not rel.get("one_liner"):
        rel = {**rel, "one_liner": tc["tagline"]}
    if tc.get("desc") and not rel.get("description"):
        rel = {**rel, "description": tc["desc"]}

    static: dict[str, Any] = {
        "type": tc,
        "stage": sc,
        "prescription_warmup": load_static_copy().get("prescription_warmup") or {},
        "weather": load_static_copy().get("weather") or {},
        "layer_probe": load_static_copy().get("layer_probe") or {},
        "layer_subdims": load_static_copy().get("layer_subdims") or {},
    }
    if tc.get("hero_quote"):
        static["hero_quote"] = tc["hero_quote"]
    payload["relationshipType"] = rel
    payload["static_copy"] = static
    return payload
