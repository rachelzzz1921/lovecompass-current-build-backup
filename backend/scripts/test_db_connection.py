from __future__ import annotations

import os
import sys
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg

ENV_PATH = Path(__file__).resolve().parents[1] / '.env'


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text(encoding='utf-8').splitlines():
        line = raw.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), value)


def mask_url(url: str) -> str:
    parts = urlsplit(url)
    host = parts.hostname or ''
    port = f':{parts.port}' if parts.port else ''
    user = parts.username or ''
    netloc = f'{user}:***@{host}{port}' if user else f'{host}{port}'
    return urlunsplit((parts.scheme, netloc, parts.path, '<query>' if parts.query else '', ''))


def normalize_for_psycopg(url: str) -> str:
    parts = urlsplit(url.strip().strip('"').strip("'"))
    allowed = {
        'application_name', 'connect_timeout', 'sslmode', 'target_session_attrs',
        'options', 'keepalives', 'keepalives_idle', 'keepalives_interval', 'keepalives_count',
    }
    query_pairs = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if k in allowed]
    if not any(k == 'sslmode' for k, _ in query_pairs):
        query_pairs.append(('sslmode', 'require'))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query_pairs), parts.fragment))


def test_one(name: str, raw_url: str) -> bool:
    if not raw_url:
        print(f'{name}: missing')
        return False
    url = normalize_for_psycopg(raw_url)
    print(f'{name}: testing {mask_url(url)}')
    try:
        with psycopg.connect(url, connect_timeout=15) as conn:
            with conn.cursor() as cur:
                cur.execute('select current_database(), current_user, version()')
                db, user, version = cur.fetchone()
                print(f'{name}: ok db={db} user={user} version={version.split()[0]} {version.split()[1]}')
        return True
    except Exception as exc:
        print(f'{name}: failed {exc.__class__.__name__}: {exc}')
        return False


if __name__ == '__main__':
    load_env(ENV_PATH)
    ok_db = test_one('DATABASE_URL', os.getenv('DATABASE_URL', ''))
    ok_direct = test_one('DIRECT_URL', os.getenv('DIRECT_URL', ''))
    sys.exit(0 if ok_db or ok_direct else 1)
