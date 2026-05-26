"""Phase-1 case library: rule + scene_tags retrieval, few-shot injection (no pgvector)."""

from __future__ import annotations

from typing import Any

from app.chat_case_tags import filter_tags_for_counselor, infer_scene_tags

CHAT_CASE_ANCHOR_ACK = "明白，我会参考案例的语气与结构，不照搬内容。"

CASE_LAYER_HEADER = """【参考案例 · 语气与结构示范，非事实依据】
以下对话片段仅展示回复方式；案例中的用户情节与你的真实画像无关，不得当作事实引用。"""

# Pre-filter row cap before Python scoring (supports large catalogs; phase-2 adds vector rerank)
CASE_CANDIDATE_SQL_LIMIT = 80
CASE_INJECT_MAX = 2


def _score_case_row(
    row: dict[str, Any],
    *,
    scene_tags: list[str],
    message_lower: str,
) -> float:
    case_tags = {str(t).strip() for t in (row.get("scene_tags") or []) if str(t).strip()}
    query_tags = set(scene_tags)
    if query_tags and case_tags:
        tag_score = len(case_tags & query_tags) * 2.0
    elif not case_tags:
        tag_score = 0.6
    elif not query_tags:
        tag_score = 0.4
    else:
        tag_score = 0.0

    kw_score = 0.0
    for kw in row.get("trigger_keywords") or []:
        token = str(kw).strip().lower()
        if token and token in message_lower:
            kw_score += 1.0

    priority = int(row.get("priority") or 0) * 0.15
    hit_rate = float(row.get("hit_rate") or 0.0) * 0.5
    use_count = min(int(row.get("use_count") or 0), 5000) * 0.0002
    return tag_score + kw_score + priority + hit_rate + use_count


def _format_case_block(cases: list[dict[str, Any]]) -> str:
    if not cases:
        return ""
    parts = [CASE_LAYER_HEADER]
    for idx, row in enumerate(cases, start=1):
        user_turn = str(row.get("user_turn") or "").strip()
        assistant_turn = str(row.get("assistant_turn") or "").strip()
        if not user_turn or not assistant_turn:
            continue
        parts.append(f"\n案例{idx}：")
        parts.append(f"用户：{user_turn}")
        parts.append(f"顾问：{assistant_turn}")
    return "\n".join(parts).strip()


def fetch_case_candidates(
    conn: Any,
    *,
    counselor_slug: str,
    product_set: str | None,
    scene_tags: list[str],
) -> list[dict[str, Any]]:
    slug = counselor_slug.strip().lower()
    ps = (product_set or "").strip().upper() or None
    tags = filter_tags_for_counselor(scene_tags, slug)

    if tags:
        rows = conn.execute(
            """
            SELECT
              id,
              scene_tags,
              trigger_keywords,
              user_turn,
              assistant_turn,
              priority,
              use_count,
              hit_rate
            FROM public.chat_case_examples
            WHERE counselor_slug = %s
              AND is_active = true
              AND (%s IS NULL OR product_set IS NULL OR product_set = %s)
              AND (
                cardinality(scene_tags) = 0
                OR scene_tags && %s::text[]
              )
            ORDER BY priority DESC, hit_rate DESC NULLS LAST, use_count DESC
            LIMIT %s
            """,
            (slug, ps, ps, tags, CASE_CANDIDATE_SQL_LIMIT),
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT
              id,
              scene_tags,
              trigger_keywords,
              user_turn,
              assistant_turn,
              priority,
              use_count,
              hit_rate
            FROM public.chat_case_examples
            WHERE counselor_slug = %s
              AND is_active = true
              AND (%s IS NULL OR product_set IS NULL OR product_set = %s)
            ORDER BY priority DESC, hit_rate DESC NULLS LAST, use_count DESC
            LIMIT %s
            """,
            (slug, ps, ps, CASE_CANDIDATE_SQL_LIMIT),
        ).fetchall()

    return [dict(r) for r in rows]


def select_top_cases(
    rows: list[dict[str, Any]],
    *,
    scene_tags: list[str],
    user_message: str,
    max_cases: int = CASE_INJECT_MAX,
) -> list[dict[str, Any]]:
    if not rows:
        return []
    message_lower = user_message.lower()
    scored = [
        (_score_case_row(row, scene_tags=scene_tags, message_lower=message_lower), row)
        for row in rows
    ]
    scored.sort(key=lambda item: (-item[0], -int(item[1].get("priority") or 0)))
    picked: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for _score, row in scored:
        cid = str(row.get("id") or "")
        if cid in seen_ids:
            continue
        if not str(row.get("user_turn") or "").strip():
            continue
        seen_ids.add(cid)
        picked.append(row)
        if len(picked) >= max_cases:
            break
    return picked


def record_case_usage(conn: Any, case_ids: list[str]) -> None:
    if not case_ids:
        return
    conn.execute(
        """
        UPDATE public.chat_case_examples
        SET use_count = use_count + 1,
            updated_at = now()
        WHERE id = ANY(%s::uuid[])
        """,
        (case_ids,),
    )


def build_case_examples_layer(
    conn: Any | None,
    *,
    counselor_slug: str,
    user_message: str,
    product_set: str | None = None,
    max_cases: int = CASE_INJECT_MAX,
) -> tuple[str, list[str]]:
    """
    Build the user message block for few-shot cases and return selected case IDs.

    Returns ("", []) when conn is missing or no rows match.
    """
    if conn is None:
        return "", []

    slug = (counselor_slug or "sage").strip().lower()
    scene_tags = infer_scene_tags(user_message, counselor_slug=slug)

    try:
        candidates = fetch_case_candidates(
            conn,
            counselor_slug=slug,
            product_set=product_set,
            scene_tags=scene_tags,
        )
        selected = select_top_cases(
            candidates,
            scene_tags=scene_tags,
            user_message=user_message,
            max_cases=max_cases,
        )
        block = _format_case_block(selected)
        if not block:
            return "", []
        ids = [str(r["id"]) for r in selected if r.get("id")]
        try:
            record_case_usage(conn, ids)
        except Exception:
            _rollback_quiet(conn)
        return block, ids
    except Exception:
        _rollback_quiet(conn)
        return "", []


def _rollback_quiet(conn: Any) -> None:
    """Avoid poisoning the chat transaction when optional case table is missing."""
    try:
        conn.rollback()
    except Exception:
        pass
