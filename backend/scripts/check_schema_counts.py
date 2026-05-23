from __future__ import annotations

import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.db import normalize_database_url

TABLES = [
    'profiles',
    'test_suites',
    'metric_dimensions',
    'test_questions',
    'scoring_models',
    'result_archetypes',
    'redemption_batches',
    'redemption_codes',
    'redemption_events',
    'test_attempts',
    'test_attempt_answers',
    'ai_result_reports',
    'chat_analysts',
    'chat_sessions',
    'chat_messages',
]


def main() -> None:
    load_dotenv(ROOT / '.env')
    raw_url = os.getenv('DIRECT_URL') or os.getenv('DATABASE_URL') or os.getenv('SUPABASE_DB_URL')
    if not raw_url:
        raise SystemExit('DATABASE_URL/DIRECT_URL is not configured')

    with psycopg.connect(normalize_database_url(raw_url), row_factory=dict_row, connect_timeout=20) as conn:
        with conn.cursor() as cur:
            for table in TABLES:
                cur.execute('select to_regclass(%s) as regclass', (f'public.{table}',))
                exists = cur.fetchone()['regclass'] is not None
                if exists:
                    cur.execute(f'select count(*)::int as count from public.{table}')
                    count = cur.fetchone()['count']
                    print(f'{table}=exists count={count}')
                else:
                    print(f'{table}=missing')


if __name__ == '__main__':
    main()
