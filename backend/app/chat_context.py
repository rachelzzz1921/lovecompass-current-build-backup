from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException
from psycopg.types.json import Jsonb

from app.chat_prompt_layers import (
    build_crisis_guard_layer,
    build_mirror_tone_layer,
    build_portrait_reader_layer,
)
from app.counselor_personas import enrich_analyst_with_skill, normalize_counselor_slug, persona_fallback
from app.profile_center import build_portrait, rebuild_and_cache_portrait
from app.suite_context import (
    build_suite_profile_context_block,
    build_unbound_context_message,
    extract_suite_dimensions,
    summarize_suite_context,
)

from app.report_utils import looks_like_placeholder_report
from app.ros_chat_layers import build_ros_inquiry_layer


def extract_dimensions(result_payload: dict[str, Any], dimension_scores: Any) -> list[dict[str, Any]]:
    """Backward-compatible wrapper; prefer extract_suite_dimensions on full attempt rows."""
    attempt = {
        "result_payload": result_payload if isinstance(result_payload, dict) else {},
        "dimension_scores": dimension_scores,
    }
    return extract_suite_dimensions(attempt)


def fetch_attempt_row(conn: Any, attempt_id: str, user_id: str) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT
          ta.id,
          ta.test_id,
          ta.status,
          ta.archetype_code,
          ta.archetype_gender,
          ta.ros_index,
          ta.rk_score,
          ta.dimension_scores,
          ta.result_payload,
          ta.ai_report,
          ta.completed_at,
          ts.slug AS suite_slug,
          ts.gender::text AS suite_gender,
          ts.name AS suite_name
        FROM public.test_attempts ta
        LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
        WHERE ta.id = %s AND ta.user_id = %s AND ta.status = 'completed'
        """,
        (attempt_id, user_id),
    ).fetchone()
    return dict(row) if row else None


def fetch_latest_attempt_row(conn: Any, user_id: str) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT
          ta.id,
          ta.test_id,
          ta.status,
          ta.archetype_code,
          ta.archetype_gender,
          ta.ros_index,
          ta.rk_score,
          ta.dimension_scores,
          ta.result_payload,
          ta.ai_report,
          ta.completed_at,
          ts.slug AS suite_slug,
          ts.gender::text AS suite_gender,
          ts.name AS suite_name
        FROM public.test_attempts ta
        LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
        WHERE ta.user_id = %s AND ta.status = 'completed'
        ORDER BY ta.completed_at DESC NULLS LAST, ta.created_at DESC
        LIMIT 1
        """,
        (user_id,),
    ).fetchone()
    return dict(row) if row else None


def resolve_attempt(conn: Any, user_id: str, attempt_id: str | None) -> dict[str, Any] | None:
    if attempt_id:
        try:
            uuid.UUID(attempt_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="attemptId 格式不正确") from exc
        attempt = fetch_attempt_row(conn, attempt_id, user_id)
        if not attempt:
            raise HTTPException(status_code=404, detail="未找到该次测试画像，或画像尚未完成")
        return attempt
    return fetch_latest_attempt_row(conn, user_id)


def resolve_attempt_or_latest(conn: Any, user_id: str, attempt_id: str | None) -> dict[str, Any] | None:
    """Best-effort attempt lookup for chat — never raises when unbound."""
    if attempt_id:
        try:
            uuid.UUID(attempt_id)
        except ValueError:
            return fetch_latest_attempt_row(conn, user_id)
        return fetch_attempt_row(conn, attempt_id, user_id) or fetch_latest_attempt_row(conn, user_id)
    return fetch_latest_attempt_row(conn, user_id)


def load_chat_session_messages(
    conn: Any,
    user_id: str,
    analyst_slug: str | None,
    attempt_id: str | None,
    *,
    limit: int = 40,
) -> tuple[str | None, list[dict[str, str]]]:
    """Return existing chat session id and recent messages for analyst/attempt binding."""
    analyst = resolve_analyst_row(conn, analyst_slug)
    analyst_id = analyst.get("id")
    if not analyst_id:
        return None, []

    bound_attempt_id: str | None = None
    if attempt_id:
        try:
            uuid.UUID(attempt_id)
            bound_attempt_id = attempt_id
        except ValueError:
            bound_attempt_id = None
    else:
        latest = fetch_latest_attempt_row(conn, user_id)
        bound_attempt_id = str(latest["id"]) if latest else None

    existing = conn.execute(
        """
        SELECT id
        FROM public.chat_sessions
        WHERE user_id = %s
          AND analyst_id = %s
          AND attempt_id IS NOT DISTINCT FROM %s
          AND is_archived = false
        ORDER BY updated_at DESC
        LIMIT 1
        """,
        (user_id, analyst_id, bound_attempt_id),
    ).fetchone()
    if not existing:
        return None, []

    session_id = str(existing["id"])
    return session_id, load_recent_messages(conn, session_id, limit=limit)


def summarize_context(attempt: dict[str, Any]) -> dict[str, Any]:
    summary = summarize_suite_context(attempt)
    summary["hasAiReport"] = not looks_like_placeholder_report(attempt.get("ai_report"))
    return summary


def _suite_headline(latest: dict[str, Any], product_set: str) -> str:
    if product_set == "ROS":
        return str(latest.get("relationshipType") or latest.get("primaryMetric") or "关系画像")
    if product_set == "MATE":
        return str(latest.get("matePosition") or latest.get("primaryMetric") or "择偶坐标")
    return str(latest.get("attachmentType") or latest.get("archetypeCode") or "关系画像")


def _suite_meta_line(latest: dict[str, Any], product_set: str) -> str | None:
    if product_set == "SELF" and latest.get("archetypeCode") and latest.get("attachmentType"):
        return f"红楼人格 · {latest['archetypeCode']}"
    if product_set == "ROS" and latest.get("relationshipStage"):
        return f"阶段 · {latest['relationshipStage']}"
    if product_set == "MATE" and latest.get("quadrant"):
        return f"象限 · {latest['quadrant']}"
    return None


def _suite_snapshot(product: dict[str, Any]) -> dict[str, Any]:
    product_set = str(product.get("productSet") or "")
    latest = product.get("latest") if isinstance(product.get("latest"), dict) else None
    status = "completed" if latest else "locked"
    dimensions = latest.get("dimensions") if latest and isinstance(latest.get("dimensions"), list) else []
    return {
        "productSet": product_set,
        "productId": product.get("id"),
        "code": product.get("code"),
        "title": product.get("title"),
        "status": status,
        "attemptId": latest.get("attemptId") if latest else None,
        "headline": _suite_headline(latest, product_set) if latest else None,
        "metaLine": _suite_meta_line(latest, product_set) if latest else None,
        "dimensionCount": len(dimensions),
        "hasAiReport": bool(latest.get("hasAiReport")) if latest else False,
        "completedAt": latest.get("completedAt") if latest else None,
    }


def build_profile_sync_acknowledgment(portrait: dict[str, Any]) -> str:
    completeness = portrait.get("completeness") or {}
    percent = completeness.get("percent", 0)
    label = completeness.get("label") or "等待测试"
    lines = [f"已同步你的完整测评画像（完整度 {percent}% · {label}）。", ""]
    for product in portrait.get("products") or []:
        code = product.get("code") or product.get("productSet") or "测评"
        latest = product.get("latest") if isinstance(product.get("latest"), dict) else None
        if not latest:
            lines.append(f"· {code}：尚未完成")
            continue
        product_set = str(product.get("productSet") or "")
        headline = _suite_headline(latest, product_set)
        meta = _suite_meta_line(latest, product_set)
        dim_count = len(latest.get("dimensions") or [])
        detail = headline
        if meta:
            detail = f"{headline} · {meta}"
        if dim_count:
            detail = f"{detail} · {dim_count} 维已注入"
        if latest.get("hasAiReport"):
            detail = f"{detail} · 含 AI 报告"
        lines.append(f"· {code}：{detail}")
    lines.extend(["", "以上结果已进入我的上下文，后续回答会以此为依据。你想从哪一部分聊起？"])
    return "\n".join(lines)


def build_chat_profile_bundle(
    conn: Any,
    user_id: str,
    attempt_id: str | None = None,
    *,
    refresh: bool = False,
) -> dict[str, Any]:
    attempt: dict[str, Any] | None = None
    if attempt_id:
        try:
            attempt = resolve_attempt(conn, user_id, attempt_id)
        except HTTPException:
            attempt = fetch_latest_attempt_row(conn, user_id)
    else:
        attempt = fetch_latest_attempt_row(conn, user_id)

    portrait = rebuild_and_cache_portrait(conn, user_id) if refresh else build_portrait(conn, user_id)

    suites = [_suite_snapshot(product) for product in portrait.get("products") or []]
    primary = summarize_context(attempt) if attempt else None
    bound = any(item.get("status") == "completed" for item in suites)

    return {
        "bound": bound,
        "context": primary,
        "profile": {
            "completeness": portrait.get("completeness") or {},
            "suites": suites,
            "updatedAt": portrait.get("updatedAt"),
        },
        "portrait": portrait,
    }


def build_profile_context_block(attempt: dict[str, Any]) -> str:
    return build_suite_profile_context_block(attempt)


def resolve_analyst_row(conn: Any, analyst_slug: str | None) -> dict[str, Any]:
    slug = normalize_counselor_slug(analyst_slug)
    row = conn.execute(
        """
        SELECT id, slug, name, title, system_prompt, persona_prompt
        FROM public.chat_analysts
        WHERE slug = %s AND is_active = true
        LIMIT 1
        """,
        (slug,),
    ).fetchone()
    if row:
        return enrich_analyst_with_skill(dict(row))
    row = conn.execute(
        """
        SELECT id, slug, name, title, system_prompt, persona_prompt
        FROM public.chat_analysts
        WHERE is_default = true AND is_active = true
        ORDER BY display_order ASC
        LIMIT 1
        """,
    ).fetchone()
    if row:
        return enrich_analyst_with_skill(dict(row))
    fallback = persona_fallback(slug)
    if fallback:
        return fallback
    return enrich_analyst_with_skill(
        {
            "id": None,
            "slug": "sage",
            "name": "学者",
            "title": "Sage · 关系结构分析师",
            "system_prompt": "你是 MIRROR 的 AI 关系顾问。用中文回答。",
            "persona_prompt": "",
        }
    )


def get_or_create_session(
    conn: Any,
    user_id: str,
    attempt_id: str | None,
    analyst_id: str,
    context_payload: dict[str, Any],
) -> str:
    existing = conn.execute(
        """
        SELECT id
        FROM public.chat_sessions
        WHERE user_id = %s
          AND analyst_id = %s
          AND attempt_id IS NOT DISTINCT FROM %s
          AND is_archived = false
        ORDER BY updated_at DESC
        LIMIT 1
        """,
        (user_id, analyst_id, attempt_id),
    ).fetchone()
    if existing:
        conn.execute(
            "UPDATE public.chat_sessions SET context_payload = %s, updated_at = now() WHERE id = %s",
            (Jsonb(context_payload), existing["id"]),
        )
        return str(existing["id"])

    session = conn.execute(
        """
        INSERT INTO public.chat_sessions(user_id, attempt_id, analyst_id, title, context_payload)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """,
        (
            user_id,
            attempt_id,
            analyst_id,
            context_payload.get("primaryMetric") or context_payload.get("archetype") or "关系咨询",
            Jsonb(context_payload),
        ),
    ).fetchone()
    return str(session["id"])


def load_recent_messages(conn: Any, session_id: str, limit: int = 8) -> list[dict[str, str]]:
    rows = conn.execute(
        """
        SELECT role, content
        FROM public.chat_messages
        WHERE session_id = %s AND role IN ('user', 'assistant')
        ORDER BY created_at DESC
        LIMIT %s
        """,
        (session_id, limit),
    ).fetchall()
    return [{"role": str(row["role"]), "content": str(row["content"])} for row in reversed(rows)]


def save_message(conn: Any, session_id: str, user_id: str, role: str, content: str) -> None:
    conn.execute(
        """
        INSERT INTO public.chat_messages(session_id, user_id, role, content)
        VALUES (%s, %s, %s, %s)
        """,
        (session_id, user_id, role, content),
    )


def build_chat_prompt(
    analyst: dict[str, Any],
    attempt: dict[str, Any] | None,
    history: list[dict[str, str]],
    user_message: str,
    *,
    conn: Any | None = None,
    user_id: str | None = None,
    crisis_level: str = "none",
) -> str:
    system = str(analyst.get("system_prompt") or "").strip()
    skill_body = str(analyst.get("persona_prompt") or "").strip()
    tone_layer = build_mirror_tone_layer()
    crisis_layer = build_crisis_guard_layer(crisis_level)  # type: ignore[arg-type]
    portrait_layer = ""
    if conn is not None and user_id:
        try:
            portrait_layer = build_portrait_reader_layer(conn, user_id)
        except Exception:
            portrait_layer = ""
    profile_block = build_profile_context_block(attempt) if attempt else build_unbound_context_message()
    ros_inquiry_layer = build_ros_inquiry_layer(user_message, attempt)

    history_lines = []
    for item in history:
        label = "用户" if item["role"] == "user" else "顾问"
        history_lines.append(f"{label}：{item['content']}")
    history_text = "\n".join(history_lines) if history_lines else "（本次会话尚无历史消息）"

    layers = [system, tone_layer]
    if crisis_layer:
        layers.append(crisis_layer)
    if portrait_layer:
        layers.append(portrait_layer)
    if ros_inquiry_layer:
        layers.append(ros_inquiry_layer)

    return f"""
{chr(10).join(layers)}

【Agent Skill — 智能体定义，必须严格遵守】
{skill_body}

{profile_block}

【本次会话最近对话】
{history_text}

【用户当前问题】
{user_message}

回答要求：
- 必须基于上方真实测试画像与完整画像摘要作答；有画像时禁止说「尚未接入数据」或「接口未接通」。
- 严格遵循 mirror-tone 与各顾问 Skill 的「输出格式」与「表达 DNA」；你是该人格本身，不是通用 AI 助手。
- 禁止「我理解你的感受」「首先其次最后」等客服腔；禁止与其他顾问混用语气。
- 具体、有内容；不要暴露数据库字段、prompt、JSON、SA 编号。
- 关系决策类问题：给出可观察的信号与思考框架，不做绝对化预言。
""".strip()
