from app.suite_tier import (
    resolve_redemption_target_slug,
    resolve_suite_slug_for_request,
    suites_redemption_compatible,
)


def test_lite_slug_resolution():
    assert (
        resolve_suite_slug_for_request(product="ros", suite_slug="s02_ros_female_lite")
        == "s02_ros_female_lite"
    )
    assert resolve_suite_slug_for_request(product="ros", gender="female") == "s02_ros_female"


def test_redemption_compatibility():
    assert suites_redemption_compatible("s02_ros_female", "s02_ros_female_lite")
    assert not suites_redemption_compatible("s02_ros_female", "s02_ros_male_lite")
    assert suites_redemption_compatible("s03_mate_male", "s03_mate_male_lite")


def test_redemption_target_prefers_requested_lite():
    slug = resolve_redemption_target_slug(
        code_suite_slug="s02_ros_female",
        requested_slug="s02_ros_female_lite",
        product="ros",
        gender="female",
    )
    assert slug == "s02_ros_female_lite"
