from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from typing import Annotated, Any

import jwt
from fastapi import Header, HTTPException
from jwt.exceptions import PyJWTError

DEMO_USER_ID = os.getenv("LOVECOMPASS_DEMO_USER_ID", "00000000-0000-0000-0000-000000000001")
ALLOW_DEMO_FALLBACK = os.getenv("LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK", "").strip().lower() in {
    "1",
    "true",
    "yes",
}

_ASYMMETRIC_ALGS = frozenset({"ES256", "RS256"})
_AUTH_VERSION = "jwks-v2"
_jwks_cache: dict[str, Any] | None = None


def auth_version() -> str:
    return _AUTH_VERSION


_SUPABASE_URL_RE = re.compile(r"https?://[\w.-]+\.supabase\.co", re.IGNORECASE)


def _supabase_url() -> str:
    raw = (os.getenv("SUPABASE_URL") or "").strip().strip('"').strip("'")
    match = _SUPABASE_URL_RE.search(raw)
    if match:
        return match.group(0).rstrip("/")
    lowered = raw.lower()
    for prefix in ("value:", "value："):
        if lowered.startswith(prefix):
            raw = raw[len(prefix) :].strip()
            break
    if raw.upper().startswith("SUPABASE_URL="):
        raw = raw.split("=", 1)[1].strip()
    raw = raw.rstrip("/")
    if raw.endswith("/auth/v1"):
        raw = raw[: -len("/auth/v1")].rstrip("/")
    if raw and not raw.startswith(("http://", "https://")) and "supabase.co" in raw:
        raw = f"https://{raw.lstrip('/')}"
    return raw


def _jwt_secret() -> str:
    return (os.getenv("SUPABASE_JWT_SECRET") or "").strip()


def _supabase_issuer() -> str:
    url = _supabase_url()
    return f"{url}/auth/v1" if url else ""


def _jwks_url() -> str:
    url = _supabase_url()
    return f"{url}/auth/v1/.well-known/jwks.json" if url else ""


def _load_jwks(*, force: bool = False) -> dict[str, Any]:
    global _jwks_cache
    jwks_url = _jwks_url()
    if not jwks_url:
        raise PyJWTError("SUPABASE_URL is not configured")
    if _jwks_cache is not None and not force:
        return _jwks_cache
    req = urllib.request.Request(jwks_url, headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            payload = json.load(resp)
    except urllib.error.URLError as exc:
        raise PyJWTError(f"JWKS fetch failed: {exc.reason}") from exc
    if not isinstance(payload, dict) or not payload.get("keys"):
        raise PyJWTError("JWKS response missing keys")
    _jwks_cache = payload
    return payload


def _signing_key_from_jwt(token: str) -> Any:
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    jwks = _load_jwks()
    keys = jwks.get("keys", [])
    jwk_dict = next((key for key in keys if key.get("kid") == kid), None)
    if jwk_dict is None and keys:
        jwk_dict = keys[0]
    if jwk_dict is None:
        raise PyJWTError("No signing key found in JWKS")
    try:
        from jwt import PyJWK

        return PyJWK.from_dict(jwk_dict).key
    except Exception as exc:
        raise PyJWTError(f"Unable to load signing key: {exc}") from exc


def probe_jwks() -> dict[str, Any]:
    url = _supabase_url()
    if not url:
        return {"ok": False, "reason": "missing_supabase_url"}
    try:
        import cryptography  # noqa: F401
    except ImportError:
        return {"ok": False, "reason": "cryptography_not_installed"}
    try:
        jwks = _load_jwks(force=True)
        return {
            "ok": True,
            "keyCount": len(jwks.get("keys", [])),
            "jwksUrl": _jwks_url(),
            "issuerExpected": _supabase_issuer(),
        }
    except PyJWTError as exc:
        return {"ok": False, "reason": type(exc).__name__, "detail": str(exc)[:200]}
    except Exception as exc:
        return {"ok": False, "reason": type(exc).__name__, "detail": str(exc)[:200]}


def probe_jwt_token(token: str) -> dict[str, Any]:
    header = jwt.get_unverified_header(token)
    claims = jwt.decode(token, options={"verify_signature": False})
    result: dict[str, Any] = {
        "alg": header.get("alg"),
        "issuerClaim": claims.get("iss"),
        "issuerExpected": _supabase_issuer(),
        "audienceClaim": claims.get("aud"),
    }
    try:
        payload = _decode_supabase_jwt(token)
    except HTTPException as exc:
        result.update({"ok": False, "status": exc.status_code, "detail": str(exc.detail)[:200]})
        return result
    except PyJWTError as exc:
        result.update({"ok": False, "reason": type(exc).__name__, "detail": str(exc)[:200]})
        return result
    result.update({"ok": True, "subPresent": bool(payload.get("sub"))})
    return result


def _decode_supabase_jwt(token: str) -> dict[str, Any]:
    header = jwt.get_unverified_header(token)
    alg = header.get("alg") or "HS256"
    issuer = _supabase_issuer()

    if alg in _ASYMMETRIC_ALGS:
        if not issuer:
            raise HTTPException(
                status_code=500,
                detail="服务端未配置 SUPABASE_URL，无法验证登录令牌",
            )
        signing_key = _signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key,
            algorithms=[alg],
            audience="authenticated",
            issuer=issuer,
        )

    secret = _jwt_secret()
    if not secret:
        raise HTTPException(status_code=500, detail="服务端未配置 SUPABASE_JWT_SECRET")
    return jwt.decode(
        token,
        secret,
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
