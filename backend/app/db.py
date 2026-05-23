import os
from contextlib import contextmanager
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL")
_pool: ConnectionPool | None = None

_ALLOWED_LIBPQ_QUERY_PARAMS = {
    "application_name",
    "connect_timeout",
    "sslmode",
    "target_session_attrs",
    "options",
    "keepalives",
    "keepalives_idle",
    "keepalives_interval",
    "keepalives_count",
}


def normalize_database_url(url: str) -> str:
    """Return a psycopg/libpq-compatible URL.

    Supabase and Prisma examples often append `pgbouncer=true` to pooled URLs.
    psycopg/libpq does not recognize that option, so the backend keeps only
    libpq-supported query parameters and adds `sslmode=require` by default.
    """
    parts = urlsplit(url.strip().strip('"').strip("'"))
    query_pairs = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key in _ALLOWED_LIBPQ_QUERY_PARAMS
    ]
    if not any(key == "sslmode" for key, _ in query_pairs):
        query_pairs.append(("sslmode", "require"))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query_pairs), parts.fragment))


def get_pool() -> ConnectionPool:
    global _pool
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL 或 SUPABASE_DB_URL 未配置")
    if _pool is None:
        _pool = ConnectionPool(normalize_database_url(DATABASE_URL), kwargs={"row_factory": dict_row}, open=True)
    return _pool


@contextmanager
def get_conn():
    pool = get_pool()
    with pool.connection() as conn:
        yield conn
