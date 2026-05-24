from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from app.chat_prompt_layers import score_band_label
from app.scoring import _clamp, answer_to_numeric

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

FEMALE_MODULE_CODES = ("FS1", "FS2", "FS3", "FS4", "FS5")
MALE_MODULE_CODES = ("MS1", "MS2", "MS3", "MS4", "MS5")

POSITION_SUBTITLES = {
    "让人想留下来的人": "有些人适合一见钟情，你更适合被慢慢留下",
    "被读懂之前的人": "有些人适合一见钟情，你更适合第二次见面",
    "一眼就懂的人": "你不需要被翻译，但需要被认真选择",
    "需要被正确打开的人": "频道对了是惊喜，频道错了是误解",
    "还没到时候的人": "你不是不够好，是最好版本还在路上",
    "越了解越值钱的人": "有些人适合一见钟情，你更适合第二次见面",
}

APPEARANCE_SLIDER_IDS = {
    "female": "FS1-A-F-01",
    "male": "MS4-A-M-49",
}

APPEARANCE_CALIBRATION_SIGNALS = {
    "FS1-A-F-01": ["FS1-A-F-03", "FS1-A-F-02", "FS1-B-F-12"],
    "MS4-A-M-49": ["MS4-A-M-50", "MS4-A-M-53", "MS4-A-M-52"],
}


def _appearance_asset_label(adjusted_1_10: float) -> str:
    if adjusted_1_10 <= 3:
        return "外形资产：待提升"
    if adjusted_1_10 <= 5:
        return "外形资产：自然型"
    if adjusted_1_10 <= 7:
        return "外形资产：中等辨识度"
    if adjusted_1_10 <= 8.5:
        return "外形资产：高辨识度"
    return "外形资产：核心吸引资产"


def _signal_score_from_answer(question: dict[str, Any], answer: dict[str, Any] | None) -> float | None:
    if not answer:
        return None
    numeric = answer_to_numeric(question, answer)
    if numeric is None:
        return None
    return _normalize_question_score_to_100(question, numeric)


def _calibrate_attractiveness(
    raw_1_10: float,
    management: float | None,
    social: float | None,
    presence: float | None,
) -> float:
    adjusted = float(raw_1_10)
    if raw_1_10 < 7:
        return _clamp(adjusted, 1, 10)

    if management is not None:
        if management < 45:
            adjusted -= (raw_1_10 - 6) * 0.35
        elif management < 55:
            adjusted -= (raw_1_10 - 6) * 0.15

    if social is not None:
        if social < 45:
            adjusted -= (raw_1_10 - 6) * 0.25
        elif social < 55:
            adjusted -= (raw_1_10 - 6) * 0.10

    if presence is not None:
        if presence < 45:
            adjusted -= (raw_1_10 - 6) * 0.12
        elif presence < 55:
            adjusted -= (raw_1_10 - 6) * 0.05

    return round(_clamp(adjusted, 1, 10), 2)


def _questions_by_external(questions: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    return {q["external_question_id"]: q for q in questions}


def _apply_appearance_calibration(
    *,
    gender: str,
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    normalized_by_external: dict[str, float],
    numeric_by_external: dict[str, float],
) -> tuple[float | None, str | None]:
    slider_id = APPEARANCE_SLIDER_IDS.get(gender)
    if not slider_id:
        return None, None

    raw = numeric_by_external.get(slider_id)
    if raw is None:
        return None, None

    by_ext = _questions_by_external(questions)
    signal_ids = APPEARANCE_CALIBRATION_SIGNALS.get(slider_id, [])
    signals: list[float | None] = []
    for signal_id in signal_ids:
        question = by_ext.get(signal_id)
        if not question:
            signals.append(None)
            continue
        signals.append(_signal_score_from_answer(question, answers.get(signal_id)))

    management, social, presence = (signals + [None, None, None])[:3]
    adjusted = _calibrate_attractiveness(raw, management, social, presence)
    normalized_by_external[slider_id] = _clamp(adjusted * 10)
    label = _appearance_asset_label(adjusted)
    return adjusted, label


def is_mate_suite(suite_slug: str | None) -> bool:
    raw = (suite_slug or "").lower()
    return "mate" in raw or "s03" in raw


def _load_result_profiles_from_file(gender: str) -> dict[str, Any]:
    filename = "suite3_mate_female.json" if gender == "female" else "suite3_mate_male.json"
    path = DATA_DIR / filename
    if not path.exists():
        return {}
    bank = json.loads(path.read_text(encoding="utf-8"))
    return bank.get("result_profiles") or {}


def load_mate_result_profiles(conn: Any, suite_id: Any, gender: str) -> dict[str, Any]:
    """Load MATE position copy from DB; fall back to local JSON in dev."""
    rows = conn.execute(
        """
        SELECT archetype_code, profile_payload
        FROM public.result_archetypes
        WHERE suite_id = %s AND is_active = true
        ORDER BY display_order ASC
        """,
        (suite_id,),
    ).fetchall()
    if rows:
        profiles: dict[str, Any] = {}
        for row in rows:
            payload = row.get("profile_payload") or {}
            profiles[str(row["archetype_code"])] = dict(payload) if isinstance(payload, dict) else {}
        return profiles
    return _load_result_profiles_from_file(gender)


def _load_result_profiles(gender: str) -> dict[str, Any]:
    return _load_result_profiles_from_file(gender)


def _normalize_question_score_to_100(question: dict[str, Any], numeric: float) -> float:
    scoring = question.get("scoring_payload") or {}
    method = str(scoring.get("method") or scoring.get("type") or "direct")
    qtype = question.get("question_type")
    direction = question.get("direction")

    if method == "direct_times_10":
        return _clamp(float(numeric) * 10)
    if method == "direct_times_20":
        return _clamp(float(numeric) * 20)
    if method in {"reverse", "reverse_slider"} or direction == "reverse":
        if float(numeric) <= 5:
            return _clamp(100 - float(numeric) * 20)
        return _clamp(100 - float(numeric))

    if qtype == "slider" and float(numeric) > 10:
        return _clamp(float(numeric))

    if float(numeric) <= 5:
        return _clamp(float(numeric) * 20)

    return _clamp(float(numeric))


def _question_sub_code(question: dict[str, Any]) -> str | None:
    payload = question.get("question_payload") or {}
    sub = payload.get("sub") or payload.get("sub_dimension")
    if sub:
        return str(sub)
    source = payload.get("source_question") or {}
    sub = source.get("sub")
    return str(sub) if sub else None


def _aggregate_sub_and_module_scores(
    questions: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    scoring_formula: dict[str, Any],
    *,
    gender: str = "female",
) -> tuple[dict[str, float], dict[str, float], dict[str, float], str | None]:
    normalized_by_external: dict[str, float] = {}
    numeric_by_external: dict[str, float] = {}

    for question in questions:
        ext = question["external_question_id"]
        numeric = answer_to_numeric(question, answers.get(ext, {}))
        if numeric is None:
            continue
        numeric_by_external[ext] = numeric
        normalized_by_external[ext] = _normalize_question_score_to_100(question, numeric)

    _apply_appearance_calibration(
        gender=gender,
        questions=questions,
        answers=answers,
        normalized_by_external=normalized_by_external,
        numeric_by_external=numeric_by_external,
    )
    appearance_label = None
    slider_id = APPEARANCE_SLIDER_IDS.get(gender)
    if slider_id and slider_id in normalized_by_external:
        adjusted = normalized_by_external[slider_id] / 10
        appearance_label = _appearance_asset_label(adjusted)

    sub_scores: dict[str, float] = {}
    sub_weights: dict[str, float] = {}
    for question in questions:
        sub = _question_sub_code(question)
        if not sub:
            continue
        ext = question["external_question_id"]
        normalized = normalized_by_external.get(ext)
        if normalized is None:
            continue
        weight = float(question.get("weight") or 1)
        sub_scores[sub] = sub_scores.get(sub, 0) + normalized * weight
        sub_weights[sub] = sub_weights.get(sub, 0) + weight

    for sub, total in list(sub_scores.items()):
        if sub_weights.get(sub):
            sub_scores[sub] = round(_clamp(total / sub_weights[sub]), 2)

    modules_cfg = scoring_formula.get("modules") or {}
    module_scores: dict[str, float] = {}
    for module_code, module_def in modules_cfg.items():
        if not isinstance(module_def, dict):
            continue
        subs = module_def.get("sub") or {}
        weighted = 0.0
        weight_sum = 0.0
        for sub_code, sub_def in subs.items():
            if not isinstance(sub_def, dict):
                continue
            sub_score = sub_scores.get(sub_code)
            if sub_score is None:
                continue
            w = float(sub_def.get("weight") or 0)
            weighted += sub_score * w
            weight_sum += w
        if weight_sum:
            module_scores[module_code] = round(_clamp(weighted / weight_sum), 2)

    return module_scores, sub_scores, numeric_by_external, appearance_label


def _compute_axes(module_scores: dict[str, float], scoring_formula: dict[str, Any]) -> tuple[float, float]:
    fs1 = module_scores.get("FS1", module_scores.get("MS1", 50))
    fs2 = module_scores.get("FS2", module_scores.get("MS2", 50))
    fs3 = module_scores.get("FS3", module_scores.get("MS3", 50))
    fs5 = module_scores.get("FS5", module_scores.get("MS5", 50))
    ms1 = module_scores.get("MS1", fs1)
    ms2 = module_scores.get("MS2", fs2)
    ms3 = module_scores.get("MS3", fs3)
    ms4 = module_scores.get("MS4", 50)
    ms5 = module_scores.get("MS5", fs5)

    if "FS1" in module_scores or "FS2" in module_scores:
        axis_x = fs1 * 0.55 + fs2 * 0.45
        axis_y = fs3 * 0.60 + (100 - fs5) * 0.40
    else:
        axis_x = ms3 * 0.50 + ms4 * 0.50
        axis_y = ms1 * 0.55 + ms2 * 0.30 + (100 - ms5) * 0.15

    return round(_clamp(axis_x), 2), round(_clamp(axis_y), 2)


def _eval_mate_condition(condition: str, ctx: dict[str, float]) -> bool:
    expr = condition.strip()
    if not expr:
        return False
    parts = re.split(r"\s*&&\s*", expr)
    for part in parts:
        match = re.match(
            r"^(horizontal|vertical|FS[1-5]|MS[1-5])\s*(>=|<=|>|<)\s*(\d+(?:\.\d+)?)$",
            part.strip(),
        )
        if not match:
            return False
        key_map = {
            "horizontal": ctx.get("horizontal", 0),
            "vertical": ctx.get("vertical", 0),
        }
        var, op, raw_value = match.group(1), match.group(2), float(match.group(3))
        value = key_map.get(var, ctx.get(var, 0))
        if op == ">=" and not value >= raw_value:
            return False
        if op == "<=" and not value <= raw_value:
            return False
        if op == ">" and not value > raw_value:
            return False
        if op == "<" and not value < raw_value:
            return False
    return True


def _resolve_position_type(
    axis_x: float,
    axis_y: float,
    module_scores: dict[str, float],
    type_rules: dict[str, Any],
    gender: str,
) -> tuple[str, str]:
    ctx = {
        "horizontal": axis_x,
        "vertical": axis_y,
        **module_scores,
    }
    quadrant_logic = type_rules.get("quadrant_logic") or {}

    ordered_keys = ("special_2", "special_1", "Q1", "Q2", "Q4", "Q3")
    for key in ordered_keys:
        rule = quadrant_logic.get(key) or {}
        condition = str(rule.get("condition") or "")
        if gender == "male" and key == "special_2":
            condition = condition.replace("FS2 >= 65", "MS3 >= 65")
        if condition and _eval_mate_condition(condition, ctx):
            pos_type = str(rule.get("type") or key)
            return pos_type, key if key.startswith("Q") else "Q2"

    if axis_x >= 60 and axis_y >= 60:
        return "让人想留下来的人", "Q1"
    if axis_x < 50 and axis_y >= 60:
        return "被读懂之前的人", "Q2"
    if axis_x >= 60 and axis_y < 50:
        return "一眼就懂的人", "Q4"
    if axis_x < 50 and axis_y < 50:
        return "还没到时候的人", "Q3"
    return "需要被正确打开的人", "Q0"


def _stars_from_score(score: float) -> int:
    return max(1, min(5, round(score / 20)))


def _risk_band(fs5: float) -> str:
    if fs5 <= 35:
        return "低风险"
    if fs5 <= 55:
        return "中低风险"
    if fs5 <= 70:
        return "中等风险"
    return "需留意"


def _first_impression_label(axis_x: float) -> str:
    if axis_x >= 70:
        return "容易被发现"
    if axis_x >= 55:
        return "需要一点相处才显优势"
    return "第一眼容易被低估"


def _long_term_label(axis_y: float) -> str:
    if axis_y >= 70:
        return "持续升值"
    if axis_y >= 55:
        return "稳定积累型"
    return "仍在建设期"


def _retention_label(fs2: float, fs4: float) -> str:
    blend = fs2 * 0.6 + fs4 * 0.4
    if blend >= 70:
        return "高"
    if blend >= 55:
        return "中等偏高"
    return "需要时间证明"


def _build_matchmaker_records(position_name: str, module_scores: dict[str, float], gender: str) -> list[dict[str, str]]:
    fs2 = module_scores.get("FS2", module_scores.get("MS3", 55))
    fs4 = module_scores.get("FS4", module_scores.get("MS2", 55))
    partner = "对方" if gender == "female" else "对方"
    records = [
        {
            "id": "001",
            "title": "第一次见面",
            "remember": ["聊天感觉", "舒服程度"] if fs2 >= 60 else ["整体印象", "是否愿意再见"],
            "notRemember": ["具体细节", "你说了哪句话"],
            "narrative": f"{partner}大概率记住的是相处氛围，而不是细节。",
        },
        {
            "id": "002",
            "title": "相处两个月后",
            "discover": "原来Ta情绪挺稳定" if fs4 >= 65 else "原来Ta比想象中更靠谱",
            "narrative": f"进入熟悉期后，{partner}开始看见你的{'情绪稳定' if fs4 >= 65 else '长期价值'}。",
        },
        {
            "id": "003",
            "title": "出现冲突",
            "feel": "Ta没我想象中难相处" if fs4 >= 60 else "Ta比我想的更直接",
            "narrative": "冲突时，对方对你的耐受度往往高于预期。" if fs2 >= 60 else "冲突时，对方需要更多清晰表达。",
        },
    ]
    if position_name == "越了解越值钱的人":
        records[0]["remember"] = ["越聊越有意思", "愿意再约"]
    return records


def _build_love_timeline(module_scores: dict[str, float]) -> list[dict[str, Any]]:
    fs2 = module_scores.get("FS2", module_scores.get("MS3", 55))
    fs4 = module_scores.get("FS4", module_scores.get("MS2", 55))
    stability = round((fs2 * 0.55 + fs4 * 0.45))
    return [
        {"day": 1, "label": "Day1", "mood": "挺有意思" if fs2 >= 55 else "还在观察"},
        {"day": 14, "label": "Day14", "mood": "开始变熟"},
        {"day": 45, "label": "Day45", "mood": "产生依赖" if fs2 >= 65 else "慢慢靠近"},
        {"day": 90, "label": "Day90", "mood": "关系磨合", "expandable": True,
         "danger": "容易进入情绪需求不对等阶段" if fs2 >= 70 and fs4 < 60 else "容易因节奏差异产生误解",
         "advice": "主动表达需求，不要等对方猜" if fs4 < 60 else "保持现有节奏，别急着定义关系"},
        {"day": 180, "label": "Day180", "mood": f"稳定概率：{max(45, min(92, stability))}%"},
    ]


def _build_upper_match(profile: dict[str, Any], module_scores: dict[str, float]) -> dict[str, Any]:
    fs2 = module_scores.get("FS2", module_scores.get("MS3", 55))
    fs4 = module_scores.get("FS4", module_scores.get("MS2", 55))
    return {
        "title": "能激活你上限的人",
        "traits": {
            "成熟度": _stars_from_score(fs4 + 10),
            "情绪稳定": _stars_from_score(fs4),
            "表达能力": _stars_from_score(min(100, fs2 + 5)),
            "存在感": _stars_from_score(module_scores.get("FS1", module_scores.get("MS4", 55))),
            "现实能力": _stars_from_score(module_scores.get("FS3", module_scores.get("MS1", 55))),
        },
        "summary": str(profile.get("upper_match") or "能读懂你没说出口的话，不会因为你的慢热提前离场。"),
        "venues": ["熟人局", "长期工作关系", "兴趣圈子"],
    }


def _build_sweet_spot(profile: dict[str, Any], module_scores: dict[str, float]) -> dict[str, Any]:
    fs4 = module_scores.get("FS4", module_scores.get("MS2", 55))
    fs5 = module_scores.get("FS5", module_scores.get("MS5", 50))
    success = max(55, min(88, round((fs4 * 0.5 + (100 - fs5) * 0.5))))
    return {
        "title": "最高成功概率区",
        "profile": {
            "性格": "务实型" if fs4 >= 60 else "温和型",
            "恋爱节奏": "稳定推进",
            "消费观": "偏理性",
            "婚恋观": "长期主义",
        },
        "successRate": success,
        "reason": str(profile.get("sweet_spot") or "双方预期成本低，矛盾结构简单，关系容易进入稳定状态。"),
        "summary": str(profile.get("sweet_spot") or ""),
    }


def _build_lower_match(profile: dict[str, Any], module_scores: dict[str, float]) -> dict[str, Any]:
    fs5 = module_scores.get("FS5", module_scores.get("MS5", 50))
    risk_boost = max(0, fs5 - 40)
    return {
        "title": "最容易消耗你的人",
        "traits": {
            "情绪波动": _stars_from_score(min(100, 55 + risk_boost)),
            "刺激需求": _stars_from_score(min(100, 50 + risk_boost)),
            "边界感": max(1, 3 - _stars_from_score(fs5) // 2),
            "现实规划": max(1, 2 - _stars_from_score(module_scores.get("FS3", module_scores.get("MS1", 50))) // 3),
        },
        "summary": str(profile.get("lower_match") or "初期很容易上头，后期容易疲惫。"),
    }


def _build_secular_advice(position_name: str, module_scores: dict[str, float]) -> list[dict[str, str]]:
    axis_slow = position_name in {"被读懂之前的人", "越了解越值钱的人", "还没到时候的人"}
    return [
        {
            "title": "你的进入方式",
            "dont": "一上来聊价值观" if axis_slow else "过度包装自己",
            "do": "先创造轻松互动",
            "reason": "你的优势需要时间显现" if axis_slow else "真实感比完美人设更打动人",
        },
        {
            "title": "你的展示重点",
            "dont": "强调自己多懂事",
            "do": "多展示生活感",
            "reason": "别人更容易感知具体的生活状态",
        },
        {
            "title": "相亲局建议",
            "dont": "",
            "do": "第一次：聊天70% / 条件30%\n第二次：条件40% / 相处60%\n第三次：开始谈未来",
            "reason": "节奏比一次聊透更重要",
        },
        {
            "title": "提高成功率",
            "dont": "",
            "do": "照片增加生活场景 · 主动创造第二次见面 · 减少抽象表达",
            "reason": "可感知的细节比形容词更有效",
        },
    ]


def _build_ai_lens(module_scores: dict[str, float], gender: str) -> list[dict[str, str]]:
    fs2 = module_scores.get("FS2", module_scores.get("MS3", 55))
    fs1 = module_scores.get("FS1", module_scores.get("MS4", 55))
    fs5 = module_scores.get("FS5", module_scores.get("MS5", 50))
    codes = FEMALE_MODULE_CODES if gender == "female" else MALE_MODULE_CODES
    best = max(codes[:4], key=lambda c: module_scores.get(c, 0))
    best_label = {"FS2": "长期安全感", "MS3": "长期安全感", "FS1": "第一眼记忆点", "MS4": "社交门面"}.get(best, "稳定感")
    return [
        {
            "key": "weapon",
            "title": "隐藏武器",
            "tag": best_label,
            "body": f"{score_band_label(module_scores.get(best, 55))}——这是相处越久越明显的部分。",
        },
        {
            "key": "misread",
            "title": "容易被误解",
            "tag": "看起来偏冷" if fs1 < 60 else "看起来太随和",
            "body": "第一眼印象和长期价值之间存在落差，需要相处来校正。",
        },
        {
            "key": "miss",
            "title": "容易错过你",
            "tag": "高刺激偏好",
            "body": "追求即时反馈的人，往往在真正读懂你之前就离开了。" if fs2 >= 65 else "快节奏筛选者容易低估你的长期价值。",
        },
    ]


SOCIAL_QUOTES = [
    "看起来一般，熟了以后会越来越上头",
    "第一眼不算惊艳，但越相处越觉得离不开",
    "不属于一眼万年，但属于越了解越值钱",
    "慢热型，但一旦进入关系就很稳",
    "不是最会表现的，却是最让人想留下来的",
]


def _build_social_quotes(position_name: str) -> list[str]:
    base = list(SOCIAL_QUOTES)
    if position_name == "越了解越值钱的人":
        base.insert(0, "第一眼普通，第三个月开始上头")
    elif position_name == "一眼就懂的人":
        base.insert(0, "所见即所得，喜欢就来不喜欢就走")
    return base


def _build_market_coordinate(axis_x: float, axis_y: float, module_scores: dict[str, float]) -> dict[str, Any]:
    fs5 = module_scores.get("FS5", module_scores.get("MS5", 50))
    fs2 = module_scores.get("FS2", module_scores.get("MS3", 55))
    fs4 = module_scores.get("FS4", module_scores.get("MS2", 55))
    return {
        "axisX": axis_x,
        "axisY": axis_y,
        "horizontalLabel": "显示度",
        "verticalLabel": "现实支撑",
        "summary": {
            "firstImpression": _first_impression_label(axis_x),
            "longTerm": _long_term_label(axis_y),
            "retention": _retention_label(fs2, fs4),
            "riskLevel": _risk_band(fs5),
        },
        "insight": (
            "你不是靠瞬间惊艳获得优势，而是靠持续相处获得溢价。"
            if axis_x < 60 and axis_y >= 55
            else "你的优势在相处中比在第一眼中更明显。"
            if axis_x < axis_y
            else "你的牌面清晰，筛选效率高，留存取决于相处质量。"
        ),
    }


def _build_identity_assets(module_scores: dict[str, float], gender: str) -> list[dict[str, str]]:
    if gender == "female":
        return [
            {"label": "情感价值", "module": "FS2", "role": "核心竞争力"},
            {"label": "现实支撑", "module": "FS3", "role": "重要资产"},
            {"label": "风险净值", "module": "FS5", "role": "稳定型" if module_scores.get("FS5", 50) <= 45 else "需留意"},
        ]
    return [
        {"label": "情感供给", "module": "MS3", "role": "核心竞争力"},
        {"label": "现实底牌", "module": "MS1", "role": "重要资产"},
        {"label": "风险净值", "module": "MS5", "role": "稳定型" if module_scores.get("MS5", 50) <= 45 else "需留意"},
    ]


def _build_modules_display(module_scores: dict[str, float], scoring_formula: dict[str, Any]) -> list[dict[str, Any]]:
    modules_cfg = scoring_formula.get("modules") or {}
    items: list[dict[str, Any]] = []
    for code, cfg in modules_cfg.items():
        if not isinstance(cfg, dict):
            continue
        score = module_scores.get(code)
        if score is None:
            continue
        label = str(cfg.get("label") or code)
        if cfg.get("direction") == "reverse":
            summary = _risk_band(score)
        else:
            summary = score_band_label(score)
        items.append({"code": code, "label": label, "displaySummary": summary})
    return items


def _build_mate_result_payload(
    *,
    gender: str,
    module_scores: dict[str, float],
    axis_x: float,
    axis_y: float,
    position_name: str,
    quadrant: str,
    profile: dict[str, Any],
    scoring_formula: dict[str, Any],
    appearance_label: str | None = None,
) -> dict[str, Any]:
    tags = profile.get("tags") or []
    tagline = str(profile.get("tagline") or POSITION_SUBTITLES.get(position_name, ""))
    assets_raw = _build_identity_assets(module_scores, gender)
    assets = [
        {
            "label": item["label"],
            "summary": score_band_label(module_scores.get(item["module"], 50))
            if item["module"] not in ("FS5", "MS5")
            else item["role"],
            "role": item["role"],
        }
        for item in assets_raw
    ]
    if appearance_label:
        summary = appearance_label.split("：", 1)[-1]
        assets.insert(0, {"label": "外形资产", "summary": summary, "role": "观察型指标"})

    modules = _build_modules_display(module_scores, scoring_formula)
    display_summaries = {str(item["code"]): str(item["displaySummary"]) for item in modules if item.get("displaySummary")}

    payload = {
        "model": "MATE_V3",
        "productSet": "MATE",
        "gender": gender,
        "axisX": axis_x,
        "axisY": axis_y,
        "quadrant": quadrant,
        "positionType": {
            "name": position_name,
            "tags": tags,
            "tagline": tagline,
            "subtitle": POSITION_SUBTITLES.get(position_name, tagline),
            "marketRead": profile.get("market_read") or profile.get("marketRead") or "",
        },
        "identityCard": {
            "title": position_name,
            "tags": tags,
            "tagline": tagline,
            "subtitle": POSITION_SUBTITLES.get(position_name, ""),
            "assets": assets,
        },
        "marketCoordinate": _build_market_coordinate(axis_x, axis_y, module_scores),
        "matchmakerRecords": _build_matchmaker_records(position_name, module_scores, gender),
        "loveTimeline": _build_love_timeline(module_scores),
        "upperMatch": _build_upper_match(profile, module_scores),
        "sweetSpot": _build_sweet_spot(profile, module_scores),
        "lowerMatch": _build_lower_match(profile, module_scores),
        "secularAdvice": _build_secular_advice(position_name, module_scores),
        "aiLens": _build_ai_lens(module_scores, gender),
        "deepArchive": {
            "title": "还有1份档案未拆封",
            "items": [
                "为什么总吸引同一种人",
                "关系风险时间点",
                "你的择偶雷区",
                "AI一对一分析",
            ],
            "cta": "拆开完整档案",
        },
        "socialQuotes": _build_social_quotes(position_name),
        "matchmaker": {
            "upper_match": profile.get("upper_match") or "",
            "sweet_spot": profile.get("sweet_spot") or "",
            "lower_match": profile.get("lower_match") or "",
        },
        "modules": modules,
        "display_summaries": display_summaries,
        "insights": [
            {
                "kind": "strength",
                "title": "你的市场优势",
                "body": str(profile.get("market_read") or tagline),
            },
            {
                "kind": "growth",
                "title": "温柔提升点",
                "body": "把最值钱的部分变成更容易被看见的表达，不必改变内核。",
            },
            {
                "kind": "linkage",
                "title": "与 SELF 联动",
                "body": "完成 SELF 后，AI 会把依恋模式与择偶坐标合并解读。",
            },
        ],
        **{code: module_scores.get(code) for code in module_scores},
    }
    if appearance_label:
        payload["appearanceAsset"] = {"label": appearance_label}
    return payload


def summarize_mate_scores(
    rows: list[dict[str, Any]],
    answers: dict[str, dict[str, Any]],
    scoring_model: dict[str, Any] | None = None,
    *,
    gender: str = "female",
    profile_payload: dict[str, Any] | None = None,
    result_profiles: dict[str, Any] | None = None,
) -> dict[str, Any]:
    type_rules = (scoring_model or {}).get("type_rules") or {}
    scoring_formula = (scoring_model or {}).get("scoring_formula") or {}
    if not isinstance(scoring_formula, dict):
        scoring_formula = {}

    module_scores, _sub_scores, numeric_by_external, appearance_label = _aggregate_sub_and_module_scores(
        rows, answers, scoring_formula, gender=gender
    )
    axis_x, axis_y = _compute_axes(module_scores, scoring_formula)
    position_name, quadrant = _resolve_position_type(
        axis_x, axis_y, module_scores, type_rules, gender
    )

    profiles = result_profiles if result_profiles is not None else _load_result_profiles(gender)
    profile = dict(profiles.get(position_name) or {})
    if profile_payload:
        profile = {**profile, **profile_payload}

    result_payload = _build_mate_result_payload(
        gender=gender,
        module_scores=module_scores,
        axis_x=axis_x,
        axis_y=axis_y,
        position_name=position_name,
        quadrant=quadrant,
        profile=profile,
        scoring_formula=scoring_formula,
        appearance_label=appearance_label,
    )

    mate_index = round((axis_x + axis_y) / 2, 2)
    ai_report = (
        f"## 择偶坐标：{position_name}\n\n"
        f"{profile.get('tagline') or tagline_fallback(position_name)} "
        f"市场显示度与现实支撑力已映射到四象限 {quadrant}。"
    )

    return {
        "numeric_by_external_id": numeric_by_external,
        "dimension_scores": module_scores,
        "ros_index": mate_index,
        "rk_score": module_scores.get("FS5") or module_scores.get("MS5"),
        "archetype_code": position_name,
        "attachment_type": profile.get("tagline") or "",
        "result_payload": result_payload,
        "ai_report": ai_report,
        "position_type": position_name,
        "quadrant": quadrant,
        "axis_x": axis_x,
        "axis_y": axis_y,
    }


def tagline_fallback(position_name: str) -> str:
    return POSITION_SUBTITLES.get(position_name, "")
