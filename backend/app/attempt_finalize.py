"""Background finalize — enrich, AI attach, relation sessions, portrait."""

from __future__ import annotations

import os
import threading
import uuid
from typing import Any

from psycopg.types.json import Jsonb

from app.attempt_helpers import rebuild_portrait_background, persist_attempt_answers_for_attempt
from app.core_traits import attach_core_traits_to_payload
from app.db import get_conn
from app.mate_ai_content import attach_mate_ai_content_to_payload, enhance_mate_ai_for_attempt
from app.mate_router import (
    create_relation_session as create_mate_relation_session,
    link_partner_to_session as link_mate_partner_to_session,
)
from app.mate_router import attempt_snapshot as mate_attempt_snapshot
from app.mate_scoring import is_mate_suite

try:
    from app.ros_couple_ai_content import enhance_ros_couple_session_background
except ImportError:
    def enhance_ros_couple_session_background(_session_id: str) -> None:
        return None

from app.ros_ai_content import attach_ros_ai_content_to_payload, enhance_ros_ai_for_attempt
from app.ros_couple import attempt_snapshot as ros_attempt_snapshot
from app.ros_router import create_relation_session, link_partner_to_session, merge_and_store_couple_report
from app.ros_scoring import is_ros_suite
from app.self_ai_content import attach_self_ai_content_to_payload, enhance_self_ai_for_attempt


def _enhance_ai_after_finalize(conn: Any, attempt_id: str, suite_slug: str) -> None:
    if os.getenv("AI_PROVIDER", "mock").strip().lower() != "zhipu":
        return
    try:
        if is_ros_suite(suite_slug):
            updated = enhance_ros_ai_for_attempt(conn, attempt_id, use_ai=True, force=False)
        elif is_mate_suite(suite_slug):
            updated = enhance_mate_ai_for_attempt(conn, attempt_id, use_ai=True, force=False)
        else:
            updated = enhance_self_ai_for_attempt(conn, attempt_id, use_ai=True, force=False)
        if updated:
            conn.execute(
                "UPDATE public.test_attempts SET result_payload = %s WHERE id = %s",
                (Jsonb(updated), attempt_id),
            )
    except Exception:
        return


def _run_post_finalize_ai(attempt_id: str, suite_slug: str) -> None:
    try:
        with get_conn() as conn:
            _enhance_ai_after_finalize(conn, attempt_id, suite_slug)
            conn.commit()
    except Exception:
        return


def finalize_attempt_background(attempt_id: str, user_id: str) -> None:
    try:
        with get_conn() as conn:
            row = conn.execute(
                """
                SELECT
                  ta.id,
                  ta.user_id,
                  ta.test_id,
                  ta.status,
                  ta.answers,
                  ta.dimension_scores,
                  ta.archetype_gender,
                  ta.ros_index,
                  ta.result_payload,
                  ta.partner_relation_code,
                  ta.suite_id,
                  ts.slug AS suite_slug,
                  ts.gender::text AS suite_gender
                FROM public.test_attempts ta
                JOIN public.test_suites ts ON ts.id = ta.suite_id
                WHERE ta.id = %s AND ta.user_id = %s
                """,
                (attempt_id, user_id),
            ).fetchone()
            if not row or row.get("status") == "completed":
                return

            persist_attempt_answers_for_attempt(conn, attempt_id)

            suite_slug = str(row["suite_slug"] or row["test_id"] or "")
            gender = str(row.get("archetype_gender") or row.get("suite_gender") or "female")
            partner_code = (row.get("partner_relation_code") or "").strip().upper() or None
            result_payload = dict(row.get("result_payload") or {})
            dimension_scores = row.get("dimension_scores") or {}
            if not isinstance(dimension_scores, dict):
                dimension_scores = {}

            if is_mate_suite(suite_slug):
                scoring_row = conn.execute(
                    """
                    SELECT scoring_formula
                    FROM public.scoring_models
                    WHERE suite_id = %s AND is_active = true
                    ORDER BY updated_at DESC
                    LIMIT 1
                    """,
                    (row["suite_id"],),
                ).fetchone()
                scoring_formula = (scoring_row or {}).get("scoring_formula") or {}
                layers = result_payload.get("computedLayers") or {}
                module_scores = layers.get("feature_vector") or dimension_scores
                sub_scores = layers.get("sub_scores") or {}
                quadrant = str(result_payload.get("quadrant") or "Q0")

                from app.mate_engine import enrich_mate_payload_v4

                result_payload = enrich_mate_payload_v4(
                    result_payload,
                    module_scores={str(k): float(v) for k, v in module_scores.items()},
                    sub_scores={str(k): float(v) for k, v in sub_scores.items()},
                    scoring_formula=scoring_formula if isinstance(scoring_formula, dict) else {},
                    quadrant=quadrant,
                    precomputed=layers if isinstance(layers, dict) else None,
                )
                result_payload = attach_mate_ai_content_to_payload(
                    conn,
                    attempt_id,
                    result_payload,
                    {str(k): float(v) for k, v in module_scores.items()},
                    use_ai=False,
                    gender=gender,
                )
                scores = {
                    "dimension_scores": module_scores,
                    "ros_index": row.get("ros_index"),
                    "relation_code": result_payload.get("relationCode"),
                }
            elif is_ros_suite(suite_slug):
                result_payload = attach_ros_ai_content_to_payload(
                    conn,
                    attempt_id,
                    result_payload,
                    dimension_scores,
                    use_ai=False,
                    gender=gender,
                )
                scores = {
                    "dimension_scores": dimension_scores,
                    "ros_index": row.get("ros_index"),
                    "relation_code": result_payload.get("relationCode"),
                }
            else:
                archetype = None
                if result_payload.get("archetype_code"):
                    archetype = conn.execute(
                        """
                        SELECT gender::text AS gender, profile_payload
                        FROM public.result_archetypes
                        WHERE suite_id = %s AND archetype_code = %s AND is_active = true
                        LIMIT 1
                        """,
                        (row["suite_id"], result_payload.get("archetype_code")),
                    ).fetchone()
                if archetype and archetype.get("profile_payload"):
                    result_payload["archetype_profile"] = archetype["profile_payload"]
                result_payload = attach_core_traits_to_payload(
                    conn,
                    uuid.UUID(attempt_id),
                    result_payload,
                    dimension_scores,
                )
                result_payload = attach_self_ai_content_to_payload(
                    conn,
                    attempt_id,
                    result_payload,
                    dimension_scores,
                    use_ai=False,
                    gender=str(archetype["gender"] if archetype else gender),
                )
                scores = {"dimension_scores": dimension_scores, "ros_index": row.get("ros_index")}

            conn.execute(
                """
                UPDATE public.test_attempts
                SET result_payload = %s,
                    dimension_scores = %s,
                    ros_index = %s,
                    status = 'completed',
                    completed_at = now()
                WHERE id = %s
                """,
                (
                    Jsonb(result_payload),
                    Jsonb(scores.get("dimension_scores") or dimension_scores),
                    scores.get("ros_index") if is_ros_suite(suite_slug) or is_mate_suite(suite_slug) else row.get("ros_index"),
                    attempt_id,
                ),
            )

            if is_ros_suite(suite_slug):
                if partner_code:
                    linked = link_partner_to_session(
                        conn,
                        code=partner_code,
                        partner_attempt_id=uuid.UUID(attempt_id),
                        partner_user_id=user_id,
                    )
                    session_row = linked.get("session") if isinstance(linked, dict) else None
                    if session_row and session_row.get("id"):
                        try:
                            merge_and_store_couple_report(conn, session_row["id"])
                        except Exception:
                            pass
                else:
                    relation_code = result_payload.get("relationCode") or scores.get("relation_code")
                    create_relation_session(
                        conn,
                        code=str(relation_code),
                        initiator_attempt_id=uuid.UUID(attempt_id),
                        initiator_user_id=user_id,
                        initiator_snapshot=ros_attempt_snapshot(
                            {
                                "id": attempt_id,
                                "user_id": user_id,
                                "suite_slug": suite_slug,
                                "dimension_scores": scores.get("dimension_scores"),
                                "ros_index": scores.get("ros_index"),
                                "result_payload": result_payload,
                            }
                        ),
                    )
            elif is_mate_suite(suite_slug):
                if partner_code:
                    link_mate_partner_to_session(
                        conn,
                        code=partner_code,
                        partner_attempt_id=uuid.UUID(attempt_id),
                        partner_user_id=user_id,
                    )
                else:
                    relation_code = result_payload.get("relationCode") or scores.get("relation_code")
                    create_mate_relation_session(
                        conn,
                        code=str(relation_code),
                        initiator_attempt_id=uuid.UUID(attempt_id),
                        initiator_user_id=user_id,
                        initiator_snapshot=mate_attempt_snapshot(
                            {
                                "id": attempt_id,
                                "user_id": user_id,
                                "suite_slug": suite_slug,
                                "archetype_gender": gender,
                                "ros_index": scores.get("ros_index"),
                                "dimension_scores": scores.get("dimension_scores"),
                                "result_payload": result_payload,
                            }
                        ),
                    )

            if is_ros_suite(suite_slug) and partner_code:
                session_row = conn.execute(
                    "SELECT id FROM public.ros_relation_sessions WHERE code = %s",
                    (partner_code,),
                ).fetchone()
                if session_row and session_row.get("id"):
                    enhance_ros_couple_session_background(str(session_row["id"]))
            conn.commit()

            if os.getenv("AI_PROVIDER", "mock").strip().lower() == "zhipu":
                threading.Thread(
                    target=_run_post_finalize_ai,
                    args=(attempt_id, suite_slug),
                    daemon=True,
                ).start()
    except Exception:
        try:
            with get_conn() as conn:
                conn.execute(
                    """
                    UPDATE public.test_attempts
                    SET status = 'completed',
                        completed_at = COALESCE(completed_at, now())
                    WHERE id = %s AND user_id = %s AND status = 'in_progress'
                    """,
                    (attempt_id, user_id),
                )
                conn.commit()
        except Exception:
            return

    rebuild_portrait_background(user_id)
