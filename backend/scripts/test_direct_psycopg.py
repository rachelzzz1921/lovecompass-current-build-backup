#!/usr/bin/env python3
"""Minimal direct psycopg test — no ConnectionPool.

Usage:
  DATABASE_URL='postgresql://postgres.ref:pass@...pooler...:6543/postgres' \\
    python3 scripts/test_direct_psycopg.py
"""
from __future__ import annotations

import os
import socket
import sys
import time
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import psycopg

from app.db import database_conninfo, normalize_database_url


def mask_url(url: str) -> str:
    parts = urlsplit(url.strip().strip('"').strip("'"))
    host = parts.hostname or "?"
    port = parts.port or 5432
    user = parts.username or "?"
    return f"{parts.scheme}://{user}:***@{host}:{port}{parts.path or '/postgres'}"


def run(label: str, fn) -> bool:
    print(f"\n[{label}]")
    t0 = time.perf_counter()
    try:
        fn()
        print(f"  OK ({time.perf_counter() - t0:.2f}s)")
        return True
    except Exception as exc:
        print(f"  FAIL ({time.perf_counter() - t0:.2f}s) {type(exc).__name__}: {exc}")
        return False


def main() -> int:
    raw = (os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL") or "").strip()
    if not raw:
        print("ERROR: set DATABASE_URL")
        return 1

    print("DATABASE_URL =", mask_url(raw))
    cfg = database_conninfo(raw)
    print("parsed sslmode =", cfg.get("sslmode"), "| user =", cfg.get("user"))

    parts = urlsplit(raw.replace("postgres://", "postgresql://", 1))
    host = parts.hostname or "localhost"
    port = parts.port or 6543

    run("DNS", lambda: print("  ->", socket.getaddrinfo(host, port)[0][4][0]))

    ok = False
    ok |= run(
        "psycopg.connect(conninfo string, no pool)",
        lambda: _select1(normalize_database_url(raw)),
    )
    ok |= run(
        "psycopg.connect(**kwargs, no pool)",
        lambda: _select1_kwargs(cfg),
    )
    if "pgbouncer" in raw:
        run(
            "raw URI with ?pgbouncer=true (expected fail)",
            lambda: _select1(raw),
        )

    return 0 if ok else 1


def _select1(conninfo: str) -> None:
    with psycopg.connect(conninfo) as conn:
        print("  ->", conn.execute("SELECT 1 AS ok, current_user").fetchone())


def _select1_kwargs(cfg: dict) -> None:
    with psycopg.connect(**cfg) as conn:
        print("  ->", conn.execute("SELECT 1 AS ok, current_user").fetchone())


if __name__ == "__main__":
    raise SystemExit(main())
