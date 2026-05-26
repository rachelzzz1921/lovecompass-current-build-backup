"""MATE Pair (P1–P6) couple report builder — separate from ROS couple storage."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.json_utils import coerce_dict
from app.mate_pair_supplement import build_pair_supplement_analysis

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


@lru_cache(maxsize=1)
def load_pair_model() -> dict[str, Any]:
    path = DATA_DIR / "mate_pair_model_v1.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def attempt_snapshot(attempt: dict[str, Any]) -> dict[str, Any]:
    payload = coerce_dict(attempt.get("result_payload"))
    dims = coerce_dict(attempt.get("dimension_scores"))
    suite_slug = str(attempt.get("suite_slug") or "")
    suite_tier = payload.get("suiteTier") or ("lite" if "_lite" in suite_slug else "full")
    return {
        "attemptId": str(attempt.get("id") or ""),
        "userId": str(attempt.get("user_id") or ""),
        "suiteSlug": suite_slug or None,
        "suiteTier": suite_tier,
        "gender": attempt.get("archetype_gender") or payload.get("gender"),
        "mateIndex": attempt.get("ros_index"),
        "positionType": (payload.get("positionType") or {}).get("name") if isinstance(payload.get("positionType"), dict) else payload.get("positionType"),
        "moduleScores": dims or {k: payload.get(k) for k in ("FS1", "FS2", "FS3", "FS4", "FS5", "MS1", "MS2", "MS3", "MS4", "MS5") if payload.get(k) is not None},
        "axisX": payload.get("axisX"),
        "axisY": payload.get("axisY"),
    }


def _module_scores(attempt: dict[str, Any]) -> dict[str, float]:
    dims = coerce_dict(attempt.get("dimension_scores"))
    if dims:
        return {str(k): float(v) for k, v in dims.items()}
    payload = coerce_dict(attempt.get("result_payload"))
    out: dict[str, float] = {}
    for code in ("FS1", "FS2", "FS3", "FS4", "FS5", "MS1", "MS2", "MS3", "MS4", "MS5"):
        if payload.get(code) is not None:
            out[code] = float(payload[code])
    return out


def _gender(attempt: dict[str, Any]) -> str:
    g = attempt.get("archetype_gender") or coerce_dict(attempt.get("result_payload")).get("gender")
    return str(g or "female").lower()


def _pick(you: dict[str, float], ta: dict[str, float], female_key: str, male_key: str, you_gender: str) -> tuple[float, float]:
    if you_gender == "female":
        return float(you.get(female_key, 50)), float(ta.get(male_key, 50))
    return float(you.get(male_key, 50)), float(ta.get(female_key, 50))


def _gap_level(gap: float) -> str:
    if gap <= 10:
        return "高适配"
    if gap <= 20:
        return "可磨合"
    if gap <= 30:
        return "存在落差"
    return "长期压力较大"


def _sync_level(score: float) -> str:
    if score >= 85:
        return "高同步"
    if score >= 70:
        return "基本同步"
    if score >= 50:
        return "存在差异"
    return "容易累"


def _alignment_score(a: float, b: float) -> float:
    return max(0.0, min(100.0, 100.0 - abs(a - b)))


def _resolve_spark(p1: float, p2: float, p5_penalty: float, you: dict[str, float], ta: dict[str, float], you_g: str) -> str:
    fs1, ms4 = _pick(you, ta, "FS1", "MS4", you_g)
    fs5, ms5 = _pick(you, ta, "FS5", "MS5", you_g)
    risk_avg = (fs5 + ms5) / 2
    if fs1 >= 65 and ms4 >= 65 and risk_avg >= 55:
        return "高压拉扯"
    if p1 >= 75 and p2 >= 80:
        return "稳定升温"
    if fs1 >= 70 and ms4 >= 70:
        return "一拍即合"
    if you_g == "female" and you.get("FS3", 50) >= 65 and ta.get("MS1", 50) >= 65:
        return "双向成长"
    return "互相照顾"


def _relationship_status(score: float) -> str:
    for rule in load_pair_model().get("relationship_status_rules") or []:
        if score >= float(rule.get("min_score", 0)):
            return str(rule.get("status") or "")
    return "需要认真磨合型"


def _risk_lab(you: dict[str, float], ta: dict[str, float], you_g: str) -> dict[str, Any]:
    fs5, ms5 = _pick(you, ta, "FS5", "MS5", you_g)
    fs4, ms2 = _pick(you, ta, "FS4", "MS2", you_g)
    fs1, ms4 = _pick(you, ta, "FS1", "MS4", you_g)

    if fs5 >= 60 and ms5 >= 60:
        return {
            "risk_name": "双向拉扯",
            "risk_level": "高",
            "risk_visual": "████████░░",
            "manifest": ["双方都有未处理完的关系包袱", "容易把旧模式带入新关系"],
            "repair": ["先各自梳理边界", "慢速推进，不急于定义关系"],
        }
    if fs1 < 50 and ms2 >= 70:
        return {
            "risk_name": "边界冲突",
            "risk_level": "中",
            "risk_visual": "██████░░░░",
            "manifest": ["一方需要知道动态", "另一方需要空间"],
            "repair": ["提前定义边界", "约定固定的高质量相处时间"],
        }
    if fs4 >= 70 and ms2 < 50:
        return {
            "risk_name": "推进差异",
            "risk_level": "中",
            "risk_visual": "█████░░░░░",
            "manifest": ["一方想确认关系", "另一方还在观察"],
            "repair": ["增加共同场景", "用经历代替口头确认"],
        }
    return {
        "risk_name": "摩擦可控",
        "risk_level": "低",
        "risk_visual": "███░░░░░░░",
        "manifest": ["暂无明显雷区对撞"],
        "repair": ["保持现有沟通节奏"],
    }


def build_couple_payload(
    *,
    code: str,
    initiator: dict[str, Any],
    partner: dict[str, Any],
    conn: Any | None = None,
) -> dict[str, Any]:
    you_g = _gender(initiator)
    ta_g = _gender(partner)
    you = _module_scores(initiator)
    ta = _module_scores(partner)
    you_payload = coerce_dict(initiator.get("result_payload"))
    ta_payload = coerce_dict(partner.get("result_payload"))

    you_real, ta_real = _pick(you, ta, "FS3", "MS1", you_g)
    p1_gap = abs(you_real - ta_real)
    p1 = _alignment_score(you_real, ta_real)

    you_em, ta_em = _pick(you, ta, "FS2", "MS3", you_g)
    p2 = _alignment_score(you_em, ta_em)

    you_rhythm, ta_rhythm = _pick(you, ta, "FS4", "MS2", you_g)
    p3 = _alignment_score(you_rhythm, ta_rhythm)

    you_future, ta_future = _pick(you, ta, "FS4", "MS2", you_g)
    p4 = (p3 + _alignment_score(you_future, ta_future)) / 2

    fs5, ms5 = _pick(you, ta, "FS5", "MS5", you_g)
    risk_penalty = 0.0
    if fs5 >= 60 and ms5 >= 60:
        risk_penalty = 18
    elif fs5 >= 55 or ms5 >= 55:
        risk_penalty = 8

    weights = load_pair_model().get("module_weights") or {
        "P1": 0.30, "P2": 0.25, "P3": 0.15, "P4": 0.15, "P5": 0.10, "P6": 0.05,
    }
    p5_score = max(0.0, 100.0 - risk_penalty * 5)
    p6_bonus = min(12.0, (you.get("FS1", you.get("MS4", 50)) + ta.get("MS4", ta.get("FS1", 50))) / 20)

    raw = (
        p1 * float(weights.get("P1", 0.3))
        + p2 * float(weights.get("P2", 0.25))
        + p3 * float(weights.get("P3", 0.15))
        + p4 * float(weights.get("P4", 0.15))
        + p5_score * float(weights.get("P5", 0.1))
        + p6_bonus
    )
    matching_score = round(max(45.0, min(96.0, raw)))

    spark = _resolve_spark(p1, p2, risk_penalty, you, ta, you_g)
    status = _relationship_status(float(matching_score))
    risk_lab = _risk_lab(you, ta, you_g)

    keywords: list[str] = []
    if p1_gap <= 15:
        keywords.append("现实差距小")
    if p2 >= 75:
        keywords.append("需求同步")
    if p3 >= 70 and p4 >= 70:
        keywords.append("长期稳定")
    if not keywords:
        keywords = ["真实相处", "需要磨合", "值得认真看"]

    you_pos = str((you_payload.get("positionType") or {}).get("name") or you_payload.get("identityCard", {}).get("title") or "")
    ta_pos = str((ta_payload.get("positionType") or {}).get("name") or ta_payload.get("identityCard", {}).get("title") or "")

    common = ["稳定感", "长期关系"]
    if p1 >= 70:
        common.append("现实预期接近")
    if p2 >= 75:
        common.append("情感需求同频")
    differences: list[str] = []
    if p3 < 65:
        differences.append("相处节奏差")
    if abs(float(you_payload.get("axisX") or 50) - float(ta_payload.get("axisX") or 50)) >= 18:
        differences.append("推进速度差")
    if not differences:
        differences.append("表达浓度略有差异")

    stable_prob = round(min(92, matching_score * 0.95))
    marriage_score = round(min(94, (p1 * 0.4 + p4 * 0.35 + p2 * 0.25)))

    advice_problem = differences[0]
    advice_base = "增加共同场景" if "推进" in advice_problem else "把边界说清楚"
    matchmaker_suggestion = (
        f"你们的问题不是现实条件，而是{advice_problem.replace('差', '不同')}。"
        f"先建立更多共同经历，比快速定义关系更有效。"
        if "推进" in advice_problem
        else f"你们的问题不是条件，而是相处节奏。{advice_base}，比反复确认更有效。"
    )

    pair_supplement = build_pair_supplement_analysis(
        initiator=initiator,
        partner=partner,
        conn=conn,
    )

    return {
        "model": "MATE_PAIR_V1",
        "engine": "MATE_PAIR_ENGINE_V1.0",
        "productSet": "MATE",
        "code": code,
        "participants": {
            "initiatorAttemptId": str(initiator.get("id") or ""),
            "partnerAttemptId": str(partner.get("id") or ""),
            "initiatorSuiteTier": (
                "lite" if "_lite" in str(initiator.get("suite_slug") or "") else "full"
            ),
            "partnerSuiteTier": (
                "lite" if "_lite" in str(partner.get("suite_slug") or "") else "full"
            ),
            "initiatorSuiteSlug": str(initiator.get("suite_slug") or "") or None,
            "partnerSuiteSlug": str(partner.get("suite_slug") or "") or None,
            "youGender": you_g,
            "taGender": ta_g,
            "youPosition": you_pos,
            "taPosition": ta_pos,
        },
        "relationship_summary": {
            "matching_score": matching_score,
            "relationship_status": status,
            "relationship_spark": spark,
            "keywords": keywords,
        },
        "coordinate": {
            "matching_score": matching_score,
            "relationship_status": status,
            "relationship_spark": spark,
            "keywords": keywords,
            "you": {"position": you_pos, "axisX": you_payload.get("axisX"), "axisY": you_payload.get("axisY")},
            "ta": {"position": ta_pos, "axisX": ta_payload.get("axisX"), "axisY": ta_payload.get("axisY")},
        },
        "relationship_analysis": {
            "P1": {"level": _gap_level(p1_gap), "desc": "双方生活预期接近" if p1_gap <= 15 else "现实位置存在一定差距，需要预期管理"},
            "P2": {"level": _sync_level(p2), "desc": "双方都偏重陪伴和稳定感" if p2 >= 75 else "关系浓度期待需要慢慢对齐"},
            "P3": {"level": _sync_level(p3), "desc": "日常相处节奏基本同频" if p3 >= 70 else "作息与冲突处理方式需要磨合"},
            "P4": {"level": _sync_level(p4), "desc": "未来方向基本一致" if p4 >= 70 else "长期规划还需要更多对话"},
        },
        "relationship_portrait": {
            "common": common,
            "difference": differences,
            "portrait": {
                "现实适配": "高" if p1 >= 75 else "中",
                "现实适配_desc": "双方生活预期接近，家庭环境差异较小" if p1_gap <= 15 else "现实差距需要被正视和讨论",
                "情感需求": _sync_level(p2),
                "情感需求_desc": "双方都偏重陪伴和稳定感" if p2 >= 75 else "一方可能需要更高浓度的情感确认",
                "长期规划": "中高" if p4 >= 70 else "中",
                "长期规划_desc": "未来方向基本一致" if p4 >= 70 else "婚育与城市节奏还需要对齐",
            },
        },
        "risk_lab": risk_lab,
        "future_prediction": {
            "stable_relationship_probability": stable_prob,
            "marriage_adaptation_score": marriage_score,
            "timeline": [
                {"stage": "认识阶段", "text": "第一印象更多来自显示度与相处轻松感，别急着下结论。"},
                {"stage": "磨合阶段", "text": f"{'推进速度' if '推进' in advice_problem else '相处节奏'}会是主要课题，共同经历比口头确认更有效。"},
                {"stage": "长期阶段", "text": "若现实与情感需求持续同频，关系会越处越稳。"},
            ],
        },
        "matchmaker_advice": {
            "goodNews": "现实条件没有明显硬伤，你们属于可以认真往下推进的一类。" if p1 >= 65 else "你们并非不能在一起，而是需要更诚实地对齐期待。",
            "caution": f"注意{risk_lab['risk_name']}：{'、'.join(risk_lab['manifest'][:2])}",
            "oneChange": matchmaker_suggestion,
        },
        "profile_atoms": {
            "pair_atoms": keywords + differences,
            "spark": spark,
        },
        "ai_context": {
            "pair_atoms": keywords + differences,
            "spark": spark,
            "problem": advice_problem,
            "base_suggestion": advice_base,
        },
        **pair_supplement,
    }
