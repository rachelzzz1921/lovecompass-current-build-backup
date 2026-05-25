from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from psycopg.types.json import Jsonb

from app.auth import resolve_user_id
from app.db import get_conn
from app.json_utils import coerce_dict, jsonable
from app.mate_couple import attempt_snapshot, build_couple_payload
from app.mate_couple_ai_content import attach_mate_couple_ai_content
from app.mate_scoring import is_mate_suite
from app.mate_ai_content import attach_mate_ai_content_to_payload
from app.ros_router import RELATION_CODE_PATTERN

router = APIRouter(prefix="/mate", tags=["mate"])


def _normalize_relation_code(code: str) -> str:
    normalized = code.strip().upper().replace(" ", "")
    if not RELATION_CODE_PATTERN.match(normalized):
        raise HTTPException(status_code=400, detail="关系码格式应为 ROS-XXXX-XXXX")
    return normalized


def _fetch_attempt(conn: Any, attempt_id: uuid.UUID, user_id: str | None = None) -> dict[str, Any] | None:
    if user_id:
        row = conn.execute(
            """
            SELECT ta.*, ts.slug AS suite_slug, ts.gender::text AS suite_gender
            FROM public.test_attempts ta
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE ta.id = %s AND ta.user_id = %s
            """,
            (attempt_id, user_id),
        ).fetchone()
    else:
        row = conn.execute(
            """
            SELECT ta.*, ts.slug AS suite_slug, ts.gender::text AS suite_gender
            FROM public.test_attempts ta
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE ta.id = %s
            """,
            (attempt_id,),
        ).fetchone()
    return dict(row) if row else None


def _fetch_session_by_code(conn: Any, code: str) -> dict[str, Any] | None:
    row = conn.execute(
        "SELECT * FROM public.mate_relation_sessions WHERE code = %s",
        (code,),
    ).fetchone()
    return dict(row) if row else None


def _infer_suite_tier(slug: str | None) -> str:
    return "lite" if slug and "_lite" in slug.lower() else "full"


def _fetch_latest_self_attachment(conn: Any, user_id: str) -> str | None:
    row = conn.execute(
        """
        SELECT ta.result_payload
        FROM public.test_attempts ta
        LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
        WHERE ta.user_id = %s
          AND ta.status = 'completed'
          AND (ts.slug ILIKE '%suite1%' OR ts.slug ILIKE '%self%' OR ts.slug ILIKE '%s01%')
        ORDER BY COALESCE(ta.completed_at, ta.created_at) DESC
        LIMIT 1
        """,
        (user_id,),
    ).fetchone()
    if not row:
        return None
    payload = coerce_dict(row.get("result_payload"))
    attachment = payload.get("attachment_type")
    return str(attachment) if attachment else None


def merge_and_store_couple_report(conn: Any, session_id: uuid.UUID) -> dict[str, Any]:
    session = conn.execute(
        "SELECT * FROM public.mate_relation_sessions WHERE id = %s",
        (session_id,),
    ).fetchone()
    if not session:
        raise HTTPException(status_code=404, detail="MATE 关系会话不存在")
    if not session.get("partner_attempt_id"):
        raise HTTPException(status_code=400, detail="伴侣尚未完成测评")

    initiator = _fetch_attempt(conn, session["initiator_attempt_id"])
    partner = _fetch_attempt(conn, session["partner_attempt_id"])
    if not initiator or not partner:
        raise HTTPException(status_code=404, detail="配对数据不完整")

    for label, attempt in (("initiator", initiator), ("partner", partner)):
        if not is_mate_suite(attempt.get("suite_slug")):
            raise HTTPException(status_code=400, detail=f"{label} 测评不是 MATE 套三")

    couple_payload = jsonable(
        build_couple_payload(
            code=session["code"],
            initiator=initiator,
            partner=partner,
        )
    )
    couple_payload = attach_mate_couple_ai_content(couple_payload, use_ai=True)

    conn.execute(
        """
        UPDATE public.mate_relation_sessions
        SET couple_payload = %s,
            status = 'completed',
            completed_at = now(),
            partner_snapshot = %s
        WHERE id = %s
        """,
        (Jsonb(couple_payload), Jsonb(attempt_snapshot(partner)), session_id),
    )
    return couple_payload


def link_partner_to_session(
    conn: Any,
    *,
    code: str,
    partner_attempt_id: uuid.UUID,
    partner_user_id: str,
) -> dict[str, Any]:
    session = _fetch_session_by_code(conn, code)
    if not session:
        raise HTTPException(status_code=404, detail="MATE 关系码不存在或已失效")
    if session.get("partner_attempt_id"):
        if str(session["partner_attempt_id"]) == str(partner_attempt_id):
            return session
        raise HTTPException(status_code=409, detail="该关系码已被其他伴侣使用")
    if str(session["initiator_user_id"]) == partner_user_id:
        raise HTTPException(status_code=400, detail="不能使用自己的关系码配对")

    partner_attempt = _fetch_attempt(conn, partner_attempt_id, partner_user_id)
    if not partner_attempt or not is_mate_suite(partner_attempt.get("suite_slug")):
        raise HTTPException(status_code=400, detail="伴侣 MATE 测评无效")

    initiator = _fetch_attempt(conn, session["initiator_attempt_id"])
    if initiator:
        if _infer_suite_tier(initiator.get("suite_slug")) != _infer_suite_tier(partner_attempt.get("suite_slug")):
            raise HTTPException(status_code=400, detail="伴侣需使用与发起人相同的测试版本（快速版/完整版）")

    conn.execute(
        """
        UPDATE public.mate_relation_sessions
        SET partner_attempt_id = %s,
            partner_user_id = %s,
            partner_snapshot = %s
        WHERE id = %s
        """,
        (
            partner_attempt_id,
            partner_user_id,
            Jsonb(attempt_snapshot(partner_attempt)),
            session["id"],
        ),
    )
    conn.execute(
        """
        UPDATE public.test_attempts
        SET partner_relation_code = %s, relation_code = %s
        WHERE id = %s
        """,
        (code, code, partner_attempt_id),
    )
    return _fetch_session_by_code(conn, code) or session


def create_relation_session(
    conn: Any,
    *,
    code: str,
    initiator_attempt_id: uuid.UUID,
    initiator_user_id: str,
    initiator_snapshot: dict[str, Any],
) -> dict[str, Any]:
    row = conn.execute(
        """
        INSERT INTO public.mate_relation_sessions(
          code, initiator_attempt_id, initiator_user_id, initiator_snapshot, status
        )
        VALUES (%s, %s, %s, %s, 'waiting_partner')
        RETURNING *
        """,
        (code, initiator_attempt_id, initiator_user_id, Jsonb(initiator_snapshot)),
    ).fetchone()
    conn.execute(
        "UPDATE public.test_attempts SET relation_code = %s WHERE id = %s",
        (code, initiator_attempt_id),
    )
    return dict(row)


@router.get("/codes/{code}")
def get_relation_code_preview(code: str):
    normalized = _normalize_relation_code(code)
    with get_conn() as conn:
        session = _fetch_session_by_code(conn, normalized)
        if not session:
            raise HTTPException(status_code=404, detail="MATE 关系码不存在")
        initiator = _fetch_attempt(conn, session["initiator_attempt_id"])
        snapshot = session.get("initiator_snapshot") or {}
        payload = coerce_dict(initiator.get("result_payload") if initiator else snapshot)
        position = (payload.get("positionType") or {}).get("name") if isinstance(payload.get("positionType"), dict) else None
        suite_slug = initiator.get("suite_slug") if initiator else snapshot.get("suiteSlug")
        suite_tier = snapshot.get("suiteTier") if isinstance(snapshot, dict) and snapshot.get("suiteTier") in ("lite", "full") else _infer_suite_tier(str(suite_slug or ""))

    return {
        "ok": True,
        "code": normalized,
        "productSet": "MATE",
        "status": session.get("status"),
        "suiteTier": suite_tier,
        "suiteSlug": suite_slug,
        "preview": {
            "positionType": position,
            "mateIndex": snapshot.get("mateIndex") if isinstance(snapshot, dict) else initiator.get("ros_index") if initiator else None,
        },
        "invitePath": f"/mate/invite/{normalized}",
        "coupleUnlocked": session.get("status") == "completed",
    }


@router.get("/couple/{code}")
def get_couple_report(code: str, user_id: str = Depends(resolve_user_id)):
    normalized = _normalize_relation_code(code)
    with get_conn() as conn:
        session = _fetch_session_by_code(conn, normalized)
        if not session:
            raise HTTPException(status_code=404, detail="MATE 关系码不存在")
        if str(session.get("initiator_user_id")) != user_id and str(session.get("partner_user_id")) != user_id:
            raise HTTPException(status_code=403, detail="无权查看该双人报告")

        if session.get("status") != "completed" or not session.get("couple_payload"):
            if not session.get("partner_attempt_id"):
                raise HTTPException(status_code=409, detail="等待伴侣完成测评")
            couple_payload = merge_and_store_couple_report(conn, session["id"])
            conn.commit()
        else:
            couple_payload = coerce_dict(session.get("couple_payload"))

    return {"ok": True, "code": normalized, "couple": jsonable(couple_payload)}


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

        payload = coerce_dict(attempt.get("result_payload"))
        attachment = _fetch_latest_self_attachment(conn, user_id)
        if attachment and not payload.get("selfAttachmentType"):
            payload = {**payload, "selfAttachmentType": attachment}

        payload = attach_mate_ai_content_to_payload(
            conn,
            attempt_id,
            payload,
            attempt.get("dimension_scores"),
            use_ai=False,
            gender=str(attempt.get("suite_gender") or payload.get("gender") or "female"),
        )

        code = attempt.get("relation_code") or payload.get("relationCode")
        session = _fetch_session_by_code(conn, code) if code else None

    return {
        "ok": True,
        "attemptId": attempt_id,
        "single": payload,
        "gender": attempt.get("suite_gender") or payload.get("gender"),
        "relationCode": code,
        "partnerStatus": (session or {}).get("status"),
        "coupleUnlocked": (session or {}).get("status") == "completed",
        "invitePath": f"/mate/invite/{code}" if code else None,
    }
