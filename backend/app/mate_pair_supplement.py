"""MATE Pair supplement (PR1–PR3): separate from ROS; answers live on MATE attempts only."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.core_traits import load_attempt_answer_rows

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "mate_pair_supplement_questions_v2.json"

WORK_PLAN_RANK = {
    "fulltime": 4,
    "flexible_after_birth": 3,
    "parttime_after_birth": 2,
    "fulltime_home": 1,
}

# Single MATE bank → supplement field (see pair_output_map in JSON spec).
SINGLE_QUESTION_SUPPLEMENT_MAP: dict[str, tuple[str, str]] = {
    "FS3-A-F-38": ("PR1-02", "education_level"),
    "MS1-A-M-06": ("PR1-02", "education_level"),
}

EDUCATION_OPTION_TO_LEVEL = {"A": 1, "B": 2, "C": 3, "D": 4, "E": 5}

FEMALE_INCOME_LABELS = {
    "A": "稳定独立",
    "B": "半独立",
    "C": "依赖型",
    "D": "明显高于平均",
}

MALE_INCOME_LEVEL_LABELS = {
    1: "入门层",
    2: "基础层",
    3: "中等层",
    4: "中上层",
    5: "优质层",
    6: "顶端层",
}

CURRENT_HOUSING_LABELS = {
    "A": "自有/按揭房",
    "B": "家人提供住房",
    "C": "租房（条件较好）",
    "D": "租房（积累中）",
}

CAREER_SLIDER_LABELS = (
    (86, "规划清晰"),
    (66, "方向明确"),
    (46, "有大方向"),
    (26, "仍在摸索"),
    (0, "尚未规划"),
)


@lru_cache(maxsize=1)
def load_supplement_spec() -> dict[str, Any]:
    try:
        return json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except OSError:
        return {"questions": []}


def questions_for_gender(gender: str, *, skip_ids: set[str] | None = None) -> list[dict[str, Any]]:
    g = str(gender or "female").lower()
    skip = skip_ids or set()
    out: list[dict[str, Any]] = []
    for q in load_supplement_spec().get("questions") or []:
        if not isinstance(q, dict):
            continue
        qid = str(q.get("id") or "")
        if qid in skip:
            continue
        q_gender = str(q.get("gender") or "both").lower()
        if q_gender not in ("both", g):
            continue
        out.append(dict(q))
    out.sort(key=lambda item: int(item.get("order") or 0))
    return out


def _career_label_from_slider(value: float) -> str:
    for threshold, label in CAREER_SLIDER_LABELS:
        if value >= threshold:
            return label
    return "尚未规划"


def extract_single_mapped_supplement_fields(
    conn: Any | None,
    attempt: dict[str, Any],
) -> dict[str, Any]:
    """Map answered single MATE items into pair_supplement.fields (MATE-only, not ROS)."""
    fields: dict[str, Any] = {}
    attempt_id = str(attempt.get("id") or "")
    if not conn or not attempt_id:
        return fields

    rows = load_attempt_answer_rows(conn, attempt_id)
    for row in rows:
        ext = str(row.get("external_question_id") or "")
        answer = row.get("answer_payload") or {}
        if not isinstance(answer, dict):
            continue

        mapped = SINGLE_QUESTION_SUPPLEMENT_MAP.get(ext)
        if mapped:
            _qid, field = mapped
            key = answer.get("optionKey")
            if key in EDUCATION_OPTION_TO_LEVEL:
                fields[field] = EDUCATION_OPTION_TO_LEVEL[str(key)]

        if ext == "FS3-A-F-35":
            key = answer.get("optionKey")
            if key in FEMALE_INCOME_LABELS:
                fields["_single_income_label"] = FEMALE_INCOME_LABELS[str(key)]

        if ext == "MS1-A-M-01" and answer.get("value") is not None:
            level = int(float(answer["value"]))
            fields["_single_income_label"] = MALE_INCOME_LEVEL_LABELS.get(level, f"档位 {level}")

        if ext == "MS1-A-M-02":
            key = answer.get("optionKey")
            if key in CURRENT_HOUSING_LABELS:
                fields["_single_housing_label"] = CURRENT_HOUSING_LABELS[str(key)]

        if ext == "MS1-B-M-07" and answer.get("value") is not None:
            fields["_single_career_label"] = _career_label_from_slider(float(answer["value"]))

        if ext == "FS3-B-F-40":
            key = answer.get("optionKey")
            family_labels = {
                "A": "家庭助力强",
                "B": "独立决策",
                "C": "轻度干预",
                "D": "高干预",
            }
            if key in family_labels:
                fields["_single_family_label"] = family_labels[str(key)]

    return fields


def skip_question_ids_from_single(conn: Any | None, attempt: dict[str, Any]) -> set[str]:
    mapped = extract_single_mapped_supplement_fields(conn, attempt)
    skip: set[str] = set()
    for ext, (qid, field) in SINGLE_QUESTION_SUPPLEMENT_MAP.items():
        if field in mapped:
            skip.add(qid)
    return skip


def resolve_supplement_fields(
    attempt: dict[str, Any],
    conn: Any | None = None,
) -> dict[str, Any]:
    """Merge stored pair_supplement.fields with single-test mappings (single wins for education)."""
    payload = attempt.get("result_payload") or {}
    if not isinstance(payload, dict):
        payload = {}
    stored = payload.get("pair_supplement") or {}
    user_fields: dict[str, Any] = {}
    if isinstance(stored, dict):
        raw = stored.get("fields")
        if isinstance(raw, dict):
            user_fields = dict(raw)

    single_fields = extract_single_mapped_supplement_fields(conn, attempt)
    merged = {**single_fields, **user_fields}
    return merged


def _user_supplement_complete(sup_block: Any) -> bool:
    if not isinstance(sup_block, dict):
        return False
    if sup_block.get("completed_at"):
        return True
    fields = sup_block.get("fields")
    return isinstance(fields, dict) and len(fields) >= 3


def _option_value(q: dict[str, Any], key: str) -> Any:
    for opt in q.get("options") or []:
        if not isinstance(opt, dict):
            continue
        if str(opt.get("key")) == str(key):
            if "value" in opt:
                return opt.get("value")
            return opt.get("text")
    return key


def _flexibility_score(q: dict[str, Any], key: str) -> int | None:
    for opt in q.get("options") or []:
        if isinstance(opt, dict) and str(opt.get("key")) == str(key):
            raw = opt.get("flexibility_score")
            return int(raw) if raw is not None else None
    return None


def normalize_supplement_answers(
    raw_answers: dict[str, Any],
    *,
    gender: str,
) -> dict[str, Any]:
    """Map PR ids → output_field values stored on attempt.result_payload.pair_supplement.fields."""
    fields: dict[str, Any] = {}
    by_id = {str(q.get("id")): q for q in questions_for_gender(gender) if q.get("id")}

    for qid, q in by_id.items():
        entry = raw_answers.get(qid)
        if entry is None:
            continue
        field = str(q.get("output_field") or "")
        if not field:
            continue
        q_type = str(q.get("type") or "")
        if q_type == "slider":
            val = entry.get("value") if isinstance(entry, dict) else entry
            fields[field] = int(float(val))
        elif q_type == "binary":
            key = entry.get("optionKey") if isinstance(entry, dict) else str(entry)
            fields[field] = _option_value(q, str(key))
        else:
            key = entry.get("optionKey") if isinstance(entry, dict) else str(entry)
            fields[field] = _option_value(q, str(key))
        if field == "childcare_plan":
            fs = _flexibility_score(q, str(key if not isinstance(entry, dict) else entry.get("optionKey")))
            if fs is not None:
                fields["childcare_flexibility_score"] = fs

    if gender == "female" and "female_work_plan" in fields:
        pass
    if gender == "male" and "male_expect_female_work" in fields:
        pass
    return fields


def _gap_badge(diff: float, rules: list[dict[str, Any]]) -> tuple[str, str]:
    for rule in rules:
        lo, hi = rule.get("range") or [0, 0]
        if float(lo) <= diff <= float(hi):
            return str(rule.get("label") or ""), str(rule.get("badge") or "ok")
    return "有出入", "warn"


def _row(label: str, you: str, ta: str, verdict: str, badge: str) -> dict[str, str]:
    return {"label": label, "you": you, "ta": ta, "verdict": verdict, "badge": badge}


def _display_huji(v: Any) -> str:
    mapping = {"local": "本地户籍", "transferring": "落户办理中", "nonlocal": "外地户籍"}
    return mapping.get(str(v), str(v))


def _display_city_plan(v: Any) -> str:
    mapping = {
        "current_fixed": "定居现城市",
        "current_flexible": "现城市，可变动",
        "other_fixed": "计划换城市",
        "undecided": "尚未规划",
    }
    return mapping.get(str(v), str(v))


def _display_want_children(v: Any) -> str:
    return "想要" if str(v) == "want" else "不想要/未定"


def _work_plan_label(v: Any) -> str:
    mapping = {
        "fulltime": "继续工作",
        "flexible_after_birth": "产后灵活",
        "parttime_after_birth": "可能全职在家",
        "fulltime_home": "以家庭为主",
    }
    return mapping.get(str(v), str(v))


def _module_tier(score: float) -> str:
    if score >= 75:
        return "较好"
    if score >= 55:
        return "中等"
    return "偏弱"


def _extract_single_context(attempt: dict[str, Any], conn: Any | None = None) -> dict[str, str]:
    """Pull income/housing/career/family hints from single MATE answers — MATE only."""
    mapped = extract_single_mapped_supplement_fields(conn, attempt)
    if mapped.get("_single_income_label"):
        income = str(mapped["_single_income_label"])
    else:
        dims = attempt.get("dimension_scores") or {}
        if not isinstance(dims, dict):
            dims = {}
        income = _module_tier(float(dims.get("FS3") or dims.get("MS1") or 55))

    if mapped.get("_single_housing_label"):
        housing = str(mapped["_single_housing_label"])
    else:
        dims = attempt.get("dimension_scores") or {}
        if not isinstance(dims, dict):
            dims = {}
        housing = "有房/稳定" if float(dims.get("MS1") or dims.get("FS3") or 0) >= 65 else "仍在积累"

    if mapped.get("_single_career_label"):
        career = str(mapped["_single_career_label"])
    else:
        dims = attempt.get("dimension_scores") or {}
        if not isinstance(dims, dict):
            dims = {}
        career = _module_tier(float(dims.get("FS1") or dims.get("MS4") or 55))

    if mapped.get("_single_family_label"):
        family = str(mapped["_single_family_label"])
    else:
        dims = attempt.get("dimension_scores") or {}
        if not isinstance(dims, dict):
            dims = {}
        family = _module_tier(float(dims.get("FS3") or dims.get("MS3") or 50))

    return {
        "income_level": income,
        "housing_status": housing,
        "career_track": career,
        "family_support": family,
    }


def build_pair_supplement_analysis(
    *,
    initiator: dict[str, Any],
    partner: dict[str, Any],
    conn: Any | None = None,
) -> dict[str, Any]:
    you_payload = initiator.get("result_payload") or {}
    ta_payload = partner.get("result_payload") or {}
    if not isinstance(you_payload, dict):
        you_payload = {}
    if not isinstance(ta_payload, dict):
        ta_payload = {}

    you_sup = you_payload.get("pair_supplement") or {}
    ta_sup = ta_payload.get("pair_supplement") or {}
    you_fields = resolve_supplement_fields(initiator, conn)
    ta_fields = resolve_supplement_fields(partner, conn)

    you_g = str(initiator.get("archetype_gender") or you_payload.get("gender") or "female").lower()
    ta_g = str(partner.get("archetype_gender") or ta_payload.get("gender") or "male").lower()

    you_ctx = _extract_single_context(initiator, conn)
    ta_ctx = _extract_single_context(partner, conn)

    condition_rows: list[dict[str, str]] = []
    deal_rows: list[dict[str, str]] = []
    attention: list[dict[str, str]] = []

    you_age = you_fields.get("age")
    ta_age = ta_fields.get("age")
    if you_age is not None and ta_age is not None:
        diff = abs(int(you_age) - int(ta_age))
        label, badge = _gap_badge(diff, [
            {"range": [0, 2], "label": "年龄相当", "badge": "ok"},
            {"range": [3, 5], "label": "差距合理", "badge": "ok"},
            {"range": [6, 9], "label": "有一定差距", "badge": "warn"},
            {"range": [10, 99], "label": "年龄差较大", "badge": "warn"},
        ])
        condition_rows.append(_row("年龄差", f"{you_age}岁", f"{ta_age}岁", label, badge))

    you_edu = you_fields.get("education_level")
    ta_edu = ta_fields.get("education_level")
    if you_edu is not None and ta_edu is not None:
        diff = abs(int(you_edu) - int(ta_edu))
        label, badge = _gap_badge(diff, [
            {"range": [0, 1], "label": "学历相当", "badge": "ok"},
            {"range": [2, 2], "label": "有差距，可接受", "badge": "warn"},
            {"range": [3, 99], "label": "差距较大", "badge": "warn"},
        ])
        condition_rows.append(_row("学历", str(you_edu), str(ta_edu), label, badge))
        if you_g == "female" and ta_g == "male" and int(you_edu) > int(ta_edu):
            attention.append({
                "label": "学历差",
                "message": "她的学历高于他，部分家庭会在意",
                "desc": "学历差距本身不是问题，但可能带来外部压力，两人提前对齐家里态度更好。",
                "badge": "warn",
            })

    if you_fields.get("huji") and ta_fields.get("huji"):
        yh, th = str(you_fields["huji"]), str(ta_fields["huji"])
        if yh == th == "local":
            verdict, badge = "户籍一致", "ok"
        elif "local" in (yh, th) and "transferring" in (yh, th):
            verdict, badge = "基本无问题", "ok"
        elif yh == th == "nonlocal":
            verdict, badge = "均为外地，需规划落户", "warn"
        else:
            verdict, badge = "存在差异，影响就学等", "warn"
        condition_rows.append(_row("户籍", _display_huji(yh), _display_huji(th), verdict, badge))

    condition_rows.append(_row("收入档位", you_ctx["income_level"], ta_ctx["income_level"], "来自单人题组", "ok"))
    condition_rows.append(_row("住房情况", you_ctx["housing_status"], ta_ctx["housing_status"], "来自单人题组", "ok"))

    if you_fields.get("target_city_plan") and ta_fields.get("target_city_plan"):
        yc, tc = str(you_fields["target_city_plan"]), str(ta_fields["target_city_plan"])
        if yc == tc == "current_fixed":
            verdict, badge = "城市规划一致", "ok"
        elif yc == tc == "current_flexible":
            verdict, badge = "方向一致，细节待定", "ok"
        elif "undecided" in (yc, tc):
            verdict, badge = "一方尚未规划，建议沟通", "warn"
        elif yc != tc:
            verdict, badge = "城市规划存在分歧", "warn"
        else:
            verdict, badge = "基本一致", "ok"
        deal_rows.append(_row("定居城市", _display_city_plan(yc), _display_city_plan(tc), verdict, badge))

    condition_rows.append(_row("职业方向", you_ctx["career_track"], ta_ctx["career_track"], "来自单人题组", "ok"))
    condition_rows.append(_row("家庭助力", you_ctx["family_support"], ta_ctx["family_support"], "来自单人题组", "ok"))

    if you_fields.get("want_children") and ta_fields.get("want_children"):
        yw, tw = str(you_fields["want_children"]), str(ta_fields["want_children"])
        if yw == tw:
            verdict, badge = "一致", "ok"
        else:
            verdict, badge = "分歧明显，需认真谈", "alert"
        deal_rows.append(_row("要不要孩子", _display_want_children(yw), _display_want_children(tw), verdict, badge))

    if (
        you_fields.get("want_children") == "want"
        and ta_fields.get("want_children") == "want"
        and you_fields.get("children_timing") is not None
        and ta_fields.get("children_timing") is not None
        and float(you_fields["children_timing"]) >= 0
        and float(ta_fields["children_timing"]) >= 0
    ):
        diff = abs(float(you_fields["children_timing"]) - float(ta_fields["children_timing"]))
        label, badge = _gap_badge(diff, [
            {"range": [0, 0], "label": "时间表一致", "badge": "ok"},
            {"range": [0.1, 1.5], "label": "基本接近", "badge": "ok"},
            {"range": [1.5, 3], "label": "有出入，需对齐", "badge": "warn"},
            {"range": [3, 99], "label": "时间表差距大", "badge": "alert"},
        ])
        deal_rows.append(_row("生育时间表", str(you_fields["children_timing"]), str(ta_fields["children_timing"]), label, badge))

    female_plan = you_fields.get("female_work_plan") if you_g == "female" else ta_fields.get("female_work_plan")
    male_expect = ta_fields.get("male_expect_female_work") if you_g == "female" else you_fields.get("male_expect_female_work")
    if female_plan and male_expect:
        if str(female_plan) == str(male_expect):
            verdict, badge = "一致", "ok"
        elif abs(WORK_PLAN_RANK.get(str(female_plan), 0) - WORK_PLAN_RANK.get(str(male_expect), 0)) <= 1:
            verdict, badge = "基本接近，可沟通", "warn"
        else:
            verdict, badge = "分歧明显", "alert"
        deal_rows.append(_row(
            "女方工作预期",
            _work_plan_label(female_plan),
            _work_plan_label(male_expect),
            verdict,
            badge,
        ))

    you_flex = you_fields.get("childcare_flexibility_score")
    ta_flex = ta_fields.get("childcare_flexibility_score")
    rhythm_note = "两人在育儿安排上还有空间聊"
    if you_flex is not None and ta_flex is not None:
        diff = abs(int(you_flex) - int(ta_flex))
        if diff <= 15:
            rhythm_note = "两人在育儿安排上灵活度接近"
        elif diff <= 30:
            rhythm_note = "育儿分工预期略有不同，可以聊"
        else:
            rhythm_note = "育儿分工预期差异较大，建议提前对齐"

    if you_fields.get("long_distance_tolerance") is not None and ta_fields.get("long_distance_tolerance") is not None:
        diff = abs(int(you_fields["long_distance_tolerance"]) - int(ta_fields["long_distance_tolerance"]))
        label, badge = _gap_badge(diff, [
            {"range": [0, 0], "label": "一致", "badge": "ok"},
            {"range": [1, 1], "label": "基本接近", "badge": "ok"},
            {"range": [2, 3], "label": "容忍度有差距", "badge": "warn"},
        ])
        deal_rows.append(_row("异地容忍", str(you_fields["long_distance_tolerance"]), str(ta_fields["long_distance_tolerance"]), label, badge))

    for field, label in (
        ("financial_model", "财务模式"),
        ("housing_plan", "住房预期"),
        ("bride_price_attitude", "彩礼态度"),
        ("living_with_parents", "与父母同住"),
    ):
        if you_fields.get(field) and ta_fields.get(field):
            yv, tv = str(you_fields[field]), str(ta_fields[field])
            if yv == tv:
                verdict, badge = "一致", "ok"
            else:
                verdict, badge = "有出入，需对齐", "warn"
            deal_rows.append(_row(label, yv, tv, verdict, badge))

    return {
        "productSet": "MATE",
        "engine": "MATE_PAIR_SUPPLEMENT_V1.1",
        "supplementComplete": bool(_user_supplement_complete(you_sup) and _user_supplement_complete(ta_sup)),
        "youSupplementComplete": _user_supplement_complete(you_sup),
        "taSupplementComplete": _user_supplement_complete(ta_sup),
        "condition_compare_table": condition_rows,
        "deal_items_table": deal_rows,
        "rhythm_section": {
            "label": "育儿分工灵活度",
            "youScore": you_flex,
            "taScore": ta_flex,
            "note": rhythm_note,
        },
        "attention_items": attention,
    }
