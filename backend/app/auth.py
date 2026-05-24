from __future__ import annotations

import os
from functools import lru_cache
from typing import Annotated, Any

import jwt
from fastapi import Header, HTTPException
from jwt import PyJWKClient
from jwt.exceptions import PyJWTError

DEMO_USER_ID = os.getenv("LOVECOMPASS_DEMO_USER_ID", "00000000-0000-0000-0000-000000000001")
JWT_SECRET = (os.getenv("SUPABASE_JWT_SECRET") or "").strip()
SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").strip().rstrip("/")
ALLOW_DEMO_FALLBACK = os.getenv("LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK", "").strip().lower() in {
    "1",
    "true",
    "yes",
}

_ASYMMETRIC_ALGS = frozenset({"ES256", "RS256"})


@lru_cache(maxsize=1)
def _jwks_client() -> PyJWKClient | None:
    if not SUPABASE_URL:
        return None
    return PyJWKClient(f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json", cache_keys=True)


def _decode_supabase_jwt(token: str) -> dict[str, Any]:
    header = jwt.get_unverified_header(token)
    alg = header.get("alg") or "HS256"

    if alg in _ASYMMETRIC_ALGS:
        client = _jwks_client()
        if client is None:
            raise HTTPException(
                status_code=500,
                detail="服务端未配置 SUPABASE_URL，无法验证登录令牌",
            )
        signing_key = client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=[alg],
            audience="authenticated",
            issuer=f"{SUPABASE_URL}/auth/v1",
        )

    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="服务端未配置 SUPABASE_JWT_SECRET")
    return jwt.decode(
        token,
        JWT_SECRET,
        algorithms=["HS256"],
        audience="authenticated",
    )


def resolve_user_id(authorization: Annotated[str | None, Header()] = None) -> str:
    """Resolve Supabase Auth user id from Bearer JWT, or demo user when fallback is enabled."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        if not token:
            raise HTTPException(status_code=401, detail="未提供登录令牌")
        try:
            payload = _decode_supabase_jwt(token)
        except PyJWTError as exc:
            raise HTTPException(
                status_code=401,
                detail="无效或过期的登录令牌，请重新登录",
            ) from exc
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="登录令牌缺少用户标识")
        return str(sub)

    if ALLOW_DEMO_FALLBACK:
        return DEMO_USER_ID

    raise HTTPException(status_code=401, detail="需要登录")
