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
from app.chat_injection import (
    ChatInjectionState,
    load_portrait_bundle,
    portrait_has_completed_tests,
    profile_ready_requirement,
)
from app.profile_center import load_portrait_for_chat
from app.suite_context import (
    build_suite_profile_context_block,
    build_unbound_context_message,
    extract_suite_dimensions,
    summarize_suite_context,
)

from app.report_utils import looks_like_placeholder_report
from app.chat_case_library import CHAT_CASE_ANCHOR_ACK, build_case_examples_layer
from app.ros_chat_layers import build_ros_inquiry_layer
from app.suite_context import resolve_attempt_product_set


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
    """Chat 链路专用：无效或缺失 attemptId 时回退到最近一次完成测评，避免对话中断。"""
    if attempt_id:
        try:
            uuid.UUID(attempt_id)
        except ValueError:
            return fetch_latest_attempt_row(conn, user_id)
        return fetch_attempt_row(conn, attempt_id, user_id) or fetch_latest_attempt_row(conn, user_id)
    return fetch_latest_attempt_row(conn, user_id)


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
            attempt = resolve_attempt_or_latest(conn, user_id, attempt_id)
        except HTTPException:
            attempt = fetch_latest_attempt_row(conn, user_id)
    else:
        attempt = fetch_latest_attempt_row(conn, user_id)

    portrait = load_portrait_for_chat(conn, user_id, refresh=refresh)

    suites = [_suite_snapshot(product) for product in portrait.get("products") or []]
    primary = summarize_context(attempt) if attempt else None
    if primary is None and any(item.get("status") == "completed" for item in suites):
        latest = fetch_latest_attempt_row(conn, user_id)
        if latest:
            primary = summarize_context(latest)
            attempt = attempt or latest
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


def _portrait_has_completed_tests(portrait: dict[str, Any]) -> bool:
    for product in portrait.get("products") or []:
        if isinstance(product.get("latest"), dict):
            return True
    return False


def build_portrait_aggregate_profile_block(portrait: dict[str, Any]) -> str:
    """无单套 attempt 绑定时，用跨套 portrait 作为 profile_block（与 portrait-reader 层一致）。"""
    completeness = portrait.get("completeness") or {}
    lines = [
        "【用户已完成的真实测试画像 — 跨套汇总 · 必须作为回答依据】",
        f"画像完整度：{completeness.get('percent', 0)}% · {completeness.get('label', '等待测试')}",
        "以下各套均为真实测评结果；回答时综合引用，勿说「尚未接入数据」。",
        "",
    ]
    for product in portrait.get("products") or []:
        latest = product.get("latest") if isinstance(product.get("latest"), dict) else None
        code = product.get("code") or product.get("productSet") or "测评"
        if not latest:
            lines.append(f"· {code}：尚未完成")
            continue
        product_set = str(product.get("productSet") or "")
        headline = _suite_headline(latest, product_set)
        meta = _suite_meta_line(latest, product_set)
        dim_count = len(latest.get("dimensions") or [])
        detail = headline
        if meta:
            detail = f"{detail} · {meta}"
        if dim_count:
            detail = f"{detail} · {dim_count} 维"
        if latest.get("hasAiReport"):
            detail = f"{detail} · 含 AI 报告"
        lines.append(f"· {code}：{detail}")
    return "\n".join(lines)


def build_effective_profile_block(
    conn: Any,
    user_id: str,
    attempt: dict[str, Any] | None,
    *,
    portrait: dict[str, Any] | None = None,
) -> str:
    if attempt:
        return build_profile_context_block(attempt)
    portrait_data = portrait
    if portrait_data is None and conn is not None:
        portrait_data = load_portrait_for_chat(conn, user_id)
    if portrait_data and _portrait_has_completed_tests(portrait_data):
        return build_portrait_aggregate_profile_block(portrait_data)
    return build_unbound_context_message()


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


def find_session(
    conn: Any,
    user_id: str,
    attempt_id: str | None,
    analyst_id: str,
) -> str | None:
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
    return str(existing["id"]) if existing else None


def load_chat_session_messages(
    conn: Any,
    user_id: str,
    analyst_slug: str | None,
    attempt_id: str | None,
    *,
    limit: int = 40,
) -> tuple[str | None, list[dict[str, str]]]:
    """读取已有会话消息（不创建新会话）；无 DB 分析师行时返回空历史。"""
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

    session_id = find_session(conn, user_id, bound_attempt_id, str(analyst_id))
    if not session_id:
        return None, []

    rows = load_recent_messages(conn, session_id, limit=limit)
    mapped: list[dict[str, str]] = []
    for row in rows:
        role = str(row.get("role") or "user")
        if role == "assistant":
            role = "ai"
        elif role != "user":
            role = "user"
        content = str(row.get("content") or "").strip()
        if content:
            mapped.append({"role": role, "content": content})
    return session_id, mapped


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


CHAT_PROFILE_DETAIL_ACK = "明白，当前测评详情已记录，我不会直接复读，会在需要时织入。"

CHAT_ANSWER_REQUIREMENTS = """【本轮回答要求】
- 严格保持当前顾问人格，不混用其他顾问风格
- 有画像时至少织入一条具体画像线索作为依据（自然语言，不暴露字段名）
- 不给关系结果的绝对判断
- 如用户问题简短（少于 20 字）或情绪激动，可省略完整输出结构
- 禁止以「我理解你的感受」「作为 AI 我……」「首先其次最后」开头"""

def _profile_anchor_ack(bound_product_set: str | None, has_portrait: bool, has_profile: bool) -> str:
    if has_profile and bound_product_set:
        from app.chat_prompt_layers import _suite_label

        label = _suite_label(bound_product_set)
        if has_portrait:
            return (
                f"好的，我已了解你在 {label} 的画像，以及其他套件的摘要线索。"
                "后续回答会严格依据上述测评结果。"
            )
        return f"好的，我已了解你在 {label} 的画像。后续回答会严格依据上述测评结果。"
    if has_portrait:
        return "好的，我已了解你目前的综合画像摘要。后续回答会严格依据上述测评结果。"
    return "好的，我们直接聊。"


def build_chat_messages(
    analyst: dict[str, Any],
    attempt: dict[str, Any] | None,
    history: list[dict[str, str]],
    user_message: str,
    *,
    conn: Any | None = None,
    user_id: str | None = None,
    crisis_level: str = "none",
) -> tuple[list[dict[str, str]], ChatInjectionState]:
    """OpenAI 多轮 messages：system 锁人格，画像锚定，历史多轮，末条 user 为当前问题。"""
    system = str(analyst.get("system_prompt") or "").strip()
    skill_body = str(analyst.get("persona_prompt") or "").strip()
    tone_layer = build_mirror_tone_layer()
    crisis_layer = build_crisis_guard_layer(crisis_level)  # type: ignore[arg-type]
    ros_inquiry_layer = build_ros_inquiry_layer(user_message, attempt)

    portrait, bound_product_set = load_portrait_bundle(conn, user_id or "", attempt)

    portrait_layer = ""
    if conn is not None and user_id:
        try:
            if attempt and bound_product_set:
                portrait_layer = build_portrait_reader_layer(
                    conn,
                    user_id,
                    exclude_product_set=bound_product_set,
                    portrait=portrait,
                )
            else:
                portrait_layer = build_portrait_reader_layer(
                    conn, user_id, portrait=portrait
                )
        except Exception:
            portrait_layer = ""

    if conn is not None and user_id:
        profile_block = build_effective_profile_block(
            conn, user_id, attempt, portrait=portrait
        )
    elif attempt:
        profile_block = build_profile_context_block(attempt)
    else:
        profile_block = build_unbound_context_message()

    system_parts = [system, tone_layer]
    if crisis_layer:
        system_parts.append(crisis_layer)
    if skill_body:
        system_parts.append(f"【Agent Skill — 智能体定义，必须严格遵守】\n{skill_body}")
    system_content = "\n\n".join(p for p in system_parts if p and p.strip())

    messages: list[dict[str, str]] = [{"role": "system", "content": system_content}]

    has_portrait = bool(portrait_layer.strip())
    has_profile = bool(profile_block.strip())

    if has_portrait:
        messages.append({"role": "user", "content": portrait_layer})
        messages.append(
            {
                "role": "assistant",
                "content": _profile_anchor_ack(bound_product_set, True, False),
            }
        )

    if has_profile:
        messages.append({"role": "user", "content": profile_block})
        messages.append({"role": "assistant", "content": CHAT_PROFILE_DETAIL_ACK})
    elif not has_portrait and not attempt:
        messages.append({"role": "assistant", "content": _profile_anchor_ack(None, False, False)})

    counselor_slug = str(analyst.get("slug") or "sage").strip().lower()
    case_layer, _case_ids = build_case_examples_layer(
        conn,
        counselor_slug=counselor_slug,
        user_message=user_message,
        product_set=bound_product_set,
    )
    if case_layer:
        messages.append({"role": "user", "content": case_layer})
        messages.append({"role": "assistant", "content": CHAT_CASE_ANCHOR_ACK})

    for item in history:
        role = str(item.get("role") or "user")
        if role not in ("user", "assistant"):
            role = "user"
        content = str(item.get("content") or "").strip()
        if content:
            messages.append({"role": role, "content": content})

    final_user_parts: list[str] = []
    if ros_inquiry_layer:
        final_user_parts.append(ros_inquiry_layer)
    final_user_parts.append(user_message.strip())
    injection = ChatInjectionState(
        has_portrait_layer=has_portrait,
        has_profile_block=has_profile,
        has_completed_tests=portrait_has_completed_tests(portrait),
        bound_product_set=bound_product_set,
    )
    final_user_parts.append(
        CHAT_ANSWER_REQUIREMENTS + profile_ready_requirement(injection)
    )
    messages.append({"role": "user", "content": "\n\n".join(final_user_parts)})

    return messages, injection


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
    """Deprecated：单条 prompt 拼接，仅供调试；生产路径用 build_chat_messages。"""
    parts = []
    messages, _injection = build_chat_messages(
        analyst,
        attempt,
        history,
        user_message,
        conn=conn,
        user_id=user_id,
        crisis_level=crisis_level,
    )
    for item in messages:
        parts.append(f"[{item['role']}]\n{item['content']}")
    return "\n\n---\n\n".join(parts)
