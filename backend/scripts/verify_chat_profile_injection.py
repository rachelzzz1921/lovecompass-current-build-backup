#!/usr/bin/env python3
"""Verify chat portrait/profile blocks are injected (requires DATABASE_URL in .env)."""

from __future__ import annotations

import os
import sys
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

from app.chat_context import build_chat_messages, resolve_analyst_row, resolve_attempt_or_latest
from app.db import get_conn


def main() -> None:
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT id, user_id
            FROM public.test_attempts
            WHERE status = 'completed'
            ORDER BY completed_at DESC NULLS LAST
            LIMIT 1
            """
        ).fetchone()
    if not row:
        raise SystemExit("no completed attempt")

    user_id = str(row["user_id"])
    attempt_id = str(row["id"])

    with get_conn() as conn:
        attempt = resolve_attempt_or_latest(conn, user_id, attempt_id)
        analyst = resolve_analyst_row(conn, "oracle")
        messages, injection = build_chat_messages(
            analyst,
            attempt,
            [],
            "值不值得继续",
            conn=conn,
            user_id=user_id,
        )

    meta = injection.to_meta()
    if not meta.get("profileReady"):
        raise SystemExit(f"profile not injected: {meta}")

    portrait_hits = sum(
        1 for m in messages if m["role"] == "user" and "画像" in m["content"]
    )
    if portrait_hits < 1:
        raise SystemExit("no portrait/profile user blocks in messages")

    print("chat_profile_injection=ok")
    print(meta)
    print(f"user_context_blocks={portrait_hits}")


if __name__ == "__main__":
    main()
