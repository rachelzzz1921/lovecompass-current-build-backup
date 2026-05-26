"""MATE V4.1 page engine — rules define skeleton, narrative from dictionaries."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.mate_express import (
    asset_module_label,
    build_lens_cross_text,
    build_module_market_mapping,
    footer_quotes_for_position,
    match_evidence_triggers,
    module_display_label,
    resolve_sub_badges,
    risk_melt_down,
    risk_module_label,
)
from app.mate_rehearse import build_rehearse_episodes
from app.mate_reverse import build_reverse_card
from app.mate_simulator import build_simulator
from app.scoring import answer_to_numeric
from app.semantic_translation import user_label

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

QUADRANT_LABELS = {
    "Q1": "亮眼 × 能托底",
    "Q2": "低调 × 能托底",
    "Q3": "低调 × 待建设",
    "Q4": "亮眼 × 中等托底",
    "Q0": "临界区 · 需要对频道",
}

SUB_TYPE_RULES: list[tuple[str, callable]] = []  # populated below


def _load_json(name: str) -> dict[str, Any]:
    path = DATA_DIR / name
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def load_mate_model() -> dict[str, Any]:
    return _load_json("mate_model_v4.json")


@lru_cache(maxsize=1)
def load_mate_engine_spec() -> dict[str, Any]:
    return _load_json("mate_engine_v4.json")


@lru_cache(maxsize=1)
def load_mate_ui_spec() -> dict[str, Any]:
    return _load_json("mate_ui_spec_v4.json")


def human_score_label(score: float, *, reverse: bool = False) -> str:
    if reverse:
        return risk_module_label(score)["display"]
    return asset_module_label(score)


def risk_human_label(risk_score: float) -> str:
    return risk_module_label(risk_score)["label"]


def apply_v4_position_overrides(
    position_name: str,
    axis_x: float,
    axis_y: float,
    module_scores: dict[str, float],
    gender: str,
) -> str:
    risk = module_scores.get("FS5", module_scores.get("MS5", 50))
    if risk_melt_down(risk):
        return "还没到时候的人"

    low_display = axis_x < 50
    high_support = axis_y >= 60
    if low_display and high_support and axis_y >= 80:
        return "越了解越值钱的人"

    return position_name


def resolve_sub_type(
    position_name: str,
    axis_x: float,
    axis_y: float,
    module_scores: dict[str, float],
    gender: str,
) -> str:
    fs2 = module_scores.get("FS2", module_scores.get("MS3", 55))
    fs1 = module_scores.get("FS1", module_scores.get("MS4", 55))
    fs3 = module_scores.get("FS3", module_scores.get("MS1", 55))

    if axis_x < 50 and axis_y >= 60 and fs2 >= 65:
        return "慢热筛选者"
    if axis_x >= 60 and axis_y >= 60 and fs2 >= 65:
        return "关系经营者"
    if axis_x >= 60 and axis_y < 50 and fs1 >= 65:
        return "瞬时点火型"
    if axis_x < 50 and axis_y >= 60:
        return "长期托底者"
    if position_name == "需要被正确打开的人":
        return "非标准频道型"
    return "稳定推进型"


def extract_profile_engine(
    *,
    position_name: str,
    sub_type: str,
    axis_x: float,
    axis_y: float,
    module_scores: dict[str, float],
    gender: str,
) -> dict[str, Any]:
    fs5 = module_scores.get("FS5", module_scores.get("MS5", 50))
    fs2 = module_scores.get("FS2", module_scores.get("MS3", 55))
    fs3 = module_scores.get("FS3", module_scores.get("MS1", 55))

    trait_atoms: list[str] = []
    if axis_x < 50:
        trait_atoms.append("低显示")
    else:
        trait_atoms.append("高显示")
    if axis_y >= 60:
        trait_atoms.append("高支撑")
    else:
        trait_atoms.append("支撑在建")
    if fs2 >= 65:
        trait_atoms.append("高情绪价值")
    if fs5 <= 40:
        trait_atoms.append("低风险")
    elif fs5 >= 60:
        trait_atoms.append("风险需留意")

    behavior_atoms: list[str] = []
    if axis_x < 55:
        behavior_atoms.extend(["观察型", "筛选型"])
    else:
        behavior_atoms.append("表达型")
    if axis_y >= 60:
        behavior_atoms.append("托底型")

    relationship_atoms: list[str] = []
    if position_name in {"被读懂之前的人", "越了解越值钱的人"}:
        relationship_atoms.extend(["价值释放后置", "需要时间证明"])
    if position_name == "让人想留下来的人":
        relationship_atoms.append("长期留存型")

    scene_atoms = _scene_atoms_for_position(position_name, gender)

    return {
        "main_type": position_name,
        "sub_type": sub_type,
        "trait_atoms": trait_atoms,
        "behavior_atoms": behavior_atoms,
        "relationship_atoms": relationship_atoms,
        "scene_atoms": scene_atoms,
    }


def _scene_atoms_for_position(position_name: str, gender: str) -> list[str]:
    common: dict[str, list[str]] = {
        "被读懂之前的人": ["熟了以后突然变得话多", "会记住别人说过的小事", "不主动但一直在"],
        "让人想留下来的人": ["相处越久越觉得稳", "冲突后能快速修复", "让人愿意规划未来"],
        "越了解越值钱的人": ["第三个月开始上头", "细节里藏着高价值", "慢热但复利高"],
        "一眼就懂的人": ["第一眼就有判断", "筛选效率高", "所见即所得"],
        "还没到时候的人": ["还在建设自己", "牌面尚未完全释放", "时间站在你这边"],
        "需要被正确打开的人": ["频道对了是惊喜", "频道错了是误解", "市场窄但深"],
    }
    return common.get(position_name, ["真实相处比标签更重要"])


def _option_text(question: dict[str, Any], answer: dict[str, Any]) -> str | None:
    payload = question.get("question_payload") or {}
    source = payload.get("source_question") or payload
    options = source.get("options") or payload.get("options") or []
    key = answer.get("optionKey")
    idx = answer.get("optionIndex")
    if key:
        for opt in options:
            if str(opt.get("key")) == str(key):
                return str(opt.get("text") or "")
    if idx is not None and 0 <= int(idx) < len(options):
        return str(options[int(idx)].get("text") or "")
    return None


def _build_answer_evidence(
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    module_code: str,
) -> str | None:
    best: tuple[float, str] | None = None
    for q in questions:
        if q.get("dimension_code") != module_code:
            continue
        ext = q["external_question_id"]
        ans = answers.get(ext)
        if not ans:
            continue
        numeric = answer_to_numeric(q, ans)
        if numeric is None:
            continue
        weight = float(q.get("weight") or 1)
        stem = (q.get("question_text") or "")[:40]
        opt = _option_text(q, ans)
        if "value" in ans:
            snippet = f"在「{stem}…」的自评倾向偏高"
        elif opt:
            snippet = f"在「{stem}…」中，你选择了「{opt[:36]}」"
        else:
            snippet = f"「{stem}…」这道题给出了清晰信号"
        score = float(numeric) * weight
        if best is None or score > best[0]:
            best = (score, snippet)
    if not best:
        return None
    return f"{best[1]}。这在模型里不是偶然，而是该模块的重要证据。"


def build_module_accordions(
    *,
    questions: list[dict[str, Any]] | None = None,
    answers: dict[str, dict[str, Any]] | None = None,
    module_scores: dict[str, float],
    sub_scores: dict[str, float],
    scoring_formula: dict[str, Any],
    gender: str,
    precomputed: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    modules_cfg = scoring_formula.get("modules") or {}
    items: list[dict[str, Any]] = []

    for code, cfg in modules_cfg.items():
        if not isinstance(cfg, dict):
            continue
        score = module_scores.get(code)
        if score is None:
            continue
        reverse = cfg.get("direction") == "reverse"
        label = str(cfg.get("label") or code)
        display = module_display_label(code, score)

        bar_len = 16
        filled = round((score / 100) * bar_len) if not reverse else round(((100 - score) / 100) * bar_len)
        visual = "█" * filled + "░" * (bar_len - filled)
        if reverse:
            visual = "●" * max(1, min(5, round(score / 20))) + "○" * max(0, 5 - round(score / 20))

        if precomputed:
            sub_badges = (precomputed.get("sub_badges_by_module") or {}).get(code, [])
            evidence = (precomputed.get("module_evidence") or {}).get(code)
        elif questions and answers:
            sub_badges = resolve_sub_badges(
                gender=gender,
                questions=questions,
                answers=answers,
                module_scores=module_scores,
                sub_scores=sub_scores,
                scoring_formula=scoring_formula,
            ).get(code, [])
            evidence = match_evidence_triggers(
                gender=gender,
                questions=questions,
                answers=answers,
                module_code=code,
            ) or _build_answer_evidence(questions, answers, code)
        else:
            sub_badges = []
            evidence = None
        market_mapping = build_module_market_mapping(
            code=str(code),
            label=label,
            display=display,
            score=float(score),
        )

        items.append({
            "code": code,
            "dimension": label,
            "display": display,
            "visual": visual,
            "tag": "核心竞争力" if score >= 66 else "重要资产" if score >= 51 else "发展阶段",
            "subBadges": sub_badges,
            "answerEvidence": evidence or f"{label}综合表现为「{display}」。",
            "marketMapping": market_mapping,
        })
    return items


def build_observe_slices(
    profile_engine: dict[str, Any],
    matchmaker_records: list[dict[str, Any]],
    *,
    module_scores: dict[str, float] | None = None,
    gender: str = "female",
) -> list[dict[str, Any]]:
    scenes = profile_engine.get("scene_atoms") or []
    first = matchmaker_records[0] if matchmaker_records else {}
    remember = first.get("remember") or []
    scores = module_scores or {}
    codes = ["FS1", "FS2", "FS3", "FS4"] if gender == "female" else ["MS1", "MS2", "MS3", "MS4"]
    non_risk = {c: float(scores.get(c, 0)) for c in codes if c in scores}
    best_code = max(non_risk, key=non_risk.get, default=codes[0]) if non_risk else codes[0]
    weak_code = min(non_risk, key=non_risk.get, default=codes[-1]) if non_risk else codes[-1]
    best_label = user_label(best_code)
    weak_label = user_label(weak_code)
    return [
        {
            "slice": "01 / 03",
            "title": "第一次见面时，约会对象会……",
            "correctTraits": "、".join(remember[:2]) if remember else (scenes[0] if scenes else f"注意到你的{best_label}"),
            "missingTraits": f"具体细节、以及你的{weak_label}尚未展开",
        },
        {
            "slice": "02 / 03",
            "title": "五分钟后，对方开始……",
            "correctTraits": scenes[1] if len(scenes) > 1 else f"被你的{best_label}吸引",
            "missingTraits": "你的条件清单、以及长期节奏预期",
        },
        {
            "slice": "03 / 03",
            "title": "离开以后，对方会……",
            "correctTraits": scenes[2] if len(scenes) > 2 else f"记住与你{best_label}相关的某个细节",
            "missingTraits": f"你的{weak_label}全貌——那需要更多次见面",
        },
    ]


def _resolve_user_zone(
    module_scores: dict[str, float],
    axis_x: float,
    axis_y: float,
    gender: str,
) -> str:
    fs5 = float(module_scores.get("FS5", module_scores.get("MS5", 50)))
    if fs5 >= 58:
        return "风险区"
    display = axis_x
    support = axis_y
    if display >= 68 and support >= 65 and fs5 <= 42:
        return "挑战上限区"
    if display < 52 and support < 52:
        return "风险区"
    return "最佳适配区"


def build_advice_v4(
    position_name: str,
    module_scores: dict[str, float],
    axis_x: float,
) -> dict[str, str]:
    fs5 = module_scores.get("FS5", module_scores.get("MS5", 50))
    good = (
        "先透露一个确定性的好消息：相处里摩擦不多，"
        "在性格上不太属于看着光鲜但相处极其消耗的类型，这在当下关系里很加分。"
        if fs5 <= 45
        else "你并非高风险类型，但需要把边界和节奏说清楚，避免被误读。"
    )
    warning = (
        "但有一件事必须提醒你：第一印象偏低调，极度依赖熟人网络。"
        "如果一味等待被挖掘，效率会很低，你需要主动做局部曝光。"
        if axis_x < 55
        else "第一印象已经在线，注意别让「容易得到的第一印象」掩盖长期价值建设。"
    )
    if position_name == "还没到时候的人":
        warning = "当前阶段更重要的是建设底牌，不必急于进入高强度筛选。"
    return {"goodNews": good, "warning": warning}


def build_match_zone(
    sweet_spot: dict[str, Any],
    lower_match: dict[str, Any],
    profile: dict[str, Any],
    *,
    upper_match: dict[str, Any] | None = None,
    gender: str = "female",
    module_scores: dict[str, float] | None = None,
    axis_x: float = 50,
    axis_y: float = 50,
) -> dict[str, Any]:
    lib_scenes = []
    try:
        from app.mate_match_bounds import load_match_bounds_library

        lib_scenes = (load_match_bounds_library().get("meet_scenes") or {}).get(gender) or []
    except Exception:
        pass
    portraits = sweet_spot.get("portraits") or []
    portrait_hint = "、".join(str(p.get("name") or "") for p in portraits[:2] if p.get("name"))
    target = portrait_hint or str(profile.get("sweet_spot") or sweet_spot.get("reason") or "")
    upper_score = upper_match.get("matchScore") if upper_match else sweet_spot.get("matchScore")
    scores = module_scores or {}
    user_zone = _resolve_user_zone(scores, axis_x, axis_y, gender)
    return {
        "sliderTitle": "什么样的对象更适合你（基于你的坐标，不是普适标准）",
        "zones": ["风险区", "最佳适配区", "挑战上限区"],
        "userZone": user_zone,
        "targetPortrait": target,
        "matchingReason": str(sweet_spot.get("reason") or sweet_spot.get("summary") or ""),
        "meetScene": " · ".join(lib_scenes[:3]) if lib_scenes else "高校校友圈、高信任度工作场合、靠谱朋友引介。",
        "riskPortrait": str(lower_match.get("summary") or profile.get("lower_match") or ""),
        "sweetScore": sweet_spot.get("matchScore") or sweet_spot.get("successRate"),
        "upperScore": upper_score,
        "lowerScore": lower_match.get("matchScore"),
        "stableProbability": sweet_spot.get("stableProbability"),
        "marriageAdaptScore": sweet_spot.get("marriageAdaptScore"),
    }


def build_lens_grid(
    ai_lens: list[dict[str, str]],
    profile_engine: dict[str, Any],
    *,
    attachment_type: str | None = None,
) -> list[dict[str, str]]:
    cross = build_lens_cross_text(attachment_type)
    if not ai_lens:
        return [
            {"title": "隐形资产", "desc": "长期相处才能看见的稳定价值"},
            {"title": "盲区", "desc": "你以为的独立，可能被解读成距离感"},
            {
                "title": "跨模型联动",
                "desc": cross or "完成 SELF 后，依恋模式会修正这里的解读",
            },
        ]
    mapping = {
        "weapon": "隐形资产",
        "misread": "盲区",
        "miss": "跨模型联动",
    }
    items = [
        {"title": mapping.get(item.get("key", ""), item.get("title", "")), "desc": item.get("body", "")}
        for item in ai_lens[:3]
    ]
    if cross and len(items) >= 3:
        items[2] = {"title": "跨模型联动", "desc": cross}
    return items


def build_footer_quotes(profile_engine: dict[str, Any], social_quotes: list[str]) -> dict[str, Any]:
    position = str(profile_engine.get("main_type") or "")
    quotes = footer_quotes_for_position(position, count=3)
    if not quotes:
        quotes = list(social_quotes)[:3] or ["刚认识觉得普通，后来越来越上头。"]
    return {"marquee": quotes, "intervalMs": 3000}


def enrich_mate_payload_v4(
    payload: dict[str, Any],
    *,
    questions: list[dict[str, Any]] | None = None,
    answers: dict[str, dict[str, Any]] | None = None,
    module_scores: dict[str, float],
    sub_scores: dict[str, float],
    scoring_formula: dict[str, Any],
    quadrant: str,
    precomputed: dict[str, Any] | None = None,
) -> dict[str, Any]:
    gender = str(payload.get("gender") or "female")
    axis_x = float(payload.get("axisX") or (payload.get("marketCoordinate") or {}).get("axisX") or 50)
    axis_y = float(payload.get("axisY") or (payload.get("marketCoordinate") or {}).get("axisY") or 50)
    position_name = str((payload.get("positionType") or {}).get("name") or payload.get("identityCard", {}).get("title") or "")

    position_name = apply_v4_position_overrides(position_name, axis_x, axis_y, module_scores, gender)
    layers = precomputed if isinstance(precomputed, dict) else payload.get("computedLayers")
    if isinstance(layers, dict) and isinstance(layers.get("atoms"), dict):
        profile_engine = layers["atoms"]
    else:
        sub_type = resolve_sub_type(position_name, axis_x, axis_y, module_scores, gender)
        profile_engine = extract_profile_engine(
            position_name=position_name,
            sub_type=sub_type,
            axis_x=axis_x,
            axis_y=axis_y,
            module_scores=module_scores,
            gender=gender,
        )

    accordions = build_module_accordions(
        questions=questions,
        answers=answers,
        module_scores=module_scores,
        sub_scores=sub_scores,
        scoring_formula=scoring_formula,
        gender=gender,
        precomputed=layers if isinstance(layers, dict) else None,
    )

    reverse = build_reverse_card(profile_engine, position_name)
    observe_slices = build_observe_slices(
        profile_engine,
        payload.get("matchmakerRecords") or [],
        module_scores=module_scores,
        gender=gender,
    )
    rehearse = build_rehearse_episodes(
        payload.get("loveTimeline") or [],
        profile_engine,
        module_scores=module_scores,
        gender=gender,
        position_name=position_name,
        axis_y=axis_y,
    )
    market_insight = str((payload.get("marketCoordinate") or {}).get("insight") or "")
    simulator = build_simulator(
        axis_x, axis_y, module_scores, position_name, gender, market_insight=market_insight
    )
    advice = build_advice_v4(position_name, module_scores, axis_x)
    match_zone = build_match_zone(
        payload.get("sweetSpot") or {},
        payload.get("lowerMatch") or {},
        payload.get("matchmaker") or {},
        upper_match=payload.get("upperMatch") or {},
        gender=gender,
        module_scores=module_scores,
        axis_x=axis_x,
        axis_y=axis_y,
    )
    lens_grid = build_lens_grid(
        payload.get("aiLens") or [],
        profile_engine,
        attachment_type=str(payload.get("selfAttachmentType") or payload.get("attachment_type") or "") or None,
    )
    footer = build_footer_quotes(profile_engine, payload.get("socialQuotes") or [])

    from app.mate_ai_content import build_mate_insights

    insights = build_mate_insights(
        position_name=position_name,
        quadrant=quadrant,
        module_scores=module_scores,
        profile=dict(payload.get("positionType") or {}),
        gender=gender,
    )

    coord = payload.get("marketCoordinate") or {}
    if gender == "female":
        coord = {**coord, "horizontalLabel": "第一印象", "verticalLabel": "长期稳定度"}
    else:
        coord = {**coord, "horizontalLabel": "相处印象", "verticalLabel": "现实托底感"}

    identity = payload.get("identityCard") or {}
    identity = {
        **identity,
        "title": "MIRROR · 择偶坐标档案",
        "subTitle": "SET 03 / MATE  |  CONFIDENTIAL",
        "quadrantResult": position_name,
        "quadrantDesc": f"象限判定：{QUADRANT_LABELS.get(quadrant, quadrant)}",
        "slogan": identity.get("tagline") or "",
        "badges": [
            {"name": a.get("label"), "result": a.get("summary")}
            for a in (identity.get("assets") or [])[:3]
        ],
    }

    enriched = {
        **payload,
        "model": "MATE_V4",
        "engine": "MATE_ENGINE_V4.1",
        "positionType": {**(payload.get("positionType") or {}), "name": position_name},
        "identityCard": {**identity, "title": position_name},
        "marketCoordinate": coord,
        "profileEngine": profile_engine,
        "moduleAccordions": accordions,
        "reverse": reverse,
        "observeSlices": observe_slices,
        "rehearseEpisodes": rehearse,
        "simulator": simulator,
        "adviceV4": advice,
        "matchZone": match_zone,
        "lensGrid": lens_grid,
        "footerMarquee": footer,
        "insights": insights,
    }
    try:
        from app.ai_context_assembler import assemble_mate_context, attach_assembled_context_to_payload

        ctx = assemble_mate_context(enriched, module_scores=module_scores)
        enriched = attach_assembled_context_to_payload(enriched, ctx)
    except Exception:
        pass
    from app.semantic_translation import sanitize_user_facing_payload

    return sanitize_user_facing_payload(enriched)
