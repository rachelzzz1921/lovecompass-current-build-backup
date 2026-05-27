from __future__ import annotations

import secrets
import string
import uuid
from decimal import Decimal
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Header, Query
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


def resolve_admin_user_id(
    user_id: str = Depends(resolve_user_id),
    x_admin_unlock: Annotated[str | None, Header(alias="X-Admin-Unlock")] = None,
) -> str:
    from app.admin_unlock import verify_admin_unlock_token

    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, role::text AS role FROM public.profiles WHERE id = %s",
            (user_id,),
        ).fetchone()
    if row and row.get("role") == "admin":
        return user_id
    if x_admin_unlock and verify_admin_unlock_token(x_admin_unlock.strip(), user_id):
        return user_id
    raise HTTPException(status_code=403, detail="需要管理员权限")


def resolve_admin_access_mode(
    user_id: str = Depends(resolve_user_id),
    x_admin_unlock: Annotated[str | None, Header(alias="X-Admin-Unlock")] = None,
) -> str:
    from app.admin_unlock import verify_admin_unlock_token

    with get_conn() as conn:
        row = conn.execute(
            "SELECT role::text AS role FROM public.profiles WHERE id = %s",
            (user_id,),
        ).fetchone()
    if row and row.get("role") == "admin":
        return "role"
    if x_admin_unlock and verify_admin_unlock_token(x_admin_unlock.strip(), user_id):
        return "password"
    return "none"


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
    customCode: str | None = Field(default=None, min_length=4, max_length=64)


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


class PatchUserIn(BaseModel):
    role: str | None = None
    status: str | None = None
    displayName: str | None = None


class InviteUserIn(BaseModel):
    email: str = Field(min_length=3)
    password: str | None = Field(default=None, min_length=8)
    displayName: str | None = None
    role: str = Field(default="user")


class PatchQuestionIn(BaseModel):
    questionText: str | None = Field(default=None, min_length=1)
    questionPayload: dict[str, Any] | None = None
    isActive: bool | None = None
    displayOrder: int | None = Field(default=None, ge=1)
    weight: float | None = Field(default=None, gt=0)
    direction: str | None = None


class AdminUnlockIn(BaseModel):
    password: str = Field(min_length=1, max_length=128)


def _generate_code(prefix: str) -> str:
    alphabet = string.ascii_uppercase + string.digits
    part = lambda n: "".join(secrets.choice(alphabet) for _ in range(n))
    return f"{prefix.strip().upper()}-{part(4)}-{part(4)}"


def _format_user_code(registration_no: int) -> str:
    return f"MR-{registration_no:06d}"


def _parse_user_code_query(raw: str) -> int | None:
    import re

    text = raw.strip().upper()
    match = re.fullmatch(r"MR-?(\d+)", text)
    if match:
        return int(match.group(1))
    if text.isdigit():
        return int(text)
    return None


def _user_code_sql(alias: str = "p") -> str:
    """Registration sequence by created_at (stable tie-break on id)."""
    return f"""
    ROW_NUMBER() OVER (
      ORDER BY {alias}.created_at ASC, {alias}.id ASC
    )::int AS registration_no
    """


@router.get("/me")
def admin_me(user_id: str = Depends(resolve_user_id), access_mode: str = Depends(resolve_admin_access_mode)):
    if access_mode == "none":
        raise HTTPException(status_code=403, detail="需要管理员权限")
    with get_conn() as conn:
        profile = conn.execute(
            """
            SELECT id, email, display_name, role::text AS role, created_at
            FROM public.profiles
            WHERE id = %s
            """,
            (user_id,),
        ).fetchone()
    if not profile:
        raise HTTPException(status_code=404, detail="管理员资料不存在")
    return {
        "ok": True,
        "accessMode": access_mode,
        "user": _jsonable(dict(profile)),
    }


@router.post("/unlock")
def admin_unlock_with_password(data: AdminUnlockIn, user_id: str = Depends(resolve_user_id)):
    from app.admin_unlock import (
        admin_password_configured,
        issue_admin_unlock_token,
        unlock_ttl_hours,
        verify_admin_password,
    )

    if not admin_password_configured():
        raise HTTPException(status_code=503, detail="服务端未配置 LOVECOMPASS_ADMIN_PASSWORD")
    if not verify_admin_password(data.password):
        raise HTTPException(status_code=401, detail="管理密码不正确")

    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, role::text AS role FROM public.profiles WHERE id = %s",
            (user_id,),
        ).fetchone()
        if row and row.get("role") == "admin":
            return {
                "ok": True,
                "accessMode": "role",
                "unlockToken": None,
                "expiresAt": None,
                "message": "已是数据库管理员，无需密码解锁",
            }

        token, expires_at = issue_admin_unlock_token(user_id)
        _log_admin_action(
            conn,
            user_id,
            "admin_password_unlock",
            target_table="profiles",
            target_id=str(user_id),
            after={"expiresAt": expires_at, "ttlHours": unlock_ttl_hours()},
        )
        conn.commit()

    return {
        "ok": True,
        "accessMode": "password",
        "unlockToken": token,
        "expiresAt": expires_at,
        "ttlHours": unlock_ttl_hours(),
    }


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
        ops_row = conn.execute(
            """
            SELECT
              (SELECT COUNT(*)::int FROM public.ros_relation_sessions WHERE status = 'completed') AS ros_couples_completed,
              (SELECT COUNT(*)::int FROM public.mate_relation_sessions WHERE status = 'completed') AS mate_couples_completed,
              (SELECT COUNT(*)::int FROM public.ros_relation_sessions WHERE status = 'waiting_partner') AS ros_couples_waiting,
              (SELECT COUNT(*)::int FROM public.mate_relation_sessions WHERE status = 'waiting_partner') AS mate_couples_waiting,
              (SELECT COUNT(*)::int FROM public.chat_messages) AS chat_messages,
              (SELECT COUNT(*)::int FROM public.chat_messages
                 WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Shanghai')) AS chat_messages_today,
              (SELECT COUNT(*)::int FROM public.chat_sessions
                 WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Shanghai')) AS chat_sessions_today
            """
        ).fetchone()
        recent_audit = conn.execute(
            """
            SELECT
              al.id,
              al.action,
              al.target_table,
              al.created_at,
              p.email AS admin_email
            FROM public.admin_audit_logs al
            LEFT JOIN public.profiles p ON p.id = al.admin_user_id
            ORDER BY al.created_at DESC
            LIMIT 8
            """
        ).fetchall()
    stats_payload = _jsonable(dict(row or {}))
    if ops_row:
        stats_payload.update(_jsonable(dict(ops_row)))
    return {
        "stats": stats_payload,
        "attemptsBySuite": [_jsonable(dict(item)) for item in by_suite],
        "recentRedemptions": [_jsonable(dict(item)) for item in recent_events],
        "recentAuditLogs": [_jsonable(dict(item)) for item in recent_audit],
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
        custom = (data.customCode or "").strip().upper()
        if custom:
            if data.count != 1:
                raise HTTPException(status_code=400, detail="指定 customCode 时 count 必须为 1")
            codes_to_insert = [custom]
        else:
            codes_to_insert = []
            attempts = 0
            while len(codes_to_insert) < data.count and attempts < data.count * 20:
                attempts += 1
                code = _generate_code(data.prefix)
                if code not in seen:
                    seen.add(code)
                    codes_to_insert.append(code)

        for code in codes_to_insert:
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
        code_no = _parse_user_code_query(q)
        if code_no is not None:
            filters.append("registration_no = %s")
            params.append(code_no)
        else:
            filters.append("(email ILIKE %s OR display_name ILIKE %s)")
            like = f"%{q.strip()}%"
            params.extend([like, like])
    where_sql = " AND ".join(filters)
    with get_conn() as conn:
        total = conn.execute(
            f"""
            SELECT COUNT(*)::int AS total
            FROM (
              SELECT
                p.id,
                p.email,
                p.display_name,
                {_user_code_sql("p")}
              FROM public.profiles p
            ) ranked
            WHERE {where_sql}
            """,
            tuple(params),
        ).fetchone()["total"]
        rows = conn.execute(
            f"""
            SELECT *
            FROM (
              SELECT
                p.id,
                p.email,
                p.display_name,
                p.role::text AS role,
                p.status,
                p.created_at,
                p.last_login_at,
                {_user_code_sql("p")},
                (SELECT COUNT(*)::int FROM public.test_attempts ta WHERE ta.user_id = p.id) AS attempt_count,
                (SELECT COUNT(*)::int FROM public.chat_sessions cs WHERE cs.user_id = p.id) AS chat_session_count
              FROM public.profiles p
            ) ranked
            WHERE {where_sql}
            ORDER BY ranked.created_at DESC
            LIMIT %s OFFSET %s
            """,
            tuple([*params, safe_limit, safe_offset]),
        ).fetchall()
    users = []
    for row in rows or []:
        item = dict(row)
        item["user_code"] = _format_user_code(item.pop("registration_no"))
        users.append(_jsonable(item))
    return {
        "total": total,
        "limit": safe_limit,
        "offset": safe_offset,
        "users": users,
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
        ranked = conn.execute(
            f"""
            SELECT registration_no
            FROM (
              SELECT id, {_user_code_sql("p")}
              FROM public.profiles p
            ) ranked
            WHERE id = %s
            """,
            (user_uuid,),
        ).fetchone()
        profile = dict(profile)
        if ranked:
            profile["user_code"] = _format_user_code(ranked["registration_no"])
            profile["registration_no"] = ranked["registration_no"]
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


@router.get("/redemption/universal")
def admin_universal_redemption_info(admin_user_id: AdminUser):
    del admin_user_id
    from app.suite_tier import ALL_KNOWN_SUITE_SLUGS, full_suite_slug
    from app.universal_redemption import UNIVERSAL_CODE, shadow_code_for_suite

    base_slugs = sorted({full_suite_slug(slug) for slug in ALL_KNOWN_SUITE_SLUGS})
    with get_conn() as conn:
        suites: list[dict[str, Any]] = []
        for slug in base_slugs:
            shadow = shadow_code_for_suite(slug)
            row = conn.execute(
                """
                SELECT rc.id, rc.is_active, rc.status::text AS status, rc.used_count
                FROM public.redemption_codes rc
                WHERE rc.code = %s
                """,
                (shadow,),
            ).fetchone()
            suites.append(
                {
                    "suiteSlug": slug,
                    "shadowCode": shadow,
                    "provisioned": bool(row),
                    "isActive": row["is_active"] if row else False,
                    "status": row["status"] if row else None,
                    "usedCount": row["used_count"] if row else 0,
                }
            )
    return {
        "configuredCode": UNIVERSAL_CODE or None,
        "isConfigured": bool(UNIVERSAL_CODE),
        "description": "用户输入此码可解锁任意付费套题（不限次数）；后台需为各套件预置 shadow 记录。",
        "suites": suites,
        "allProvisioned": all(item["provisioned"] for item in suites),
    }


@router.post("/redemption/universal/ensure-all")
def admin_ensure_universal_shadow_codes(admin_user_id: AdminUser):
    from app.suite_tier import ALL_KNOWN_SUITE_SLUGS, full_suite_slug
    from app.universal_redemption import UNIVERSAL_CODE, ensure_shadow_redemption_code

    base_slugs = sorted({full_suite_slug(slug) for slug in ALL_KNOWN_SUITE_SLUGS})
    results: list[dict[str, Any]] = []
    with get_conn() as conn:
        for slug in base_slugs:
            try:
                row = ensure_shadow_redemption_code(conn, slug)
                results.append({"suiteSlug": slug, "ok": True, "codeId": str(row["code_id"])})
            except HTTPException as exc:
                results.append({"suiteSlug": slug, "ok": False, "error": exc.detail})
        _log_admin_action(
            conn,
            admin_user_id,
            "ensure_universal_shadow_codes",
            target_table="redemption_codes",
            after={"universalCode": UNIVERSAL_CODE, "results": results},
        )
        conn.commit()
    return {
        "ok": True,
        "universalCode": UNIVERSAL_CODE,
        "results": results,
        "allOk": all(item["ok"] for item in results),
    }


@router.post("/users/invite")
def admin_invite_user(data: InviteUserIn, admin_user_id: AdminUser):
    from app.admin_supabase import create_auth_user

    email = data.email.strip().lower()
    role = data.role.strip()
    if role not in {"user", "admin"}:
        raise HTTPException(status_code=400, detail="role 必须是 user 或 admin")
    if "@" not in email:
        raise HTTPException(status_code=400, detail="邮箱格式不正确")

    with get_conn() as conn:
        existing = conn.execute(
            "SELECT id, email, role::text AS role FROM public.profiles WHERE lower(email) = %s",
            (email,),
        ).fetchone()
        if existing:
            if role == "admin" and existing["role"] != "admin":
                row = conn.execute(
                    """
                    UPDATE public.profiles
                    SET role = 'admin'::public.user_role, updated_at = now()
                    WHERE id = %s
                    RETURNING id, email, display_name, role::text AS role, status
                    """,
                    (existing["id"],),
                ).fetchone()
                _log_admin_action(
                    conn,
                    admin_user_id,
                    "promote_user_admin",
                    target_table="profiles",
                    target_id=str(existing["id"]),
                    before=dict(existing),
                    after=dict(row),
                )
                conn.commit()
                return {"ok": True, "created": False, "promoted": True, "user": _jsonable(dict(row))}
            raise HTTPException(status_code=409, detail="该邮箱已注册")

    auth_user = create_auth_user(
        email=email,
        password=data.password,
        display_name=data.displayName,
    )
    user_id = auth_user.get("id")
    if not user_id:
        raise HTTPException(status_code=500, detail="Supabase 未返回用户 ID")

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO public.profiles(id, email, display_name, role)
            VALUES (%s, %s, %s, %s::public.user_role)
            ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
                role = EXCLUDED.role,
                updated_at = now()
            """,
            (user_id, email, data.displayName, role),
        )
        profile = conn.execute(
            """
            SELECT id, email, display_name, role::text AS role, status, created_at
            FROM public.profiles WHERE id = %s
            """,
            (user_id,),
        ).fetchone()
        _log_admin_action(
            conn,
            admin_user_id,
            "invite_user",
            target_table="profiles",
            target_id=str(user_id),
            after={"email": email, "role": role},
        )
        conn.commit()

    return {
        "ok": True,
        "created": True,
        "promoted": False,
        "user": _jsonable(dict(profile)),
        "temporaryPassword": data.password if data.password else None,
    }


@router.patch("/users/{user_id}")
def admin_patch_user(user_id: str, data: PatchUserIn, admin_user_id: AdminUser):
    user_uuid = _safe_uuid(user_id, "userId")
    if str(user_uuid) == admin_user_id and data.role == "user":
        raise HTTPException(status_code=400, detail="不能取消自己的管理员权限")

    updates: list[str] = []
    params: list[Any] = []
    if data.role is not None:
        if data.role not in {"user", "admin"}:
            raise HTTPException(status_code=400, detail="role 必须是 user 或 admin")
        updates.append("role = %s::public.user_role")
        params.append(data.role)
    if data.status is not None:
        if data.status not in {"active", "suspended"}:
            raise HTTPException(status_code=400, detail="status 必须是 active 或 suspended")
        updates.append("status = %s")
        params.append(data.status)
    if data.displayName is not None:
        updates.append("display_name = %s")
        params.append(data.displayName.strip() or None)
    if not updates:
        raise HTTPException(status_code=400, detail="没有可更新字段")

    with get_conn() as conn:
        before = conn.execute(
            "SELECT id, email, display_name, role::text AS role, status FROM public.profiles WHERE id = %s",
            (user_uuid,),
        ).fetchone()
        if not before:
            raise HTTPException(status_code=404, detail="用户不存在")
        row = conn.execute(
            f"""
            UPDATE public.profiles
            SET {", ".join(updates)}, updated_at = now()
            WHERE id = %s
            RETURNING id, email, display_name, role::text AS role, status, created_at, last_login_at
            """,
            tuple([*params, user_uuid]),
        ).fetchone()
        _log_admin_action(
            conn,
            admin_user_id,
            "patch_user",
            target_table="profiles",
            target_id=str(user_uuid),
            before=dict(before),
            after=dict(row),
        )
        conn.commit()
    return {"ok": True, "user": _jsonable(dict(row))}


@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: str,
    admin_user_id: AdminUser,
    hard: bool = Query(default=False),
):
    from app.admin_supabase import delete_auth_user

    user_uuid = _safe_uuid(user_id, "userId")
    if str(user_uuid) == admin_user_id:
        raise HTTPException(status_code=400, detail="不能删除当前登录的管理员账号")

    with get_conn() as conn:
        before = conn.execute(
            "SELECT id, email, role::text AS role, status FROM public.profiles WHERE id = %s",
            (user_uuid,),
        ).fetchone()
        if not before:
            raise HTTPException(status_code=404, detail="用户不存在")

        if hard:
            delete_auth_user(str(user_uuid))
            _log_admin_action(
                conn,
                admin_user_id,
                "delete_user_hard",
                target_table="profiles",
                target_id=str(user_uuid),
                before=dict(before),
            )
            conn.commit()
            return {"ok": True, "hard": True, "deletedUserId": str(user_uuid)}

        row = conn.execute(
            """
            UPDATE public.profiles
            SET status = 'suspended', updated_at = now()
            WHERE id = %s
            RETURNING id, email, status
            """,
            (user_uuid,),
        ).fetchone()
        _log_admin_action(
            conn,
            admin_user_id,
            "delete_user_soft",
            target_table="profiles",
            target_id=str(user_uuid),
            before=dict(before),
            after=dict(row),
        )
        conn.commit()
    return {"ok": True, "hard": False, "user": _jsonable(dict(row))}


@router.get("/questions/stats")
def admin_question_stats(admin_user_id: AdminUser, suiteSlug: str):
    del admin_user_id
    slug = suiteSlug.strip()
    if not slug:
        raise HTTPException(status_code=400, detail="suiteSlug 必填")
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT
              ts.slug,
              ts.name,
              ts.total_questions,
              COUNT(tq.id) FILTER (WHERE tq.is_active)::int AS active_count,
              COUNT(tq.id) FILTER (WHERE NOT tq.is_active)::int AS inactive_count,
              COUNT(tq.id) FILTER (
                WHERE NOT tq.is_active
                  AND NOT EXISTS (
                    SELECT 1 FROM public.test_attempt_answers taa WHERE taa.question_id = tq.id
                  )
              )::int AS deletable_inactive_count
            FROM public.test_suites ts
            LEFT JOIN public.test_questions tq ON tq.suite_id = ts.id
            WHERE ts.slug = %s
            GROUP BY ts.id, ts.slug, ts.name, ts.total_questions
            """,
            (slug,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="测试套件不存在")
    return {"stats": _jsonable(dict(row))}


@router.get("/questions")
def admin_list_questions(
    admin_user_id: AdminUser,
    suiteSlug: str,
    q: str | None = None,
    activeOnly: bool = False,
    inactiveOnly: bool = False,
    limit: int = 50,
    offset: int = 0,
):
    del admin_user_id
    if not suiteSlug.strip():
        raise HTTPException(status_code=400, detail="suiteSlug 必填")
    if activeOnly and inactiveOnly:
        raise HTTPException(status_code=400, detail="activeOnly 与 inactiveOnly 不能同时为 true")
    safe_limit = _clamp_limit(limit, default=50, maximum=200)
    safe_offset = max(0, offset)
    filters = ["ts.slug = %s"]
    params: list[Any] = [suiteSlug.strip()]
    if q:
        filters.append("(tq.question_text ILIKE %s OR tq.external_question_id ILIKE %s)")
        like = f"%{q.strip()}%"
        params.extend([like, like])
    if activeOnly:
        filters.append("tq.is_active = true")
    elif inactiveOnly:
        filters.append("tq.is_active = false")
    where_sql = " AND ".join(filters)

    with get_conn() as conn:
        total = conn.execute(
            f"""
            SELECT COUNT(*)::int AS total
            FROM public.test_questions tq
            JOIN public.test_suites ts ON ts.id = tq.suite_id
            WHERE {where_sql}
            """,
            tuple(params),
        ).fetchone()["total"]
        rows = conn.execute(
            f"""
            SELECT
              tq.id,
              tq.external_question_id,
              tq.display_order,
              tq.dimension_code,
              tq.question_type,
              tq.weight,
              tq.direction,
              tq.question_text,
              tq.question_payload,
              tq.is_active,
              tq.updated_at,
              ts.slug AS suite_slug,
              ts.name AS suite_name,
              (SELECT COUNT(*)::int FROM public.test_attempt_answers taa WHERE taa.question_id = tq.id) AS answer_ref_count
            FROM public.test_questions tq
            JOIN public.test_suites ts ON ts.id = tq.suite_id
            WHERE {where_sql}
            ORDER BY tq.is_active DESC, tq.display_order ASC
            LIMIT %s OFFSET %s
            """,
            tuple([*params, safe_limit, safe_offset]),
        ).fetchall()
    questions = []
    for row in rows or []:
        item = dict(row)
        ref_count = item.pop("answer_ref_count", 0) or 0
        item["answerRefCount"] = ref_count
        item["canDelete"] = not item.get("is_active") and ref_count == 0
        questions.append(_jsonable(item))
    return {
        "total": total,
        "limit": safe_limit,
        "offset": safe_offset,
        "questions": questions,
    }


@router.get("/questions/{question_id}")
def admin_question_detail(question_id: str, admin_user_id: AdminUser):
    del admin_user_id
    q_uuid = _safe_uuid(question_id, "questionId")
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT
              tq.id,
              tq.external_question_id,
              tq.display_order,
              tq.dimension_code,
              tq.question_type,
              tq.weight,
              tq.direction,
              tq.question_text,
              tq.question_payload,
              tq.scoring_payload,
              tq.is_active,
              tq.updated_at,
              ts.slug AS suite_slug,
              ts.name AS suite_name
            FROM public.test_questions tq
            JOIN public.test_suites ts ON ts.id = tq.suite_id
            WHERE tq.id = %s
            """,
            (q_uuid,),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="题目不存在")
    return {"question": _jsonable(dict(row))}


@router.patch("/questions/{question_id}")
def admin_patch_question(question_id: str, data: PatchQuestionIn, admin_user_id: AdminUser):
    q_uuid = _safe_uuid(question_id, "questionId")
    if data.direction is not None and data.direction not in {"positive", "negative", "neutral", "reverse"}:
        raise HTTPException(status_code=400, detail="direction 无效")

    updates: list[str] = []
    params: list[Any] = []
    field_map = {
        "question_text": data.questionText,
        "is_active": data.isActive,
        "display_order": data.displayOrder,
        "weight": data.weight,
        "direction": data.direction,
    }
    for column, value in field_map.items():
        if value is not None:
            updates.append(f"{column} = %s")
            params.append(value)
    if data.questionPayload is not None:
        updates.append("question_payload = %s")
        params.append(Jsonb(data.questionPayload))
    if not updates:
        raise HTTPException(status_code=400, detail="没有可更新字段")

    with get_conn() as conn:
        before = conn.execute(
            """
            SELECT id, external_question_id, question_text, is_active, display_order, direction
            FROM public.test_questions WHERE id = %s
            """,
            (q_uuid,),
        ).fetchone()
        if not before:
            raise HTTPException(status_code=404, detail="题目不存在")
        row = conn.execute(
            f"""
            UPDATE public.test_questions
            SET {", ".join(updates)}, updated_at = now()
            WHERE id = %s
            RETURNING id, external_question_id, display_order, question_text, is_active, direction, updated_at
            """,
            tuple([*params, q_uuid]),
        ).fetchone()
        _log_admin_action(
            conn,
            admin_user_id,
            "patch_question",
            target_table="test_questions",
            target_id=str(q_uuid),
            before=dict(before),
            after=dict(row),
        )
        conn.commit()
    return {"ok": True, "question": _jsonable(dict(row))}


@router.delete("/questions/{question_id}")
def admin_delete_question(question_id: str, admin_user_id: AdminUser):
    q_uuid = _safe_uuid(question_id, "questionId")
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT
              tq.id,
              tq.external_question_id,
              tq.question_text,
              tq.is_active,
              ts.slug AS suite_slug,
              (SELECT COUNT(*)::int FROM public.test_attempt_answers taa WHERE taa.question_id = tq.id) AS answer_ref_count
            FROM public.test_questions tq
            JOIN public.test_suites ts ON ts.id = tq.suite_id
            WHERE tq.id = %s
            """,
            (q_uuid,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="题目不存在")
        if row["is_active"]:
            raise HTTPException(status_code=400, detail="在线题目不能直接删除，请先下线")
        if row["answer_ref_count"]:
            raise HTTPException(status_code=409, detail="该题已有用户作答记录，无法删除")

        conn.execute("DELETE FROM public.test_questions WHERE id = %s", (q_uuid,))
        _log_admin_action(
            conn,
            admin_user_id,
            "delete_question",
            target_table="test_questions",
            target_id=str(q_uuid),
            before=dict(row),
        )
        conn.commit()
    return {"ok": True, "deletedQuestionId": str(q_uuid)}


@router.post("/questions/purge-inactive")
def admin_purge_inactive_questions(admin_user_id: AdminUser, suiteSlug: str):
    slug = suiteSlug.strip()
    if not slug:
        raise HTTPException(status_code=400, detail="suiteSlug 必填")
    with get_conn() as conn:
        suite = conn.execute(
            "SELECT id, slug, name FROM public.test_suites WHERE slug = %s",
            (slug,),
        ).fetchone()
        if not suite:
            raise HTTPException(status_code=404, detail="测试套件不存在")

        blocked = conn.execute(
            """
            SELECT COUNT(*)::int AS c
            FROM public.test_questions tq
            WHERE tq.suite_id = %s
              AND tq.is_active = false
              AND EXISTS (SELECT 1 FROM public.test_attempt_answers taa WHERE taa.question_id = tq.id)
            """,
            (suite["id"],),
        ).fetchone()["c"]

        deleted_rows = conn.execute(
            """
            DELETE FROM public.test_questions tq
            WHERE tq.suite_id = %s
              AND tq.is_active = false
              AND NOT EXISTS (
                SELECT 1 FROM public.test_attempt_answers taa WHERE taa.question_id = tq.id
              )
            RETURNING tq.id, tq.external_question_id
            """,
            (suite["id"],),
        ).fetchall()

        _log_admin_action(
            conn,
            admin_user_id,
            "purge_inactive_questions",
            target_table="test_questions",
            target_id=slug,
            after={
                "suiteSlug": slug,
                "deletedCount": len(deleted_rows),
                "blockedWithAnswers": blocked,
                "sampleIds": [str(item["id"]) for item in deleted_rows[:20]],
            },
        )
        conn.commit()

    return {
        "ok": True,
        "suiteSlug": slug,
        "deletedCount": len(deleted_rows),
        "blockedWithAnswers": blocked,
        "deleted": [_jsonable(dict(item)) for item in deleted_rows[:50]],
    }


@router.get("/audit/logs")
def admin_audit_logs(
    admin_user_id: AdminUser,
    action: str | None = None,
    q: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    del admin_user_id
    safe_limit = _clamp_limit(limit, default=50, maximum=200)
    safe_offset = max(0, offset)
    filters = ["1=1"]
    params: list[Any] = []
    if action:
        filters.append("al.action = %s")
        params.append(action.strip())
    if q:
        like = f"%{q.strip()}%"
        filters.append(
            "(al.action ILIKE %s OR al.target_table ILIKE %s OR al.target_id ILIKE %s OR p.email ILIKE %s)"
        )
        params.extend([like, like, like, like])
    where_sql = " AND ".join(filters)
    with get_conn() as conn:
        total = conn.execute(
            f"""
            SELECT COUNT(*)::int AS total
            FROM public.admin_audit_logs al
            LEFT JOIN public.profiles p ON p.id = al.admin_user_id
            WHERE {where_sql}
            """,
            tuple(params),
        ).fetchone()["total"]
        rows = conn.execute(
            f"""
            SELECT
              al.id,
              al.action,
              al.target_table,
              al.target_id,
              al.before_payload,
              al.after_payload,
              al.created_at,
              al.admin_user_id,
              p.email AS admin_email,
              p.display_name AS admin_name
            FROM public.admin_audit_logs al
            LEFT JOIN public.profiles p ON p.id = al.admin_user_id
            WHERE {where_sql}
            ORDER BY al.created_at DESC
            LIMIT %s OFFSET %s
            """,
            tuple([*params, safe_limit, safe_offset]),
        ).fetchall()
        action_types = conn.execute(
            """
            SELECT action, COUNT(*)::int AS count
            FROM public.admin_audit_logs
            GROUP BY action
            ORDER BY count DESC, action ASC
            LIMIT 30
            """
        ).fetchall()
    return {
        "total": total,
        "limit": safe_limit,
        "offset": safe_offset,
        "logs": [_jsonable(dict(row)) for row in rows],
        "actionTypes": [_jsonable(dict(row)) for row in action_types],
    }


@router.get("/chat/analytics")
def admin_chat_analytics(admin_user_id: AdminUser, limit: int = 30):
    del admin_user_id
    safe_limit = _clamp_limit(limit, default=30, maximum=100)
    with get_conn() as conn:
        summary = conn.execute(
            """
            SELECT
              (SELECT COUNT(*)::int FROM public.chat_sessions) AS total_sessions,
              (SELECT COUNT(*)::int FROM public.chat_sessions
                 WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Shanghai')) AS sessions_today,
              (SELECT COUNT(*)::int FROM public.chat_messages) AS total_messages,
              (SELECT COUNT(*)::int FROM public.chat_messages
                 WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Shanghai')) AS messages_today,
              (SELECT COUNT(DISTINCT user_id)::int FROM public.chat_sessions) AS unique_chat_users
            """
        ).fetchone()
        by_analyst = conn.execute(
            """
            SELECT
              ca.slug,
              ca.name,
              COUNT(cs.id)::int AS session_count,
              (SELECT COUNT(*)::int FROM public.chat_messages cm
               JOIN public.chat_sessions cs2 ON cs2.id = cm.session_id
               WHERE cs2.analyst_id = ca.id) AS message_count
            FROM public.chat_analysts ca
            LEFT JOIN public.chat_sessions cs ON cs.analyst_id = ca.id
            GROUP BY ca.id, ca.slug, ca.name, ca.display_order
            ORDER BY ca.display_order, ca.slug
            """
        ).fetchall()
        recent = conn.execute(
            """
            SELECT
              cs.id,
              cs.title,
              cs.created_at,
              cs.updated_at,
              p.email AS user_email,
              ca.slug AS analyst_slug,
              ca.name AS analyst_name,
              (SELECT COUNT(*)::int FROM public.chat_messages cm WHERE cm.session_id = cs.id) AS message_count
            FROM public.chat_sessions cs
            LEFT JOIN public.profiles p ON p.id = cs.user_id
            LEFT JOIN public.chat_analysts ca ON ca.id = cs.analyst_id
            ORDER BY cs.updated_at DESC
            LIMIT %s
            """,
            (safe_limit,),
        ).fetchall()
    return {
        "summary": _jsonable(dict(summary or {})),
        "byAnalyst": [_jsonable(dict(row)) for row in by_analyst],
        "recentSessions": [_jsonable(dict(row)) for row in recent],
    }
