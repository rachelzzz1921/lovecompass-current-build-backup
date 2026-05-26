"""Layer A 静态词库加载 —— self_static_copy_v1.json"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

STATIC_COPY_PATH = Path(__file__).resolve().parents[1] / "data" / "self_static_copy_v1.json"

ATTACHMENT_BY_CHARACTER: dict[str, str] = {
    "薛宝钗": "安全型",
    "林黛玉": "焦虑型",
    "妙玉": "回避型",
    "史湘云": "混合型",
    "王熙凤": "高边界安全型",
    "袭人": "低自我高投入型",
    "贾探春": "安全型",
    "贾宝玉": "焦虑型",
    "柳湘莲": "回避型",
    "贾雨村": "混合型",
    "北静王": "高边界安全型",
    "蒋玉菡": "低自我高投入型",
}


@lru_cache(maxsize=1)
def load_static_copy() -> dict[str, Any]:
    try:
        return json.loads(STATIC_COPY_PATH.read_text(encoding="utf-8"))
    except OSError:
        return {"version": "0", "types": {}, "scenes_by_attachment": {}, "character_reasons": {}, "match_combos": {}}


def get_type_copy(character: str) -> dict[str, Any]:
    lib = load_static_copy()
    types = lib.get("types") or {}
    return dict(types.get(character) or {})


def scenes_for_attachment(attachment: str) -> list[dict[str, str]]:
    lib = load_static_copy()
    bucket = (lib.get("scenes_by_attachment") or {}).get(attachment) or {}
    order = ["第一次见面", "发生冲突时", "喜欢一个人时"]
    out: list[dict[str, str]] = []
    for scene in order:
        item = bucket.get(scene)
        if not isinstance(item, dict):
            continue
        out.append(
            {
                "scene": scene,
                "title": str(item.get("title") or ""),
                "body": str(item.get("body") or ""),
                "resonance": str(item.get("resonance") or ""),
            }
        )
    return out


def character_reasons_copy(character: str) -> list[dict[str, Any]]:
    lib = load_static_copy()
    reasons = (lib.get("character_reasons") or {}).get(character) or []
    return [dict(r) for r in reasons if isinstance(r, dict)]


def match_combo_copy(character: str, partner: str) -> dict[str, Any] | None:
    lib = load_static_copy()
    combos = lib.get("match_combos") or {}
    key = f"{character}×{partner}"
    item = combos.get(key)
    return dict(item) if isinstance(item, dict) else None


def build_match_suggestions(character: str, attachment: str) -> list[dict[str, Any]]:
    from app.self_ai_content import MATCH_BY_ATTACHMENT

    presets = MATCH_BY_ATTACHMENT.get(attachment) or MATCH_BY_ATTACHMENT["安全型"]
    out: list[dict[str, Any]] = []
    for index, item in enumerate(presets):
        partner = str(item.get("name") or "").split("（")[0].strip()
        combo = match_combo_copy(character, partner) if partner else None
        out.append(
            {
                "code": f"M-{index + 1}",
                "name": str(item.get("name") or partner),
                "pct": int(item.get("pct") or 0),
                "tagline": str(item.get("tagline") or ""),
                "top": index == 0,
                "deepExplore": {
                    "title": str((combo or {}).get("title") or "相处深探"),
                    "body": str(
                        (combo or {}).get("body")
                        or f"如果你遇见{partner}，{item.get('tagline', '')}。这不是标准答案，而是同体系里与你节奏较同频的方向。"
                    ),
                },
            }
        )
    return out


def attach_static_copy_to_payload(result_payload: dict[str, Any]) -> dict[str, Any]:
    payload = dict(result_payload)
    character = str(payload.get("archetype_code") or "")
    profile = payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}
    attachment = str(payload.get("attachment_type") or profile.get("attachment_type") or ATTACHMENT_BY_CHARACTER.get(character, ""))

    type_copy = get_type_copy(character)
    scenes = scenes_for_attachment(attachment)
    reasons = character_reasons_copy(character)

    static_copy: dict[str, Any] = {
        "type": type_copy,
        "scenes": scenes,
        "character_reasons": reasons,
        "match_suggestions": build_match_suggestions(character, attachment) if character else [],
    }
    if type_copy.get("tagline") and not profile.get("tagline"):
        profile = {**profile, "tagline": type_copy["tagline"]}
    if type_copy.get("archetype_line"):
        static_copy["archetype_line"] = type_copy["archetype_line"]
    payload["static_copy"] = static_copy
    payload["archetype_profile"] = profile
    return payload
