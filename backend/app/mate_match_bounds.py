"""MATE 匹配上下限 · P1-P6 分数 + 现实人物画像映射。

参考：套三双人模型（现实适配 / 情感需求 / 相处节奏 / 长期规划 / 风险碰撞 / 火花增益）
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


@lru_cache(maxsize=1)
def load_match_bounds_library() -> dict[str, Any]:
    path = DATA_DIR / "mate_match_bounds_v1.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


@lru_cache(maxsize=1)
def load_pair_model_weights() -> dict[str, float]:
    path = DATA_DIR / "mate_pair_model_v1.json"
    if not path.exists():
        return {"P1": 0.30, "P2": 0.25, "P3": 0.15, "P4": 0.15, "P5": 0.10, "P6": 0.05}
    raw = json.loads(path.read_text(encoding="utf-8"))
    weights = raw.get("module_weights") or {}
    return {str(k): float(v) for k, v in weights.items()}


def compute_pair_compatibility_base(
    *,
    module_scores: dict[str, float],
    axis_x: float,
    axis_y: float,
    gender: str,
) -> dict[str, float]:
    """P1-P6 加权，得到用户当前「婚恋区间」基准分。"""
    if gender == "female":
        p1 = axis_y * 0.55 + module_scores.get("FS3", 50) * 0.45
        p2 = module_scores.get("FS2", 50)
        p3 = module_scores.get("FS4", 50)
        p4 = axis_y * 0.45 + module_scores.get("FS4", 50) * 0.55
        risk = module_scores.get("FS5", 50)
        p6 = module_scores.get("FS1", 50)
    else:
        p1 = axis_y * 0.55 + module_scores.get("MS1", 50) * 0.45
        p2 = module_scores.get("MS3", 50)
        p3 = module_scores.get("MS2", 50)
        p4 = axis_y * 0.45 + module_scores.get("MS2", 50) * 0.55
        risk = module_scores.get("MS5", 50)
        p6 = module_scores.get("MS4", 50)

    p5 = 100 - risk
    weights = load_pair_model_weights()
    base = (
        p1 * weights.get("P1", 0.30)
        + p2 * weights.get("P2", 0.25)
        + p3 * weights.get("P3", 0.15)
        + p4 * weights.get("P4", 0.15)
        + p5 * weights.get("P5", 0.10)
        + p6 * weights.get("P6", 0.05)
    )
    return {
        "P1": round(p1, 1),
        "P2": round(p2, 1),
        "P3": round(p3, 1),
        "P4": round(p4, 1),
        "P5": round(p5, 1),
        "P6": round(p6, 1),
        "base": round(base, 1),
        "risk_raw": risk,
    }


def _resolve_portraits(
    lib: dict[str, Any],
    portrait_ids: list[str],
    *,
    band: str,
    match_score: int,
    stable_probability: int | None = None,
) -> list[dict[str, Any]]:
    pool = lib.get("portraits") or {}
    out: list[dict[str, Any]] = []
    for pid in portrait_ids[:2]:
        raw = pool.get(pid)
        if not isinstance(raw, dict):
            continue
        snapshot = str(raw.get("snapshot") or "")
        user_snap = raw.get("userSnapshot")
        if isinstance(user_snap, dict) and user_snap.get(band):
            snapshot = str(user_snap[band])
        elif isinstance(user_snap, str) and user_snap:
            snapshot = user_snap
        item = {
            "id": pid,
            "name": str(raw.get("name") or ""),
            "tags": list(raw.get("tags") or [])[:4],
            "snapshot": snapshot,
            "matchScore": match_score,
        }
        if stable_probability is not None:
            item["stableProbability"] = stable_probability
        out.append(item)
    return out


def _user_summary(
    lib: dict[str, Any],
    *,
    band: str,
    position_name: str,
    gender: str,
    profile: dict[str, Any],
    partner: str,
) -> str:
    by_pos = lib.get("user_summaries") or {}
    pos_block = by_pos.get(position_name) or {}
    gender_block = pos_block.get(gender) or {}
    lead = str(gender_block.get(band) or "").strip()
    profile_key = {"upper": "upper_match", "sweet": "sweet_spot", "lower": "lower_match"}[band]
    detail = str(profile.get(profile_key) or "").strip()
    if lead and detail:
        return f"{lead}{detail}"
    if lead:
        return lead
    if detail:
        return f"对你来说，这类{partner}——{detail}"
    defaults = {
        "upper": f"对你来说，值得争取的是能读懂你节奏、现实差距可控的{partner}。",
        "sweet": f"对你来说，最合拍的是生活预期接近、相处不必硬拧的{partner}。",
        "lower": f"对你来说，要尽量避开初期上头快、后期消耗大的{partner}类型。",
    }
    return defaults[band]


def _band_config(
    lib: dict[str, Any],
    position_name: str,
    gender: str,
    band: str,
) -> dict[str, Any]:
    by_pos = lib.get("bounds_by_position") or {}
    pos_block = by_pos.get(position_name) or by_pos.get("稳定推进型") or {}
    gender_block = pos_block.get(gender) or pos_block.get("female") or {}
    cfg = gender_block.get(band) or {}
    if not cfg:
        defaults = {
            "upper": {"portraitIds": ["male:steady_midcareer"] if gender == "female" else ["female:practical_stable"], "scoreAdjust": 5},
            "sweet": {"portraitIds": ["male:practical_peer"] if gender == "female" else ["female:warm_steady"], "scoreAdjust": 0},
            "lower": {"portraitIds": ["male:fast_dating"] if gender == "female" else ["female:fast_stimulus_f"], "scoreAdjust": -5},
        }
        cfg = defaults.get(band, {})
    return cfg


def build_match_bounds(
    *,
    profile: dict[str, Any],
    module_scores: dict[str, float],
    axis_x: float,
    axis_y: float,
    gender: str,
    position_name: str,
) -> dict[str, Any]:
    """生成 upperMatch / sweetSpot / lowerMatch 三分区（含分数 + 画像）。"""
    lib = load_match_bounds_library()
    partner = (lib.get("partner_noun") or {}).get(gender, "对象")
    titles = lib.get("band_titles") or {}
    metrics = compute_pair_compatibility_base(
        module_scores=module_scores,
        axis_x=axis_x,
        axis_y=axis_y,
        gender=gender,
    )
    base = float(metrics["base"])
    risk = float(metrics["risk_raw"])

    upper_cfg = _band_config(lib, position_name, gender, "upper")
    sweet_cfg = _band_config(lib, position_name, gender, "sweet")
    lower_cfg = _band_config(lib, position_name, gender, "lower")

    upper_score = int(_clamp(round(base + float(upper_cfg.get("scoreAdjust", 5))), 78, 93))
    sweet_score = int(_clamp(round(base + float(sweet_cfg.get("scoreAdjust", 0))), 68, 88))
    lower_score = int(_clamp(round(base + float(lower_cfg.get("scoreAdjust", -5)) - risk * 0.08), 32, 58))
    stable_prob = int(_clamp(round(sweet_score * 0.92 + metrics["P1"] * 0.08), 62, 90))
    marriage_score = int(_clamp(round(stable_prob * 0.96 + metrics["P4"] * 0.04), 60, 92))

    upper_summary = _user_summary(
        lib, band="upper", position_name=position_name, gender=gender, profile=profile, partner=partner,
    )
    sweet_summary = _user_summary(
        lib, band="sweet", position_name=position_name, gender=gender, profile=profile, partner=partner,
    )
    lower_summary = _user_summary(
        lib, band="lower", position_name=position_name, gender=gender, profile=profile, partner=partner,
    )

    upper_portraits = _resolve_portraits(
        lib,
        list(upper_cfg.get("portraitIds") or []),
        band="upper",
        match_score=upper_score,
        stable_probability=int(_clamp(stable_prob + 4, 70, 94)),
    )
    sweet_portraits = _resolve_portraits(
        lib,
        list(sweet_cfg.get("portraitIds") or []),
        band="sweet",
        match_score=sweet_score,
        stable_probability=stable_prob,
    )
    lower_portraits = _resolve_portraits(
        lib,
        list(lower_cfg.get("portraitIds") or []),
        band="lower",
        match_score=lower_score,
    )

    fs2 = module_scores.get("FS2", module_scores.get("MS3", 55))
    fs4 = module_scores.get("FS4", module_scores.get("MS2", 55))

    return {
        "upperMatch": {
            "title": str(titles.get("upper") or "对你来说 · 值得争取"),
            "bandLabel": f"对你上限 · 适配 {upper_score}",
            "matchScore": upper_score,
            "stableProbability": int(_clamp(stable_prob + 4, 70, 94)),
            "marriageAdaptScore": marriage_score,
            "summary": upper_summary,
            "portraits": upper_portraits,
            "traits": {
                "现实差距可控": metrics["P1"],
                "情感需求同频": metrics["P2"],
                "长期可谈": metrics["P4"],
                "火花潜力": metrics["P6"],
            },
            "venues": list((lib.get("meet_scenes") or {}).get(gender) or ["熟人局", "行业小圈", "兴趣固定局"]),
            "pairMetrics": metrics,
        },
        "sweetSpot": {
            "title": str(titles.get("sweet") or "对你来说 · 最合拍"),
            "bandLabel": f"对你甜区 · 适配 {sweet_score}",
            "matchScore": sweet_score,
            "successRate": sweet_score,
            "stableProbability": stable_prob,
            "marriageAdaptScore": marriage_score,
            "reason": sweet_summary,
            "summary": sweet_summary,
            "portraits": sweet_portraits,
            "profile": {
                "现实差距": "≤15 分" if metrics["P1"] >= 60 else "需重点对齐",
                "情感同步": "高" if fs2 >= 65 else "可磨合",
                "相处节奏": "稳定推进" if fs4 >= 60 else "需主动沟通",
                "婚恋观": "长期主义",
            },
        },
        "lowerMatch": {
            "title": str(titles.get("lower") or "对你来说 · 尽量避开"),
            "bandLabel": f"对你风险偏高 · {lower_score}",
            "matchScore": lower_score,
            "summary": lower_summary,
            "portraits": lower_portraits,
            "traits": {
                "与你节奏错配": int(_clamp(50 + max(0, fs2 - fs4) * 0.3, 35, 85)),
                "消耗风险": int(_clamp(45 + risk * 0.35, 40, 90)),
            },
            "warning": "对你来说，问题通常不是「有没有感觉」，而是相处三个月后会不会明显变累。",
        },
        "matchZoneExtras": {
            "partnerNoun": partner,
            "stableProbability": stable_prob,
            "marriageAdaptScore": marriage_score,
            "pairMetrics": metrics,
            "scoreScope": lib.get("score_scope") or {},
        },
    }
