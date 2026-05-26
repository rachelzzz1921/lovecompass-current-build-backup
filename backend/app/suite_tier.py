"""Lite / full suite slug helpers — redemption and attempt validation."""

from __future__ import annotations

import re

from fastapi import HTTPException

PRODUCT_SUITE_SLUGS: dict[str, dict[str, str]] = {
    "self": {"female": "s01_self_female", "male": "s01_self_male"},
    "ros": {"female": "s02_ros_female", "male": "s02_ros_male"},
    "mate": {"female": "s03_mate_female", "male": "s03_mate_male"},
}

LITE_SUITE_SLUGS: dict[str, dict[str, str]] = {
    "self": {"female": "s01_self_female_lite", "male": "s01_self_male_lite"},
    "ros": {"female": "s02_ros_female_lite", "male": "s02_ros_male_lite"},
    "mate": {"female": "s03_mate_female_lite", "male": "s03_mate_male_lite"},
}

ALL_KNOWN_SUITE_SLUGS = frozenset(
    slug for gender_map in PRODUCT_SUITE_SLUGS.values() for slug in gender_map.values()
) | frozenset(slug for gender_map in LITE_SUITE_SLUGS.values() for slug in gender_map.values())


def is_lite_suite_slug(slug: str | None) -> bool:
    return "_lite" in (slug or "").lower()


def full_suite_slug(slug: str) -> str:
    return slug.replace("_lite", "") if "_lite" in slug else slug


def parse_suite_slug(slug: str) -> tuple[str, str, bool]:
    """Return (product_id, gender, is_lite)."""
    lower = slug.lower()
    if "_ros_" in lower or lower.startswith("s02_ros"):
        product = "ros"
    elif "_mate_" in lower or lower.startswith("s03_mate"):
        product = "mate"
    else:
        product = "self"
    gender = "female" if "female" in lower else "male" if "male" in lower else "female"
    return product, gender, is_lite_suite_slug(slug)


def suites_redemption_compatible(slug_a: str, slug_b: str) -> bool:
    if slug_a == slug_b:
        return True
    prod_a, gender_a, _ = parse_suite_slug(slug_a)
    prod_b, gender_b, _ = parse_suite_slug(slug_b)
    return prod_a == prod_b and gender_a == gender_b


def resolve_suite_slug_for_request(
    *,
    product: str,
    suite_slug: str | None = None,
    gender: str | None = None,
) -> str:
    if suite_slug:
        slug = suite_slug.strip()
        if slug in ALL_KNOWN_SUITE_SLUGS:
            return slug
    product_key = product.strip().lower()
    suites = PRODUCT_SUITE_SLUGS.get(product_key)
    if not suites:
        raise HTTPException(status_code=400, detail="无法识别测试产品")
    gender_key = (gender or "female").strip().lower()
    if gender_key not in suites:
        gender_key = "female"
    return suites[gender_key]


def resolve_redemption_target_slug(
    *,
    code_suite_slug: str,
    requested_slug: str | None,
    product: str,
    gender: str | None,
) -> str:
    """Pick the suite slug to unlock — honor lite/full tier from client when compatible with code."""
    if requested_slug and suites_redemption_compatible(code_suite_slug, requested_slug.strip()):
        return requested_slug.strip()
    fallback = resolve_suite_slug_for_request(product=product, suite_slug=None, gender=gender)
    if suites_redemption_compatible(code_suite_slug, fallback):
        return fallback
    return code_suite_slug
