#!/usr/bin/env python3
"""Smoke test POST /chat/sync-profile (requires DATABASE_URL + valid user in .env override)."""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
ENV = ROOT / ".env"
if ENV.exists():
    for raw in ENV.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

from fastapi.testclient import TestClient
from app.auth import resolve_user_id
from app.db import get_conn
from app.main import app


def main() -> None:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT user_id
            FROM public.test_attempts
            WHERE status = 'completed'
            ORDER BY completed_at DESC NULLS LAST
            LIMIT 1
            """
        ).fetchone()
    if not row:
        raise SystemExit("no completed attempt")
    user_id = str(row["user_id"])

    app.dependency_overrides[resolve_user_id] = lambda: user_id
    client = TestClient(app)
    started = time.perf_counter()
    resp = client.post("/chat/sync-profile")
    elapsed = time.perf_counter() - started
    app.dependency_overrides.clear()

    if resp.status_code >= 400:
        raise SystemExit(f"sync-profile failed: {resp.status_code} {resp.text[:400]}")
    data = resp.json()
    if not data.get("acknowledgment"):
        raise SystemExit("missing acknowledgment")
    print({"status": resp.status_code, "elapsed_s": round(elapsed, 2), "bound": data.get("bound")})
    print("sync_profile_endpoint=ok")


if __name__ == "__main__":
    main()
