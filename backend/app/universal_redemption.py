from __future__ import annotations

import os
import re
from typing import Any

from fastapi import HTTPException
from psycopg.types.json import Jsonb

UNIVERSAL_CODE = os.getenv("LOVECOMPASS_UNIVERSAL_CODE", "MIRROR-ALL-ACCESS").strip()
SHADOW_CODE_PREFIX = "__UNIVERSAL__"
SHADOW_BATCH_NAME = "UNIVERSAL-SHADOW"

PRODUCT_SUITE_SLUGS: dict[str, dict[str, str]] = {
    "self": {"female": "s01_self_female", "male": "s01_self_male"},
    "ros": {"female": "s02_ros_female", "male": "s02_ros_male"},
    "mate": {"female": "s03_mate_female", "male": "s03_mate_male"},
}

ALL_SUITE_SLUGS = frozenset(
    slug for gender_map in PRODUCT_SUITE_SLUGS.values() for slug in gender_map.values()
)


def normalize_input_code(code: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", code.strip().upper())


def is_universal_code(code: str) -> bool:
    configured = normalize_input_code(UNIVERSAL_CODE)
    if not configured:
        return False
    return normalize_input_code(code) == configured


def resolve_suite_slug(*, product: str, suite_slug: str | None = None, gender: str | None = None) -> str:
    if suite_slug:
        slug = suite_slug.strip()
        if slug in ALL_SUITE_SLUGS:
            return slug
    product_key = product.strip().lower()
    suites = PRODUCT_SUITE_SLUGS.get(product_key)
    if not suites:
        raise HTTPException(status_code=400, detail="无法识别测试产品")
    gender_key = (gender or "female").strip().lower()
    if gender_key not in suites:
        gender_key = "female"
    return suites[gender_key]


def shadow_code_for_suite(suite_slug: str) -> str:
    return f"{SHADOW_CODE_PREFIX}{suite_slug}"


def ensure_shadow_redemption_code(conn: Any, suite_slug: str) -> dict[str, Any]:
    shadow = shadow_code_for_suite(suite_slug)
    row = conn.execute(
        """
        SELECT rc.id AS code_id, rc.suite_id, ts.slug
        FROM public.redemption_codes rc
        JOIN public.test_suites ts ON ts.id = rc.suite_id
        WHERE rc.code = %s AND rc.is_active = true AND rc.status = 'active'
        """,
        (shadow,),
    ).fetchone()
    if row:
        return dict(row)

    suite = conn.execute(
        "SELECT id FROM public.test_suites WHERE slug = %s AND is_active = true",
        (suite_slug,),
    ).fetchone()
    if not suite:
        raise HTTPException(status_code=404, detail="测试套件不存在")

    batch = conn.execute(
        """
        INSERT INTO public.redemption_batches(
          name, suite_id, code_kind, is_active, max_uses_per_code, max_uses_per_user_per_suite, metadata
        )
        VALUES (%s, %s, 'admin_grant'::public.redemption_code_kind, true, NULL, 999999, %s::jsonb)
        ON CONFLICT DO NOTHING
        RETURNING id
        """,
        (SHADOW_BATCH_NAME, suite["id"], Jsonb({"universal": True, "suiteSlug": suite_slug})),
    ).fetchone()
    if not batch:
        batch = conn.execute(
            """
            SELECT rb.id
            FROM public.redemption_batches rb
            WHERE rb.name = %s AND rb.suite_id = %s AND rb.code_kind = 'admin_grant'::public.redemption_code_kind
            LIMIT 1
            """,
            (SHADOW_BATCH_NAME, suite["id"]),
        ).fetchone()
    if not batch:
        raise HTTPException(status_code=500, detail="无法创建万能码批次")

    conn.execute(
        """
        INSERT INTO public.redemption_codes(
          batch_id, suite_id, code, code_kind, max_uses, is_active, metadata
        )
        VALUES (%s, %s, %s, 'admin_grant'::public.redemption_code_kind, NULL, true, %s::jsonb)
        ON CONFLICT (code) DO NOTHING
        """,
        (
            batch["id"],
            suite["id"],
            shadow,
            Jsonb({"universal": True, "suiteSlug": suite_slug}),
        ),
    )
    row = conn.execute(
        """
        SELECT rc.id AS code_id, rc.suite_id, ts.slug
        FROM public.redemption_codes rc
        JOIN public.test_suites ts ON ts.id = rc.suite_id
        WHERE rc.code = %s
        """,
        (shadow,),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=500, detail="无法创建万能码记录")
    return dict(row)
