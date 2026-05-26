from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.universal_redemption import (
    is_universal_code,
    normalize_input_code,
    resolve_suite_slug,
    shadow_base_slug,
    shadow_code_for_suite,
)


def test_universal_code_match() -> None:
    assert is_universal_code("MIRROR-ALL-ACCESS")
    assert is_universal_code("mirror all access")
    assert not is_universal_code("LOVE-COMPASS")


def test_resolve_suite_by_product_and_gender() -> None:
    assert resolve_suite_slug(product="self", gender="male") == "s01_self_male"
    assert resolve_suite_slug(product="ros", gender="female") == "s02_ros_female"
    assert resolve_suite_slug(product="mate", gender="male") == "s03_mate_male"


def test_resolve_suite_prefers_explicit_slug() -> None:
    assert resolve_suite_slug(product="self", suite_slug="s02_ros_male", gender="female") == "s02_ros_male"


def test_shadow_code_format() -> None:
    assert shadow_code_for_suite("s01_self_female") == "__UNIVERSAL__s01_self_female"
    assert normalize_input_code("  mirror-all-access ") == "MIRRORALLACCESS"


def test_shadow_base_slug_uses_full_suite() -> None:
    assert shadow_base_slug("s02_ros_female_lite") == "s02_ros_female"
    assert shadow_code_for_suite(shadow_base_slug("s03_mate_male_lite")) == "__UNIVERSAL__s03_mate_male"


if __name__ == "__main__":
    test_universal_code_match()
    test_resolve_suite_by_product_and_gender()
    test_resolve_suite_prefers_explicit_slug()
    test_shadow_code_format()
    test_shadow_base_slug_uses_full_suite()
    print("ok")
