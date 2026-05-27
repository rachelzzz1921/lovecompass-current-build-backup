"""MATE Pair (P1–P6) couple report builder — v4 payload for frontend rendering."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.json_utils import coerce_dict
from app.mate_pair_supplement import (
    _extract_single_context,
    _user_supplement_complete,
    resolve_supplement_fields,
)

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


@lru_cache(maxsize=1)
def load_pair_model() -> dict[str, Any]:
    path = DATA_DIR / "mate_pair_model_v1.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def load_couple_copy() -> dict[str, Any]:
    path = DATA_DIR / "mate_couple_copy_v1.json"
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
        "positionType": (payload.get("positionType") or {}).get("name")
        if isinstance(payload.get("positionType"), dict)
        else payload.get("positionType"),
        "moduleScores": dims
        or {
            k: payload.get(k)
            for k in ("FS1", "FS2", "FS3", "FS4", "FS5", "MS1", "MS2", "MS3", "MS4", "MS5")
            if payload.get(k) is not None
        },
        "axisX": payload.get("axisX"),
        "axisY": payload.get("axisY"),
    }


def _gender(attempt: dict[str, Any]) -> str:
    g = attempt.get("archetype_gender") or coerce_dict(attempt.get("result_payload")).get("gender")
    return str(g or "female").lower()


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


def _alignment_score(a: float, b: float) -> float:
    return max(0.0, min(100.0, 100.0 - abs(a - b)))


def _level_for_score(module: str, score: float) -> str:
    copy = load_couple_copy()
    rules = copy.get("p_level_labels", {}).get(module) or copy.get("p_level_labels", {}).get("default") or []
    for rule in rules:
        if score >= float(rule.get("min", 0)):
            return str(rule.get("level") or "")
    return "需要磨合"


def _label_map(group: str, value: Any) -> str:
    copy = load_couple_copy()
    mapping = copy.get(f"{group}_labels") or copy.get(group) or {}
    key = str(value)
    return str(mapping.get(key, value))


def _gap_badge(diff: float, rules: list[dict[str, Any]]) -> tuple[str, str]:
    for rule in rules:
        lo, hi = rule.get("range") or [0, 0]
        if float(lo) <= diff <= float(hi):
            return str(rule.get("label") or ""), str(rule.get("badge") or "ok")
    return "有出入", "warn"


def _resolve_ref(ref: str, ctx: dict[str, Any]) -> Any:
    node: Any = ctx
    for part in str(ref).split("."):
        if not isinstance(node, dict):
            return None
        node = node.get(part)
    return node


def _eval_compare(left: Any, op: str, right: Any) -> bool:
    if left is None:
        return False
    try:
        l_val = float(left)
        r_val = float(right)
    except (TypeError, ValueError):
        return str(left) == str(right) if op == "eq" else False

    if op == "gte":
        return l_val >= r_val
    if op == "gt":
        return l_val > r_val
    if op == "lte":
        return l_val <= r_val
    if op == "lt":
        return l_val < r_val
    if op == "eq":
        return l_val == r_val
    if op == "neq":
        return l_val != r_val
    return False


def _eval_condition(condition: dict[str, Any], ctx: dict[str, Any]) -> bool:
    ref = condition.get("ref")
    if ref is None:
        return False
    return _eval_compare(_resolve_ref(str(ref), ctx), str(condition.get("op") or "eq"), condition.get("value"))


def _eval_when(when: dict[str, Any] | None, ctx: dict[str, Any]) -> bool:
    if not when:
        return False
    if "all" in when:
        items = [item for item in (when.get("all") or []) if isinstance(item, dict)]
        return all(_eval_condition(item, ctx) for item in items)
    if "any" in when:
        items = [item for item in (when.get("any") or []) if isinstance(item, dict)]
        return any(_eval_condition(item, ctx) for item in items)
    return _eval_condition(when, ctx)


def _build_rule_context(
    male: dict[str, Any],
    female: dict[str, Any],
    *,
    modules: dict[str, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    m_scores = male.get("scores") or {}
    f_scores = female.get("scores") or {}
    m_risk = float(m_scores.get("MS5", 35))
    f_risk = float(f_scores.get("FS5", 35))
    return {
        "male": male,
        "female": female,
        "modules": modules or {},
        "derived": {
            "risk_avg": (m_risk + f_risk) / 2,
        },
    }


def _first_matching_rule(
    rules: list[dict[str, Any]],
    ctx: dict[str, Any],
) -> dict[str, Any] | None:
    ordered = sorted(rules, key=lambda item: int(item.get("priority") or 0), reverse=True)
    for rule in ordered:
        if _eval_when(rule.get("when"), ctx):
            return rule
    return None


def _p5_level_for_penalty(penalty: float, config: dict[str, Any]) -> str:
    for rule in config.get("score_levels") or []:
        if penalty >= float(rule.get("min_penalty", 0)):
            return str(rule.get("level") or "")
    return "低"


def _aggregate_metric(spec: dict[str, Any], ctx: dict[str, Any]) -> float:
    values: list[float] = []
    for ref in spec.get("refs") or []:
        raw = _resolve_ref(str(ref), ctx)
        if raw is None:
            continue
        try:
            values.append(float(raw))
        except (TypeError, ValueError):
            continue
    if not values:
        return 50.0
    aggregate = str(spec.get("aggregate") or "avg")
    if aggregate == "max":
        result = max(values)
    elif aggregate == "min":
        result = min(values)
    else:
        result = sum(values) / len(values)
    cap = spec.get("cap")
    if cap is not None:
        result = min(float(cap), result)
    return result


def compute_P5(male: dict[str, Any], female: dict[str, Any]) -> dict[str, Any]:
    config = load_pair_model().get("p5_config") or {}
    ctx = _build_rule_context(male, female)
    hit = _first_matching_rule(config.get("rules") or [], ctx)

    if hit:
        penalty = float(hit.get("penalty") or 0)
        atoms = [str(hit.get("atom") or hit.get("risk_name") or "")]
        level = str(hit.get("level") or _p5_level_for_penalty(penalty, config))
    else:
        fallback = config.get("fallback_rule") or {}
        if _eval_when(fallback.get("when"), ctx):
            penalty = float(fallback.get("penalty") or 0)
            atoms = [str(fallback.get("atom") or fallback.get("risk_name") or "")]
            level = str(fallback.get("level") or _p5_level_for_penalty(penalty, config))
        else:
            penalty = 0.0
            atoms = []
            level = _p5_level_for_penalty(penalty, config)

    score = min(100.0, penalty)
    return {"score": score, "level": level, "atoms": [a for a in atoms if a]}


def compute_P6(
    male: dict[str, Any],
    female: dict[str, Any],
    p1: dict[str, Any],
    p2: dict[str, Any],
    p5: dict[str, Any],
) -> dict[str, Any]:
    config = load_pair_model().get("p6_config") or {}
    modules = {"P1": p1, "P2": p2, "P5": p5}
    ctx = _build_rule_context(male, female, modules=modules)

    hit = _first_matching_rule(config.get("spark_rules") or [], ctx)
    spark_key = str((hit or {}).get("key") or config.get("default_spark_key") or "mutual_care")
    spark_types = config.get("spark_types") or {}
    spark = str(spark_types.get(spark_key) or spark_key)

    bonus = _aggregate_metric(config.get("bonus") or {}, ctx)
    dampening = config.get("p5_dampening") or {}
    if _eval_when(dampening.get("when"), ctx):
        bonus = max(float(dampening.get("floor") or 0), bonus - float(dampening.get("subtract") or 0))

    return {"score": bonus, "level": spark, "atoms": [spark], "spark_key": spark_key}


def extract_profiles(
    initiator: dict[str, Any],
    partner: dict[str, Any],
    conn: Any | None = None,
) -> dict[str, Any]:
    profiles: dict[str, dict[str, Any]] = {}
    for attempt in (initiator, partner):
        g = _gender(attempt)
        scores = _module_scores(attempt)
        payload = coerce_dict(attempt.get("result_payload"))
        fields = resolve_supplement_fields(attempt, conn)
        context = _extract_single_context(attempt, conn)

        if g == "male":
            density = scores.get("MS3", 50.0)
            stability = 100.0 - scores.get("MS5", 50.0)
            independence = scores.get("MS4", 50.0)
            family_interference = scores.get("MS5", 50.0)
            reality = scores.get("MS1", 50.0)
            housing_status = "no_own" if "租" in context.get("housing_status", "") else "has_own"
        else:
            density = scores.get("FS2", 50.0)
            stability = 100.0 - scores.get("FS5", 50.0)
            independence = scores.get("FS1", 50.0)
            family_interference = scores.get("FS5", 50.0)
            reality = scores.get("FS3", 50.0)
            housing_status = "no_own" if "租" in context.get("housing_status", "") else "has_own"

        childcare = fields.get("childcare_flexibility_score")
        profiles[g] = {
            "gender": g,
            "attempt": attempt,
            "scores": scores,
            "payload": payload,
            "fields": fields,
            "context": context,
            "derived": {
                "emotional_density_score": density,
                "emotional_stability_score": stability,
                "independence_score": independence,
                "childcare_flexibility": float(childcare) if childcare is not None else None,
                "family_interference_score": family_interference,
                "reality_score": reality,
                "housing_status": housing_status,
                "huji": fields.get("huji"),
                "education_level": fields.get("education_level"),
            },
        }

    male = profiles.get("male") or profiles.get(_gender(partner if _gender(initiator) == "female" else initiator))
    female = profiles.get("female") or profiles.get(_gender(initiator if _gender(partner) == "male" else partner))
    if male is None:
        male = profiles.get(_gender(partner), {})
    if female is None:
        female = profiles.get(_gender(initiator), {})

    return {"male": male, "female": female}


_INCOME_TIER_BY_LABEL: dict[str, float] = {
    "入门层": 1.0,
    "基础层": 2.0,
    "中等层": 3.0,
    "中上层": 4.0,
    "优质层": 5.0,
    "顶端层": 6.0,
    "稳定独立": 3.0,
    "半独立": 2.5,
    "依赖型": 1.5,
    "明显高于平均": 4.5,
    "较好": 3.5,
    "中等": 2.5,
    "偏弱": 1.5,
}


def _badge_to_alignment(badge: str, config: dict[str, Any]) -> float:
    scores = config.get("badge_scores") or {"ok": 92, "warn": 62, "alert": 35}
    return float(scores.get(badge, scores.get("warn", 62)))


def _income_tier(label: str) -> float | None:
    text = str(label or "").strip()
    if not text or text == "—":
        return None
    if text in _INCOME_TIER_BY_LABEL:
        return _INCOME_TIER_BY_LABEL[text]
    if text.startswith("档位"):
        try:
            return float(text.split()[-1])
        except ValueError:
            return None
    return None


def _collect_p1_hard_alignments(male: dict[str, Any], female: dict[str, Any]) -> list[float]:
    """Hard-condition gaps from supplement + single-test context (income, housing, huji, etc.)."""
    copy = load_couple_copy()
    gap_rules = copy.get("gap_rules") or {}
    p1_cfg = load_pair_model().get("p1_config") or {}
    m_fields = male.get("fields") or {}
    f_fields = female.get("fields") or {}
    m_ctx = male.get("context") or {}
    f_ctx = female.get("context") or {}
    alignments: list[float] = []

    m_edu, f_edu = m_fields.get("education_level"), f_fields.get("education_level")
    if m_edu is not None and f_edu is not None:
        diff = abs(int(m_edu) - int(f_edu))
        _, badge = _gap_badge(diff, gap_rules.get("education") or [])
        alignments.append(_badge_to_alignment(badge, p1_cfg))

    if m_fields.get("huji") and f_fields.get("huji"):
        badge, _ = _resolve_huji_badge(str(m_fields["huji"]), str(f_fields["huji"]))
        alignments.append(_badge_to_alignment(badge, p1_cfg))

    m_age, f_age = m_fields.get("age"), f_fields.get("age")
    if m_age is not None and f_age is not None:
        diff = abs(int(m_age) - int(f_age))
        _, badge = _gap_badge(diff, gap_rules.get("age") or [])
        alignments.append(_badge_to_alignment(badge, p1_cfg))

    m_tier, f_tier = _income_tier(str(m_ctx.get("income_level") or "")), _income_tier(str(f_ctx.get("income_level") or ""))
    if m_tier is not None and f_tier is not None:
        diff = abs(m_tier - f_tier)
        _, badge = _gap_badge(diff, gap_rules.get("income") or [])
        alignments.append(_badge_to_alignment(badge, p1_cfg))

    m_h, f_h = str(m_ctx.get("housing_status") or ""), str(f_ctx.get("housing_status") or "")
    if m_h and f_h and m_h != "—" and f_h != "—":
        alignments.append(95.0 if m_h == f_h else 62.0)

    return alignments


def compute_P1(male: dict[str, Any], female: dict[str, Any]) -> dict[str, Any]:
    m_score = float(male.get("derived", {}).get("reality_score", 50))
    f_score = float(female.get("derived", {}).get("reality_score", 50))
    module_score = _alignment_score(m_score, f_score)
    hard_alignments = _collect_p1_hard_alignments(male, female)

    p1_cfg = load_pair_model().get("p1_config") or {}
    module_blend = float(p1_cfg.get("module_blend", 0.55))
    hard_blend = float(p1_cfg.get("hard_blend", 0.45))

    if hard_alignments:
        hard_score = sum(hard_alignments) / len(hard_alignments)
        score = module_score * module_blend + hard_score * hard_blend
    else:
        score = module_score

    gap = abs(m_score - f_score)
    atoms: list[str] = []
    if hard_alignments and score < module_score - 8:
        atoms.append("硬条件有落差")
    if gap <= 15:
        atoms.append("现实差距小")
    elif gap >= 25:
        atoms.append("现实落差")
    return {"score": score, "level": _level_for_score("P1", score), "atoms": atoms}


def compute_P2(male: dict[str, Any], female: dict[str, Any]) -> dict[str, Any]:
    m_score = float(male.get("derived", {}).get("emotional_density_score", 50))
    f_score = float(female.get("derived", {}).get("emotional_density_score", 50))
    score = _alignment_score(m_score, f_score)
    atoms: list[str] = []
    if score >= 75:
        atoms.append("需求同步")
    elif score < 55:
        atoms.append("情感浓度差")
    return {"score": score, "level": _level_for_score("P2", score), "atoms": atoms}


def compute_P3(male: dict[str, Any], female: dict[str, Any]) -> dict[str, Any]:
    m_score = float(male.get("scores", {}).get("MS2", 50))
    f_score = float(female.get("scores", {}).get("FS4", 50))
    score = _alignment_score(m_score, f_score)
    atoms: list[str] = []
    if score >= 70:
        atoms.append("节奏同频")
    else:
        atoms.append("相处节奏差")
    return {"score": score, "level": _level_for_score("P3", score), "atoms": atoms}


def _collect_p4_alignments(male: dict[str, Any], female: dict[str, Any]) -> list[float]:
    m_fields = male.get("fields") or {}
    f_fields = female.get("fields") or {}
    alignments: list[float] = []

    yc, tc = str(m_fields.get("target_city_plan") or ""), str(f_fields.get("target_city_plan") or "")
    if yc and tc:
        if yc == tc:
            alignments.append(100.0)
        elif yc == tc == "current_flexible" or ("flexible" in yc and "flexible" in tc):
            alignments.append(85.0)
        elif "undecided" in (yc, tc):
            alignments.append(55.0)
        else:
            alignments.append(35.0)

    yw, tw = str(m_fields.get("want_children") or ""), str(f_fields.get("want_children") or "")
    if yw and tw:
        alignments.append(100.0 if yw == tw else 20.0)

    yt, tt = m_fields.get("children_timing"), f_fields.get("children_timing")
    if yt is not None and tt is not None and float(yt) >= 0 and float(tt) >= 0:
        diff = abs(float(yt) - float(tt))
        alignments.append(_alignment_score(0, diff * 20))

    yh, th = str(m_fields.get("housing_plan") or ""), str(f_fields.get("housing_plan") or "")
    if yh and th:
        alignments.append(100.0 if yh == th else 60.0)

    return alignments


def compute_P4(male: dict[str, Any], female: dict[str, Any]) -> dict[str, Any]:
    alignments = _collect_p4_alignments(male, female)
    if not alignments:
        return {
            "score": None,
            "level": "待评估",
            "atoms": ["长期规划待评估"],
            "pending": True,
        }

    score = sum(alignments) / len(alignments)
    atoms: list[str] = []
    if score >= 75:
        atoms.append("长期稳定")
    else:
        atoms.append("规划待对齐")
    return {"score": score, "level": _level_for_score("P4", score), "atoms": atoms, "pending": False}


def aggregate_score(modules: dict[str, dict[str, Any]]) -> int:
    weights = dict(
        load_pair_model().get("module_weights")
        or {
            "P1": 0.30,
            "P2": 0.25,
            "P3": 0.15,
            "P4": 0.15,
            "P5": 0.10,
            "P6": 0.05,
        }
    )
    p4 = modules.get("P4") or {}
    if p4.get("pending") or p4.get("score") is None:
        p4_weight = float(weights.pop("P4", 0.15))
        p1_w = float(weights.get("P1", 0.30))
        p2_w = float(weights.get("P2", 0.25))
        share = p1_w + p2_w
        if share > 0:
            weights["P1"] = p1_w + p4_weight * (p1_w / share)
            weights["P2"] = p2_w + p4_weight * (p2_w / share)

    raw = 0.0
    for key, weight in weights.items():
        mod = modules.get(key) or {}
        score = mod.get("score")
        if score is None:
            continue
        if key == "P5":
            raw += (100.0 - float(score)) * float(weight)
        else:
            raw += float(score) * float(weight)
    return round(max(0.0, min(100.0, raw)))


def extract_atoms(modules: dict[str, dict[str, Any]]) -> list[str]:
    atoms: list[str] = []
    for mod in modules.values():
        for atom in mod.get("atoms") or []:
            if atom not in atoms:
                atoms.append(str(atom))
    return atoms


def _resolve_huji_badge(m_huji: str, f_huji: str) -> tuple[str, str]:
    rules = load_couple_copy().get("huji_rules") or {}
    if m_huji == f_huji == "local":
        hit = rules.get("both_local") or {}
    elif "local" in (m_huji, f_huji) and "transferring" in (m_huji, f_huji):
        hit = rules.get("one_local_transferring") or {}
    elif m_huji == f_huji == "nonlocal":
        hit = rules.get("both_nonlocal") or {}
    elif ("local" in (m_huji, f_huji)) ^ ("nonlocal" in (m_huji, f_huji)):
        hit = rules.get("one_local_one_nonlocal") or {}
    else:
        hit = rules.get("default") or {}
    return str(hit.get("badge") or "warn"), str(hit.get("label") or "存在差异")


def _resolve_city_plan_badge(m_plan: str, f_plan: str) -> tuple[str, str]:
    rules = load_couple_copy().get("city_plan_rules") or {}
    if m_plan == f_plan == "current_fixed":
        hit = rules.get("both_fixed_same") or {}
    elif m_plan == f_plan == "current_flexible":
        hit = rules.get("both_flexible") or {}
    elif "undecided" in (m_plan, f_plan):
        hit = rules.get("either_undecided") or {}
    elif m_plan != f_plan:
        hit = rules.get("differ_meaningfully") or {}
    else:
        hit = rules.get("default") or {}
    return str(hit.get("badge") or "ok"), str(hit.get("label") or "基本一致")


def build_condition_table(male: dict[str, Any], female: dict[str, Any]) -> list[dict[str, Any]]:
    copy = load_couple_copy()
    gap_rules = copy.get("gap_rules") or {}
    m_fields = male.get("fields") or {}
    f_fields = female.get("fields") or {}
    m_ctx = male.get("context") or {}
    f_ctx = female.get("context") or {}
    rows: list[dict[str, Any]] = []

    m_age, f_age = m_fields.get("age"), f_fields.get("age")
    if m_age is not None and f_age is not None:
        diff = abs(int(m_age) - int(f_age))
        label, badge = _gap_badge(diff, gap_rules.get("age") or [])
        rows.append({
            "field": "age",
            "label": "年龄",
            "source": "PR1-01",
            "male_value": f"{m_age}岁",
            "female_value": f"{f_age}岁",
            "male_sub": "",
            "female_sub": "",
            "badge": badge,
            "badge_label": label,
        })

    m_edu, f_edu = m_fields.get("education_level"), f_fields.get("education_level")
    if m_edu is not None and f_edu is not None:
        diff = abs(int(m_edu) - int(f_edu))
        label, badge = _gap_badge(diff, gap_rules.get("education") or [])
        rows.append({
            "field": "education",
            "label": "学历",
            "source": "PR1-02",
            "male_value": _label_map("education", m_edu),
            "female_value": _label_map("education", f_edu),
            "male_sub": "",
            "female_sub": "",
            "badge": badge,
            "badge_label": label,
        })

    m_income = str(m_ctx.get("income_level") or "—")
    f_income = str(f_ctx.get("income_level") or "—")
    m_tier, f_tier = _income_tier(m_income), _income_tier(f_income)
    if m_tier is not None and f_tier is not None:
        diff = abs(m_tier - f_tier)
        income_label, income_badge = _gap_badge(diff, gap_rules.get("income") or [])
    else:
        income_label, income_badge = "接近", "ok"
    rows.append({
        "field": "income_level",
        "label": "收入水平",
        "source": "MS1-A-M-01",
        "male_value": m_income,
        "female_value": f_income,
        "male_sub": "",
        "female_sub": "",
        "badge": income_badge,
        "badge_label": income_label,
    })

    rows.append({
        "field": "housing",
        "label": "住房情况",
        "source": "MS1-A-M-02",
        "male_value": m_ctx.get("housing_status", "—"),
        "female_value": f_ctx.get("housing_status", "—"),
        "male_sub": "",
        "female_sub": "",
        "badge": "warn" if m_ctx.get("housing_status") != f_ctx.get("housing_status") else "ok",
        "badge_label": "待确认" if m_ctx.get("housing_status") != f_ctx.get("housing_status") else "接近",
    })

    if m_fields.get("huji") and f_fields.get("huji"):
        badge, label = _resolve_huji_badge(str(m_fields["huji"]), str(f_fields["huji"]))
        rows.append({
            "field": "huji",
            "label": "户籍",
            "source": "PR1-03",
            "male_value": _label_map("huji", m_fields["huji"]),
            "female_value": _label_map("huji", f_fields["huji"]),
            "male_sub": "",
            "female_sub": "",
            "badge": badge,
            "badge_label": label,
        })

    if m_fields.get("target_city_plan") and f_fields.get("target_city_plan"):
        badge, label = _resolve_city_plan_badge(str(m_fields["target_city_plan"]), str(f_fields["target_city_plan"]))
        rows.append({
            "field": "city_plan",
            "label": "定居规划",
            "source": "PR1-04",
            "male_value": _label_map("city_plan", m_fields["target_city_plan"]),
            "female_value": _label_map("city_plan", f_fields["target_city_plan"]),
            "male_sub": "",
            "female_sub": "",
            "badge": badge,
            "badge_label": label,
        })

    rows.append({
        "field": "career_track",
        "label": "事业轨道",
        "source": "MS1_B",
        "male_value": m_ctx.get("career_track", "—"),
        "female_value": f_ctx.get("career_track", "—"),
        "male_sub": "",
        "female_sub": "",
        "badge": "ok",
        "badge_label": "匹配",
    })

    rows.append({
        "field": "family_support",
        "label": "家庭助力",
        "source": "MS1_C / FS3_B",
        "male_value": m_ctx.get("family_support", "—"),
        "female_value": f_ctx.get("family_support", "—"),
        "male_sub": "不干涉",
        "female_sub": "独立程度高",
        "badge": "ok",
        "badge_label": "接近",
    })

    return rows


def _deal_item(
    *,
    field: str,
    label: str,
    source: str,
    male_text: str,
    female_text: str,
    badge: str,
    status_text: str | None = None,
) -> dict[str, Any]:
    copy = load_couple_copy()
    status = status_text or copy.get("deal_status_text", {}).get(badge, "—")
    return {
        "field": field,
        "label": label,
        "source": source,
        "male_text": male_text,
        "female_text": female_text,
        "badge": badge,
        "status_text": status,
        "highlight": badge in ("warn", "alert"),
    }


def build_deal_items(male: dict[str, Any], female: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    m_fields = male.get("fields") or {}
    f_fields = female.get("fields") or {}
    items: list[dict[str, Any]] = []

    if m_fields.get("want_children") and f_fields.get("want_children"):
        yw, tw = str(m_fields["want_children"]), str(f_fields["want_children"])
        badge = "ok" if yw == tw else "alert"
        items.append(_deal_item(
            field="want_children",
            label="要不要孩子",
            source="PR2-01",
            male_text=_label_map("want_children", yw),
            female_text=_label_map("want_children", tw),
            badge=badge,
        ))

    if (
        m_fields.get("want_children") == "want"
        and f_fields.get("want_children") == "want"
        and m_fields.get("children_timing") is not None
        and f_fields.get("children_timing") is not None
    ):
        yt, tt = m_fields["children_timing"], f_fields["children_timing"]
        if float(yt) >= 0 and float(tt) >= 0:
            diff = abs(float(yt) - float(tt))
            _, badge = _gap_badge(diff, [
                {"range": [0, 0], "label": "一致", "badge": "ok"},
                {"range": [0.1, 1.5], "label": "接近", "badge": "ok"},
                {"range": [1.5, 3], "label": "有出入", "badge": "warn"},
                {"range": [3, 99], "label": "差距大", "badge": "alert"},
            ])
            items.append(_deal_item(
                field="children_timing",
                label="要孩子的时间",
                source="PR2-02",
                male_text=_label_map("children_timing", yt),
                female_text=_label_map("children_timing", tt),
                badge=badge,
            ))

    female_plan = f_fields.get("female_work_plan")
    male_expect = m_fields.get("male_expect_female_work")
    if female_plan and male_expect:
        badge = "ok" if str(female_plan) == str(male_expect) else "warn"
        items.append(_deal_item(
            field="female_work_plan",
            label="婚后工作安排",
            source="PR2-03/04",
            male_text=_label_map("work_plan", male_expect),
            female_text=_label_map("work_plan", female_plan),
            badge=badge,
        ))

    if m_fields.get("target_city_plan") and f_fields.get("target_city_plan"):
        badge, _ = _resolve_city_plan_badge(str(m_fields["target_city_plan"]), str(f_fields["target_city_plan"]))
        items.append(_deal_item(
            field="target_city_plan",
            label="定居城市",
            source="PR1-04",
            male_text=_label_map("city_plan", m_fields["target_city_plan"]),
            female_text=_label_map("city_plan", f_fields["target_city_plan"]),
            badge=badge,
        ))

    if m_fields.get("long_distance_tolerance") is not None and f_fields.get("long_distance_tolerance") is not None:
        diff = abs(int(m_fields["long_distance_tolerance"]) - int(f_fields["long_distance_tolerance"]))
        _, badge = _gap_badge(diff, [
            {"range": [0, 0], "label": "一致", "badge": "ok"},
            {"range": [1, 1], "label": "接近", "badge": "ok"},
            {"range": [2, 3], "label": "有差距", "badge": "warn"},
        ])
        items.append(_deal_item(
            field="long_distance_tolerance",
            label="异地接受度",
            source="PR2-06",
            male_text=_label_map("long_distance", m_fields["long_distance_tolerance"]),
            female_text=_label_map("long_distance", f_fields["long_distance_tolerance"]),
            badge=badge,
        ))

    for field, label, source, label_group in (
        ("financial_model", "婚后财务模式", "PR3-01", "financial_model"),
        ("housing_plan", "婚后住房规划", "PR3-02", "housing_plan"),
        ("bride_price_attitude", "彩礼嫁妆", "PR3-03", "bride_price"),
        ("living_with_parents", "与父母同住", "PR3-04", "living_with_parents"),
    ):
        if m_fields.get(field) and f_fields.get(field):
            mv, fv = str(m_fields[field]), str(f_fields[field])
            badge = "ok" if mv == fv else "warn"
            items.append(_deal_item(
                field=field,
                label=label,
                source=source,
                male_text=_label_map(label_group, mv),
                female_text=_label_map(label_group, fv),
                badge=badge,
            ))

    highlight = [item for item in items if item["badge"] in ("warn", "alert")]
    dim = [item for item in items if item["badge"] == "ok"]
    return {"highlight": highlight, "dim": dim}


def build_rhythm(male: dict[str, Any], female: dict[str, Any]) -> list[dict[str, Any]]:
    copy = load_couple_copy()
    rows: list[dict[str, Any]] = []
    m_derived = male.get("derived") or {}
    f_derived = female.get("derived") or {}

    for spec in copy.get("rhythm_fields") or []:
        field = str(spec.get("male_field") or "")
        m_val = float(m_derived.get(field) or 50)
        f_val = float(f_derived.get(field) or 50)
        if field == "childcare_flexibility":
            m_val = float(m_derived.get("childcare_flexibility") or 60)
            f_val = float(f_derived.get("childcare_flexibility") or 60)

        diff = abs(m_val - f_val)
        note = ""
        for rule in spec.get("note_rules") or []:
            if diff <= float(rule.get("max_diff", 99)):
                note = str(rule.get("note") or "")
                break

        rows.append({
            "label": str(spec.get("label") or ""),
            "male_score": round(m_val),
            "female_score": round(f_val),
            "note": note,
        })

    return rows


def _eval_attention_condition(condition: str, ctx: dict[str, Any]) -> bool:
    male = ctx.get("male") or {}
    female = ctx.get("female") or {}
    m_derived = male.get("derived") or {}
    f_derived = female.get("derived") or {}
    m_fields = male.get("fields") or {}
    f_fields = female.get("fields") or {}

    if condition == "female.emotional_density_score > 65":
        return float(f_derived.get("emotional_density_score", 0)) > 65
    if condition == "male.housing_status == 'no_own' AND male.huji == 'nonlocal'":
        return m_derived.get("housing_status") == "no_own" and str(m_fields.get("huji")) == "nonlocal"
    if condition == "female.education_level > male.education_level":
        me = m_fields.get("education_level")
        fe = f_fields.get("education_level")
        return me is not None and fe is not None and int(fe) > int(me)
    if condition == "male.family_interference_score < 40 AND female.family_interference_score < 40":
        return float(m_derived.get("family_interference_score", 99)) < 40 and float(
            f_derived.get("family_interference_score", 99)
        ) < 40
    if condition == "children_timing_badge in ('warn', 'alert')":
        return ctx.get("children_timing_badge") in ("warn", "alert")
    if condition == "financial_model_badge == 'warn'":
        return ctx.get("financial_model_badge") == "warn"
    return False


def build_attention(
    male: dict[str, Any],
    female: dict[str, Any],
    deal_items: dict[str, list[dict[str, Any]]],
) -> list[dict[str, Any]]:
    copy = load_couple_copy()
    ctx: dict[str, Any] = {"male": male, "female": female}
    for item in deal_items.get("highlight", []) + deal_items.get("dim", []):
        if item.get("field") == "children_timing":
            ctx["children_timing_badge"] = item.get("badge")
        if item.get("field") == "financial_model":
            ctx["financial_model_badge"] = item.get("badge")

    matched: list[dict[str, Any]] = []
    for rule in copy.get("attention_rules") or []:
        if _eval_attention_condition(str(rule.get("condition") or ""), ctx):
            matched.append({
                "id": rule.get("id"),
                "icon": rule.get("icon"),
                "title": rule.get("title"),
                "desc": rule.get("desc"),
                "source": rule.get("source"),
            })

    warns = [item for item in matched if item.get("icon") == "warn"]
    oks = [item for item in matched if item.get("icon") == "ok"]
    ordered = warns + oks
    if oks and not any(item.get("icon") == "ok" for item in ordered[:4]):
        ordered = warns[:3] + oks[:1]
    return ordered[:4]


def build_verdict(score: int, modules: dict[str, dict[str, Any]], deal_items: dict[str, list[dict[str, Any]]]) -> dict[str, Any]:
    copy = load_couple_copy()
    title_map = copy.get("verdict_title") or {}
    if score >= 85:
        title = title_map.get("85-100", "")
    elif score >= 70:
        title = title_map.get("70-84", "")
    elif score >= 55:
        title = title_map.get("55-69", "")
    else:
        title = title_map.get("0-54", "")

    p1, p2, p4, p5 = modules["P1"], modules["P2"], modules["P4"], modules["P5"]
    oneliner = copy.get("verdict_oneliner_rules", [])[-1].get("text", "")
    for rule in copy.get("verdict_oneliner_rules") or []:
        when = str(rule.get("when") or "")
        if when == "default":
            continue
        p4_score = p4.get("score")
        if when == "P1_high+P4_high" and float(p1["score"]) >= 75 and p4_score is not None and float(p4_score) >= 75:
            oneliner = rule.get("text", oneliner)
            break
        if when == "P1_high+P4_mid" and float(p1["score"]) >= 75 and p4_score is not None and 55 <= float(p4_score) < 75:
            oneliner = rule.get("text", oneliner)
            break
        if when == "P1_mid+P2_high" and 55 <= float(p1["score"]) < 75 and float(p2["score"]) >= 75:
            oneliner = rule.get("text", oneliner)
            break
        if when == "P5_high" and float(p5["score"]) >= 50:
            oneliner = rule.get("text", oneliner)
            break

    parts: list[str] = []
    part_keys = copy.get("verdict_desc_parts") or {}
    parts.append(part_keys.get("income_ok", "收入区间接近"))
    if not deal_items.get("highlight"):
        parts.append(part_keys.get("family_low_risk", "家庭干预风险低"))
    else:
        if any(item.get("field") == "children_timing" for item in deal_items["highlight"]):
            parts.append(part_keys.get("children_warn", "婚育时间表有出入"))
        if any(item.get("field") == "financial_model" for item in deal_items["highlight"]):
            parts.append(part_keys.get("finance_warn", "财务模式有出入"))

    desc = "，".join(dict.fromkeys(p for p in parts if p)) + "。"
    return {
        "score": score,
        "title": title,
        "oneliner": oneliner,
        "desc": desc,
        "texture": None,
    }


def build_conclusion(
    score: int,
    deal_items: dict[str, list[dict[str, Any]]],
    modules: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    copy = load_couple_copy()
    highlight = deal_items.get("highlight") or []
    alert_count = sum(1 for item in highlight if item.get("badge") == "alert")
    warn_count = sum(1 for item in highlight if item.get("badge") == "warn")

    summary_map = copy.get("conclusion_summary") or {}
    if score >= 85 and not alert_count:
        summary = summary_map.get("high_score", "")
    elif alert_count >= 2 or warn_count >= 2:
        summary = summary_map.get("multiple_alerts", "")
    elif alert_count >= 1:
        summary = summary_map.get("has_alert", "")
    else:
        summary = summary_map.get("no_alert", "")

    templates = copy.get("conclusion_item_templates") or {}
    items: list[dict[str, Any]] = []
    for deal in highlight[:3]:
        field = str(deal.get("field") or "")
        template = templates.get(field)
        if not template:
            continue
        text = template.format(
            male_text=deal.get("male_text", ""),
            female_text=deal.get("female_text", ""),
        )
        items.append({"field": field, "text": text})

    problem = ""
    base_suggestion = ""
    if highlight:
        problem = str(highlight[0].get("label") or "")
        base_suggestion = "先把预期摆上桌，比拖着更省力"

    return {
        "summary": summary,
        "items": items,
        "action_item": None,
        "ai_pending": bool(problem),
        "ai_context": {"problem": problem, "base_suggestion": base_suggestion},
    }


def build_couple_payload(
    *,
    code: str,
    initiator: dict[str, Any],
    partner: dict[str, Any],
    conn: Any | None = None,
) -> dict[str, Any]:
    profiles = extract_profiles(initiator, partner, conn)
    male, female = profiles["male"], profiles["female"]

    modules = {
        "P1": compute_P1(male, female),
        "P2": compute_P2(male, female),
        "P3": compute_P3(male, female),
        "P4": compute_P4(male, female),
        "P5": compute_P5(male, female),
    }
    modules["P6"] = compute_P6(male, female, modules["P1"], modules["P2"], modules["P5"])

    score = aggregate_score(modules)
    atoms = extract_atoms(modules)
    deal_items = build_deal_items(male, female)
    condition_table = build_condition_table(male, female)
    rhythm = build_rhythm(male, female)
    attention = build_attention(male, female, deal_items)
    verdict = build_verdict(score, modules, deal_items)
    conclusion = build_conclusion(score, deal_items, modules)

    you_payload = coerce_dict(initiator.get("result_payload"))
    ta_payload = coerce_dict(partner.get("result_payload"))
    you_g, ta_g = _gender(initiator), _gender(partner)
    you_pos = str((you_payload.get("positionType") or {}).get("name") or you_payload.get("identityCard", {}).get("title") or "")
    ta_pos = str((ta_payload.get("positionType") or {}).get("name") or ta_payload.get("identityCard", {}).get("title") or "")

    you_sup = you_payload.get("pair_supplement") or {}
    ta_sup = ta_payload.get("pair_supplement") or {}
    spark = str(modules["P6"].get("level") or "")

    risk_atoms = list(modules["P5"].get("atoms") or [])
    ai_context = {
        "pair_atoms": atoms,
        "spark": spark,
        "risk_atoms": risk_atoms,
        "problem": conclusion.get("ai_context", {}).get("problem"),
        "base_suggestion": conclusion.get("ai_context", {}).get("base_suggestion"),
        "score": score,
    }

    return {
        "model": "MATE_PAIR_V4",
        "engine": "MATE_PAIR_ENGINE_V1.0",
        "productSet": "MATE",
        "code": code,
        "scoreScope": load_couple_copy().get("score_scope") or {},
        "participants": {
            "initiatorAttemptId": str(initiator.get("id") or ""),
            "partnerAttemptId": str(partner.get("id") or ""),
            "initiatorSuiteTier": "lite" if "_lite" in str(initiator.get("suite_slug") or "") else "full",
            "partnerSuiteTier": "lite" if "_lite" in str(partner.get("suite_slug") or "") else "full",
            "initiatorSuiteSlug": str(initiator.get("suite_slug") or "") or None,
            "partnerSuiteSlug": str(partner.get("suite_slug") or "") or None,
            "youGender": you_g,
            "taGender": ta_g,
            "youPosition": you_pos,
            "taPosition": ta_pos,
        },
        "verdict": verdict,
        "condition_table": condition_table,
        "deal_items": deal_items,
        "rhythm": rhythm,
        "attention": attention,
        "conclusion": conclusion,
        "ai_context": ai_context,
        "modules": {
            k: {
                "score": v.get("score"),
                "level": v.get("level"),
                "atoms": v.get("atoms") or [],
                "pending": bool(v.get("pending")),
            }
            for k, v in modules.items()
        },
        "supplementComplete": bool(_user_supplement_complete(you_sup) and _user_supplement_complete(ta_sup)),
        "youSupplementComplete": _user_supplement_complete(you_sup),
        "taSupplementComplete": _user_supplement_complete(ta_sup),
        "relationship_summary": {
            "matching_score": score,
            "relationship_status": verdict.get("title"),
            "relationship_spark": spark,
            "keywords": atoms[:5],
        },
        "relationship_analysis": {
            code: {
                "level": mod.get("level"),
                "desc": "",
                "score": mod.get("score"),
                "pending": bool(mod.get("pending")),
            }
            for code, mod in modules.items()
            if code != "P6"
        },
    }
