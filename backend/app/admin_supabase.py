"""Supabase Auth Admin API — create/delete users via service role key."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import Any

from fastapi import HTTPException

from app.auth import _supabase_url


def _service_role_key() -> str:
    key = (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not key:
        raise HTTPException(
            status_code=503,
            detail="服务端未配置 SUPABASE_SERVICE_ROLE_KEY，无法创建或删除 Auth 用户",
        )
    return key


def supabase_admin_request(method: str, path: str, body: dict[str, Any] | None = None) -> dict[str, Any]:
    base = _supabase_url()
    if not base:
        raise HTTPException(status_code=503, detail="SUPABASE_URL 未配置")
    url = f"{base}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    key = _service_role_key()
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read()
            if not raw:
                return {}
            payload = json.loads(raw)
            return payload if isinstance(payload, dict) else {"data": payload}
    except urllib.error.HTTPError as exc:
        detail_raw = exc.read().decode("utf-8", errors="replace")
        message = detail_raw
        try:
            parsed = json.loads(detail_raw)
            if isinstance(parsed, dict):
                message = (
                    parsed.get("msg")
                    or parsed.get("message")
                    or parsed.get("error_description")
                    or parsed.get("error")
                    or detail_raw
                )
        except json.JSONDecodeError:
            pass
        status = exc.code if 400 <= exc.code < 600 else 502
        raise HTTPException(status_code=status, detail=f"Supabase Auth：{message}") from exc
    except urllib.error.URLError as exc:
        raise HTTPException(status_code=502, detail=f"Supabase Auth 连接失败：{exc.reason}") from exc


def create_auth_user(
    *,
    email: str,
    password: str | None = None,
    email_confirm: bool = True,
    display_name: str | None = None,
) -> dict[str, Any]:
    body: dict[str, Any] = {"email": email.strip().lower(), "email_confirm": email_confirm}
    if password:
        body["password"] = password
    if display_name:
        body["user_metadata"] = {"display_name": display_name.strip()}
    return supabase_admin_request("POST", "/auth/v1/admin/users", body)


def delete_auth_user(user_id: str) -> None:
    supabase_admin_request("DELETE", f"/auth/v1/admin/users/{user_id}")
