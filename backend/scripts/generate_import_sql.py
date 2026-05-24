#!/usr/bin/env python3
"""
LoveCompass 数据导入 SQL 生成器。

设计原则：
1. 题目、选项、评分公式、结果画像全部来自外部 JSON 文件。
2. 脚本不硬编码任何题目内容，也不把业务模型写进代码。
3. 输出 PostgreSQL/Supabase 可执行 SQL，便于审查后再导入数据库。

用法：
  python3.11 scripts/generate_import_sql.py \
    --question-bank data/suite1_female.json \
    --question-bank data/suite1_male.json \
    --out data/001_import_question_banks.sql
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Dict, List, Tuple


PRODUCT_LAYERS: Dict[str, Tuple[str, str]] = {
    "SELF": ("SELF_ATTACHMENT", "自我关系模式"),
    "ROS": ("ROS_RELATIONSHIP", "关系画像"),
    "MATE": ("MATE_SELECTION", "择偶坐标"),
}


def sql_literal(value: Any) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value)
    return "'" + text.replace("'", "''") + "'"


def jsonb_literal(value: Any) -> str:
    return sql_literal(json.dumps(value if value is not None else {}, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"


def normalize_slug(value: str) -> str:
    return value.strip().lower().replace(" ", "_")


def gender_sql(value: str | None) -> str:
    v = (value or "neutral").strip().lower()
    if v not in {"female", "male", "neutral"}:
        v = "neutral"
    return sql_literal(v) + "::public.test_gender"


def resolve_product_set(source_id: str) -> str:
    raw = source_id.strip().lower()
    if "s02" in raw or "ros" in raw:
        return "ROS"
    if "s03" in raw or "mate" in raw:
        return "MATE"
    return "SELF"


def extract_scoring_dimensions(scoring_formula: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    if not scoring_formula:
        return {}
    if isinstance(scoring_formula.get("modules"), dict):
        return scoring_formula["modules"]
    if isinstance(scoring_formula.get("layers"), dict):
        return scoring_formula["layers"]
    skip_keys = {"axes", "overall", "resonance_levels"}
    return {
        code: conf
        for code, conf in scoring_formula.items()
        if code not in skip_keys and isinstance(conf, dict) and conf.get("label")
    }


def resolve_question_dimension(question: Dict[str, Any]) -> str:
    for key in ("dimension", "module", "layer"):
        value = question.get(key)
        if value:
            return str(value)
    return "PRE"


def question_payload(question: Dict[str, Any]) -> Dict[str, Any]:
    excluded = {
        "id",
        "order",
        "dimension",
        "module",
        "layer",
        "sub",
        "type",
        "weight",
        "direction",
        "text",
        "scoring",
    }
    payload = {k: v for k, v in question.items() if k not in excluded}
    payload["source_question"] = question
    return payload


def build_type_rules(data: Dict[str, Any]) -> Dict[str, Any]:
    rules = dict(data.get("type_rules") or {})
    for key in (
        "pre_questions",
        "stage_rules",
        "relationship_type_rules",
        "prescription_rules",
        "attachment_collision_map",
        "score_display_rules",
    ):
        if data.get(key):
            rules[key] = data[key]
    return rules


def emit_metric_dimensions_from_formula(
    scoring_formula: Dict[str, Any],
    product_set: str,
) -> List[str]:
    layer_code, layer_name = PRODUCT_LAYERS[product_set]
    statements: List[str] = []
    dimensions = extract_scoring_dimensions(scoring_formula)
    for idx, (code, conf) in enumerate(dimensions.items(), start=1):
        label = conf.get("label") or code
        config = {k: v for k, v in conf.items() if k != "weights"}
        statements.append(
            "INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)\n"
            f"VALUES ({sql_literal(code)}, {sql_literal(label)}, {sql_literal(layer_code)}, {sql_literal(layer_name)}, {idx}, {jsonb_literal(config)})\n"
            "ON CONFLICT (code) DO UPDATE SET\n"
            "  name = EXCLUDED.name,\n"
            "  layer_code = EXCLUDED.layer_code,\n"
            "  layer_name = EXCLUDED.layer_name,\n"
            "  display_order = EXCLUDED.display_order,\n"
            "  config = public.metric_dimensions.config || EXCLUDED.config,\n"
            "  updated_at = now();"
        )
    return statements


def emit_pre_question_dimension(product_set: str) -> str:
    layer_code, layer_name = PRODUCT_LAYERS[product_set]
    return (
        "INSERT INTO public.metric_dimensions (code, name, layer_code, layer_name, display_order, config)\n"
        f"VALUES ('PRE', '前置校准题', {sql_literal(layer_code)}, {sql_literal(layer_name)}, 0, "
        "'{\"direction\":\"neutral\",\"scored\":false}'::jsonb)\n"
        "ON CONFLICT (code) DO UPDATE SET\n"
        "  name = EXCLUDED.name,\n"
        "  layer_code = EXCLUDED.layer_code,\n"
        "  layer_name = EXCLUDED.layer_name,\n"
        "  config = public.metric_dimensions.config || EXCLUDED.config,\n"
        "  updated_at = now();"
    )


def emit_question_insert(
    slug: str,
    question: Dict[str, Any],
    display_order: int,
    *,
    dimension_code: str | None = None,
    direction: str = "neutral",
    weight: Any = 0,
) -> str:
    external_id = question.get("id")
    if not external_id:
        raise ValueError(f"题目缺少 id: {question}")
    dimension = dimension_code or resolve_question_dimension(question)
    return (
        "INSERT INTO public.test_questions (suite_id, external_question_id, display_order, dimension_code, question_type, weight, direction, question_text, question_payload, scoring_payload, is_active)\n"
        f"SELECT s.id, {sql_literal(external_id)}, {display_order}, {sql_literal(dimension)}, "
        f"{sql_literal(question.get('type'))}, {sql_literal(question.get('weight', weight))}, "
        f"{sql_literal(question.get('direction', direction))}, "
        f"{sql_literal(question.get('text') or '')}, {jsonb_literal(question_payload(question))}, "
        f"{jsonb_literal(question.get('scoring') or {})}, true\n"
        f"FROM public.test_suites s WHERE s.slug = {sql_literal(slug)}\n"
        "ON CONFLICT (suite_id, external_question_id) DO UPDATE SET\n"
        "  display_order = EXCLUDED.display_order,\n"
        "  dimension_code = EXCLUDED.dimension_code,\n"
        "  question_type = EXCLUDED.question_type,\n"
        "  weight = EXCLUDED.weight,\n"
        "  direction = EXCLUDED.direction,\n"
        "  question_text = EXCLUDED.question_text,\n"
        "  question_payload = EXCLUDED.question_payload,\n"
        "  scoring_payload = EXCLUDED.scoring_payload,\n"
        "  is_active = EXCLUDED.is_active,\n"
        "  updated_at = now();"
    )


def emit_suite(data: Dict[str, Any]) -> List[str]:
    suite = data.get("suite") or {}
    source_id = suite.get("id") or suite.get("slug") or suite.get("name")
    if not source_id:
        raise ValueError("suite.id 或 suite.name 缺失，无法生成唯一 slug")
    slug = normalize_slug(str(source_id))
    name = suite.get("name") or slug
    version = str(suite.get("version") or "v1")
    product_set = resolve_product_set(str(source_id))
    total_questions = int(suite.get("total_questions") or len(data.get("questions") or []))
    estimated_minutes = suite.get("estimated_minutes")

    statements: List[str] = []
    statements.extend(emit_metric_dimensions_from_formula(data.get("scoring_formula") or {}, product_set))

    pre_questions = data.get("pre_questions") or []
    if pre_questions:
        statements.append(emit_pre_question_dimension(product_set))

    statements.append(
        "INSERT INTO public.test_suites (slug, name, version, gender, total_questions, estimated_minutes, is_free, is_active, source_suite_config)\n"
        f"VALUES ({sql_literal(slug)}, {sql_literal(name)}, {sql_literal(version)}, {gender_sql(suite.get('gender'))}, "
        f"{total_questions}, {sql_literal(estimated_minutes)}, {sql_literal(bool(suite.get('is_free', False)))}, true, {jsonb_literal(suite)})\n"
        "ON CONFLICT (slug) DO UPDATE SET\n"
        "  name = EXCLUDED.name,\n"
        "  version = EXCLUDED.version,\n"
        "  gender = EXCLUDED.gender,\n"
        "  total_questions = EXCLUDED.total_questions,\n"
        "  estimated_minutes = EXCLUDED.estimated_minutes,\n"
        "  is_free = EXCLUDED.is_free,\n"
        "  is_active = EXCLUDED.is_active,\n"
        "  source_suite_config = EXCLUDED.source_suite_config,\n"
        "  updated_at = now();"
    )

    ros_config = {
        "source": "ROS_V3_whitepaper_optimized.docx",
        "storage_strategy": "whitepaper_as_business_reference; executable formulas and rules are stored in scoring_formula/type_rules JSONB",
        "product_set": product_set,
    }
    statements.append(
        "INSERT INTO public.scoring_models (suite_id, model_key, model_version, scoring_formula, type_rules, ros_config, is_active)\n"
        f"SELECT id, 'ROS_V3', {sql_literal(version)}, {jsonb_literal(data.get('scoring_formula') or {})}, "
        f"{jsonb_literal(build_type_rules(data))}, {jsonb_literal(ros_config)}, true\n"
        f"FROM public.test_suites WHERE slug = {sql_literal(slug)}\n"
        "ON CONFLICT (suite_id, model_key, model_version) DO UPDATE SET\n"
        "  scoring_formula = EXCLUDED.scoring_formula,\n"
        "  type_rules = EXCLUDED.type_rules,\n"
        "  ros_config = EXCLUDED.ros_config,\n"
        "  is_active = EXCLUDED.is_active,\n"
        "  updated_at = now();"
    )

    result_profiles = data.get("result_profiles") or data.get("relationship_type_rules") or {}
    for idx, (name_key, profile) in enumerate(result_profiles.items(), start=1):
        statements.append(
            "INSERT INTO public.result_archetypes (suite_id, archetype_code, archetype_name, gender, profile_payload, display_order, is_active)\n"
            f"SELECT id, {sql_literal(name_key)}, {sql_literal(name_key)}, {gender_sql(suite.get('gender'))}, {jsonb_literal(profile)}, {idx}, true\n"
            f"FROM public.test_suites WHERE slug = {sql_literal(slug)}\n"
            "ON CONFLICT (suite_id, archetype_code) DO UPDATE SET\n"
            "  archetype_name = EXCLUDED.archetype_name,\n"
            "  gender = EXCLUDED.gender,\n"
            "  profile_payload = EXCLUDED.profile_payload,\n"
            "  display_order = EXCLUDED.display_order,\n"
            "  is_active = EXCLUDED.is_active,\n"
            "  updated_at = now();"
        )

    pre_offset = len(pre_questions)
    for idx, question in enumerate(pre_questions, start=1):
        statements.append(
            emit_question_insert(
                slug,
                question,
                idx,
                dimension_code="PRE",
                direction="neutral",
                weight=0,
            )
        )

    for question in data.get("questions") or []:
        display_order = pre_offset + int(question.get("order") or 0)
        statements.append(emit_question_insert(slug, question, display_order))

    return statements


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate SQL import file from LoveCompass question-bank JSON files.")
    parser.add_argument("--question-bank", action="append", required=True, help="Path to question-bank JSON file. Can be repeated.")
    parser.add_argument("--out", required=True, help="Output SQL file path.")
    args = parser.parse_args()

    all_statements: List[str] = [
        "-- LoveCompass generated data import SQL",
        "-- 此文件由 scripts/generate_import_sql.py 根据外部 JSON 数据生成；题目内容没有硬编码在脚本中。",
        "BEGIN;",
    ]

    for path_str in args.question_bank:
        path = Path(path_str)
        data = json.loads(path.read_text(encoding="utf-8"))
        all_statements.append(f"\n-- Source: {path.name}")
        all_statements.extend(emit_suite(data))

    all_statements.append("COMMIT;")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n\n".join(all_statements) + "\n", encoding="utf-8")
    print(str(out))


if __name__ == "__main__":
    main()
