#!/usr/bin/env python3
"""Verify MIRROR-ALL-ACCESS unlocks every known suite slug (12 cases).

Usage:
  LOVECOMPASS_API_BASE=https://lovecompass-api-backend.vercel.app \\
    python3 scripts/test_universal_all_suites.py
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.suite_tier import ALL_KNOWN_SUITE_SLUGS, parse_suite_slug

ENV = ROOT / ".env"
if ENV.exists():
    for raw in ENV.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

API_BASE = os.getenv("LOVECOMPASS_API_BASE", "http://127.0.0.1:8000").rstrip("/")
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wjfpglsygkbpubanylug.supabase.co").rstrip("/")
SUPABASE_ANON_KEY = os.getenv(
    "SUPABASE_ANON_KEY",
    os.getenv(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZnBnbHN5Z2ticHViYW55bHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODIzMDUsImV4cCI6MjA5NTA1ODMwNX0.a38qw2kaeEZ-T2N5gTLKwQWdBb02iV1riHWhstbqptk",
    ),
)

EMAIL = os.getenv("INITIATOR_EMAIL", "lovecompass.test@example.com")
PASSWORD = os.getenv("INITIATOR_PASSWORD", "LoveCompassTest2026!")
UNIVERSAL_CODE = os.getenv("LOVECOMPASS_UNIVERSAL_CODE", "MIRROR-ALL-ACCESS")

CODE_VARIANTS = (
    UNIVERSAL_CODE,
    "mirror all access",
    "MIRROR ALL ACCESS",
)


def _request(
    method: str,
    path: str,
    *,
    payload: dict | None = None,
    token: str | None = None,
) -> tuple[int, dict[str, Any]]:
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(f"{API_BASE}{path}", data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except json.JSONDecodeError:
            parsed = {"raw": body}
        return exc.code, parsed


def _login(email: str, password: str) -> str:
    payload = json.dumps({"email": email, "password": password}).encode("utf-8")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        data=payload,
        headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    token = data.get("access_token")
    if not token:
        raise RuntimeError(f"login failed for {email}: {data}")
    return token


def main() -> None:
    status, _ = _request("GET", "/health")
    if status >= 400:
        raise SystemExit(f"health check failed: {status}")

    token = _login(EMAIL, PASSWORD)
    print({"api": API_BASE, "suites": len(ALL_KNOWN_SUITE_SLUGS), "code": UNIVERSAL_CODE})

    for suite_slug in sorted(ALL_KNOWN_SUITE_SLUGS):
        product, gender, _ = parse_suite_slug(suite_slug)
        verify = _request(
            "POST",
            "/redemption/verify",
            payload={
                "code": UNIVERSAL_CODE,
                "product": product,
                "suiteSlug": suite_slug,
                "gender": gender,
            },
            token=token,
        )
        status, body = verify
        if status >= 400 or body.get("suiteSlug") != suite_slug:
            raise SystemExit(
                f"verify failed for {suite_slug}: status={status}, body={body}",
            )
        if not body.get("redemptionEventId"):
            raise SystemExit(f"missing redemptionEventId for {suite_slug}")
        print({"suite": suite_slug, "ok": True})

    # Spot-check alternate spellings on one suite.
    sample = "s02_ros_female_lite"
    for variant in CODE_VARIANTS[1:]:
        status, body = _request(
            "POST",
            "/redemption/verify",
            payload={
                "code": variant,
                "product": "ros",
                "suiteSlug": sample,
                "gender": "female",
            },
            token=token,
        )
        if status >= 400 or body.get("suiteSlug") != sample:
            raise SystemExit(f"variant {variant!r} failed: status={status}, body={body}")

    print(json.dumps({"universal_all_suites": "ok", "count": len(ALL_KNOWN_SUITE_SLUGS)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
