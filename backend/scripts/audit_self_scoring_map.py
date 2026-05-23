from __future__ import annotations

import os
import sys
from collections import defaultdict
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import psycopg
from dotenv import load_dotenv

from app.db import normalize_database_url

load_dotenv()

FORMULA_INCLUDED_FEMALE = {
    "F01", "F02", "F03", "F04", "F05", "F06",
    "F07", "F08", "F09", "F10", "F11", "F12", "F13", "F14", "F15", "F16",
    "F17", "F18", "F19", "F20", "F21", "F22", "F23", "F24",
    "F25", "F26", "F27", "F29", "F30", "F31", "F32",
    "F33", "F34", "F35", "F36", "F37", "F38", "F39", "F40", "F41",
    "F43", "F44", "F45", "F47", "F48", "F49",
}

EXPECTED_DENOMS_FEMALE = {
    "SA1": Decimal("7.1"),
    "SA2": Decimal("13.8"),
    "SA3": Decimal("10.1"),
    "SA4": Decimal("9.9"),
    "SA5": Decimal("12.3"),
    "SA6": Decimal("8.5"),
}


def short_external_id(external_id: str) -> str:
    parts = external_id.split("-")
    if len(parts) >= 3:
        return parts[-1]
    return external_id


def main() -> None:
    conn = psycopg.connect(normalize_database_url(os.environ["DATABASE_URL"]))
    with conn, conn.cursor() as cur:
        cur.execute(
            """
            SELECT ts.slug, tq.external_question_id, tq.display_order, tq.dimension_code,
                   tq.question_type, tq.weight, tq.direction, tq.scoring_payload
            FROM test_questions tq
            JOIN test_suites ts ON ts.id = tq.suite_id
            WHERE ts.slug IN ('s01_self_female', 's01_self_male')
            ORDER BY ts.slug, tq.display_order
            """
        )
        rows = cur.fetchall()

    by_suite: dict[str, list[tuple]] = defaultdict(list)
    for row in rows:
        by_suite[row[0]].append(row)

    for suite, items in by_suite.items():
        print("\nSUITE", suite, "total", len(items))
        sums: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
        included_sums: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
        excluded = []
        for _, ext, order, dim, qtype, weight, direction, scoring in items:
            w = Decimal(str(weight))
            sums[dim] += w
            short = short_external_id(ext)
            include = suite == "s01_self_male" or short in FORMULA_INCLUDED_FEMALE
            if include:
                included_sums[dim] += w
            else:
                excluded.append((order, ext, dim, qtype, str(w), direction, scoring))
            print(f"{order:02d} {ext:12s} {short:4s} {dim} {qtype:10s} weight={w} dir={direction} include={include}")
        print("DIM_WEIGHT_SUMS", dict(sums))
        print("INCLUDED_WEIGHT_SUMS", dict(included_sums))
        if suite == "s01_self_female":
            print("EXPECTED_DENOMS", EXPECTED_DENOMS_FEMALE)
            print("EXCLUDED", excluded)


if __name__ == "__main__":
    main()
