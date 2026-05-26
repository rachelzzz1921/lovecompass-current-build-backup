"""Shared DB helpers for attempt submission."""

from __future__ import annotations

from typing import Any

from psycopg.types.json import Jsonb

from app.db import get_conn
from app.profile_center import rebuild_and_cache_portrait


def batch_insert_attempt_answers(
    conn: Any,
    attempt_id: Any,
    questions: list[dict[str, Any]],
    answer_by_external: dict[str, dict[str, Any]],
    numeric_map: dict[str, float],
) -> None:
    if not questions:
        return
    rows = [
        (
            attempt_id,
            q["id"],
            q["external_question_id"],
            Jsonb(answer_by_external[q["external_question_id"]]),
            numeric_map.get(q["external_question_id"]),
            q["dimension_code"],
        )
        for q in questions
    ]
    conn.executemany(
        """
        INSERT INTO public.test_attempt_answers(
          attempt_id, question_id, external_question_id, answer_payload, numeric_score, dimension_code
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        rows,
    )


def rebuild_portrait_background(user_id: str) -> None:
    try:
        with get_conn() as conn:
            rebuild_and_cache_portrait(conn, user_id)
            conn.commit()
    except Exception:
        return
