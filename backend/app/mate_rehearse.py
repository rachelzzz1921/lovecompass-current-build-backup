"""MATE 恋爱预演 · 规则引擎 + 词库映射。

三层素材：
1. mate_rehearse_library_v1.json — 按定位/子类型/行为原子的阶段文案
2. loveTimeline — 数值层输出的 danger/advice/mood 注入
3. atom_dictionary — 可选短语点缀（RAG-lite）
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.dictionary_retrieval import retrieve_dictionary_snippets

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

FEMALE_RISK = "FS5"
MALE_RISK = "MS5"


@lru_cache(maxsize=1)
def load_rehearse_library() -> dict[str, Any]:
    path = DATA_DIR / "mate_rehearse_library_v1.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _stable_pick(options: list[str], key: str) -> str:
    if not options:
        return ""
    idx = sum(ord(c) for c in key) % len(options)
    return options[idx]


def _nearest_timeline_node(love_timeline: list[dict[str, Any]], target_day: int) -> dict[str, Any]:
    if not love_timeline:
        return {}
    return min(love_timeline, key=lambda n: abs(int(n.get("day", 0)) - target_day))


def _trait_display_key(trait_atoms: list[str]) -> str:
    if "低显示" in trait_atoms:
        return "低显示"
    if "高显示" in trait_atoms:
        return "高显示"
    return "default"


def _module_scores(profile_engine: dict[str, Any], module_scores: dict[str, float] | None) -> dict[str, float]:
    if module_scores:
        return module_scores
    embedded = profile_engine.get("module_scores")
    return embedded if isinstance(embedded, dict) else {}


def _comfort_index(
    *,
    day: int,
    fs2: float,
    fs4: float,
    fs5: float,
    axis_y: float,
    low_display: bool,
) -> str:
    stability = fs2 * 0.45 + fs4 * 0.35 + (100 - fs5) * 0.2
    hearts = round(stability / 22)
    if day == 1:
        hearts += 1 if fs2 >= 60 else 0
    elif day == 30:
        hearts -= 1 if low_display else 0
        hearts -= 1 if fs5 >= 60 else 0
    else:
        hearts += 1 if axis_y >= 65 else 0
        hearts += 1 if fs4 >= 65 else 0
    hearts = min(5, max(1, hearts))
    return "💙" * hearts + "○" * (5 - hearts)


def _resolve_plot(
    lib: dict[str, Any],
    *,
    position_name: str,
    sub_type: str,
    day: int,
    scene_atoms: list[str],
    timeline_node: dict[str, Any],
    pick_key: str,
) -> str:
    by_position = lib.get("plot_by_position") or {}
    pos_block = by_position.get(position_name) or {}
    day_key = str(day)
    candidates: list[str] = []
    if isinstance(pos_block.get(day_key), list):
        candidates.extend(str(x) for x in pos_block[day_key] if x)

    by_sub = lib.get("plot_by_sub_type") or {}
    sub_block = by_sub.get(sub_type) or {}
    if isinstance(sub_block.get(day_key), str) and sub_block[day_key]:
        candidates.append(str(sub_block[day_key]))

    mood = str(timeline_node.get("mood") or "").strip()
    if mood and 4 < len(mood) <= 96 and mood not in candidates:
        candidates.append(mood)

    scene_idx = {1: 0, 30: 1, 90: 2}.get(day, 0)
    if scene_atoms and len(scene_atoms) > scene_idx:
        scene = str(scene_atoms[scene_idx]).strip()
        if scene and len(scene) > 6:
            candidates.append(f"这个阶段，{scene}——关系往往在这里分出走向。")

    if not candidates:
        hooks = (lib.get("golden_lines") or {}).get("plot_hooks") or []
        if hooks:
            candidates.append(str(hooks[sum(ord(c) for c in pick_key) % len(hooks)]))

    if candidates:
        return _stable_pick(candidates, pick_key)

    desc = next(
        (ep.get("desc") for ep in (lib.get("episodes") or []) if int(ep.get("day", 0)) == day),
        "关系进入新阶段",
    )
    return str(desc)


def _resolve_partner_psychology(
    lib: dict[str, Any],
    *,
    trait_key: str,
    sub_type: str,
    day: int,
    gender: str,
    pick_key: str,
) -> str:
    by_trait = lib.get("partner_psychology_by_trait") or {}
    trait_block = by_trait.get(trait_key) or by_trait.get("default") or {}
    day_key = str(day)
    options: list[str] = []
    if isinstance(trait_block.get(day_key), list):
        options.extend(str(x) for x in trait_block[day_key] if x)

    by_sub = lib.get("partner_psychology_by_sub_type") or {}
    sub_line = (by_sub.get(sub_type) or {}).get(day_key)
    if sub_line:
        options.append(str(sub_line))

    partner = "她" if gender == "male" else "他"
    for i, text in enumerate(options):
        options[i] = text.replace("她很好", f"{partner}很好").replace("她到底有没有", f"{partner}到底有没有")

    if options:
        return _stable_pick(options, pick_key + trait_key)

    voices = (lib.get("golden_lines") or {}).get("partner_voice") or []
    return _stable_pick([str(v) for v in voices], pick_key) if voices else "开始认真评估长期可能性。"


def _resolve_warning(
    lib: dict[str, Any],
    *,
    day: int,
    low_display: bool,
    fs2: float,
    fs4: float,
    fs5: float,
    position_name: str,
    timeline_node: dict[str, Any],
) -> str:
    danger = str(timeline_node.get("danger") or "").strip()
    if danger:
        return danger

    warnings = lib.get("warnings") or {}
    parts: list[str] = []
    if day == 30 and low_display and warnings.get("low_display_day30"):
        parts.append(str(warnings["low_display_day30"]))
    if fs5 >= 60 and warnings.get("high_risk_fs5"):
        parts.append(str(warnings["high_risk_fs5"]))
    if day >= 30 and fs2 >= 70 and fs4 < 55 and warnings.get("emotion_demand_mismatch"):
        parts.append(str(warnings["emotion_demand_mismatch"]))
    if day == 30 and fs2 >= 65 and fs4 < 50 and warnings.get("pace_mismatch"):
        parts.append(str(warnings["pace_mismatch"]))
    if day == 90 and low_display is False and fs2 < 55 and warnings.get("over_display_under_depth"):
        parts.append(str(warnings["over_display_under_depth"]))
    if position_name == "还没到时候的人" and day == 30 and warnings.get("building_phase"):
        parts.append(str(warnings["building_phase"]))

    return " ".join(parts[:2]).strip()


def _looks_like_user_action(advice: str) -> bool:
    text = advice.strip()
    if not text or len(text) > 72:
        return False
    narrative_markers = ("的真实价值", "开始浮现", "往往", "容易被", "第一印象往往", "低估", "高估")
    if any(m in text for m in narrative_markers):
        return False
    action_markers = ("主动", "别", "不要", "用", "给", "约", "说", "分享", "表达", "保持", "把", "让", "先")
    return any(m in text for m in action_markers)


def _resolve_suggestion(
    lib: dict[str, Any],
    *,
    behavior_atoms: list[str],
    position_name: str,
    day: int,
    timeline_node: dict[str, Any],
    profile_engine: dict[str, Any],
    pick_key: str,
) -> str:
    advice = str(timeline_node.get("advice") or "").strip()
    if advice and _looks_like_user_action(advice):
        return advice

    by_behavior = lib.get("suggestions_by_behavior") or {}
    for atom in behavior_atoms:
        block = by_behavior.get(atom) or {}
        line = block.get(str(day))
        if line:
            return str(line)

    by_position = lib.get("suggestions_by_position") or {}
    pos_line = (by_position.get(position_name) or {}).get(str(day))
    if pos_line:
        return str(pos_line)

    default_block = by_behavior.get("default") or {}
    if default_block.get(str(day)):
        return str(default_block[str(day)])

    snippets = retrieve_dictionary_snippets(
        trait_atoms=profile_engine.get("trait_atoms") or [],
        behavior_atoms=behavior_atoms,
        relationship_atoms=profile_engine.get("relationship_atoms") or [],
        scene_atoms=profile_engine.get("scene_atoms") or [],
        max_total=3,
    )
    matchmaker = (lib.get("golden_lines") or {}).get("matchmaker_voice") or []
    pool = snippets + [str(x) for x in matchmaker if x]
    return _stable_pick(pool, pick_key + str(day)) if pool else "主动共享一个今天发生的小情绪。"


def build_rehearse_episodes(
    love_timeline: list[dict[str, Any]],
    profile_engine: dict[str, Any],
    *,
    module_scores: dict[str, float] | None = None,
    gender: str = "female",
    position_name: str = "",
    axis_y: float | None = None,
) -> list[dict[str, Any]]:
    """Build three Netflix-style rehearsal episodes from library + timeline + scores."""
    lib = load_rehearse_library()
    episodes_meta = lib.get("episodes") or [
        {"day": 1, "name": "EP1 初见阶段", "time": "Day 1 - 3", "desc": "心动发生的瞬间"},
        {"day": 30, "name": "EP2 试探阶段", "time": "Day 30", "desc": "情绪稳定性的博弈"},
        {"day": 90, "name": "EP3 真实阶段", "time": "Day 90+", "desc": "核心资产的沉淀"},
    ]

    scores = _module_scores(profile_engine, module_scores)
    fs2 = float(scores.get("FS2", scores.get("MS3", 55)))
    fs4 = float(scores.get("FS4", scores.get("MS2", 55)))
    fs5 = float(scores.get("FS5", scores.get("MS5", 50)))
    ay = float(axis_y if axis_y is not None else profile_engine.get("axis_y") or 55)

    traits = profile_engine.get("trait_atoms") or []
    behavior_atoms = profile_engine.get("behavior_atoms") or []
    scene_atoms = profile_engine.get("scene_atoms") or []
    sub_type = str(profile_engine.get("sub_type") or "稳定推进型")
    main_type = position_name or str(profile_engine.get("main_type") or "")
    trait_key = _trait_display_key(traits)
    low_display = trait_key == "低显示"

    out: list[dict[str, Any]] = []
    for meta in episodes_meta:
        day = int(meta.get("day", 1))
        node = _nearest_timeline_node(love_timeline, day)
        pick_key = f"{main_type}:{sub_type}:{gender}:{day}"

        plot = _resolve_plot(
            lib,
            position_name=main_type,
            sub_type=sub_type,
            day=day,
            scene_atoms=scene_atoms,
            timeline_node=node,
            pick_key=pick_key,
        )
        partner_psychology = _resolve_partner_psychology(
            lib,
            trait_key=trait_key,
            sub_type=sub_type,
            day=day,
            gender=gender,
            pick_key=pick_key,
        )
        warning = _resolve_warning(
            lib,
            day=day,
            low_display=low_display,
            fs2=fs2,
            fs4=fs4,
            fs5=fs5,
            position_name=main_type,
            timeline_node=node,
        )
        suggestion = _resolve_suggestion(
            lib,
            behavior_atoms=behavior_atoms,
            position_name=main_type,
            day=day,
            timeline_node=node,
            profile_engine=profile_engine,
            pick_key=pick_key,
        )
        comfort = _comfort_index(day=day, fs2=fs2, fs4=fs4, fs5=fs5, axis_y=ay, low_display=low_display)

        out.append({
            "name": str(meta.get("name") or f"EP · Day {day}"),
            "time": str(meta.get("time") or f"Day {day}"),
            "desc": str(meta.get("desc") or ""),
            "plot": plot,
            "partnerPsychology": partner_psychology,
            "warning": warning,
            "suggestion": suggestion,
            "comfortIndex": comfort,
        })
    return out
