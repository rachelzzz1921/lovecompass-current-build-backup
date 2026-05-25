"""MATE 结果页 Layer B/C — 洞察四卡、观察室/透视镜/建议文案增强。

架构：计算层 → 原子层 → 上下文装配 → AI 导演（按模块） → JSON。
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from psycopg.types.json import Jsonb

from app.ai_adapter import get_ai_adapter
from app.ai_context_assembler import AssembledAIContext, assemble_mate_context, attach_assembled_context_to_payload
from app.ai_director import build_director_prompt
from app.chat_prompt_layers import score_band_label
from app.report_utils import looks_like_placeholder_report
from app.semantic_translation import sanitize_deep, user_label

FEMALE_CODES = ["FS1", "FS2", "FS3", "FS4", "FS5"]
MALE_CODES = ["MS1", "MS2", "MS3", "MS4", "MS5"]

MATE_MODULE_SPECS: list[tuple[str, str]] = [
    (
        "mate-reverse",
        """
只输出 JSON：
{"reverse":{"misread":"","truth":"","mechanism":"","cost":""}}
每段 50-80 字，写现实镜头，不要抽象人格定义。
""".strip(),
    ),
    (
        "mate-observe",
        """
只输出 JSON：
{"observeSlices":[
  {"slice":"01 / 03","title":"第一次见面时，约会对象会……","correctTraits":"","missingTraits":""},
  {"slice":"02 / 03","title":"五分钟后，对方开始……","correctTraits":"","missingTraits":""},
  {"slice":"03 / 03","title":"离开以后，对方会……","correctTraits":"","missingTraits":""}
]}
每段 correctTraits / missingTraits 各 20-40 字。
""".strip(),
    ),
    (
        "mate-lens",
        """
只输出 JSON：
{
  "insights":[
    {"kind":"strength","title":"","body":""},
    {"kind":"watch","title":"","body":""},
    {"kind":"match","title":"","body":""},
    {"kind":"growth","title":"","body":""}
  ],
  "lensGrid":[
    {"title":"隐形资产","desc":""},
    {"title":"盲区","desc":""},
    {"title":"跨模型联动","desc":""}
  ],
  "adviceV4":{"goodNews":"","warning":""}
}
insights 各 100-130 字；lensGrid 各 60-90 字。
""".strip(),
    ),
    (
        "footer_marquee",
        """
只输出 JSON：
{"social_quotes":["",""]}
2 条，各 20 字以内，口语化，像匿名评价。
""".strip(),
    ),
]


def _module_codes(gender: str) -> list[str]:
    return MALE_CODES if gender == "male" else FEMALE_CODES


def compute_score_pattern(module_scores: dict[str, float], gender: str) -> str:
    codes = _module_codes(gender)
    parts: list[str] = []
    for code in codes:
        raw = float(module_scores.get(code, 0))
        band = int(max(0, min(100, round(raw))) // 5 * 5)
        parts.append(str(band))
    return "_".join(parts)


def pattern_cache_key(
    position_name: str,
    sub_type: str,
    gender: str,
    module_scores: dict[str, float],
) -> str:
    return f"{position_name}:{sub_type}:{gender}:{compute_score_pattern(module_scores, gender)}"


def fetch_pattern_cache(conn: Any, pattern_key: str) -> dict[str, Any] | None:
    try:
        row = conn.execute(
            """
            SELECT reverse, observe_slices, advice_v4, lens_grid, insights,
                   generation_mode, hit_count
            FROM public.mate_ai_pattern_cache
            WHERE pattern_key = %s
            """,
            (pattern_key,),
        ).fetchone()
    except Exception:
        return None
    if not row:
        return None
    try:
        conn.execute(
            "UPDATE public.mate_ai_pattern_cache SET hit_count = hit_count + 1 WHERE pattern_key = %s",
            (pattern_key,),
        )
    except Exception:
        pass
    return dict(row)


def save_pattern_cache(
    conn: Any,
    *,
    pattern_key: str,
    position_name: str,
    sub_type: str,
    gender: str,
    score_pattern: str,
    ai_content: dict[str, Any],
) -> None:
    try:
        conn.execute(
            """
            INSERT INTO public.mate_ai_pattern_cache(
              pattern_key, position_name, sub_type, gender, score_pattern,
              reverse, observe_slices, advice_v4, lens_grid, insights, generation_mode
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (pattern_key) DO UPDATE SET
              reverse = EXCLUDED.reverse,
              observe_slices = EXCLUDED.observe_slices,
              advice_v4 = EXCLUDED.advice_v4,
              lens_grid = EXCLUDED.lens_grid,
              insights = EXCLUDED.insights,
              generation_mode = EXCLUDED.generation_mode,
              updated_at = now()
            """,
            (
                pattern_key,
                position_name,
                sub_type,
                gender,
                score_pattern,
                Jsonb(ai_content.get("reverse") or {}),
                Jsonb(ai_content.get("observe_slices") or []),
                Jsonb(ai_content.get("advice_v4") or {}),
                Jsonb(ai_content.get("lens_grid") or []),
                Jsonb(ai_content.get("insights") or []),
                ai_content.get("mode") or "deterministic",
            ),
        )
    except Exception:
        return


def _best_module(module_scores: dict[str, float], gender: str) -> tuple[str, float]:
    codes = _module_codes(gender)
    best = max(codes, key=lambda c: float(module_scores.get(c, 0)))
    return best, float(module_scores.get(best, 0))


def _weakest_module(module_scores: dict[str, float], gender: str) -> tuple[str, float]:
    codes = [c for c in _module_codes(gender) if c not in {"FS5", "MS5"}]
    weak = min(codes, key=lambda c: float(module_scores.get(c, 100)))
    return weak, float(module_scores.get(weak, 0))


def build_mate_insights(
    *,
    position_name: str,
    quadrant: str,
    module_scores: dict[str, float],
    profile: dict[str, Any],
    gender: str,
) -> list[dict[str, str]]:
    best_code, best_score = _best_module(module_scores, gender)
    weak_code, weak_score = _weakest_module(module_scores, gender)
    best_label = user_label(best_code)
    weak_label = user_label(weak_code)
    market_read = str(profile.get("market_read") or profile.get("marketRead") or profile.get("tagline") or "")
    sweet = str(profile.get("sweet_spot") or profile.get("sweetSpot") or "经济适用区")

    return [
        {
            "kind": "strength",
            "title": "你的市场优势",
            "body": (
                f"你的定位是「{position_name}」（{quadrant}）。"
                f"「{best_label}」{score_band_label(best_score)}——这是别人最容易感知、也最值得放大的部分。"
                + (f" {market_read[:80]}" if market_read else "")
            ).strip(),
        },
        {
            "kind": "watch",
            "title": "可以温柔留意",
            "body": (
                f"「{weak_label}」{score_band_label(weak_score)}。"
                "这不是否定你，而是提醒：把短板补到「不拖后腿」，比追求全面满分更划算。"
            ),
        },
        {
            "kind": "match",
            "title": "匹配建议",
            "body": (
                f"上限区：{profile.get('upper_match') or '值得争取、能读懂你节奏的人'}。"
                f" 经济适用区：{sweet}。"
                f" 下限区：{profile.get('lower_match') or '初期上头、后期消耗的类型'}。"
                " 用区间思考，不用「你只配谁」。"
            ),
        },
        {
            "kind": "growth",
            "title": "提升路径",
            "body": (
                "把最值钱的部分变成更容易被看见的表达：具体的生活场景、稳定的见面节奏、"
                "少抽象形容词。完成套一 SELF 后，依恋模式会与这套坐标合并解读。"
            ),
        },
    ]


def _parse_json_object(raw: str) -> dict[str, Any] | None:
    text = raw.strip()
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        data = json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def _run_director_module(context: AssembledAIContext, task: str, extra_rules: str) -> dict[str, Any] | None:
    module_context = AssembledAIContext(
        role=context.role,
        product_set=context.product_set,
        main_type=context.main_type,
        sub_type=context.sub_type,
        profile_atoms=dict(context.profile_atoms),
        pair_atoms=dict(context.pair_atoms),
        evidence=list(context.evidence),
        dictionary=list(context.dictionary),
        cross_model_summary=list(context.cross_model_summary),
        display_summaries=list(context.display_summaries),
        user_traits=list(context.user_traits),
        task=task,
    )
    prompt = build_director_prompt(task=task, context=module_context, extra_rules=extra_rules)
    try:
        raw = get_ai_adapter().generate(prompt, json_mode=True)
        if looks_like_placeholder_report(raw):
            return None
        parsed = _parse_json_object(raw)
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        return None


def _merge_ai_modules(base: dict[str, Any], parsed: dict[str, Any]) -> dict[str, Any]:
    merged = dict(base)

    rev = parsed.get("reverse") or {}
    if isinstance(rev, dict) and rev:
        reverse = dict(merged.get("reverse") or {})
        front = dict(reverse.get("front") or {})
        back = dict(reverse.get("back") or {})
        if rev.get("misread"):
            front["content"] = str(rev["misread"])
        if rev.get("truth"):
            back["content"] = str(rev["truth"])
        if rev.get("mechanism"):
            back["mechanism"] = str(rev["mechanism"])
        if rev.get("cost"):
            back["cost"] = str(rev["cost"])
        reverse["front"] = front
        reverse["back"] = back
        merged["reverse"] = reverse

    if isinstance(parsed.get("observeSlices"), list) and parsed["observeSlices"]:
        merged["observeSlices"] = parsed["observeSlices"]

    advice = parsed.get("adviceV4")
    if isinstance(advice, dict) and advice:
        merged["adviceV4"] = {**(merged.get("adviceV4") or {}), **advice}

    if isinstance(parsed.get("lensGrid"), list) and parsed["lensGrid"]:
        merged["lensGrid"] = parsed["lensGrid"]

    if isinstance(parsed.get("insights"), list) and parsed["insights"]:
        merged["insights"] = parsed["insights"]

    if isinstance(parsed.get("social_quotes"), list) and parsed["social_quotes"]:
        merged["socialQuotes"] = parsed["social_quotes"]

    return merged


def try_enhance_mate_modules_with_ai(
    *,
    context: AssembledAIContext,
    payload: dict[str, Any],
    fallback_insights: list[dict[str, str]],
) -> tuple[dict[str, Any], str]:
    combined: dict[str, Any] = {}
    any_ai = False

    for task, extra_rules in MATE_MODULE_SPECS:
        parsed = _run_director_module(context, task, extra_rules)
        if not parsed:
            continue
        any_ai = True
        combined.update(parsed)

    if not any_ai:
        return {"insights": fallback_insights}, "deterministic"

    if not isinstance(combined.get("insights"), list) or len(combined.get("insights") or []) < 4:
        combined["insights"] = fallback_insights

    merged_payload = _merge_ai_modules(payload, combined)
    out: dict[str, Any] = sanitize_deep(
        {
            "insights": combined.get("insights") or fallback_insights,
            "reverse": merged_payload.get("reverse"),
            "observe_slices": merged_payload.get("observeSlices"),
            "advice_v4": merged_payload.get("adviceV4"),
            "lens_grid": merged_payload.get("lensGrid"),
            "social_quotes": merged_payload.get("socialQuotes"),
        }
    )
    return out, "ai"


def build_mate_ai_content(
    *,
    result_payload: dict[str, Any],
    module_scores: dict[str, float] | None,
    gender: str = "female",
    use_ai: bool = False,
) -> dict[str, Any]:
    payload = result_payload
    pos = payload.get("positionType") or {}
    if not isinstance(pos, dict):
        pos = {}
    position_name = str(pos.get("name") or payload.get("identityCard", {}).get("title") or "择偶定位")
    quadrant = str(payload.get("quadrant") or "待判断")
    profile = dict(pos)
    scores = {str(k): float(v) for k, v in (module_scores or {}).items()}
    sub_type = str((payload.get("profileEngine") or {}).get("sub_type") or "default")

    context = assemble_mate_context(payload, module_scores=scores, task="mate-module-bundle", gender=gender)
    insights = sanitize_deep(
        build_mate_insights(
            position_name=position_name,
            quadrant=quadrant,
            module_scores=scores,
            profile=profile,
            gender=gender,
        )
    )

    mode = "deterministic"
    extra: dict[str, Any] = {}
    if use_ai:
        extra, mode = try_enhance_mate_modules_with_ai(
            context=context,
            payload=payload,
            fallback_insights=insights,
        )
        insights = extra.get("insights") or insights

    return {
        "insights": insights,
        "reverse": extra.get("reverse"),
        "observe_slices": extra.get("observe_slices"),
        "advice_v4": extra.get("advice_v4"),
        "lens_grid": extra.get("lens_grid"),
        "social_quotes": extra.get("social_quotes"),
        "assembled_context": context.to_model_safe_prompt_dict(),
        "pattern_key": pattern_cache_key(position_name, sub_type, gender, scores),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "cached": False,
        "status": "ready",
        "mode": mode,
    }


def _apply_ai_content_to_payload(payload: dict[str, Any], ai_content: dict[str, Any]) -> dict[str, Any]:
    payload = dict(payload)
    payload["insights"] = ai_content["insights"]
    payload["ai_content"] = ai_content
    payload["assembledAiContext"] = ai_content.get("assembled_context")
    payload = attach_assembled_context_to_payload(
        payload,
        assemble_mate_context(
            payload,
            module_scores={str(k): float(v) for k, v in (payload.get("dimension_scores") or {}).items()}
            if isinstance(payload.get("dimension_scores"), dict)
            else None,
            task="mate-module-bundle",
            gender=str(payload.get("gender") or "female"),
        ),
    )

    if ai_content.get("reverse"):
        payload["reverse"] = ai_content["reverse"]
    if ai_content.get("observe_slices"):
        payload["observeSlices"] = ai_content["observe_slices"]
    if ai_content.get("advice_v4"):
        payload["adviceV4"] = ai_content["advice_v4"]
    if ai_content.get("lens_grid"):
        payload["lensGrid"] = ai_content["lens_grid"]
    if ai_content.get("social_quotes"):
        payload["socialQuotes"] = ai_content["social_quotes"]
    return payload


def attach_mate_ai_content_to_payload(
    conn: Any,
    attempt_id: str,
    result_payload: dict[str, Any],
    module_scores: dict[str, float] | None,
    *,
    use_ai: bool = False,
    force: bool = False,
    gender: str = "female",
) -> dict[str, Any]:
    payload = dict(result_payload)
    existing = payload.get("ai_content")
    if isinstance(existing, dict) and existing.get("status") == "ready" and not force and not use_ai:
        return payload

    pos = payload.get("positionType") or {}
    position_name = str((pos or {}).get("name") or payload.get("identityCard", {}).get("title") or "择偶定位")
    sub_type = str((payload.get("profileEngine") or {}).get("sub_type") or "default")
    scores = {str(k): float(v) for k, v in (module_scores or {}).items()}
    pkey = pattern_cache_key(position_name, sub_type, gender, scores)

    if not force:
        cached = fetch_pattern_cache(conn, pkey)
        if cached:
            payload = dict(payload)
            if cached.get("reverse"):
                payload["reverse"] = cached["reverse"]
            if cached.get("observe_slices"):
                payload["observeSlices"] = cached["observe_slices"]
            if cached.get("advice_v4"):
                payload["adviceV4"] = cached["advice_v4"]
            if cached.get("lens_grid"):
                payload["lensGrid"] = cached["lens_grid"]
            ai_content = {
                "insights": cached.get("insights") or payload.get("insights") or [],
                "reverse": cached.get("reverse"),
                "observe_slices": cached.get("observe_slices"),
                "advice_v4": cached.get("advice_v4"),
                "lens_grid": cached.get("lens_grid"),
                "assembled_context": payload.get("assembledAiContext") or {},
                "pattern_key": pkey,
                "mode": cached.get("generation_mode") or "cached",
                "cached": True,
                "status": "ready",
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }
            return _apply_ai_content_to_payload(payload, ai_content)

    ai_content = build_mate_ai_content(
        result_payload=payload,
        module_scores=module_scores,
        gender=gender,
        use_ai=use_ai,
    )
    payload = _apply_ai_content_to_payload(payload, ai_content)

    if use_ai and ai_content.get("mode") == "ai":
        save_pattern_cache(
            conn,
            pattern_key=pkey,
            position_name=position_name,
            sub_type=sub_type,
            gender=gender,
            score_pattern=compute_score_pattern(scores, gender),
            ai_content=ai_content,
        )
    return payload


def enhance_mate_ai_for_attempt(
    conn: Any,
    attempt_id: str,
    *,
    use_ai: bool = True,
    force: bool = False,
) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT result_payload, dimension_scores, archetype_gender, test_id
        FROM public.test_attempts
        WHERE id = %s
        """,
        (attempt_id,),
    ).fetchone()
    if not row:
        return None
    payload = row.get("result_payload") or {}
    if not isinstance(payload, dict):
        payload = {}
    existing = payload.get("ai_content") or {}
    if not force and isinstance(existing, dict) and existing.get("mode") == "ai":
        return None
    gender = str(row.get("archetype_gender") or payload.get("gender") or "female")
    return attach_mate_ai_content_to_payload(
        conn,
        attempt_id,
        payload,
        row.get("dimension_scores"),
        use_ai=use_ai,
        force=force,
        gender=gender,
    )
