from __future__ import annotations

import os
from typing import Annotated

import jwt
from fastapi import Header, HTTPException

DEMO_USER_ID = os.getenv("LOVECOMPASS_DEMO_USER_ID", "00000000-0000-0000-0000-000000000001")
JWT_SECRET = (os.getenv("SUPABASE_JWT_SECRET") or "").strip()
ALLOW_DEMO_FALLBACK = os.getenv("LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK", "").strip().lower() in {
    "1",
    "true",
    "yes",
}


def resolve_user_id(authorization: Annotated[str | None, Header()] = None) -> str:
    """Resolve Supabase Auth user id from Bearer JWT, or demo user when fallback is enabled."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        if not token:
            raise HTTPException(status_code=401, detail="未提供登录令牌")
        if not JWT_SECRET:
            raise HTTPException(status_code=500, detail="服务端未配置 SUPABASE_JWT_SECRET")
        try:
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        except jwt.PyJWTError as exc:
            raise HTTPException(status_code=401, detail="无效或过期的登录令牌") from exc
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="登录令牌缺少用户标识")
        return str(sub)

    if ALLOW_DEMO_FALLBACK:
        return DEMO_USER_ID

    raise HTTPException(status_code=401, detail="需要登录")
