"""Shared DB helpers for attempt submission."""

from __future__ import annotations

import json
from typing import Any

from psycopg.types.json import Jsonb

from app.db import get_conn
from app.profile_center import rebuild_and_cache_portrait
from app.scoring import answer_to_numeric

_QUESTION_SELECT = """
SELECT
  tq.id,
  tq.external_question_id,
  tq.dimension_code,
  tq.question_type,
  tq.question_text,
  tq.question_payload,
  tq.scoring_payload,
  tq.weight,
  tq.direction
FROM public.test_questions tq
WHERE tq.suite_id = %s AND tq.is_active = true
ORDER BY tq.display_order ASC
"""


def parse_stored_answers(raw: Any) -> dict[str, dict[str, Any]]:
    """Map external_question_id → answer_payload from test_attempts.answers JSONB."""
    by_external: dict[str, dict[str, Any]] = {}
    if not raw:
        return by_external
    if isinstance(raw, str):
        try:
            raw = json.loads(raw)
        except json.JSONDecodeError:
            return by_external
    if not isinstance(raw, list):
        return by_external
    for item in raw:
        if not isinstance(item, dict):
            continue
        ext = str(item.get("externalId") or item.get("external_question_id") or "").strip()
        if not ext:
            continue
        payload = item.get("answerPayload") or item.get("answer_payload") or {}
        by_external[ext] = payload if isinstance(payload, dict) else {}
    return by_external


def attempt_answers_exist(conn: Any, attempt_id: Any) -> bool:
    row = conn.execute(
        "SELECT 1 FROM public.test_attempt_answers WHERE attempt_id = %s LIMIT 1",
        (attempt_id,),
    ).fetchone()
    return bool(row)


def materialize_answer_rows_from_attempt(conn: Any, attempt_id: str) -> list[dict[str, Any]]:
    """Build answer rows (same shape as test_attempt_answers JOIN) from attempt.answers JSONB."""
    row = conn.execute(
        "SELECT answers, suite_id FROM public.test_attempts WHERE id = %s",
        (attempt_id,),
    ).fetchone()
    if not row or not row.get("suite_id"):
        return []

    answer_by_external = parse_stored_answers(row.get("answers"))
    if not answer_by_external:
        return []

    questions = conn.execute(_QUESTION_SELECT, (row["suite_id"],)).fetchall()
    out: list[dict[str, Any]] = []
    for q in questions:
        ext = q["external_question_id"]
        if ext not in answer_by_external:
            continue
        payload = answer_by_external[ext]
        qdict = dict(q)
        out.append(
            {
                "external_question_id": ext,
                "answer_payload": payload,
                "numeric_score": answer_to_numeric(qdict, payload),
                "dimension_code": q.get("dimension_code"),
                "question_type": q.get("question_type"),
                "question_text": q.get("question_text"),
                "question_payload": q.get("question_payload"),
                "scoring_payload": q.get("scoring_payload"),
                "weight": q.get("weight"),
                "direction": q.get("direction"),
            }
        )
    return out


def bulk_insert_attempt_answers(
    conn: Any,
    attempt_id: Any,
    questions: list[dict[str, Any]],
    answer_by_external: dict[str, dict[str, Any]],
    numeric_map: dict[str, float] | None = None,
) -> None:
    if not questions:
        return

    attempt_ids: list[Any] = []
    question_ids: list[Any] = []
    external_ids: list[str] = []
    payloads: list[Jsonb] = []
    numerics: list[float | None] = []
    dimensions: list[str | None] = []

    for q in questions:
        ext = q["external_question_id"]
        if ext not in answer_by_external:
            continue
        qdict = dict(q)
        attempt_ids.append(attempt_id)
        question_ids.append(q["id"])
        external_ids.append(ext)
        payloads.append(Jsonb(answer_by_external[ext]))
        numeric = numeric_map.get(ext) if numeric_map else None
        if numeric is None:
            numeric = answer_to_numeric(qdict, answer_by_external[ext])
        numerics.append(float(numeric) if numeric is not None else None)
        dimensions.append(q.get("dimension_code"))

    if not attempt_ids:
        return

    conn.execute(
        """
        INSERT INTO public.test_attempt_answers(
          attempt_id, question_id, external_question_id, answer_payload, numeric_score, dimension_code
        )
        SELECT * FROM UNNEST(
          %s::uuid[],
          %s::uuid[],
          %s::text[],
          %s::jsonb[],
          %s::numeric[],
          %s::text[]
        )
        ON CONFLICT (attempt_id, question_id) DO NOTHING
        """,
        (attempt_ids, question_ids, external_ids, payloads, numerics, dimensions),
    )


def persist_attempt_answers_for_attempt(conn: Any, attempt_id: str) -> None:
    """Idempotent: write test_attempt_answers from test_attempts.answers (deferred from POST)."""
    if attempt_answers_exist(conn, attempt_id):
        return
    row = conn.execute(
        "SELECT answers, suite_id FROM public.test_attempts WHERE id = %s",
        (attempt_id,),
    ).fetchone()
    if not row or not row.get("suite_id"):
        return
    answer_by_external = parse_stored_answers(row.get("answers"))
    if not answer_by_external:
        return
    questions = conn.execute(_QUESTION_SELECT, (row["suite_id"],)).fetchall()
    bulk_insert_attempt_answers(conn, attempt_id, questions, answer_by_external)


def batch_insert_attempt_answers(
    conn: Any,
    attempt_id: Any,
    questions: list[dict[str, Any]],
    answer_by_external: dict[str, dict[str, Any]],
    numeric_map: dict[str, float],
) -> None:
    bulk_insert_attempt_answers(conn, attempt_id, questions, answer_by_external, numeric_map)


def rebuild_portrait_background(user_id: str) -> None:
    try:
        with get_conn() as conn:
            rebuild_and_cache_portrait(conn, user_id)
            conn.commit()
    except Exception:
        return
