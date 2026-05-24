#!/usr/bin/env python3
"""Validate LoveCompass backend env before local run (not Vercel build).

Usage: cd backend && python scripts/check_env.py

Vercel deploy does not run this script — runtime env is checked via GET /health?config=1.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
try:
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
except ImportError:
    pass

REQUIRED = (
    "DATABASE_URL",
    "SUPABASE_URL",
)

RECOMMENDED = (
    "SUPABASE_JWT_SECRET",
    "SUPABASE_PROJECT_ID",
    "CORS_ORIGINS",
    "AI_PROVIDER",
    "ZHIPU_API_KEY",
)

WARNINGS: list[str] = []
ERRORS: list[str] = []


def _present(name: str) -> bool:
    return bool((os.getenv(name) or "").strip())


def main() -> None:
    for name in REQUIRED:
        if not _present(name):
            ERRORS.append(f"missing required: {name}")

    for name in RECOMMENDED:
        if not _present(name):
            WARNINGS.append(f"missing recommended: {name}")

    fallback = os.getenv("LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK", "").strip().lower()
    if fallback in {"1", "true", "yes"}:
        if os.getenv("VERCEL") == "1":
            ERRORS.append("LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK must be false on Vercel")
        else:
            WARNINGS.append("LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK is enabled (ok for local, not for production)")

    db_url = (os.getenv("DATABASE_URL") or "").strip()
    if db_url and ":6543" in db_url and "pgbouncer=true" not in db_url:
        WARNINGS.append("DATABASE_URL uses pooler :6543 but lacks ?pgbouncer=true")

    if ERRORS:
        print("env_check=FAIL")
        for item in ERRORS:
            print(f"  ERROR  {item}")
        for item in WARNINGS:
            print(f"  WARN   {item}")
        raise SystemExit(1)

    print("env_check=ok")
    for item in WARNINGS:
        print(f"  WARN   {item}")
    if not WARNINGS:
        print("  all required and recommended variables present")


if __name__ == "__main__":
    main()
