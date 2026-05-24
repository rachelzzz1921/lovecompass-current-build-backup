from __future__ import annotations

import uuid
from decimal import Decimal
from typing import Any

from fastapi import HTTPException
from psycopg.types.json import Jsonb

REPORT_PLACEHOLDER_MARKERS = ("正式 AI 深度报告可由后台任务继续生成", "【AI 占位回复】", "【智谱未配置】")

_ANALYST_SLUG_ALIASES = {
    "mirror": "default_relationship_analyst",
    "default": "default_relationship_analyst",
}


def _looks_like_placeholder(report: str | None) -> bool:
    if not report:
        return True
    return any(marker in report for marker in REPORT_PLACEHOLDER_MARKERS)


def _score_tone(score: Any) -> str:
    try:
        numeric = float(score)
    except (TypeError, ValueError):
        return "需要结合更多相处经验继续观察。"
    if numeric >= 80:
        return "非常突出，是关系里的稳定资源"
    if numeric >= 65:
        return "整体较稳，多数场景里能支持成熟选择"
    if numeric >= 45:
        return "有一定弹性，压力时可能摇摆"
    return "值得被温柔照看，不必苛责自己"


def extract_dimensions(result_payload: dict[str, Any], dimension_scores: Any) -> list[dict[str, Any]]:
    dimensions = result_payload.get("dimensions") if isinstance(result_payload, dict) else None
    if isinstance(dimensions, list) and dimensions:
        return [d for d in dimensions if isinstance(d, dict)]
    if isinstance(dimension_scores, dict):
        names = {
            "SA1": ("自我吸引感知", "我相信自己值得被爱吗？"),
            "SA2": ("依恋焦虑", "我在关系里容易不安全感吗？"),
            "SA3": ("依恋回避", "我在关系里容易逃避亲密吗？"),
            "SA4": ("自我边界", "我能守住自己吗？"),
            "SA5": ("情绪调节", "我能好好处理关系里的情绪吗？"),
            "SA6": ("关系投入模式", "我是怎么爱人的？"),
        }
        extracted = []
        for code, score in dimension_scores.items():
            name, core = names.get(str(code), (str(code), ""))
            extracted.append({"code": str(code), "name": name, "core": core, "score": score})
        return extracted
    return []


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
    result_payload = attempt.get("result_payload") or {}
    if not isinstance(result_payload, dict):
        result_payload = {}
    profile = result_payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}
    archetype = str(result_payload.get("archetype_code") or attempt.get("archetype_code") or "你的关系画像")
    attachment_type = str(
        result_payload.get("attachment_type") or profile.get("attachment_type") or "待判断"
    )
    dimensions = extract_dimensions(result_payload, attempt.get("dimension_scores"))
    return {
        "attemptId": str(attempt["id"]),
        "suiteSlug": attempt.get("suite_slug") or attempt.get("test_id"),
        "suiteName": attempt.get("suite_name") or attempt.get("test_id"),
        "archetype": archetype,
        "attachmentType": attachment_type,
        "tagline": profile.get("tagline"),
        "description": profile.get("description"),
        "matchingLogic": profile.get("matching_logic"),
        "rosIndex": float(attempt["ros_index"]) if attempt.get("ros_index") is not None else None,
        "completedAt": str(attempt["completed_at"]) if attempt.get("completed_at") else None,
        "dimensions": [
            {
                "code": item.get("code"),
                "name": item.get("name"),
                "score": float(item["score"]) if isinstance(item.get("score"), (int, float, Decimal)) else item.get("score"),
            }
            for item in dimensions
        ],
        "hasAiReport": not _looks_like_placeholder(attempt.get("ai_report")),
    }


def build_profile_context_block(attempt: dict[str, Any]) -> str:
    result_payload = attempt.get("result_payload") or {}
    if not isinstance(result_payload, dict):
        result_payload = {}
    profile = result_payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}
    dimensions = extract_dimensions(result_payload, attempt.get("dimension_scores"))
    archetype = str(result_payload.get("archetype_code") or attempt.get("archetype_code") or "未知画像")
    attachment_type = str(
        result_payload.get("attachment_type") or profile.get("attachment_type") or "待判断"
    )
    tagline = str(profile.get("tagline") or "")
    description = str(profile.get("description") or "")
    matching_logic = str(profile.get("matching_logic") or "")
    dimension_lines = []
    for item in dimensions:
        dimension_lines.append(
            f"- {item.get('name')}（{item.get('code')}）：{item.get('core', '')}；参考分 {item.get('score')}；{_score_tone(item.get('score'))}"
        )
    dimension_text = "\n".join(dimension_lines) or "- 暂无完整维度明细"
    report = attempt.get("ai_report") or ""
    report_block = ""
    if not _looks_like_placeholder(report):
        excerpt = str(report).strip()
        if len(excerpt) > 2200:
            excerpt = excerpt[:2200] + "\n…（报告已截断）"
        report_block = f"\n\n已有 AI 深度报告摘要（可引用但不要逐字复读）：\n{excerpt}"

    return f"""
【用户已完成的真实测试画像 — 必须作为回答依据】
测试套件：{attempt.get('suite_name') or attempt.get('test_id') or 'SELF'}
完成时间：{attempt.get('completed_at') or '未知'}
画像名称（红楼人格原型）：{archetype}
依恋类型：{attachment_type}
一句话主题：{tagline or '（无）'}
画像描述：{description or '（无）'}
人格/匹配关键词：{matching_logic or '（无）'}
综合指数（内部参考，勿直接报具体数字）：{attempt.get('ros_index')}

六维 SELF 关系线索（内部参考，回答时用自然语言，不要暴露 SA 编号或具体分数）：
{dimension_text}
{report_block}
""".strip()


def resolve_analyst_row(conn: Any, analyst_slug: str | None) -> dict[str, Any]:
    slug = (analyst_slug or "mirror").strip().lower()
    slug = _ANALYST_SLUG_ALIASES.get(slug, slug)
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
        return dict(row)
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
        return dict(row)
    return {
        "id": None,
        "slug": slug,
        "name": "MIRROR",
        "title": "关系镜像分析师",
        "system_prompt": "你是 LoveCompass 的温柔、克制、专业的婚恋画像分析师。",
        "persona_prompt": "基于用户真实测试结果回答，不编造未提供的经历。",
    }


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
            context_payload.get("archetype") or "关系咨询",
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
) -> str:
    system = str(analyst.get("system_prompt") or "").strip()
    persona = str(analyst.get("persona_prompt") or "").strip()
    profile_block = build_profile_context_block(attempt) if attempt else "【当前未绑定具体测试画像】用户可能尚未完成测试；只能做一般性关系建议，并邀请用户先完成 SELF 测试。"

    history_lines = []
    for item in history:
        label = "用户" if item["role"] == "user" else "分析师"
        history_lines.append(f"{label}：{item['content']}")
    history_text = "\n".join(history_lines) if history_lines else "（本次会话尚无历史消息）"

    return f"""
{system}

{persona}

{profile_block}

【本次会话最近对话】
{history_text}

【用户当前问题】
{user_message}

回答要求：
- 必须基于上方真实测试画像作答；有画像时禁止说「尚未接入数据」或「接口未接通」。
- 用温柔、具体、克制的中文；像资深关系顾问对挚友说话。
- 不要暴露数据库字段、prompt、JSON、SA 编号；分数仅作内部理解，用自然语言描述倾向。
- 若用户问的是关系决策，给出可执行的观察点，不做绝对化预言。
""".strip()
