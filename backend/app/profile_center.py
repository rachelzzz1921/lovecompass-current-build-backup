from __future__ import annotations

from typing import Any

from psycopg.types.json import Jsonb

PRODUCT_SETS: tuple[str, ...] = ("SELF", "ROS", "MATE")

PRODUCT_META: dict[str, dict[str, Any]] = {
    "SELF": {
        "id": "self",
        "code": "SET · 01 / SELF",
        "title": "自我关系模式",
        "subtitle": "你是谁，在亲密关系里",
        "weight": 40,
    },
    "ROS": {
        "id": "ros",
        "code": "SET · 02 / ROS",
        "title": "具体恋情评估",
        "subtitle": "你们之间，到底怎么样",
        "weight": 35,
    },
    "MATE": {
        "id": "mate",
        "code": "SET · 03 / MATE",
        "title": "择偶标准定位",
        "subtitle": "你在找什么，你的市场位置在哪",
        "weight": 25,
    },
}


def resolve_product_set(
    suite_slug: str | None = None,
    suite_name: str | None = None,
    test_id: str | None = None,
) -> str:
    raw = f"{suite_slug or ''} {suite_name or ''} {test_id or ''}".lower()
    if "ros" in raw or "s02" in raw:
        return "ROS"
    if "mate" in raw or "s03" in raw:
        return "MATE"
    return "SELF"


def _profile_from_payload(result_payload: dict[str, Any] | None) -> dict[str, Any]:
    payload = result_payload if isinstance(result_payload, dict) else {}
    archetype_profile = payload.get("archetype_profile") or {}
    if not isinstance(archetype_profile, dict):
        archetype_profile = {}
    return {
        "archetypeCode": payload.get("archetype_code") or archetype_profile.get("archetype_code"),
        "attachmentType": payload.get("attachment_type") or archetype_profile.get("attachment_type"),
        "tagline": archetype_profile.get("tagline"),
        "description": archetype_profile.get("description"),
        "matchingLogic": archetype_profile.get("matching_logic"),
        "coreTraits": payload.get("core_traits") if isinstance(payload.get("core_traits"), list) else [],
        "dimensions": payload.get("dimensions") if isinstance(payload.get("dimensions"), list) else [],
    }


def summarize_attempt(row: dict[str, Any]) -> dict[str, Any]:
    result_payload = row.get("result_payload") or {}
    if not isinstance(result_payload, dict):
        result_payload = {}
    profile_bits = _profile_from_payload(result_payload)
    product_set = resolve_product_set(row.get("suite_slug"), row.get("suite_name"), row.get("test_id"))
    ros_index = row.get("ros_index")
    try:
        index_value = round(float(ros_index)) if ros_index is not None else None
    except (TypeError, ValueError):
        index_value = None

    summary = {
        "attemptId": str(row.get("id") or ""),
        "productSet": product_set,
        "suiteSlug": row.get("suite_slug"),
        "suiteName": row.get("suite_name"),
        "suiteGender": row.get("suite_gender"),
        "status": row.get("status"),
        "archetypeCode": profile_bits["archetypeCode"] or row.get("archetype_code"),
        "attachmentType": profile_bits["attachmentType"],
        "tagline": profile_bits["tagline"],
        "description": profile_bits["description"],
        "index": index_value,
        "rkScore": row.get("rk_score"),
        "dimensionScores": row.get("dimension_scores") if isinstance(row.get("dimension_scores"), dict) else {},
        "coreTraits": profile_bits["coreTraits"][:3],
        "dimensions": profile_bits["dimensions"],
        "completedAt": str(row.get("completed_at") or row.get("created_at") or ""),
        "hasAiReport": bool(row.get("ai_report")),
    }

    if product_set == "ROS" and isinstance(result_payload, dict):
        rel_type = result_payload.get("relationshipType") or {}
        stage = result_payload.get("relationshipStage") or {}
        resonance = result_payload.get("resonance") or {}
        summary.update(
            {
                "relationshipType": rel_type.get("name"),
                "relationshipTypeKey": rel_type.get("key"),
                "relationshipStage": stage.get("name"),
                "relationshipStageId": stage.get("id"),
                "relationCode": result_payload.get("relationCode") or row.get("relation_code"),
                "resonanceTier": resonance.get("tier"),
                "tagline": rel_type.get("one_liner") or summary.get("tagline"),
                "description": rel_type.get("description") or summary.get("description"),
            }
        )

    return summary


def compute_completeness(latest_by_set: dict[str, dict[str, Any] | None]) -> dict[str, Any]:
    earned = 0
    breakdown: list[dict[str, Any]] = []
    for product_set in PRODUCT_SETS:
        meta = PRODUCT_META[product_set]
        weight = int(meta["weight"])
        latest = latest_by_set.get(product_set)
        if latest:
            earned += weight
            status = "completed"
        else:
            status = "locked"
        breakdown.append(
            {
                "productSet": product_set,
                "productId": meta["id"],
                "code": meta["code"],
                "title": meta["title"],
                "weight": weight,
                "status": status,
                "attemptId": latest.get("attemptId") if latest else None,
                "completedAt": latest.get("completedAt") if latest else None,
            }
        )
    return {
        "percent": earned,
        "label": _completeness_label(earned),
        "breakdown": breakdown,
    }


def _completeness_label(percent: int) -> str:
    if percent >= 100:
        return "终极画像已解锁"
    if percent >= 75:
        return "画像接近完整"
    if percent >= 40:
        return "基础底片已建立"
    return "等待第一套测试"


def fetch_user_profile_row(conn: Any, user_id: str) -> dict[str, Any] | None:
    row = conn.execute(
        """
        SELECT id, email, display_name, avatar_url, portrait_cache, updated_at
        FROM public.profiles
        WHERE id = %s
        """,
        (user_id,),
    ).fetchone()
    return dict(row) if row else None


def fetch_completed_attempts(conn: Any, user_id: str, limit: int = 50) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT
          ta.id,
          ta.test_id,
          ta.status,
          ta.archetype_code,
          ta.archetype_gender,
          ta.ros_index,
          ta.rk_score,
          ta.dimension_scores,
          ta.result_payload,
          ta.ai_report,
          ta.created_at,
          ta.completed_at,
          ts.slug AS suite_slug,
          ts.name AS suite_name,
          ts.gender::text AS suite_gender
        FROM public.test_attempts ta
        LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
        WHERE ta.user_id = %s AND ta.status = 'completed'
        ORDER BY COALESCE(ta.completed_at, ta.created_at) DESC
        LIMIT %s
        """,
        (user_id, limit),
    ).fetchall()
    return [dict(row) for row in rows]


def fetch_chat_stats(conn: Any, user_id: str) -> dict[str, Any]:
    row = conn.execute(
        """
        SELECT
          COUNT(*)::int AS session_count,
          MAX(updated_at) AS last_active_at,
          (
            SELECT attempt_id::text
            FROM public.chat_sessions
            WHERE user_id = %s AND attempt_id IS NOT NULL
            ORDER BY updated_at DESC
            LIMIT 1
          ) AS bound_attempt_id
        FROM public.chat_sessions
        WHERE user_id = %s
        """,
        (user_id, user_id),
    ).fetchone()
    if not row:
        return {"sessionCount": 0, "lastActiveAt": None, "boundAttemptId": None}
    item = dict(row)
    return {
        "sessionCount": int(item.get("session_count") or 0),
        "lastActiveAt": str(item.get("last_active_at") or "") or None,
        "boundAttemptId": item.get("bound_attempt_id"),
    }


def build_portrait(conn: Any, user_id: str) -> dict[str, Any]:
    profile_row = fetch_user_profile_row(conn, user_id)
    attempts = fetch_completed_attempts(conn, user_id)
    summaries = [summarize_attempt(row) for row in attempts]

    latest_by_set: dict[str, dict[str, Any] | None] = {key: None for key in PRODUCT_SETS}
    history_by_set: dict[str, list[dict[str, Any]]] = {key: [] for key in PRODUCT_SETS}
    for summary in summaries:
        product_set = summary["productSet"]
        history_by_set.setdefault(product_set, []).append(summary)
        if latest_by_set.get(product_set) is None:
            latest_by_set[product_set] = summary

    self_latest = latest_by_set.get("SELF")
    completeness = compute_completeness(latest_by_set)
    chat = fetch_chat_stats(conn, user_id)

    primary_attempt = self_latest or next((s for s in summaries if s), None)
    products = []
    for product_set in PRODUCT_SETS:
        meta = PRODUCT_META[product_set]
        latest = latest_by_set.get(product_set)
        history = history_by_set.get(product_set) or []
        products.append(
            {
                "id": meta["id"],
                "productSet": product_set,
                "code": meta["code"],
                "title": meta["title"],
                "subtitle": meta["subtitle"],
                "status": "completed" if latest else "locked",
                "attemptCount": len(history),
                "latest": latest,
                "history": history[:5],
            }
        )

    portrait = {
        "user": {
            "id": user_id,
            "email": profile_row.get("email") if profile_row else None,
            "displayName": profile_row.get("display_name") if profile_row else None,
            "avatarUrl": profile_row.get("avatar_url") if profile_row else None,
        },
        "completeness": completeness,
        "primary": {
            "attemptId": primary_attempt.get("attemptId") if primary_attempt else None,
            "productSet": primary_attempt.get("productSet") if primary_attempt else None,
            "archetypeCode": primary_attempt.get("archetypeCode") if primary_attempt else None,
            "attachmentType": primary_attempt.get("attachmentType") if primary_attempt else None,
            "tagline": primary_attempt.get("tagline") if primary_attempt else None,
            "description": primary_attempt.get("description") if primary_attempt else None,
            "index": primary_attempt.get("index") if primary_attempt else None,
            "suiteName": primary_attempt.get("suiteName") if primary_attempt else None,
            "completedAt": primary_attempt.get("completedAt") if primary_attempt else None,
        },
        "selfProfile": {
            "attemptId": self_latest.get("attemptId") if self_latest else None,
            "archetypeCode": self_latest.get("archetypeCode") if self_latest else None,
            "attachmentType": self_latest.get("attachmentType") if self_latest else None,
            "tagline": self_latest.get("tagline") if self_latest else None,
            "index": self_latest.get("index") if self_latest else None,
            "dimensionScores": self_latest.get("dimensionScores") if self_latest else {},
            "dimensions": self_latest.get("dimensions") if self_latest else [],
            "coreTraits": self_latest.get("coreTraits") if self_latest else [],
        },
        "products": products,
        "timeline": summaries,
        "stats": {
            "totalAttempts": len(summaries),
            "chatSessions": chat["sessionCount"],
            "lastChatAt": chat["lastActiveAt"],
            "boundAttemptId": chat["boundAttemptId"],
        },
        "updatedAt": str(profile_row.get("updated_at") or "") if profile_row else None,
    }
    return portrait


def cache_portrait(conn: Any, user_id: str, portrait: dict[str, Any]) -> None:
    conn.execute(
        """
        UPDATE public.profiles
        SET portrait_cache = %s, updated_at = now()
        WHERE id = %s
        """,
        (Jsonb(portrait), user_id),
    )


def rebuild_and_cache_portrait(conn: Any, user_id: str) -> dict[str, Any]:
    portrait = build_portrait(conn, user_id)
    try:
        cache_portrait(conn, user_id, portrait)
    except Exception:
        # portrait_cache column may not exist on older deployments; portrait still returns live data.
        pass
    return portrait
