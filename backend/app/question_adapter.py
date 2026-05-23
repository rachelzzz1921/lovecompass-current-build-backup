from __future__ import annotations
from typing import Any


def _option_key(option: dict[str, Any], index: int) -> str:
    return str(option.get("key") or chr(65 + index))


def _public_options(options: list[dict[str, Any]]) -> list[dict[str, Any]]:
    public: list[dict[str, Any]] = []
    for i, option in enumerate(options or []):
        public.append({
            "key": _option_key(option, i),
            "text": option.get("text") or option.get("label") or "",
            "sub": option.get("sub") or option.get("description"),
            "icon": option.get("icon"),
        })
    return public


def adapt_question(row: dict[str, Any]) -> dict[str, Any]:
    qtype = row["question_type"]
    payload = row.get("question_payload") or {}
    options = payload.get("options") or []
    ui: dict[str, Any] = {}

    if qtype in {"choice", "scenario"}:
        kind = "choice"
        ui = {
            "component": "choice",
            "layout": "list",
            "scene": payload.get("scene"),
            "showOptionKey": True,
        }
    elif qtype in {"likert", "scale"}:
        kind = "scale"
        scale = payload.get("scale") or {}
        ui = {
            "component": "scale",
            "min": scale.get("min", 1),
            "max": scale.get("max", 5),
            "step": scale.get("step", 1),
            "minLabel": scale.get("min_label") or scale.get("minLabel"),
            "maxLabel": scale.get("max_label") or scale.get("maxLabel"),
        }
    elif qtype == "slider":
        kind = "slider"
        slider = payload.get("slider") or {}
        ui = {
            "component": "slider",
            "min": slider.get("min", 0),
            "max": slider.get("max", 100),
            "step": slider.get("step", 1),
            "minLabel": slider.get("min_label") or slider.get("minLabel"),
            "maxLabel": slider.get("max_label") or slider.get("maxLabel"),
            "feedback": slider.get("feedback") or [],
        }
    elif qtype == "binary":
        kind = "binary"
        ui = {"component": "binary", "layout": "binary", "showOptionKey": False}
    elif qtype == "card":
        kind = "card"
        ui = {"component": "card", "layout": "cards", "showOptionKey": True}
    elif qtype == "mood":
        kind = "mood"
        ui = {"component": "mood", "layout": "grid", "showOptionKey": False}
    elif qtype == "rank":
        kind = "rank"
        items = payload.get("items") or []
        ui = {
            "component": "rank",
            "layout": "list",
            "items": [{"id": str(item.get("id") or item.get("key") or i), "text": item.get("text") or item.get("label") or ""} for i, item in enumerate(items)],
        }
    else:
        kind = "choice"
        ui = {"component": "choice", "layout": "list", "showOptionKey": True}

    return {
        "id": str(row["id"]),
        "externalId": row["external_question_id"],
        "order": row["display_order"],
        "type": qtype,
        "kind": kind,
        "text": row["question_text"],
        "required": True,
        "ui": {k: v for k, v in ui.items() if v is not None},
        "options": _public_options(options),
    }
