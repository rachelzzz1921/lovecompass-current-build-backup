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
from app.suite_context import (
    build_suite_profile_context_block,
    build_unbound_context_message,
    extract_suite_dimensions,
    summarize_suite_context,
)

REPORT_PLACEHOLDER_MARKERS = ("正式 AI 深度报告可由后台任务继续生成", "【AI 占位回复】", "【智谱未配置】")


def _looks_like_placeholder(report: str | None) -> bool:
    if not report:
        return True
    return any(marker in report for marker in REPORT_PLACEHOLDER_MARKERS)


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


def summarize_context(attempt: dict[str, Any]) -> dict[str, Any]:
    summary = summarize_suite_context(attempt)
    summary["hasAiReport"] = not _looks_like_placeholder(attempt.get("ai_report"))
    return summary


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
