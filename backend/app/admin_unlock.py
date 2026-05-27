"""Password-based temporary admin unlock — bound to logged-in user, short-lived JWT."""

from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from jwt.exceptions import PyJWTError

UNLOCK_TOKEN_TYPE = "mirror_admin_unlock"
DEFAULT_TTL_HOURS = 12


def _signing_secret() -> str:
    secret = (os.getenv("LOVECOMPASS_ADMIN_UNLOCK_SECRET") or os.getenv("SUPABASE_JWT_SECRET") or "").strip()
    if not secret:
        raise RuntimeError("需要 SUPABASE_JWT_SECRET 或 LOVECOMPASS_ADMIN_UNLOCK_SECRET 才能签发管理解锁令牌")
    return secret


def admin_password_configured() -> bool:
    return bool((os.getenv("LOVECOMPASS_ADMIN_PASSWORD") or "").strip())


def verify_admin_password(password: str) -> bool:
    configured = (os.getenv("LOVECOMPASS_ADMIN_PASSWORD") or "").strip()
    if not configured:
        return False
    return secrets.compare_digest(password.strip(), configured)


def unlock_ttl_hours() -> int:
    raw = (os.getenv("LOVECOMPASS_ADMIN_UNLOCK_HOURS") or "").strip()
    try:
        hours = int(raw) if raw else DEFAULT_TTL_HOURS
    except ValueError:
        hours = DEFAULT_TTL_HOURS
    return max(1, min(hours, 72))


def issue_admin_unlock_token(user_id: str) -> tuple[str, str]:
    now = datetime.now(timezone.utc)
    exp = now + timedelta(hours=unlock_ttl_hours())
    payload = {
        "sub": user_id,
        "type": UNLOCK_TOKEN_TYPE,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    token = jwt.encode(payload, _signing_secret(), algorithm="HS256")
    return token, exp.isoformat()


def verify_admin_unlock_token(token: str, expected_user_id: str) -> bool:
    if not token or not expected_user_id:
        return False
    try:
        payload = jwt.decode(token, _signing_secret(), algorithms=["HS256"])
    except PyJWTError:
        return False
    if payload.get("type") != UNLOCK_TOKEN_TYPE:
        return False
    return str(payload.get("sub")) == str(expected_user_id)
