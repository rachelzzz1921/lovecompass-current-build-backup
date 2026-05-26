#!/usr/bin/env python3
"""Apply lite SQL batch files to Postgres. Requires DIRECT_URL or DATABASE_URL in backend/.env."""

from __future__ import annotations

import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.db import normalize_database_url


def main() -> None:
    load_dotenv(ROOT / ".env")
    raw_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
    if not raw_url:
        raise SystemExit("Set DIRECT_URL or DATABASE_URL in backend/.env")

    batch_dir = ROOT / ".apply_queue" / "batches"
    if not batch_dir.exists():
        raise SystemExit(f"Missing {batch_dir}; run lite batch prep first")

    suites = sorted({p.name.rsplit("_batch_", 1)[0] for p in batch_dir.glob("*_batch_*.sql")})
    files: list[Path] = []
    for suite in suites:
        for i in range(1, 5):
            path = batch_dir / f"{suite}_batch_{i}.sql"
            if not path.exists():
                raise SystemExit(f"Missing batch file: {path}")
            files.append(path)

    with psycopg.connect(normalize_database_url(raw_url), connect_timeout=30) as conn:
        with conn.cursor() as cur:
            for path in files:
                sql = path.read_text(encoding="utf-8")
                cur.execute(sql)
                print(f"ok {path.name} ({len(sql)} bytes)")
        conn.commit()

    print(f"applied_batches={len(files)}")


if __name__ == "__main__":
    main()
