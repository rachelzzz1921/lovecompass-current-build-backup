#!/usr/bin/env python3
"""
LoveCompass 兑换码导入 SQL 生成器。

兑换码来自 CSV 运营表格，不写死在业务代码中。建议流程：
1. 复制 data/redemption_codes_template.csv 为正式 CSV。
2. 在表格中填写 code、suite_slug、kind、max_uses、expires_at。
3. 用本脚本生成 SQL，审查后导入数据库。

用法：
  python3.11 scripts/generate_redemption_code_sql.py \
    --csv data/redemption_codes.csv \
    --out data/002_import_redemption_codes.sql
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any, Dict, List


def sql_literal(value: Any) -> str:
    if value is None:
        return "NULL"
    text = str(value).strip()
    if text == "":
        return "NULL"
    return "'" + text.replace("'", "''") + "'"


def sql_bool(value: str | None) -> str:
    return "true" if str(value or "").strip().lower() in {"true", "1", "yes", "y", "是", "启用"} else "false"


def sql_int(value: str | None, default: int) -> str:
    v = str(value or "").strip()
    return str(int(v)) if v else str(default)


def normalize_kind(value: str | None) -> str:
    v = str(value or "single_use").strip()
    if v not in {"common", "single_use", "gift", "admin_grant"}:
        raise ValueError(f"Unsupported code kind: {v}")
    return v


def emit_row(row: Dict[str, str]) -> str:
    suite_slug = (row.get("suite_slug") or "").strip()
    code = (row.get("code") or "").strip()
    if not suite_slug or not code or code.startswith("在这里填"):
        raise ValueError(f"CSV 行缺少 suite_slug/code，或仍是模板占位符: {row}")

    kind = normalize_kind(row.get("kind"))
    default_max_uses = 999999 if kind == "common" else 1
    max_uses = sql_int(row.get("max_uses"), default_max_uses)
    expires_at = sql_literal(row.get("expires_at"))
    is_active = sql_bool(row.get("is_active"))
    batch_name_raw = (row.get("batch_name") or "默认批次").strip()
    batch_name = sql_literal(batch_name_raw)
    note = (row.get("note") or "").strip()
    metadata = sql_literal(json.dumps({"note": note}, ensure_ascii=False, separators=(",", ":"))) + "::jsonb"

    return (
        "WITH target_suite AS (\n"
        f"  SELECT id FROM public.test_suites WHERE slug = {sql_literal(suite_slug)}\n"
        "), upsert_batch AS (\n"
        "  INSERT INTO public.redemption_batches (name, suite_id, code_kind, is_active, expires_at, max_uses_per_code, max_uses_per_user_per_suite, metadata)\n"
        f"  SELECT {batch_name}, id, {sql_literal(kind)}::public.redemption_code_kind, true, {expires_at}, {max_uses}, 1, {metadata}\n"
        "  FROM target_suite\n"
        "  ON CONFLICT DO NOTHING\n"
        "  RETURNING id\n"
        "), target_batch AS (\n"
        "  SELECT id FROM upsert_batch\n"
        "  UNION ALL\n"
        "  SELECT rb.id FROM public.redemption_batches rb JOIN target_suite ts ON rb.suite_id = ts.id\n"
        f"  WHERE rb.name = {batch_name} AND rb.code_kind = {sql_literal(kind)}::public.redemption_code_kind\n"
        "  ORDER BY id LIMIT 1\n"
        ")\n"
        "INSERT INTO public.redemption_codes (batch_id, suite_id, code, code_kind, max_uses, expires_at, is_active, metadata)\n"
        f"SELECT tb.id, ts.id, {sql_literal(code)}, {sql_literal(kind)}::public.redemption_code_kind, {max_uses}, {expires_at}, {is_active}, {metadata}\n"
        "FROM target_suite ts CROSS JOIN target_batch tb\n"
        "ON CONFLICT (code) DO UPDATE SET\n"
        "  batch_id = EXCLUDED.batch_id,\n"
        "  suite_id = EXCLUDED.suite_id,\n"
        "  code_kind = EXCLUDED.code_kind,\n"
        "  max_uses = EXCLUDED.max_uses,\n"
        "  expires_at = EXCLUDED.expires_at,\n"
        "  is_active = EXCLUDED.is_active,\n"
        "  metadata = EXCLUDED.metadata,\n"
        "  updated_at = now();"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate redemption-code import SQL from CSV.")
    parser.add_argument("--csv", required=True, help="Input CSV path.")
    parser.add_argument("--out", required=True, help="Output SQL path.")
    args = parser.parse_args()

    source = Path(args.csv)
    rows = list(csv.DictReader(source.read_text(encoding="utf-8-sig").splitlines()))
    statements: List[str] = [
        "-- LoveCompass generated redemption-code import SQL",
        "-- 此文件由 scripts/generate_redemption_code_sql.py 根据外部 CSV 生成；兑换码没有硬编码在业务代码中。",
        "BEGIN;",
    ]
    for row in rows:
        statements.append(emit_row(row))
    statements.append("COMMIT;")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n\n".join(statements) + "\n", encoding="utf-8")
    print(str(out))


if __name__ == "__main__":
    main()
