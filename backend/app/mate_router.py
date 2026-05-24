from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.auth import resolve_user_id
from app.db import get_conn
from app.mate_scoring import is_mate_suite

router = APIRouter(prefix="/mate", tags=["mate"])


def _fetch_attempt(conn: Any, attempt_id: uuid.UUID, user_id: str) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT ta.*, ts.slug AS suite_slug, ts.gender::text AS suite_gender
        FROM public.test_attempts ta
        LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
        WHERE ta.id = %s AND ta.user_id = %s
        """,
        (attempt_id, user_id),
    ).fetchone()
    return dict(row) if row else None


@router.get("/attempts/{attempt_id}/single")
def get_mate_single_result(attempt_id: str, user_id: str = Depends(resolve_user_id)):
    try:
        attempt_uuid = uuid.UUID(attempt_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="attemptId 格式不正确") from exc

    with get_conn() as conn:
        attempt = _fetch_attempt(conn, attempt_uuid, user_id)
        if not attempt:
            raise HTTPException(status_code=404, detail="测评结果不存在")
        if not is_mate_suite(attempt.get("suite_slug")):
            raise HTTPException(status_code=400, detail="该记录不是 MATE 择偶测评")

        payload = attempt.get("result_payload") or {}

    single = payload if isinstance(payload, dict) else {}
    return {
        "ok": True,
        "attemptId": attempt_id,
        "single": single,
        "gender": attempt.get("suite_gender") or single.get("gender"),
    }
