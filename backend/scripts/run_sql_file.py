from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.db import normalize_database_url


def main() -> None:
    parser = argparse.ArgumentParser(description='Run a SQL file against the configured LoveCompass database.')
    parser.add_argument('sql_file', help='Path to SQL file, relative to backend root or absolute')
    args = parser.parse_args()

    load_dotenv(ROOT / '.env')
    raw_url = os.getenv('DIRECT_URL') or os.getenv('DATABASE_URL') or os.getenv('SUPABASE_DB_URL')
    if not raw_url:
        raise SystemExit('DATABASE_URL/DIRECT_URL is not configured')

    sql_path = Path(args.sql_file)
    if not sql_path.is_absolute():
        sql_path = ROOT / sql_path
    sql = sql_path.read_text(encoding='utf-8')

    with psycopg.connect(normalize_database_url(raw_url), connect_timeout=20) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()

    print(f'ran_sql_file={sql_path.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
