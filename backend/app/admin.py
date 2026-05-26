from __future__ import annotations

import secrets
import string
import uuid
from decimal import Decimal
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from psycopg.types.json import Jsonb
from pydantic import BaseModel, Field

from app.auth import resolve_user_id
from app.db import get_conn

router = APIRouter(prefix="/admin", tags=["admin"])


def _jsonable(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, Decimal):
        return float(value)
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _jsonable(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_jsonable(v) for v in value]
    return value


def _safe_uuid(value: str, field_name: str = "id") -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"{field_name} 格式不正确") from exc


def resolve_admin_user_id(user_id: str = Depends(resolve_user_id)) -> str:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, role::text AS role FROM public.profiles WHERE id = %s",
            (user_id,),
        ).fetchone()
    if not row or row.get("role") != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return user_id


AdminUser = Annotated[str, Depends(resolve_admin_user_id)]


def _log_admin_action(
    conn,
    admin_user_id: str,
    action: str,
    *,
    target_table: str | None = None,
    target_id: str | None = None,
    before: dict[str, Any] | None = None,
    after: dict[str, Any] | None = None,
) -> None:
    conn.execute(
        """
        INSERT INTO public.admin_audit_logs(
          admin_user_id, action, target_table, target_id, before_payload, after_payload
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            admin_user_id,
            action,
            target_table,
            target_id,
            Jsonb(before or {}),
            Jsonb(after or {}),
        ),
    )


def _clamp_limit(limit: int, *, default: int = 20, maximum: int = 100) -> int:
    if limit <= 0:
        return default
    return min(limit, maximum)


class CreateRedemptionCodesIn(BaseModel):
    suiteSlug: str = Field(min_length=1)
    batchName: str = Field(min_length=1)
    kind: str = Field(default="single_use")
    count: int = Field(default=10, ge=1, le=500)
    maxUses: int | None = Field(default=None, ge=1)
    expiresAt: str | None = None
    prefix: str = Field(default="LOVE", min_length=2, max_length=12)
    note: str | None = None


class PatchRedemptionCodeIn(BaseModel):
    isActive: bool | None = None
    status: str | None = None
    maxUses: int | None = Field(default=None, ge=1)
    expiresAt: str | None = None


class PatchAnalystIn(BaseModel):
    name: str | None = None
    title: str | None = None
    description: str | None = None
    personaPrompt: str | None = None
    systemPrompt: str | None = None
    modelName: str | None = None
    modelParams: dict[str, Any] | None = None
    isActive: bool | None = None
    isDefault: bool | None = None
    displayOrder: int | None = None


def _generate_code(prefix: str) -> str:
    alphabet = string.ascii_uppercase + string.digits
    part = lambda n: "".join(secrets.choice(alphabet) for _ in range(n))
    return f"{prefix.strip().upper()}-{part(4)}-{part(4)}"


@router.get("/me")
def admin_me(admin_user_id: AdminUser):
    with get_conn() as conn:
        profile = conn.execute(
            """
            SELECT id, email, display_name, role::text AS role, created_at
            FROM public.profiles
            WHERE id = %s
            """,
            (admin_user_id,),
        ).fetchone()
    if not profile:
        raise HTTPException(status_code=404, detail="管理员资料不存在")
    return {"ok": True, "user": _jsonable(dict(profile))}


@router.get("/stats")
def admin_stats(admin_user_id: AdminUser):
    del admin_user_id
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT
              (SELECT COUNT(*)::int FROM public.profiles) AS users,
              (SELECT COUNT(*)::int FROM public.test_attempts WHERE status = 'completed') AS completed_attempts,
              (SELECT COUNT(*)::int FROM public.redemption_events) AS redemption_events,
              (SELECT COUNT(*)::int FROM public.redemption_codes WHERE is_active = true) AS active_codes,
              (SELECT COUNT(*)::int FROM public.ai_result_reports WHERE status = 'succeeded') AS ai_reports,
              (SELECT COUNT(*)::int FROM public.chat_sessions) AS chat_sessions
            """
        ).fetchone()
        by_suite = conn.execute(
            """
            SELECT ts.slug, ts.name, COUNT(ta.id)::int AS attempts
            FROM public.test_suites ts
            LEFT JOIN public.test_attempts ta ON ta.suite_id = ts.id AND ta.status = 'completed'
            GROUP BY ts.id, ts.slug, ts.name
            ORDER BY ts.display_order, ts.slug
            """
        ).fetchall()
        recent_events = conn.execute(
            """
            SELECT
              re.id,
              re.redeemed_at,
              p.email,
              ts.slug AS suite_slug,
              rc.code
            FROM public.redemption_events re
            JOIN public.profiles p ON p.id = re.user_id
            JOIN public.test_suites ts ON ts.id = re.suite_id
            JOIN public.redemption_codes rc ON rc.id = re.redemption_code_id
            ORDER BY re.redeemed_at DESC
            LIMIT 10
            """
        ).fetchall()
        in_progress = conn.execute(
            "SELECT COUNT(*)::int AS c FROM public.test_attempts WHERE status = 'in_progress'"
        ).fetchone()["c"]
        today_completed = conn.execute(
            """
            SELECT COUNT(*)::int AS c
            FROM public.test_attempts
            WHERE status = 'completed' AND completed_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Shanghai')
            """
        ).fetchone()["c"]
    return {
        "stats": _jsonable(dict(row or {})),
        "attemptsBySuite": [_jsonable(dict(item)) for item in by_suite],
        "recentRedemptions": [_jsonable(dict(item)) for item in recent_events],
        "inProgressAttempts": in_progress,
        "todayCompletedAttempts": today_completed,
    }


@router.get("/suites")
def admin_suites(admin_user_id: AdminUser):
    del admin_user_id
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT
              id, slug, name, gender::text AS gender, version,
              total_questions, estimated_minutes, is_free, is_active, display_order,
              (SELECT COUNT(*)::int FROM public.test_questions q WHERE q.suite_id = ts.id AND q.is_active) AS active_questions,
              (SELECT COUNT(*)::int FROM public.test_attempts a WHERE a.suite_id = ts.id) AS attempt_count
            FROM public.test_suites ts
            ORDER BY display_order, slug
            """
        ).fetchall()
    return {"suites": [_jsonable(dict(row)) for row in rows]}


@router.get("/redemption/codes")
def admin_list_redemption_codes(
    admin_user_id: AdminUser,
    suiteSlug: str | None = None,
    q: str | None = None,
    activeOnly: bool = False,
    limit: int = 50,
    offset: int = 0,
):
    del admin_user_id
    safe_limit = _clamp_limit(limit, default=50, maximum=200)
    safe_offset = max(0, offset)
    filters = ["1=1"]
    params: list[Any] = []
    if suiteSlug:
        filters.append("ts.slug = %s")
        params.append(suiteSlug.strip())
    if q:
        filters.append("rc.code ILIKE %s")
        params.append(f"%{q.strip()}%")
    if activeOnly:
        filters.append("rc.is_active = true AND rc.status = 'active'")
    where_sql = " AND ".join(filters)
    with get_conn() as conn:
        total = conn.execute(
            f"""
            SELECT COUNT(*)::int AS total
            FROM public.redemption_codes rc
            JOIN public.test_suites ts ON ts.id = rc.suite_id
            WHERE {where_sql}
            """,
            tuple(params),
        ).fetchone()["total"]
        rows = conn.execute(
            f"""
            SELECT
              rc.id,
              rc.code,
              rc.code_kind::text AS code_kind,
              rc.status::text AS status,
              rc.max_uses,
              rc.used_count,
              rc.is_active,
              rc.expires_at,
              rc.created_at,
              rb.name AS batch_name,
              ts.slug AS suite_slug,
              ts.name AS suite_name
            FROM public.redemption_codes rc
            JOIN public.redemption_batches rb ON rb.id = rc.batch_id
            JOIN public.test_suites ts ON ts.id = rc.suite_id
            WHERE {where_sql}
            ORDER BY rc.created_at DESC
            LIMIT %s OFFSET %s
            """,
            tuple([*params, safe_limit, safe_offset]),
        ).fetchall()
    return {
        "total": total,
        "limit": safe_limit,
        "offset": safe_offset,
        "codes": [_jsonable(dict(row)) for row in rows],
    }


@router.post("/redemption/codes")
def admin_create_redemption_codes(data: CreateRedemptionCodesIn, admin_user_id: AdminUser):
    kind = data.kind.strip()
    if kind not in {"common", "single_use", "gift", "admin_grant"}:
        raise HTTPException(status_code=400, detail="kind 必须是 common / single_use / gift / admin_grant")
    max_uses = data.maxUses
    if max_uses is None:
        max_uses = 999999 if kind == "common" else 1

    with get_conn() as conn:
        suite = conn.execute(
            "SELECT id, slug FROM public.test_suites WHERE slug = %s",
            (data.suiteSlug.strip(),),
        ).fetchone()
        if not suite:
            raise HTTPException(status_code=404, detail="测试套件不存在")

        metadata = {"note": data.note or "", "source": "admin_api"}
        batch = conn.execute(
            """
            INSERT INTO public.redemption_batches(
              name, suite_id, code_kind, is_active, expires_at,
              max_uses_per_code, max_uses_per_user_per_suite, metadata, created_by
            )
            VALUES (%s, %s, %s::public.redemption_code_kind, true, %s, %s, 1, %s, %s)
            RETURNING id, name
            """,
            (
                data.batchName.strip(),
                suite["id"],
                kind,
                data.expiresAt,
                max_uses,
                Jsonb(metadata),
                admin_user_id,
            ),
        ).fetchone()

        created: list[dict[str, Any]] = []
        seen: set[str] = set()
        attempts = 0
        while len(created) < data.count and attempts < data.count * 20:
            attempts += 1
            code = _generate_code(data.prefix)
            if code in seen:
                continue
            seen.add(code)
            row = conn.execute(
                """
                INSERT INTO public.redemption_codes(
                  batch_id, suite_id, code, code_kind, status, max_uses, is_active, expires_at, metadata
                )
                VALUES (%s, %s, %s, %s::public.redemption_code_kind, 'active', %s, true, %s, %s)
                ON CONFLICT (code) DO NOTHING
                RETURNING id, code
                """,
                (
                    batch["id"],
                    suite["id"],
                    code,
                    kind,
                    max_uses,
                    data.expiresAt,
                    Jsonb(metadata),
                ),
            ).fetchone()
            if row:
                created.append(dict(row))

        if not created:
            conn.rollback()
            raise HTTPException(status_code=500, detail="未能生成兑换码，请重试")

        _log_admin_action(
            conn,
            admin_user_id,
            "create_redemption_codes",
            target_table="redemption_codes",
            target_id=str(batch["id"]),
            after={
                "batchName": batch["name"],
                "suiteSlug": suite["slug"],
                "kind": kind,
                "count": len(created),
                "codes": [item["code"] for item in created[:20]],
            },
        )
        conn.commit()

    return {
        "ok": True,
        "batchId": str(batch["id"]),
        "batchName": batch["name"],
        "suiteSlug": suite["slug"],
        "kind": kind,
        "codes": [_jsonable(item) for item in created],
    }


@router.patch("/redemption/codes/{code_id}")
def admin_patch_redemption_code(code_id: str, data: PatchRedemptionCodeIn, admin_user_id: AdminUser):
    code_uuid = _safe_uuid(code_id, "codeId")
    updates: list[str] = []
    params: list[Any] = []
    if data.isActive is not None:
        updates.append("is_active = %s")
        params.append(data.isActive)
    if data.status is not None:
        if data.status not in {"active", "inactive", "expired", "exhausted"}:
            raise HTTPException(status_code=400, detail="status 无效")
        updates.append("status = %s::public.redemption_code_status")
        params.append(data.status)
    if data.maxUses is not None:
        updates.append("max_uses = %s")
        params.append(data.maxUses)
    if data.expiresAt is not None:
        updates.append("expires_at = %s")
        params.append(data.expiresAt or None)
    if not updates:
        raise HTTPException(status_code=400, detail="没有可更新字段")

    with get_conn() as conn:
        before = conn.execute(
            "SELECT id, code, status::text AS status, is_active, max_uses, expires_at FROM public.redemption_codes WHERE id = %s",
            (code_uuid,),
        ).fetchone()
        if not before:
            raise HTTPException(status_code=404, detail="兑换码不存在")
        row = conn.execute(
            f"""
            UPDATE public.redemption_codes
            SET {", ".join(updates)}, updated_at = now()
            WHERE id = %s
            RETURNING id, code, status::text AS status, is_active, max_uses, expires_at
            """,
            tuple([*params, code_uuid]),
        ).fetchone()
        _log_admin_action(
            conn,
            admin_user_id,
            "patch_redemption_code",
            target_table="redemption_codes",
            target_id=str(code_uuid),
            before=dict(before),
            after=dict(row),
        )
        conn.commit()
    return {"ok": True, "code": _jsonable(dict(row))}


@router.get("/redemption/events")
def admin_redemption_events(
    admin_user_id: AdminUser,
    limit: int = 50,
    offset: int = 0,
):
    del admin_user_id
    safe_limit = _clamp_limit(limit, default=50, maximum=200)
    safe_offset = max(0, offset)
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*)::int AS total FROM public.redemption_events").fetchone()["total"]
        rows = conn.execute(
            """
            SELECT
              re.id,
              re.redeemed_at,
              re.attempt_id,
              p.id AS user_id,
              p.email,
              p.display_name,
              ts.slug AS suite_slug,
              ts.name AS suite_name,
              rc.code,
              rc.code_kind::text AS code_kind
            FROM public.redemption_events re
            JOIN public.profiles p ON p.id = re.user_id
            JOIN public.test_suites ts ON ts.id = re.suite_id
            JOIN public.redemption_codes rc ON rc.id = re.redemption_code_id
            ORDER BY re.redeemed_at DESC
            LIMIT %s OFFSET %s
            """,
            (safe_limit, safe_offset),
        ).fetchall()
    return {
        "total": total,
        "limit": safe_limit,
        "offset": safe_offset,
        "events": [_jsonable(dict(row)) for row in rows],
    }


@router.get("/users")
def admin_users(
    admin_user_id: AdminUser,
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    del admin_user_id
    safe_limit = _clamp_limit(limit, default=50, maximum=200)
    safe_offset = max(0, offset)
    filters = ["1=1"]
    params: list[Any] = []
    if q:
        filters.append("(p.email ILIKE %s OR p.display_name ILIKE %s)")
        like = f"%{q.strip()}%"
        params.extend([like, like])
    where_sql = " AND ".join(filters)
    with get_conn() as conn:
        total = conn.execute(
            f"SELECT COUNT(*)::int AS total FROM public.profiles p WHERE {where_sql}",
            tuple(params),
        ).fetchone()["total"]
        rows = conn.execute(
            f"""
            SELECT
              p.id,
              p.email,
              p.display_name,
              p.role::text AS role,
              p.status,
              p.created_at,
              p.last_login_at,
              (SELECT COUNT(*)::int FROM public.test_attempts ta WHERE ta.user_id = p.id) AS attempt_count,
              (SELECT COUNT(*)::int FROM public.chat_sessions cs WHERE cs.user_id = p.id) AS chat_session_count
            FROM public.profiles p
            WHERE {where_sql}
            ORDER BY p.created_at DESC
            LIMIT %s OFFSET %s
            """,
            tuple([*params, safe_limit, safe_offset]),
        ).fetchall()
    return {
        "total": total,
        "limit": safe_limit,
        "offset": safe_offset,
        "users": [_jsonable(dict(row)) for row in rows],
    }


@router.get("/users/{user_id}")
def admin_user_detail(user_id: str, admin_user_id: AdminUser):
    del admin_user_id
    user_uuid = _safe_uuid(user_id, "userId")
    with get_conn() as conn:
        profile = conn.execute(
            """
            SELECT id, email, display_name, role::text AS role, status, created_at, last_login_at, portrait_cache
            FROM public.profiles
            WHERE id = %s
            """,
            (user_uuid,),
        ).fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail="用户不存在")
        attempts = conn.execute(
            """
            SELECT
              ta.id,
              ta.status,
              ta.archetype_code,
              ta.ros_index,
              ta.created_at,
              ta.completed_at,
              ts.slug AS suite_slug,
              ts.name AS suite_name
            FROM public.test_attempts ta
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE ta.user_id = %s
            ORDER BY COALESCE(ta.completed_at, ta.created_at) DESC
            LIMIT 50
            """,
            (user_uuid,),
        ).fetchall()
        redemptions = conn.execute(
            """
            SELECT re.id, re.redeemed_at, rc.code, ts.slug AS suite_slug
            FROM public.redemption_events re
            JOIN public.redemption_codes rc ON rc.id = re.redemption_code_id
            JOIN public.test_suites ts ON ts.id = re.suite_id
            WHERE re.user_id = %s
            ORDER BY re.redeemed_at DESC
            LIMIT 20
            """,
            (user_uuid,),
        ).fetchall()
    return {
        "user": _jsonable(dict(profile)),
        "attempts": [_jsonable(dict(row)) for row in attempts],
        "redemptions": [_jsonable(dict(row)) for row in redemptions],
    }


@router.get("/attempts")
def admin_attempts(
    admin_user_id: AdminUser,
    userId: str | None = None,
    suiteSlug: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    del admin_user_id
    safe_limit = _clamp_limit(limit, default=50, maximum=200)
    safe_offset = max(0, offset)
    filters = ["1=1"]
    params: list[Any] = []
    if userId:
        filters.append("ta.user_id = %s")
        params.append(str(_safe_uuid(userId, "userId")))
    if suiteSlug:
        filters.append("ts.slug = %s")
        params.append(suiteSlug.strip())
    where_sql = " AND ".join(filters)
    with get_conn() as conn:
        total = conn.execute(
            f"""
            SELECT COUNT(*)::int AS total
            FROM public.test_attempts ta
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE {where_sql}
            """,
            tuple(params),
        ).fetchone()["total"]
        rows = conn.execute(
            f"""
            SELECT
              ta.id,
              ta.user_id,
              ta.status,
              ta.archetype_code,
              ta.ros_index,
              ta.created_at,
              ta.completed_at,
              p.email,
              ts.slug AS suite_slug,
              ts.name AS suite_name
            FROM public.test_attempts ta
            LEFT JOIN public.profiles p ON p.id = ta.user_id
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE {where_sql}
            ORDER BY COALESCE(ta.completed_at, ta.created_at) DESC
            LIMIT %s OFFSET %s
            """,
            tuple([*params, safe_limit, safe_offset]),
        ).fetchall()
    return {
        "total": total,
        "limit": safe_limit,
        "offset": safe_offset,
        "attempts": [_jsonable(dict(row)) for row in rows],
    }


@router.get("/monitor/live")
def admin_monitor_live(admin_user_id: AdminUser, limit: int = 25):
    """实时运营快照：最近测评、双人关系码、进行中的作答。"""
    del admin_user_id
    safe_limit = _clamp_limit(limit, default=25, maximum=50)
    with get_conn() as conn:
        stats_row = conn.execute(
            """
            SELECT
              (SELECT COUNT(*)::int FROM public.profiles) AS users,
              (SELECT COUNT(*)::int FROM public.test_attempts WHERE status = 'completed') AS completed_attempts,
              (SELECT COUNT(*)::int FROM public.test_attempts WHERE status = 'in_progress') AS in_progress_attempts,
              (SELECT COUNT(*)::int FROM public.redemption_events) AS redemption_events,
              (SELECT COUNT(*)::int FROM public.chat_sessions) AS chat_sessions,
              (SELECT COUNT(*)::int FROM public.ros_relation_sessions WHERE status = 'completed') AS ros_couples_completed,
              (SELECT COUNT(*)::int FROM public.mate_relation_sessions WHERE status = 'completed') AS mate_couples_completed,
              (SELECT COUNT(*)::int FROM public.ros_relation_sessions WHERE status = 'waiting_partner') AS ros_couples_waiting,
              (SELECT COUNT(*)::int FROM public.mate_relation_sessions WHERE status = 'waiting_partner') AS mate_couples_waiting
            """
        ).fetchone()
        recent_attempts = conn.execute(
            """
            SELECT
              ta.id,
              ta.status,
              ta.relation_code,
              ta.partner_relation_code,
              ta.created_at,
              ta.completed_at,
              p.email,
              ts.slug AS suite_slug,
              ts.name AS suite_name
            FROM public.test_attempts ta
            LEFT JOIN public.profiles p ON p.id = ta.user_id
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            ORDER BY COALESCE(ta.completed_at, ta.created_at) DESC
            LIMIT %s
            """,
            (safe_limit,),
        ).fetchall()
        ros_sessions = conn.execute(
            """
            SELECT
              rs.id,
              rs.code,
              rs.status,
              rs.created_at,
              rs.completed_at,
              pi.email AS initiator_email,
              pp.email AS partner_email
            FROM public.ros_relation_sessions rs
            LEFT JOIN public.profiles pi ON pi.id = rs.initiator_user_id
            LEFT JOIN public.profiles pp ON pp.id = rs.partner_user_id
            ORDER BY COALESCE(rs.completed_at, rs.updated_at, rs.created_at) DESC
            LIMIT %s
            """,
            (safe_limit,),
        ).fetchall()
        mate_sessions = conn.execute(
            """
            SELECT
              ms.id,
              ms.code,
              ms.status,
              ms.created_at,
              ms.completed_at,
              pi.email AS initiator_email,
              pp.email AS partner_email
            FROM public.mate_relation_sessions ms
            LEFT JOIN public.profiles pi ON pi.id = ms.initiator_user_id
            LEFT JOIN public.profiles pp ON pp.id = ms.partner_user_id
            ORDER BY COALESCE(ms.completed_at, ms.updated_at, ms.created_at) DESC
            LIMIT %s
            """,
            (safe_limit,),
        ).fetchall()
        recent_redemptions = conn.execute(
            """
            SELECT re.redeemed_at, p.email, ts.slug AS suite_slug, rc.code
            FROM public.redemption_events re
            JOIN public.profiles p ON p.id = re.user_id
            JOIN public.test_suites ts ON ts.id = re.suite_id
            JOIN public.redemption_codes rc ON rc.id = re.redemption_code_id
            ORDER BY re.redeemed_at DESC
            LIMIT 10
            """
        ).fetchall()
    from datetime import datetime, timezone

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "stats": _jsonable(dict(stats_row or {})),
        "recentAttempts": [_jsonable(dict(row)) for row in recent_attempts],
        "rosCoupleSessions": [_jsonable(dict(row)) for row in ros_sessions],
        "mateCoupleSessions": [_jsonable(dict(row)) for row in mate_sessions],
        "recentRedemptions": [_jsonable(dict(row)) for row in recent_redemptions],
    }


@router.get("/analysts")
def admin_analysts(admin_user_id: AdminUser):
    del admin_user_id
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT
              id, slug, name, title, description,
              model_provider, model_name, model_params,
              is_default, is_active, requires_unlock, display_order,
              LEFT(persona_prompt, 120) AS persona_preview,
              updated_at
            FROM public.chat_analysts
            ORDER BY display_order, slug
            """
        ).fetchall()
    return {"analysts": [_jsonable(dict(row)) for row in rows]}


@router.get("/analysts/{slug}")
def admin_analyst_detail(slug: str, admin_user_id: AdminUser):
    del admin_user_id
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT
              id, slug, name, title, description,
              persona_prompt, system_prompt,
              model_provider, model_name, model_params,
              is_default, is_active, requires_unlock, display_order,
              updated_at
            FROM public.chat_analysts
            WHERE slug = %s
            """,
            (slug.strip(),),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="顾问不存在")
    return {"analyst": _jsonable(dict(row))}


@router.patch("/analysts/{slug}")
def admin_patch_analyst(slug: str, data: PatchAnalystIn, admin_user_id: AdminUser):
    slug = slug.strip()
    field_map = {
        "name": data.name,
        "title": data.title,
        "description": data.description,
        "persona_prompt": data.personaPrompt,
        "system_prompt": data.systemPrompt,
        "model_name": data.modelName,
        "is_active": data.isActive,
        "is_default": data.isDefault,
        "display_order": data.displayOrder,
    }
    updates: list[str] = []
    params: list[Any] = []
    for column, value in field_map.items():
        if value is not None:
            updates.append(f"{column} = %s")
            params.append(value)
    if data.modelParams is not None:
        updates.append("model_params = %s")
        params.append(Jsonb(data.modelParams))
    if not updates:
        raise HTTPException(status_code=400, detail="没有可更新字段")

    with get_conn() as conn:
        before = conn.execute(
            "SELECT slug, name, title, is_active, is_default, model_name FROM public.chat_analysts WHERE slug = %s",
            (slug,),
        ).fetchone()
        if not before:
            raise HTTPException(status_code=404, detail="顾问不存在")
        if data.isDefault is True:
            conn.execute("UPDATE public.chat_analysts SET is_default = false WHERE slug <> %s", (slug,))
        row = conn.execute(
            f"""
            UPDATE public.chat_analysts
            SET {", ".join(updates)}, updated_at = now()
            WHERE slug = %s
            RETURNING id, slug, name, title, is_active, is_default, model_name, display_order, updated_at
            """,
            tuple([*params, slug]),
        ).fetchone()
        _log_admin_action(
            conn,
            admin_user_id,
            "patch_analyst",
            target_table="chat_analysts",
            target_id=slug,
            before=dict(before),
            after=dict(row),
        )
        conn.commit()
    return {"ok": True, "analyst": _jsonable(dict(row))}
