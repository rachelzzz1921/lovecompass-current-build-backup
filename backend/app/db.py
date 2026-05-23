from __future__ import annotations

import ipaddress
import os
from contextlib import contextmanager
from typing import Any
from urllib.parse import parse_qsl, unquote

from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

_pool: ConnectionPool | None = None

# libpq/psycopg query params we accept from DATABASE_URL (not pgbouncer=true — use port 6543).
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

# Supabase Transaction Pooler (port 6543) requires TLS.
_POOLER_SSLMODE = "require"
_DEFAULT_CONNECT_TIMEOUT = int(os.getenv("DATABASE_CONNECT_TIMEOUT", "10"))


def _clean_database_url(url: str) -> str:
    return url.strip().strip('"').strip("'")


def _is_ip(value: str) -> bool:
    try:
        ipaddress.ip_address(value)
        return True
    except ValueError:
        return False


def _finalize_pooler_conn(conn: dict[str, Any]) -> dict[str, Any]:
    """Apply Supabase pooler defaults after parsing URL or libpq strings."""
    conn["hostaddr"] = ""
    conn["sslmode"] = _POOLER_SSLMODE
    conn.setdefault("connect_timeout", _DEFAULT_CONNECT_TIMEOUT)
    return conn


def _parse_postgres_uri(url: str) -> dict[str, Any]:
    """Parse postgresql:// URIs, including passwords that contain @ or :."""
    normalized = url
    if normalized.startswith("postgres://"):
        normalized = "postgresql://" + normalized[len("postgres://") :]
    if not normalized.startswith("postgresql://"):
        raise ValueError("DATABASE_URL must use postgresql:// or postgres://")

    rest = normalized[len("postgresql://") :]
    if "@" not in rest:
        raise ValueError("DATABASE_URL missing @ between credentials and host")

    userinfo, hostpart = rest.rsplit("@", 1)
    username, sep, password = userinfo.partition(":")
    if not sep:
        raise ValueError("DATABASE_URL missing username or password before @")

    host_path, _, query = hostpart.partition("?")
    if "/" in host_path:
        hostport, dbname = host_path.split("/", 1)
        dbname = dbname or "postgres"
    else:
        hostport, dbname = host_path, "postgres"

    if hostport.startswith("[") and "]" in hostport:
        host = hostport[1 : hostport.index("]")]
        port_str = hostport[hostport.index("]") + 1 :].lstrip(":")
        port = int(port_str) if port_str else 5432
    elif ":" in hostport:
        host, port_str = hostport.rsplit(":", 1)
        port = int(port_str)
    else:
        host, port = hostport, 5432

    if not host:
        raise ValueError("DATABASE_URL missing hostname")

    conn: dict[str, Any] = {
        "host": host,
        "port": port,
        "dbname": dbname,
        "user": unquote(username),
        "password": unquote(password),
    }

    for key, value in parse_qsl(query, keep_blank_values=True):
        if key in _ALLOWED_LIBPQ_QUERY_PARAMS:
            conn[key] = value

    return _finalize_pooler_conn(conn)


def _parse_libpq_keyvalue(url: str) -> dict[str, Any]:
    conn: dict[str, Any] = {}
    for part in url.split():
        if "=" not in part:
            continue
        key, value = part.split("=", 1)
        if key == "hostaddr" and value and not _is_ip(value):
            conn["host"] = value
            continue
        if key in _ALLOWED_LIBPQ_QUERY_PARAMS or key in {
            "host",
            "port",
            "dbname",
            "user",
            "password",
        }:
            conn[key] = value
    if "host" not in conn and not conn.get("hostaddr"):
        raise ValueError("DATABASE_URL libpq string missing host")
    return _finalize_pooler_conn(conn)


def database_conninfo(url: str) -> dict[str, Any]:
    """Return psycopg connection kwargs from a Supabase pooler URI or libpq string."""
    cleaned = _clean_database_url(url)
    if not cleaned:
        raise ValueError("DATABASE_URL is empty")

    if "://" in cleaned:
        return _parse_postgres_uri(cleaned)
    return _parse_libpq_keyvalue(cleaned)


def normalize_database_url(url: str) -> str:
    """Backward-compatible conninfo string for scripts using psycopg.connect()."""
    return make_conninfo("", **database_conninfo(url))


def _database_url() -> str:
    return _clean_database_url(os.getenv("DATABASE_URL") or os.getenv("SUPABASE_DB_URL") or "")


def get_pool() -> ConnectionPool:
    global _pool
    database_url = _database_url()
    if not database_url:
        raise RuntimeError("DATABASE_URL 或 SUPABASE_DB_URL 未配置")
    if _pool is None:
        conninfo = normalize_database_url(database_url)
        _pool = ConnectionPool(
            conninfo,
            kwargs={"row_factory": dict_row, "prepare_threshold": None},
            min_size=0,
            max_size=int(os.getenv("DATABASE_POOL_MAX_SIZE", "1")),
            timeout=float(os.getenv("DATABASE_POOL_TIMEOUT", "30")),
            open=True,
        )
    return _pool


@contextmanager
def get_conn():
    pool = get_pool()
    with pool.connection() as conn:
        yield conn
