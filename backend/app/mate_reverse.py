"""MATE 镜像反转 · 定位词库引擎。"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


@lru_cache(maxsize=1)
def load_reverse_library() -> dict[str, Any]:
    path = DATA_DIR / "mate_reverse_library_v1.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def build_reverse_card(profile_engine: dict[str, Any], position_name: str) -> dict[str, Any]:
    lib = load_reverse_library()
    by_position = lib.get("by_position") or {}
    block = dict(by_position.get(position_name) or by_position.get("被读懂之前的人") or {})

    traits = profile_engine.get("trait_atoms") or []
    overrides = lib.get("trait_overrides") or {}
    if "低显示" in traits and overrides.get("低显示", {}).get("misread"):
        block["misread"] = str(overrides["低显示"]["misread"])
    elif "高显示" in traits and overrides.get("高显示", {}).get("misread"):
        block["misread"] = str(overrides["高显示"]["misread"])

    misread = str(block.get("misread") or "外界对你的第一印象，往往和长期价值有落差。")
    mechanism = str(block.get("mechanism") or "你的真实机制，需要相处才能被验证。")
    cost = str(block.get("cost") or "误读会带来额外的沟通和时间成本。")
    truth = str(block.get("truth") or "深度阶段，你的底牌往往比第一眼更有说服力。")

    return {
        "front": {
            "title": "观察室 · 关于你最深的误解",
            "subtitle": "外 界 误 读",
            "content": misread,
            "tip": "点击卡片，翻看红娘剥离表象后的灵魂真相",
        },
        "back": {
            "title": "观察室 · 关于你最深的误解",
            "subtitle": "底 牌 真 相",
            "content": truth,
            "mechanism": mechanism,
            "cost": cost,
            "shareTip": "长按可保存卡片分享",
        },
    }
