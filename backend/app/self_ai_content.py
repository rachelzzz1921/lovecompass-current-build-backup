"""SELF 结果页 Layer B/C：维度摘要、AI 洞察四卡、时光机文案。"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.ai_adapter import get_ai_adapter
from app.ai_context_assembler import assemble_self_context
from app.ai_director import build_director_prompt
from app.core_traits import load_attempt_answer_rows
from app.report_utils import looks_like_placeholder_report
from app.self_static_copy import attach_static_copy_to_payload

PHRASE_LIBRARY_PATH = Path(__file__).resolve().parents[1] / "data" / "analysis_phrase_library_v1.json"
DIMENSION_ORDER = ("SA1", "SA2", "SA3", "SA4", "SA5", "SA6")

DIMENSION_META: dict[str, dict[str, str]] = {
    "SA1": {"name": "自我吸引感知", "core": "我相信自己值得被爱吗？"},
    "SA2": {"name": "依恋焦虑", "core": "我在关系里容易不安全感吗？"},
    "SA3": {"name": "依恋回避", "core": "我在关系里容易逃避亲密吗？"},
    "SA4": {"name": "自我边界", "core": "我能守住自己吗？"},
    "SA5": {"name": "情绪调节", "core": "我能好好处理关系里的情绪吗？"},
    "SA6": {"name": "关系投入模式", "core": "我是怎么爱人的？"},
}

MATCH_BY_ATTACHMENT: dict[str, list[dict[str, Any]]] = {
    "焦虑型": [
        {"name": "薛宝钗型（安全稳定者）", "pct": 92, "tagline": "情绪稳定、边界清晰，能承接你的敏感"},
        {"name": "贾探春型（清醒独立者）", "pct": 78, "tagline": "有原则但不压迫，给你确认也给你空间"},
        {"name": "北静王型（有分寸的稳定者）", "pct": 71, "tagline": "亲密而不失自我，成熟不是距离"},
    ],
    "回避型": [
        {"name": "薛宝钗型（稳定不强求者）", "pct": 88, "tagline": "不会追着你跑，但会在你靠近时稳稳接住"},
        {"name": "史湘云型（热烈不黏人）", "pct": 79, "tagline": "真实有趣，尊重你的节奏与精神标准"},
        {"name": "贾探春型（独立对等者）", "pct": 72, "tagline": "清醒独立，势均力敌的相处"},
    ],
    "混合型": [
        {"name": "北静王型（稳定有分寸）", "pct": 85, "tagline": "能接你的热烈，也尊重你的空间"},
        {"name": "薛宝钗型（安全稳定）", "pct": 80, "tagline": "稳定底盘，减少关系里的表演感"},
        {"name": "贾探春型（清醒独立）", "pct": 73, "tagline": "同频成长，不把复杂当成问题"},
    ],
    "安全型": [
        {"name": "林黛玉型（深情敏感）", "pct": 82, "tagline": "把感情当真，情感浓度与你相称"},
        {"name": "史湘云型（真实有趣）", "pct": 78, "tagline": "生命力互补，关系有温度也有趣味"},
        {"name": "贾宝玉型（用心认真）", "pct": 74, "tagline": "记得细节，愿意认真投入"},
    ],
    "高边界安全型": [
        {"name": "北静王型（分寸感对等）", "pct": 89, "tagline": "亲密有边界，尊重彼此标准"},
        {"name": "贾探春型（清醒对等）", "pct": 82, "tagline": "不将就、不消耗，原则同频"},
        {"name": "薛宝钗型（稳定互补）", "pct": 75, "tagline": "稳定可靠，减少无效拉扯"},
    ],
    "低自我高投入型": [
        {"name": "薛宝钗型（稳定给力）", "pct": 86, "tagline": "能给你稳定回应，帮你把爱落在日常"},
        {"name": "北静王型（分寸照顾）", "pct": 79, "tagline": "看见你的付出，也提醒你值得被同样对待"},
        {"name": "贾探春型（清醒稳定）", "pct": 72, "tagline": "帮你把边界找回来，而不是继续单向流出"},
    ],
}

GROWTH_PATHS: dict[str, dict[str, Any]] = {
    "林黛玉": {"target": "史湘云", "key_dimension": "SA2", "delta": 15, "changes": [
        "不再需要那么多来自对方的确认", "能更快从冲突中恢复", "你给的爱会更轻盈，也更长久",
    ]},
    "贾宝玉": {"target": "北静王", "key_dimension": "SA2", "delta": 12, "changes": [
        "情绪不再完全跟着对方起伏", "能在热烈里保留自己的节奏", "关系里少些试探，多些笃定",
    ]},
    "薛宝钗": {"target": "贾探春", "key_dimension": "SA3", "delta": 10, "changes": [
        "偶尔暴露脆弱不等于失控", "亲密不必永远完美得体", "对方会更靠近真实的你",
    ]},
    "妙玉": {"target": "柳湘莲", "key_dimension": "SA3", "delta": 12, "changes": [
        "撤回之后记得留一句「我还在」", "标准高不等于永远独处", "值得的人会在你的节奏里靠近",
    ]},
    "袭人": {"target": "薛宝钗", "key_dimension": "SA4", "delta": 15, "changes": [
        "付出之前先问自己是否也被照顾", "说「我需要」不等于自私", "你值得被同样具体地珍视",
    ]},
}

GROWTH_PATH_DEFAULT = {
    "target": "薛宝钗",
    "key_dimension": "SA5",
    "delta": 12,
    "changes": ["冲突后恢复得更快", "表达需要变得更直接", "关系里少些内耗，多些被看见"],
}


def _load_phrase_library() -> dict[str, Any]:
    try:
        return json.loads(PHRASE_LIBRARY_PATH.read_text(encoding="utf-8"))
    except OSError:
        return {}


def score_display_summary(score: float) -> str:
    s = max(0, min(100, round(float(score))))
    if s <= 30:
        return "这个维度还有很大的成长空间"
    if s <= 50:
        return "这个维度还在发展阶段"
    if s <= 65:
        return "这个维度表现稳定"
    if s <= 80:
        return "这个维度是你的重要资产"
    return "这个维度是你的核心竞争力"


def _position_labels(code: str) -> tuple[str, str]:
    if code == "SA2":
        return "低焦虑", "高焦虑"
    if code == "SA3":
        return "低回避", "高回避"
    return "还在展开", "更成熟"


def build_dimension_summaries(dimension_scores: dict[str, float] | None) -> dict[str, dict[str, Any]]:
    scores = {str(k): float(v) for k, v in (dimension_scores or {}).items()}
    out: dict[str, dict[str, Any]] = {}
    for code, meta in DIMENSION_META.items():
        raw = scores.get(code, 0.0)
        low, high = _position_labels(code)
        out[code] = {
            "label": score_display_summary(raw),
            "detail": f"{meta['core']} 你目前是「{score_display_summary(raw)}」。",
            "position": max(0, min(100, round(raw))),
            "position_label_low": low,
            "position_label_high": high,
            "name": meta["name"],
            "coreQuestion": meta["core"],
        }
    return out


def _positive_framing(attachment: str) -> str:
    lib = _load_phrase_library()
    mapping = (
        lib.get("suiteHooks", {})
        .get("SELF", {})
        .get("positiveFramingByAttachment", {})
    )
    return str(mapping.get(attachment) or "这些倾向不是缺陷，而是你在关系里长期形成的保护方式。")


def _growth_advice(attachment: str) -> str:
    advice = {
        "焦虑型": "下一段关系里，练习把「我需要确认」说成一句话，而不是一连串试探。你的真心值得被直接回应。",
        "回避型": "当你想撤退时，先留一句「我在，只是需要先冷静」。这不会削弱你的独立，反而会让对方更信任你。",
        "低自我高投入型": "在付出之前，先问自己：这个选择也在照顾我吗？你值得被同样具体地对待。",
        "高边界安全型": "保持标准的同时，允许 10% 的脆弱被看见。成熟不等于永远正确。",
        "混合型": "识别你此刻需要的是空间还是连接，并告诉对方。真实比一致更重要。",
    }
    return advice.get(attachment, "继续把稳定当礼物，也记得在关系里保留一点不可预测的柔软。")


def _is_grey_zone(scores: dict[str, float]) -> bool:
    sa2 = scores.get("SA2", 0)
    sa3 = scores.get("SA3", 0)
    return (45 <= sa2 < 60) or (45 <= sa3 < 60)


def build_self_insights(
    *,
    attachment: str,
    dimension_scores: dict[str, float] | None,
    profile: dict[str, Any] | None = None,
) -> list[dict[str, str]]:
    scores = {str(k): float(v) for k, v in (dimension_scores or {}).items()}
    dims = [
        {"code": code, "name": meta["name"], "score": scores.get(code, 0.0), "core": meta["core"]}
        for code, meta in DIMENSION_META.items()
    ]
    sorted_dims = sorted(dims, key=lambda d: d["score"], reverse=True)
    highest = sorted_dims[0] if sorted_dims else None
    lowest = sorted_dims[-1] if sorted_dims else None
    grey = _is_grey_zone(scores)
    matches = MATCH_BY_ATTACHMENT.get(attachment) or MATCH_BY_ATTACHMENT["安全型"]
    profile = profile or {}

    return [
        {
            "kind": "strength",
            "title": "你的高光",
            "body": (
                f"在「{highest['name']}」上，{score_display_summary(highest['score'])}。"
                f"套一里这一维对应：{highest['core']}"
                if highest
                else "你在关系里已经有可依靠的稳定资源。"
            ),
        },
        {
            "kind": "watch",
            "title": "可以温柔留意",
            "body": (
                "你的 SA2/SA3 至少有一维落在 45–60 的灰色地带——主类型仍成立，但依恋模式还在过渡区，不必用单一标签限制自己。"
                if grey
                else (
                    f"「{lowest['name']}」{score_display_summary(lowest['score'])}。{_positive_framing(attachment)}"
                    if lowest
                    else _positive_framing(attachment)
                )
            ),
        },
        {
            "kind": "match",
            "title": "最适合你的关系模式",
            "body": (
                f"你需要的不是一个「不让你焦虑」的人，而是一个「稳定到让你慢慢不需要焦虑」的人。"
                f"同体系参考：{matches[0]['name']}——{matches[0]['tagline']}。"
                if matches
                else str(profile.get("matching_logic") or "优先找能读懂你节奏、也愿意一起练习沟通的人。")
            ),
        },
        {
            "kind": "growth",
            "title": "下一段关系里",
            "body": _growth_advice(attachment),
        },
    ]


def build_growth_path_text(character_name: str, dimension_scores: dict[str, float] | None) -> str:
    path = GROWTH_PATHS.get(str(character_name).strip()) or GROWTH_PATH_DEFAULT
    dim_code = str(path.get("key_dimension") or "SA5")
    dim_name = DIMENSION_META.get(dim_code, {}).get("name", dim_code)
    target = str(path.get("target") or "更轻盈的状态")
    changes = path.get("changes") or []
    delta = int(path.get("delta") or 12)
    bullets = " ".join(f"· {c}" for c in changes[:3])
    return (
        f"当你让「{dim_name}」再稳一些（大约 {delta} 分的方向），你会从「{character_name}型」"
        f"更接近「{target}型」的状态。这意味着：{bullets}"
    )


def _insights_ai_prompt(
    *,
    attachment: str,
    character: str,
    result_payload: dict[str, Any],
    dimension_summaries: dict[str, dict[str, Any]],
    key_evidence: list[dict[str, Any]],
) -> str:
    context = assemble_self_context(result_payload, task="self-insights")
    if key_evidence and not context.evidence:
        context.evidence = [
            f"「{e.get('question_short', '')}」→ {e.get('chosen_label', '')}"
            for e in key_evidence[:5]
            if e.get("chosen_label") or e.get("question_short")
        ]
    extra = """
# Output JSON
{"insights":[
  {"kind":"strength","title":"你的高光","body":""},
  {"kind":"watch","title":"可以温柔留意","body":""},
  {"kind":"match","title":"最适合你的关系模式","body":""},
  {"kind":"growth","title":"下一段关系里","body":""}
]}
每条 120-150 字；禁止 SA 编号与裸分；match 说特质不说具体人名。
""".strip()
    return build_director_prompt(task="mate-lens", context=context, extra_rules=extra)


def _parse_insights_json(raw: str) -> list[dict[str, str]] | None:
    text = raw.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        data = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    items = data.get("insights")
    if not isinstance(items, list) or len(items) < 4:
        return None
    out: list[dict[str, str]] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        kind = str(item.get("kind") or "")
        if kind not in {"strength", "watch", "match", "growth"}:
            continue
        out.append(
            {
                "kind": kind,
                "title": str(item.get("title") or ""),
                "body": str(item.get("body") or "").strip(),
            }
        )
    return out if len(out) >= 4 else None


def try_enhance_insights_with_ai(
    *,
    attachment: str,
    character: str,
    result_payload: dict[str, Any],
    dimension_summaries: dict[str, dict[str, Any]],
    core_traits: list[dict[str, Any]],
    fallback: list[dict[str, str]],
) -> tuple[list[dict[str, str]], str]:
    evidence: list[dict[str, Any]] = []
    for trait in core_traits:
        for ev in trait.get("evidence") or []:
            if isinstance(ev, dict):
                evidence.append(ev)
    prompt = _insights_ai_prompt(
        attachment=attachment,
        character=character,
        result_payload=result_payload,
        dimension_summaries=dimension_summaries,
        key_evidence=evidence,
    )
    try:
        raw = get_ai_adapter().generate(prompt, json_mode=True)
        if looks_like_placeholder_report(raw):
            return fallback, "deterministic"
        parsed = _parse_insights_json(raw)
        if parsed:
            return parsed, "ai"
    except Exception:
        pass
    return fallback, "deterministic"


def compute_score_pattern(dimension_scores: dict[str, float] | None) -> str:
    scores = {str(k): float(v) for k, v in (dimension_scores or {}).items()}
    parts: list[str] = []
    for code in DIMENSION_ORDER:
        raw = scores.get(code, 0.0)
        band = int(max(0, min(100, round(raw))) // 5 * 5)
        parts.append(str(band))
    return "_".join(parts)


def pattern_cache_key(character: str, gender: str, dimension_scores: dict[str, float] | None) -> str:
    return f"{character.strip()}:{gender.strip()}:{compute_score_pattern(dimension_scores)}"


def fetch_pattern_cache(conn: Any, pattern_key: str) -> dict[str, Any] | None:
    try:
        row = conn.execute(
            """
            SELECT traits, insights, growth_path, generation_mode, hit_count
            FROM public.self_ai_pattern_cache
            WHERE pattern_key = %s
            """,
            (pattern_key,),
        ).fetchone()
    except Exception:
        return None
    if not row:
        return None
    conn.execute(
        "UPDATE public.self_ai_pattern_cache SET hit_count = hit_count + 1 WHERE pattern_key = %s",
        (pattern_key,),
    )
    return {
        "traits": row.get("traits") or [],
        "insights": row.get("insights") or [],
        "growth_path": row.get("growth_path") or "",
        "mode": row.get("generation_mode") or "cached",
        "cached": True,
        "cache_hits": int(row.get("hit_count") or 0) + 1,
    }


def save_pattern_cache(
    conn: Any,
    *,
    pattern_key: str,
    character: str,
    gender: str,
    score_pattern: str,
    ai_content: dict[str, Any],
) -> None:
    from psycopg.types.json import Jsonb

    try:
        conn.execute(
            """
            INSERT INTO public.self_ai_pattern_cache(
              pattern_key, character_code, gender, score_pattern,
              traits, insights, growth_path, generation_mode, hit_count
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0)
            ON CONFLICT (pattern_key) DO UPDATE SET
              traits = EXCLUDED.traits,
              insights = EXCLUDED.insights,
              growth_path = EXCLUDED.growth_path,
              generation_mode = EXCLUDED.generation_mode,
              updated_at = now()
            """,
            (
                pattern_key,
                character,
                gender,
                score_pattern,
                Jsonb(ai_content.get("traits") or []),
                Jsonb(ai_content.get("insights") or []),
                ai_content.get("growth_path"),
                ai_content.get("mode") or "deterministic",
            ),
        )
    except Exception:
        return


def _traits_ai_prompt(
    *,
    result_payload: dict[str, Any],
    core_traits: list[dict[str, Any]],
) -> str:
    context = assemble_self_context(result_payload, task="self-traits")
    extra = """
# Output JSON
{"traits":[{"icon":"shield|key|eye","title":"","body":"","gift_line":"","source_dimension":"SA2","highlight":true,"evidence":[{"question_id":"","question_short":"","chosen_label":""}]}]}
必须引用具体答题；每段 ≤150 字；正向包装；严禁缺点/低分/建议改变。
""".strip()
    return build_director_prompt(task="mate-lens", context=context, extra_rules=extra)


def _parse_traits_json(raw: str, fallback: list[dict[str, Any]]) -> list[dict[str, Any]] | None:
    text = raw.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        data = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    items = data.get("traits")
    if not isinstance(items, list) or len(items) < 1:
        return None
    out: list[dict[str, Any]] = []
    for item in items[:3]:
        if not isinstance(item, dict):
            continue
        icon = str(item.get("icon") or "shield")
        if icon not in {"shield", "key", "eye"}:
            icon = "shield"
        body = str(item.get("body") or "").strip()
        if not body:
            continue
        gift = str(item.get("gift_line") or "").strip()
        if gift and gift not in body:
            body = f"{body} {gift}"
        out.append(
            {
                "icon": icon,
                "title": str(item.get("title") or "你的关系特质"),
                "body": body,
                "highlight": bool(item.get("highlight")),
                "source_dimension": item.get("source_dimension"),
                "evidence": item.get("evidence") if isinstance(item.get("evidence"), list) else [],
            }
        )
    return out if out else None


def try_enhance_traits_with_ai(
    *,
    result_payload: dict[str, Any],
    core_traits: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    if not core_traits:
        return core_traits
    prompt = _traits_ai_prompt(
        result_payload=result_payload,
        core_traits=core_traits,
    )
    try:
        raw = get_ai_adapter().generate(prompt, json_mode=True)
        if looks_like_placeholder_report(raw):
            return core_traits
        parsed = _parse_traits_json(raw, core_traits)
        if parsed:
            for i, trait in enumerate(parsed):
                if i < len(core_traits):
                    fb = core_traits[i]
                    if not trait.get("evidence") and fb.get("evidence"):
                        trait["evidence"] = fb["evidence"]
                    if not trait.get("source_dimension") and fb.get("source_dimension"):
                        trait["source_dimension"] = fb.get("source_dimension") or fb.get("dimensionCode")
            return parsed
    except Exception:
        pass
    return core_traits


def build_self_ai_content(
    *,
    result_payload: dict[str, Any],
    dimension_scores: dict[str, float] | None,
    use_ai: bool = False,
) -> dict[str, Any]:
    profile = result_payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}
    attachment = str(result_payload.get("attachment_type") or profile.get("attachment_type") or "")
    character = str(result_payload.get("archetype_code") or "")
    summaries = build_dimension_summaries(dimension_scores)
    core_traits = result_payload.get("core_traits") if isinstance(result_payload.get("core_traits"), list) else []
    insights = build_self_insights(attachment=attachment, dimension_scores=dimension_scores, profile=profile)
    assembled = assemble_self_context(result_payload, task="self-ai-bundle")
    mode = "deterministic"
    traits = list(core_traits)
    if use_ai:
        traits = try_enhance_traits_with_ai(
            result_payload=result_payload,
            core_traits=traits,
        )
        insights, mode = try_enhance_insights_with_ai(
            attachment=attachment,
            character=character,
            result_payload=result_payload,
            dimension_summaries=summaries,
            core_traits=traits,
            fallback=insights,
        )
    return {
        "traits": traits,
        "insights": insights,
        "growth_path": build_growth_path_text(character, dimension_scores),
        "assembled_context": assembled.to_model_safe_prompt_dict(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "cached": False,
        "status": "ready",
        "mode": mode,
    }


def enhance_self_ai_for_attempt(
    conn: Any,
    attempt_id: str,
    *,
    gender: str = "female",
    use_ai: bool = True,
    force: bool = False,
) -> dict[str, Any]:
    row = conn.execute(
        """
        SELECT dimension_scores, result_payload, archetype_gender
        FROM public.test_attempts WHERE id = %s
        """,
        (attempt_id,),
    ).fetchone()
    if not row:
        return {}
    payload = dict(row.get("result_payload") or {})
    scores = row.get("dimension_scores") or {}
    gender = str(row.get("archetype_gender") or gender or "female")
    payload = attach_static_copy_to_payload(payload)
    if not payload.get("core_traits"):
        from app.core_traits import attach_core_traits_to_payload

        payload = attach_core_traits_to_payload(conn, attempt_id, payload, scores)

    character = str(payload.get("archetype_code") or "")
    pattern_key = pattern_cache_key(character, gender, scores)
    score_pattern = compute_score_pattern(scores)

    if use_ai and not force:
        cached = fetch_pattern_cache(conn, pattern_key)
        if cached:
            payload["dimension_summaries"] = build_dimension_summaries(scores)
            payload["ai_content"] = {
                **cached,
                "status": "ready",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "pattern_key": pattern_key,
            }
            payload["assembledAiContext"] = assemble_self_context(payload).to_model_safe_prompt_dict()
            return payload

    payload["dimension_summaries"] = build_dimension_summaries(scores)
    ai_content = build_self_ai_content(
        result_payload=payload,
        dimension_scores=scores,
        use_ai=use_ai,
    )
    ai_content["pattern_key"] = pattern_key
    payload["ai_content"] = ai_content
    payload["assembledAiContext"] = ai_content.get("assembled_context")

    if use_ai and ai_content.get("mode") == "ai":
        save_pattern_cache(
            conn,
            pattern_key=pattern_key,
            character=character,
            gender=gender,
            score_pattern=score_pattern,
            ai_content=ai_content,
        )
    return payload


def enhance_self_ai_background(attempt_id: str) -> None:
    """Background upgrade: deterministic → AI + pattern cache."""
    if os.getenv("AI_PROVIDER", "mock").strip().lower() != "zhipu":
        return
    try:
        from app.db import get_conn
        from psycopg.types.json import Jsonb

        with get_conn() as conn:
            updated = enhance_self_ai_for_attempt(conn, attempt_id, use_ai=True, force=False)
            if not updated:
                return
            conn.execute(
                "UPDATE public.test_attempts SET result_payload = %s WHERE id = %s",
                (Jsonb(updated), attempt_id),
            )
            conn.commit()
    except Exception:
        return


def attach_self_ai_content_to_payload(
    conn: Any,
    attempt_id: str,
    result_payload: dict[str, Any],
    dimension_scores: dict[str, float] | None,
    *,
    use_ai: bool = False,
    force: bool = False,
    gender: str = "female",
) -> dict[str, Any]:
    payload = attach_static_copy_to_payload(dict(result_payload))
    existing = payload.get("ai_content")
    if isinstance(existing, dict) and existing.get("status") == "ready" and not force:
        if not payload.get("dimension_summaries"):
            payload["dimension_summaries"] = build_dimension_summaries(dimension_scores)
        return payload

    character = str(payload.get("archetype_code") or "")
    pattern_key = pattern_cache_key(character, gender, dimension_scores)

    if not force:
        cached = fetch_pattern_cache(conn, pattern_key)
        if cached:
            if not payload.get("core_traits"):
                from app.core_traits import attach_core_traits_to_payload

                payload = attach_core_traits_to_payload(conn, attempt_id, payload, dimension_scores)
            payload["dimension_summaries"] = build_dimension_summaries(dimension_scores)
            payload["ai_content"] = {
                **cached,
                "status": "ready",
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "pattern_key": pattern_key,
            }
            payload["assembledAiContext"] = assemble_self_context(payload).to_model_safe_prompt_dict()
            return payload

    if not payload.get("core_traits"):
        from app.core_traits import attach_core_traits_to_payload

        payload = attach_core_traits_to_payload(conn, attempt_id, payload, dimension_scores)

    payload["dimension_summaries"] = build_dimension_summaries(dimension_scores)
    payload["ai_content"] = build_self_ai_content(
        result_payload=payload,
        dimension_scores=dimension_scores,
        use_ai=use_ai,
    )
    payload["ai_content"]["pattern_key"] = pattern_key
    payload["assembledAiContext"] = payload["ai_content"].get("assembled_context")
    return payload


def load_trait_evidence_bundle(conn: Any, attempt_id: str, trait_index: int = 0) -> list[dict[str, Any]]:
    """Return up to 3 evidence rows for a trait slot from stored answers."""
    rows = load_attempt_answer_rows(conn, attempt_id)
    from app.core_traits import build_core_traits

    payload_scores: dict[str, float] = {}
    attempt = conn.execute(
        "SELECT dimension_scores, result_payload FROM public.test_attempts WHERE id = %s",
        (attempt_id,),
    ).fetchone()
    if attempt:
        raw = attempt.get("dimension_scores") or {}
        if isinstance(raw, dict):
            payload_scores = {str(k): float(v) for k, v in raw.items()}
        rp = attempt.get("result_payload") or {}
        attachment = str(rp.get("attachment_type") or "") if isinstance(rp, dict) else ""
    else:
        attachment = ""
    traits = build_core_traits(rows, payload_scores, attachment)
    if not traits or trait_index >= len(traits):
        return []
    trait = traits[trait_index]
    evidence = trait.get("evidence") if isinstance(trait.get("evidence"), list) else []
    ext_id = trait.get("sourceQuestionId")
    related = [ev for ev in evidence if isinstance(ev, dict)]
    if ext_id:
        for row in rows:
            if row.get("external_question_id") == ext_id:
                qtext = str(row.get("question_text") or "")
                if not any(r.get("question_id") == ext_id for r in related):
                    related.insert(
                        0,
                        {
                            "question_id": ext_id,
                            "question_short": qtext[:48] + ("…" if len(qtext) > 48 else ""),
                            "chosen_label": related[0].get("chosen_label") if related else "",
                        },
                    )
                break
    return related[:3]
