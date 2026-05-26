from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.mate_engine import enrich_mate_payload_v4, extract_profile_engine, resolve_sub_type
from app.mate_rehearse import build_rehearse_episodes, load_rehearse_library


def _profile(position_name: str, *, low_display: bool = False) -> dict:
    traits = ["低显示", "高支撑"] if low_display else ["高显示", "高支撑"]
    return {
        "main_type": position_name,
        "sub_type": "慢热筛选者" if low_display else "关系经营者",
        "trait_atoms": traits,
        "behavior_atoms": ["观察型", "筛选型"] if low_display else ["表达型", "托底型"],
        "relationship_atoms": ["价值释放后置"] if low_display else ["长期留存型"],
        "scene_atoms": ["熟了以后突然变得话多", "会记住别人说过的小事", "不主动但一直在"],
    }


def _timeline(fs2: float = 60, fs4: float = 60) -> list[dict]:
    return [
        {"day": 1, "label": "Day1", "mood": "挺有意思", "advice": "第一次见面后延续一个小细节"},
        {"day": 14, "label": "Day14", "mood": "开始变熟"},
        {"day": 45, "label": "Day45", "mood": "慢慢靠近"},
        {
            "day": 90,
            "label": "Day90",
            "mood": "关系磨合",
            "danger": "容易因节奏差异产生误解" if fs4 < 60 else "",
            "advice": "主动表达需求，不要等对方猜" if fs4 < 60 else "保持现有节奏",
        },
    ]


def test_library_loads() -> None:
    lib = load_rehearse_library()
    assert lib.get("engine") == "MATE_REHEARSE_V1"
    assert len(lib.get("episodes") or []) == 3
    assert "被读懂之前的人" in (lib.get("plot_by_position") or {})


def test_builds_three_episodes() -> None:
    eps = build_rehearse_episodes(
        _timeline(),
        _profile("被读懂之前的人", low_display=True),
        module_scores={"FS2": 68, "FS4": 70, "FS5": 25},
        gender="female",
        position_name="被读懂之前的人",
        axis_y=72,
    )
    assert len(eps) == 3
    for ep in eps:
        assert ep["name"].startswith("EP")
        assert len(ep["plot"]) >= 20
        assert ep["partnerPsychology"]
        assert ep["suggestion"]
        assert len(ep["comfortIndex"]) == 5
        assert "💙" in ep["comfortIndex"]


def test_position_changes_plot() -> None:
    low = build_rehearse_episodes(
        _timeline(),
        _profile("被读懂之前的人", low_display=True),
        module_scores={"FS2": 55, "FS4": 55, "FS5": 40},
        position_name="被读懂之前的人",
    )
    high = build_rehearse_episodes(
        _timeline(),
        _profile("让人想留下来的人"),
        module_scores={"FS2": 78, "FS4": 75, "FS5": 30},
        position_name="让人想留下来的人",
    )
    assert low[0]["plot"] != high[0]["plot"]
    assert low[1]["partnerPsychology"] != high[1]["partnerPsychology"] or low[1]["plot"] != high[1]["plot"]


def test_low_display_day30_warning() -> None:
    eps = build_rehearse_episodes(
        _timeline(fs4=50),
        _profile("被读懂之前的人", low_display=True),
        module_scores={"FS2": 72, "FS4": 50, "FS5": 35},
        position_name="被读懂之前的人",
    )
    ep2 = eps[1]
    assert ep2["warning"]
    assert "冷淡" in ep2["warning"] or "误判" in ep2["warning"] or "节奏" in ep2["warning"]


def test_timeline_advice_injected() -> None:
    timeline = [
        {"day": 90, "mood": "关系磨合", "advice": "测试专用红娘建议句", "danger": "测试专用危险信号"},
    ]
    eps = build_rehearse_episodes(
        timeline,
        _profile("让人想留下来的人"),
        module_scores={"FS2": 70, "FS4": 70, "FS5": 30},
        position_name="让人想留下来的人",
    )
    assert eps[2]["suggestion"] == "测试专用红娘建议句"
    assert eps[2]["warning"] == "测试专用危险信号"


def test_male_user_gets_valid_psychology() -> None:
    eps = build_rehearse_episodes(
        _timeline(),
        _profile("被读懂之前的人", low_display=True),
        module_scores={"MS3": 50, "MS2": 55, "MS5": 40},
        gender="male",
        position_name="被读懂之前的人",
    )
    assert all(len(ep["partnerPsychology"]) >= 12 for ep in eps)


def test_enrich_pipeline_includes_rehearse() -> None:
    position = "被读懂之前的人"
    sub = resolve_sub_type(position, 45, 70, {"FS2": 68, "FS4": 70, "FS5": 22, "FS1": 48, "FS3": 72}, "female")
    profile_engine = extract_profile_engine(
        position_name=position,
        sub_type=sub,
        axis_x=45,
        axis_y=70,
        module_scores={"FS2": 68, "FS4": 70, "FS5": 22, "FS1": 48, "FS3": 72},
        gender="female",
    )
    payload = {
        "gender": "female",
        "axisX": 45,
        "axisY": 70,
        "positionType": {"name": position},
        "identityCard": {"title": position, "tagline": "test", "assets": []},
        "loveTimeline": _timeline(),
        "matchmakerRecords": [{"remember": ["安静", "靠谱"]}],
        "sweetSpot": {},
        "lowerMatch": {},
        "aiLens": [],
        "socialQuotes": [],
    }
    enriched = enrich_mate_payload_v4(
        payload,
        module_scores={"FS2": 68, "FS4": 70, "FS5": 22, "FS1": 48, "FS3": 72},
        sub_scores={},
        scoring_formula={"modules": {"FS2": {"label": "情感"}, "FS4": {"label": "成熟"}, "FS5": {"label": "风险", "direction": "reverse"}}},
        quadrant="Q2",
    )
    eps = enriched.get("rehearseEpisodes") or []
    assert len(eps) == 3
    plots = [e["plot"] for e in eps]
    assert len(set(plots)) == 3


if __name__ == "__main__":
    test_library_loads()
    test_builds_three_episodes()
    test_position_changes_plot()
    test_low_display_day30_warning()
    test_timeline_advice_injected()
    test_male_user_gets_valid_psychology()
    test_enrich_pipeline_includes_rehearse()
    print("mate rehearse tests passed")
