from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv
import psycopg

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
url = os.environ.get("DIRECT_URL") or os.environ.get("DATABASE_URL")
if not url:
    raise SystemExit("missing database url")

CORE_TABLES = [
    "profiles",
    "test_suites",
    "metric_dimensions",
    "test_questions",
    "scoring_models",
    "result_archetypes",
    "redemption_batches",
    "redemption_codes",
    "redemption_events",
    "test_attempts",
    "test_attempt_answers",
    "ai_result_reports",
    "chat_analysts",
    "chat_sessions",
    "chat_messages",
]

with psycopg.connect(url) as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            select table_name
            from information_schema.tables
            where table_schema='public'
            order by table_name
            """
        )
        tables = [row[0] for row in cur.fetchall()]
        print("PUBLIC_TABLES")
        for table in tables:
            print(f"- {table}")

        print("\nCORE_COUNTS")
        for table in CORE_TABLES:
            if table not in tables:
                print(f"{table}: MISSING")
                continue
            cur.execute(f"select count(*) from public.{table}")
            print(f"{table}: {cur.fetchone()[0]}")

        if "test_suites" in tables:
            print("\nTEST_SUITES")
            cur.execute(
                """
                select column_name
                from information_schema.columns
                where table_schema='public' and table_name='test_suites'
                order by ordinal_position
                """
            )
            suite_columns = [row[0] for row in cur.fetchall()]
            preferred = [
                "slug",
                "name",
                "gender",
                "version",
                "is_active",
                "estimated_minutes",
                "created_at",
            ]
            selected = [col for col in preferred if col in suite_columns]
            cur.execute(
                f"select {', '.join(selected)} from public.test_suites order by slug"
            )
            print(" | ".join(selected))
            for row in cur.fetchall():
                print(" | ".join(str(v) for v in row))

        if "test_questions" in tables:
            print("\nQUESTION_TYPES_BY_SUITE")
            cur.execute(
                """
                select s.slug, q.question_type, count(*)
                from public.test_questions q
                join public.test_suites s on s.id = q.suite_id
                group by s.slug, q.question_type
                order by s.slug, q.question_type
                """
            )
            for row in cur.fetchall():
                print(" | ".join(str(v) for v in row))

        if "redemption_codes" in tables:
            print("\nREDEMPTION_CODES_SAMPLE")
            cur.execute(
                """
                select column_name
                from information_schema.columns
                where table_schema='public' and table_name='redemption_codes'
                order by ordinal_position
                """
            )
            code_columns = [row[0] for row in cur.fetchall()]
            preferred = ["code", "kind", "status", "max_uses", "used_count", "suite_id", "created_at"]
            selected = [col for col in preferred if col in code_columns]
            suite_select = "ts.slug as suite_slug" if "suite_id" in code_columns else "null as suite_slug"
            selected_without_suite_id = [col for col in selected if col != "suite_id"]
            cur.execute(
                f"""
                select {', '.join('rc.' + col for col in selected_without_suite_id)}, {suite_select}
                from public.redemption_codes rc
                left join public.test_suites ts on ts.id = rc.suite_id
                order by rc.created_at desc nulls last
                limit 10
                """
            )
            print(" | ".join(selected_without_suite_id + ["suite_slug"]))
            for row in cur.fetchall():
                print(" | ".join(str(v) for v in row))
