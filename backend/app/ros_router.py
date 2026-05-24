from __future__ import annotations

import re
import uuid
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from psycopg.types.json import Jsonb

from app.auth import resolve_user_id
from app.db import get_conn
from app.ros_couple import attempt_snapshot, build_couple_payload
from app.ros_scoring import is_ros_suite

router = APIRouter(prefix="/ros", tags=["ros"])

RELATION_CODE_PATTERN = re.compile(r"^ROS-[A-Z0-9]{4}-[A-Z0-9]{4}$")


class StoryAnalyzeIn(BaseModel):
    timeline: list[dict[str, Any]] = Field(min_length=1, max_length=8)
    milestones: list[dict[str, Any]] = Field(default_factory=list, max_length=6)
    stageName: str = Field(min_length=1, max_length=40)


def _normalize_relation_code(code: str) -> str:
    normalized = code.strip().upper().replace(" ", "")
    if not RELATION_CODE_PATTERN.match(normalized):
        raise HTTPException(status_code=400, detail="关系码格式应为 ROS-XXXX-XXXX")
    return normalized


def _fetch_attempt(conn: Any, attempt_id: uuid.UUID, user_id: str | None = None) -> dict[str, Any] | None:
    if user_id:
        row = conn.execute(
            """
            SELECT ta.*, ts.slug AS suite_slug
            FROM public.test_attempts ta
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE ta.id = %s AND ta.user_id = %s
            """,
            (attempt_id, user_id),
        ).fetchone()
    else:
        row = conn.execute(
            """
            SELECT ta.*, ts.slug AS suite_slug
            FROM public.test_attempts ta
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE ta.id = %s
            """,
            (attempt_id,),
        ).fetchone()
    return dict(row) if row else None


def _fetch_session_by_code(conn: Any, code: str) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT *
        FROM public.ros_relation_sessions
        WHERE code = %s
        """,
        (code,),
    ).fetchone()
    return dict(row) if row else None


def _fetch_scoring_model(conn: Any, suite_id: uuid.UUID) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT scoring_formula, type_rules, ros_config
        FROM public.scoring_models
        WHERE suite_id = %s AND is_active = true
        ORDER BY updated_at DESC
        LIMIT 1
        """,
        (suite_id,),
    ).fetchone()
    return dict(row) if row else None


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
    payload = row.get("result_payload") or {}
    if isinstance(payload, dict):
        return payload.get("attachment_type")
    return None


def merge_and_store_couple_report(conn: Any, session_id: uuid.UUID) -> dict[str, Any]:
    session = conn.execute(
        "SELECT * FROM public.ros_relation_sessions WHERE id = %s",
        (session_id,),
    ).fetchone()
    if not session:
        raise HTTPException(status_code=404, detail="关系会话不存在")
    if not session.get("partner_attempt_id"):
        raise HTTPException(status_code=400, detail="伴侣尚未完成测评")

    initiator = _fetch_attempt(conn, session["initiator_attempt_id"])
    partner = _fetch_attempt(conn, session["partner_attempt_id"])
    if not initiator or not partner:
        raise HTTPException(status_code=404, detail="配对数据不完整")

    scoring_model = _fetch_scoring_model(conn, initiator["suite_id"])
    formula = (scoring_model or {}).get("scoring_formula") or {}
    type_rules = (scoring_model or {}).get("type_rules") or {}

    you_attachment = _fetch_latest_self_attachment(conn, str(initiator["user_id"]))
    ta_attachment = _fetch_latest_self_attachment(conn, str(partner["user_id"]))
    if you_attachment and isinstance(initiator.get("result_payload"), dict):
        initiator = dict(initiator)
        initiator["result_payload"] = {
            **initiator["result_payload"],
            "attachment_type": you_attachment,
        }
    if ta_attachment and isinstance(partner.get("result_payload"), dict):
        partner = dict(partner)
        partner["result_payload"] = {
            **partner["result_payload"],
            "attachment_type": ta_attachment,
        }

    couple_payload = build_couple_payload(
        code=session["code"],
        initiator=initiator,
        partner=partner,
        scoring_formula=formula if isinstance(formula, dict) else {},
        type_rules=type_rules if isinstance(type_rules, dict) else {},
    )

    conn.execute(
        """
        UPDATE public.ros_relation_sessions
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
        raise HTTPException(status_code=404, detail="关系码不存在或已失效")
    if session.get("partner_attempt_id"):
        if str(session["partner_attempt_id"]) == str(partner_attempt_id):
            return session
        raise HTTPException(status_code=409, detail="该关系码已被其他伴侣使用")
    if str(session["initiator_user_id"]) == partner_user_id:
        raise HTTPException(status_code=400, detail="不能使用自己的关系码配对")

    partner_attempt = _fetch_attempt(conn, partner_attempt_id, partner_user_id)
    if not partner_attempt or not is_ros_suite(partner_attempt.get("suite_slug")):
        raise HTTPException(status_code=400, detail="伴侣测评无效")

    conn.execute(
        """
        UPDATE public.ros_relation_sessions
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
    updated = _fetch_session_by_code(conn, code) or session
    return {"session": updated}


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
        INSERT INTO public.ros_relation_sessions(
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
            raise HTTPException(status_code=404, detail="关系码不存在")
        initiator = _fetch_attempt(conn, session["initiator_attempt_id"])
        snapshot = session.get("initiator_snapshot") or {}
        if initiator and isinstance(initiator.get("result_payload"), dict):
            rel_type = initiator["result_payload"].get("relationshipType") or {}
            stage = initiator["result_payload"].get("relationshipStage") or {}
        else:
            rel_type = (snapshot.get("relationshipType") or {}) if isinstance(snapshot, dict) else {}
            stage = (snapshot.get("relationshipStage") or {}) if isinstance(snapshot, dict) else {}
    return {
        "ok": True,
        "code": normalized,
        "status": session.get("status"),
        "preview": {
            "relationshipType": rel_type,
            "relationshipStage": stage,
            "rosIndex": snapshot.get("rosIndex") if isinstance(snapshot, dict) else None,
        },
        "invitePath": f"/ros/invite/{normalized}",
        "coupleUnlocked": session.get("status") == "completed",
    }


@router.get("/couple/{code}")
def get_couple_report(code: str, user_id: str = Depends(resolve_user_id)):
    normalized = _normalize_relation_code(code)
    with get_conn() as conn:
        session = _fetch_session_by_code(conn, normalized)
        if not session:
            raise HTTPException(status_code=404, detail="关系码不存在")
        if str(session.get("initiator_user_id")) != user_id and str(session.get("partner_user_id")) != user_id:
            raise HTTPException(status_code=403, detail="无权查看该双人报告")

        if session.get("status") != "completed" or not session.get("couple_payload"):
            if not session.get("partner_attempt_id"):
                raise HTTPException(status_code=409, detail="等待伴侣完成测评")
            couple_payload = merge_and_store_couple_report(conn, session["id"])
            conn.commit()
        else:
            couple_payload = session.get("couple_payload") or {}

    return {"ok": True, "code": normalized, "couple": couple_payload}


@router.get("/attempts/{attempt_id}/single")
def get_ros_single_result(attempt_id: str, user_id: str = Depends(resolve_user_id)):
    try:
        attempt_uuid = uuid.UUID(attempt_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="attemptId 格式不正确") from exc

    with get_conn() as conn:
        attempt = _fetch_attempt(conn, attempt_uuid, user_id)
        if not attempt:
            raise HTTPException(status_code=404, detail="测评结果不存在")
        if not is_ros_suite(attempt.get("suite_slug")):
            raise HTTPException(status_code=400, detail="该记录不是 ROS 关系测评")

        payload = attempt.get("result_payload") or {}
        code = attempt.get("relation_code") or (payload.get("relationCode") if isinstance(payload, dict) else None)
        session = _fetch_session_by_code(conn, code) if code else None

    single = payload if isinstance(payload, dict) else {}
    if isinstance(single, dict) and single.get("layers") and not single.get("layerDetails"):
        layer_scores = {
            str(item.get("code", "")).upper(): float(item.get("score") or item.get("displayScore") or 0)
            for item in (single.get("layers") or [])
            if isinstance(item, dict)
        }
        if layer_scores:
            from app.ros_scoring import _build_layer_details

            single = {**single, "layerDetails": _build_layer_details(layer_scores)}
    return {
        "ok": True,
        "attemptId": attempt_id,
        "single": single,
        "relationCode": code,
        "partnerStatus": (session or {}).get("status"),
        "coupleUnlocked": (session or {}).get("status") == "completed",
        "invitePath": f"/ros/invite/{code}" if code else None,
    }


@router.post("/story/analyze")
def analyze_story(data: StoryAnalyzeIn):
    points = data.timeline
    if len(points) < 2:
        trend_label = "平稳"
    else:
        diff = float(points[-1].get("value", 0)) - float(points[0].get("value", 0))
        if abs(diff) < 6:
            trend_label = "起伏中保持平稳"
        elif diff >= 6:
            trend_label = "整体回暖上升"
        else:
            trend_label = "正在降温下行"

    last = points[-1]
    note = last.get("note")
    note_clause = f"特别是「{note}」这个节点，" if note else ""
    curve_insight = (
        f"从你们填写的曲线看，{trend_label}。{note_clause}"
        "这本身就是一段真实关系会有的样子——有高有低。继续把那些让彼此靠近的小事记下来，关系会自己告诉你们下一步去哪。"
    )

    milestones = data.milestones
    if not milestones:
        milestone_insight = "还没有里程碑，等你们去把那些重要时刻一一记下。"
    else:
        sparks = sum(1 for m in milestones if m.get("tone") == "spark")
        cools = sum(1 for m in milestones if m.get("tone") == "cool")
        warms = sum(1 for m in milestones if m.get("tone") == "warm")
        last_m = milestones[-1]
        tilt = (
            "心动多过降温"
            if sparks > cools
            else "降温多过心动"
            if cools > sparks
            else "心动与降温几乎持平"
        )
        milestone_insight = (
            f"从你们记下的 {len(milestones)} 个时刻看，{tilt}，温暖时刻有 {warms} 个。"
            f"最近一次是「{last_m.get('title') or last_m.get('when')}」——这些被你们记住的瞬间，才是关系真正长出来的地方。"
        )

    return {
        "mode": "template",
        "curveInsight": curve_insight,
        "milestoneInsight": milestone_insight,
        "trend": {"label": trend_label},
    }
