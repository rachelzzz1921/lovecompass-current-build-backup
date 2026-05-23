from __future__ import annotations

import ipaddress
import os
from contextlib import contextmanager
from urllib.parse import parse_qsl, unquote, urlsplit

from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

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


def _clean_database_url(url: str) -> str:
    return url.strip().strip('"').strip("'")


def _is_ip(value: str) -> bool:
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        return False


def _fix_libpq_keyvalue(url: str) -> str:
    """Rewrite hostaddr=<hostname> to host=<hostname>; hostaddr must be an IP."""
    if "://" in url or "=" not in url:
        return url
    fixed: list[str] = []
    for part in url.split():
        if part.startswith("hostaddr="):
            _, value = part.split("=", 1)
            if value and not _is_ip(value):
                fixed.append(f"host={value}")
                continue
        fixed.append(part)
    return " ".join(fixed)


def normalize_database_url(url: str) -> str:
    """Build a psycopg/libpq conninfo string from a Supabase pooler URL.

    Uses libpq ``host=`` (hostname) rather than ``hostaddr=`` (IP only).
    Strips unsupported params such as ``pgbouncer=true`` from query strings.
    """
    cleaned = _fix_libpq_keyvalue(_clean_database_url(url))
    if not cleaned:
        raise ValueError("DATABASE_URL is empty")

    if "://" not in cleaned:
        if "sslmode=" not in cleaned:
            return make_conninfo(cleaned, sslmode="require")
        return cleaned

    normalized = cleaned
    if normalized.startswith("postgres://"):
        normalized = "postgresql://" + normalized[len("postgres://") :]

    parts = urlsplit(normalized)
    if not parts.hostname:
        raise ValueError("DATABASE_URL missing hostname")

    dbname = (parts.path or "/postgres").lstrip("/") or "postgres"
    conn_kwargs: dict[str, object] = {
        "host": parts.hostname,
        "dbname": dbname,
        "sslmode": "require",
    }
    if parts.port:
        conn_kwargs["port"] = parts.port
    if parts.username:
        conn_kwargs["user"] = unquote(parts.username)
    if parts.password is not None:
        conn_kwargs["password"] = unquote(parts.password)

    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        if key in _ALLOWED_LIBPQ_QUERY_PARAMS:
            conn_kwargs[key] = value

    return make_conninfo("", **conn_kwargs)


def _database_url() -> str:
    return _clean_database_url(os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL") or "")


def get_pool() -> ConnectionPool:
    global _pool
    database_url = _database_url()
    if not database_url:
        raise RuntimeError("DATABASE_URL 或 SUPABASE_DB_URL 未配置")
    if _pool is None:
        _pool = ConnectionPool(
            normalize_database_url(database_url),
            kwargs={"row_factory": dict_row, "prepare_threshold": None},
            min_size=0,
            max_size=int(os.getenv("DATABASE_POOL_MAX_SIZE", "1")),
            open=True,
        )
    return _pool


@contextmanager
def get_conn():
    pool = get_pool()
    with pool.connection() as conn:
        yield conn
