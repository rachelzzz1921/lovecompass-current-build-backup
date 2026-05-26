from __future__ import annotations

from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parents[1] / ".env")
except ImportError:
    pass

import os
import uuid
from decimal import Decimal
import json
from typing import Annotated, Any
from collections.abc import Iterator

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from psycopg.types.json import Jsonb
from app.auth import auth_version, probe_jwks, probe_jwt_token, resolve_user_id, _supabase_url
from app.db import get_conn
from app.question_adapter import adapt_question
from app.scoring import summarize_scores
from app.ai_adapter import get_ai_adapter
from app.chat_context import (
    build_chat_messages,
    build_chat_profile_bundle,
    build_profile_sync_acknowledgment,
    get_or_create_session,
    load_chat_session_messages,
    load_recent_messages,
    resolve_analyst_row,
    resolve_attempt_or_latest,
    save_message,
    summarize_context,
)
from app.chat_injection import ChatInjectionState, guard_chat_output


def _injection_state_from_meta(meta: dict[str, Any] | None) -> ChatInjectionState | None:
    if not meta:
        return None
    return ChatInjectionState(
        has_portrait_layer=bool(meta.get("hasPortraitLayer")),
        has_profile_block=bool(meta.get("hasProfileBlock")),
        has_completed_tests=bool(meta.get("hasCompletedTests")),
        bound_product_set=meta.get("boundProductSet"),
    )
from app.chat_prompt_layers import assess_crisis, build_crisis_response, triage_counselor
from app.admin import router as admin_router
from app.core_traits import attach_core_traits_to_payload
from app.self_ai_content import attach_self_ai_content_to_payload, enhance_self_ai_background, enhance_self_ai_for_attempt
from app.ros_ai_content import (
    attach_ros_ai_content_to_payload,
    enhance_ros_ai_background,
    enhance_ros_ai_for_attempt,
    ros_ai_content_ready,
)
from app.mate_ai_content import attach_mate_ai_content_to_payload, enhance_mate_ai_for_attempt
from app.profile_center import rebuild_and_cache_portrait
from app.attempt_finalize import finalize_attempt_background
from app.report_utils import looks_like_placeholder_report
from app.semantic_translation import guard_ai_output, sanitize_user_facing_payload, FORBIDDEN_RULES_MARKDOWN
from app.ros_router import router as ros_router
from app.ros_scoring import is_ros_suite, summarize_ros_scores
from app.mate_router import router as mate_router
from app.universal_redemption import (
    ensure_shadow_redemption_code,
    is_universal_code,
    resolve_suite_slug as resolve_universal_suite_slug,
)
from app.mate_scoring import is_mate_suite, load_mate_result_profiles, summarize_mate_scores
from app.suite_tier import resolve_redemption_target_slug, suites_redemption_compatible

def is_lite_suite(suite_slug: str | None) -> bool:
    return "_lite" in (suite_slug or "").lower()


def is_self_suite(suite_slug: str | None) -> bool:
    raw = (suite_slug or "").lower()
    return "self" in raw or "s01" in raw


def self_lite_is_free(suite_slug: str) -> bool:
    return is_self_suite(suite_slug) and is_lite_suite(suite_slug)
from app.suite_context import build_suite_report_prompt, fallback_suite_report


def _cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def _enhance_mate_ai_background(attempt_id: str) -> None:
    if os.getenv("AI_PROVIDER", "mock").strip().lower() != "zhipu":
        return
    try:
        with get_conn() as conn:
            updated = enhance_mate_ai_for_attempt(conn, attempt_id, use_ai=True, force=False)
            if not updated:
                return
            conn.execute(
                "UPDATE public.test_attempts SET result_payload = %s WHERE id = %s",
                (Jsonb(updated), attempt_id),
            )
            conn.commit()
    except Exception:
        return


def _cors_allow_vercel_previews() -> bool:
    return os.getenv("CORS_ALLOW_VERCEL_PREVIEWS", "true").strip().lower() not in {
        "0",
        "false",
        "no",
    }


def _cors_origin_regex() -> str | None:
    parts: list[str] = []
    if _cors_allow_vercel_previews():
        parts.append(r"https://[\w.-]+\.vercel\.app")
    extra = os.getenv("CORS_MIRROR_ORIGIN_REGEX", "").strip()
    if extra:
        parts.append(extra)
    if not parts:
        return None
    return "|".join(f"(?:{p})" for p in parts)


app = FastAPI(title="LoveCompass API", version="0.1.0")
app.include_router(admin_router)
app.include_router(ros_router)
app.include_router(mate_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REPORT_PROMPT_VERSION = "self_v1_red_chamber_20260523"


def _safe_uuid(value: str, field_name: str = "attemptId") -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"{field_name} 格式不正确")


def _jsonable(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, Decimal):
        return float(value)
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: _jsonable(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_jsonable(v) for v in value]
    return value


def _score_tone(score: Any) -> str:
    try:
        numeric = float(score)
    except (TypeError, ValueError):
        return "这个部分仍需要结合更多相处经验继续观察。"
    if numeric >= 80:
        return "这个部分非常突出，已经是你在亲密关系里的稳定资源。"
    if numeric >= 65:
        return "这个部分整体较稳，能在多数关系场景里支持你做出成熟选择。"
    if numeric >= 45:
        return "这个部分有一定弹性，也可能在压力或不确定时出现摇摆。"
    return "这个部分值得被温柔照看，不需要苛责自己，而是给它更多练习空间。"


def _extract_dimensions(result_payload: dict[str, Any], dimension_scores: Any) -> list[dict[str, Any]]:
    dimensions = result_payload.get("dimensions") if isinstance(result_payload, dict) else None
    if isinstance(dimensions, list) and dimensions:
        return [d for d in dimensions if isinstance(d, dict)]
    if isinstance(dimension_scores, dict):
        names = {
            "SA1": ("自我吸引感知", "我相信自己值得被爱吗？"),
            "SA2": ("依恋焦虑", "我在关系里容易不安全感吗？"),
            "SA3": ("依恋回避", "我在关系里容易逃避亲密吗？"),
            "SA4": ("自我边界", "我能守住自己吗？"),
            "SA5": ("情绪调节", "我能好好处理关系里的情绪吗？"),
            "SA6": ("关系投入模式", "我是怎么爱人的？"),
        }
        extracted = []
        for code, score in dimension_scores.items():
            name, core = names.get(str(code), (str(code), ""))
            extracted.append({"code": str(code), "name": name, "core": core, "score": score})
        return extracted
    return []


def _build_report_prompt(attempt: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    result_payload = attempt.get("result_payload") or {}
    if not isinstance(result_payload, dict):
        result_payload = {}
    profile = result_payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}
    dimensions = _extract_dimensions(result_payload, attempt.get("dimension_scores"))
    archetype = str(result_payload.get("archetype_code") or attempt.get("archetype_code") or "未知画像")
    attachment_type = str(result_payload.get("attachment_type") or profile.get("attachment_type") or "待判断")
    tagline = str(profile.get("tagline") or "你正在靠近更清醒的亲密关系")
    description = str(profile.get("description") or "这份画像用于帮助你理解当下的关系模式，而不是给你贴上固定标签。")
    matching_logic = str(profile.get("matching_logic") or "")
    dimension_lines = []
    for item in dimensions:
        name = item.get("name") or "该维度"
        dimension_lines.append(
            f"- {name}：{item.get('core', '')}；解释方向：{_score_tone(item.get('score'))}"
        )
    dimension_text = "\n".join(dimension_lines) or "- 暂无完整维度明细。"
    prompt_payload = {
        "attemptId": str(attempt["id"]),
        "suiteSlug": attempt.get("test_id"),
        "archetype": archetype,
        "attachmentType": attachment_type,
        "tagline": tagline,
        "description": description,
        "matchingLogic": matching_logic,
        "rosIndex": _jsonable(attempt.get("ros_index")),
        "dimensions": _jsonable(dimensions),
        "promptVersion": REPORT_PROMPT_VERSION,
    }
    prompt = f"""
你是 LoveCompass 的婚恋画像 AI 分析师。请基于真实测试结果，生成一份温柔、体面、有共鸣的中文个人化关系画像报告。

写作要求：
- 输出 Markdown。
- 必须包含四个二级标题：## 你此刻的样子 / ## 关系里的高光 / ## 可以温柔留意的地方 / ## 给你下一段关系的建议。
- 不要暴露内部字段名、数据库字段、prompt、JSON、SA 编号或具体分数。
- 可以自然提及画像名称、依恋类型、人格关键词与用户在关系中的倾向。
- 每个区块 90 到 180 字，语气像一位资深婚恋顾问对挚友说话，具体但不审判。
- 不要制造诊断、治疗承诺或绝对化结论；强调画像是当下状态，不是终身定义。

用户画像上下文：
画像名称：{archetype}
依恋类型：{attachment_type}
一句话主题：{tagline}
画像描述：{description}
人格关键词：{matching_logic}
综合指数（仅内部参考，不要写出具体数值）：{attempt.get('ros_index')}
六维关系线索（仅内部参考，不要写出编号或分数）：
{dimension_text}

请生成正式报告。

{FORBIDDEN_RULES_MARKDOWN}
""".strip()
    return prompt, prompt_payload


def _fallback_report_from_attempt(attempt: dict[str, Any]) -> tuple[str, str, dict[str, Any]]:
    result_payload = attempt.get("result_payload") or {}
    if not isinstance(result_payload, dict):
        result_payload = {}
    profile = result_payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}
    archetype = str(result_payload.get("archetype_code") or attempt.get("archetype_code") or "你的关系画像")
    attachment_type = str(result_payload.get("attachment_type") or profile.get("attachment_type") or "独特关系模式")
    tagline = str(profile.get("tagline") or "你正在靠近更清醒的亲密关系")
    description = str(profile.get("description") or "你对关系有自己的节奏，也正在学习更稳定地理解自己和他人。")
    matching_logic = str(profile.get("matching_logic") or "真诚、觉察、期待被理解")
    traits = [part.strip(" ，、。") for part in matching_logic.replace("、", ",").split(",") if part.strip()]
    dimensions = _extract_dimensions(result_payload, attempt.get("dimension_scores"))
    stable = [d for d in dimensions if isinstance(d.get("score"), (int, float, Decimal)) and float(d.get("score")) >= 65]
    tender = [d for d in dimensions if isinstance(d.get("score"), (int, float, Decimal)) and float(d.get("score")) < 55]
    stable_text = "、".join(str(d.get("name")) for d in stable[:2]) or (traits[0] if traits else "对关系保持认真与觉察")
    tender_text = "、".join(str(d.get("name")) for d in tender[:2]) or "在不确定时更温柔地安放自己的感受"
    report = f"""## 你此刻的样子

你最贴近的画像是 **{archetype}**，它提醒你：{tagline}。这不是一个用来限制你的标签，而是一面镜子，照见你在亲密关系中习惯如何靠近、如何保护自己，也照见你真正珍视的相处质地。{description}

## 关系里的高光

你在关系里的亮点，常常来自 **{stable_text}**。当你处在被尊重、被认真对待的关系中，你会更愿意拿出稳定、真诚和有质量的投入。你不是为了证明自己值得被爱才去爱，而是在逐渐学会从更丰盛的位置与别人相遇。

## 可以温柔留意的地方

你可以留意 **{tender_text}**。这并不意味着你做得不够好，而是说明某些关系场景容易触碰你的旧有反应。真正重要的不是立刻变得完美，而是在情绪升起时多停一步，分辨眼前的人和过去的经验是否被混在了一起。

## 给你下一段关系的建议

下一段关系里，请继续把自己的感受当回事，也把对方的真实行动看清楚。好的亲密关系不需要你持续压抑、讨好或猜测；它会让你更像自己。画像是当下，不是定论。带着这份觉察往前走，你会更知道怎样选择，也更知道怎样被爱。
""".strip()
    summary = f"{archetype} · {attachment_type}：{tagline}"
    payload = {
        "archetype": archetype,
        "attachmentType": attachment_type,
        "tagline": tagline,
        "highlightFocus": stable_text,
        "growthFocus": tender_text,
        "generationMode": "deterministic_fallback",
    }
    return report, summary, payload



class AnswerIn(BaseModel):
    questionId: str
    externalId: str
    kind: str
    answerPayload: dict[str, Any]
    durationMs: int | None = None

class AttemptIn(BaseModel):
    suiteSlug: str
    redemptionEventId: str | None = None
    partnerRelationCode: str | None = None
    answers: list[AnswerIn]

class RedemptionIn(BaseModel):
    code: str = Field(min_length=1)
    product: str = Field(min_length=1)
    suiteSlug: str | None = None
    gender: str | None = None

class SceneFeedbackIn(BaseModel):
    scene: str = Field(min_length=1, max_length=80)
    resonated: bool
    note: str | None = Field(default=None, max_length=500)


class ChatIn(BaseModel):
    attemptId: str | None = None
    analystId: str | None = "sage"
    message: str = Field(min_length=1)
    stream: bool = False


class TriageIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)

@app.get("/health")
def health(
    db: bool = False,
    config: bool = False,
    jwt: bool = False,
    authorization: Annotated[str | None, Header()] = None,
):
    """Liveness probe. ?db=1 checks DATABASE_URL; ?config=1 reports non-secret config flags; ?jwt=1 probes JWKS."""
    if jwt:
        payload: dict[str, Any] = {"ok": True, "authVersion": auth_version(), "jwks": probe_jwks()}
        if authorization and authorization.startswith("Bearer "):
            token = authorization[7:].strip()
            if token:
                payload["token"] = probe_jwt_token(token)
        return payload
    if config:
        fallback = os.getenv("LOVECOMPASS_ALLOW_DEMO_USER_FALLBACK", "").strip().lower()
        supabase_url = (os.getenv("SUPABASE_URL") or "").strip()
        normalized_supabase_url = _supabase_url()
        return {
            "ok": True,
            "config": {
                "authVersion": auth_version(),
                "databaseUrl": bool((os.getenv("DATABASE_URL") or "").strip()),
                "supabaseUrl": bool(supabase_url),
                "supabaseUrlNormalized": bool(normalized_supabase_url),
                "supabaseUrlLooksMalformed": bool(supabase_url)
                and (
                    "value" in supabase_url.lower()
                    or "：" in supabase_url
                    or not normalized_supabase_url.startswith("https://")
                ),
                "jwtSecretLegacy": bool((os.getenv("SUPABASE_JWT_SECRET") or "").strip()),
                "jwtVerifyJwks": bool(normalized_supabase_url),
                "jwksProbe": probe_jwks(),
                "corsVercelPreviews": _cors_allow_vercel_previews(),
                "demoUserFallback": fallback in {"1", "true", "yes"},
            },
        }
    if not db:
        return {"ok": True}
    try:
        with get_conn() as conn:
            conn.execute("SELECT 1").fetchone()
        return {"ok": True, "database": "connected"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail={"ok": False, "database": str(exc)[:200]})

@app.get("/tests/{suite_slug}/questions")
def get_questions(suite_slug: str):
    with get_conn() as conn:
        suite = conn.execute(
            """
            SELECT id, slug, name, gender::text AS gender, version, total_questions, estimated_minutes
            FROM public.test_suites
            WHERE slug = %s AND is_active = true
            """,
            (suite_slug,),
        ).fetchone()
        if not suite:
            raise HTTPException(status_code=404, detail="测试套件不存在或未启用")
        questions = conn.execute(
            """
            SELECT tq.id, tq.external_question_id, tq.display_order, tq.question_type, tq.question_text,
                   tq.question_payload, tq.scoring_payload, tq.dimension_code, tq.weight, tq.direction
            FROM public.test_questions tq
            WHERE tq.suite_id = %s AND tq.is_active = true
            ORDER BY tq.display_order ASC
            """,
            (suite["id"],),
        ).fetchall()
        if not questions and suite["total_questions"]:
            raise HTTPException(
                status_code=503,
                detail=f"题库「{suite['name']}」题目尚未导入（预期 {suite['total_questions']} 题）",
            )
    return {
        "suite": {
            "id": str(suite["id"]),
            "slug": suite["slug"],
            "name": suite["name"],
            "gender": suite["gender"],
            "version": suite["version"],
            "totalQuestions": suite["total_questions"],
            "estimatedMinutes": suite["estimated_minutes"],
        },
        "questions": [adapt_question(q, suite["slug"]) for q in questions],
    }

@app.post("/redemption/verify")
def verify_redemption(data: RedemptionIn, user_id: str = Depends(resolve_user_id)):
    code = data.code.strip()
    universal = is_universal_code(code)
    with get_conn() as conn:
        if universal:
            target_slug = resolve_universal_suite_slug(
                product=data.product,
                suite_slug=data.suiteSlug,
                gender=data.gender,
            )
            shadow_row = ensure_shadow_redemption_code(conn, target_slug)
            event_metadata = Jsonb({"source": "universal_code", "requestedSlug": data.suiteSlug})
            if data.suiteSlug and suites_redemption_compatible(shadow_row["slug"], data.suiteSlug.strip()):
                final_slug = resolve_redemption_target_slug(
                    code_suite_slug=shadow_row["slug"],
                    requested_slug=data.suiteSlug,
                    product=data.product,
                    gender=data.gender,
                )
                final_suite = conn.execute(
                    "SELECT id, slug FROM public.test_suites WHERE slug = %s AND is_active = true",
                    (final_slug,),
                ).fetchone()
                if not final_suite:
                    raise HTTPException(status_code=404, detail="测试套件不存在")
                row = {
                    "code_id": shadow_row["code_id"],
                    "suite_id": final_suite["id"],
                    "slug": final_suite["slug"],
                }
            else:
                row = shadow_row
        else:
            row = conn.execute(
                """
                SELECT rc.id AS code_id, rc.suite_id, ts.slug
                FROM public.redemption_codes rc
                JOIN public.test_suites ts ON ts.id = rc.suite_id
                WHERE rc.code = %s AND rc.is_active = true AND rc.status = 'active'
                  AND (rc.expires_at IS NULL OR rc.expires_at > now())
                  AND (rc.max_uses IS NULL OR rc.used_count < rc.max_uses)
                """,
                (code,),
            ).fetchone()
            if not row:
                raise HTTPException(status_code=400, detail="兑换码无效或已过期")
            event_metadata = Jsonb({"source": "api_v1"})
            target_slug = resolve_redemption_target_slug(
                code_suite_slug=row["slug"],
                requested_slug=data.suiteSlug,
                product=data.product,
                gender=data.gender,
            )
            target_suite = conn.execute(
                "SELECT id, slug FROM public.test_suites WHERE slug = %s AND is_active = true",
                (target_slug,),
            ).fetchone()
            if not target_suite:
                raise HTTPException(status_code=404, detail="测试套件不存在")
            row = {"code_id": row["code_id"], "suite_id": target_suite["id"], "slug": target_suite["slug"]}
        event = conn.execute(
            """
            INSERT INTO public.redemption_events(user_id, suite_id, redemption_code_id, metadata)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, suite_id, redemption_code_id)
            DO UPDATE SET metadata = public.redemption_events.metadata || EXCLUDED.metadata
            RETURNING id
            """,
            (user_id, row["suite_id"], row["code_id"], event_metadata),
        ).fetchone()
        if not universal:
            conn.execute(
                "UPDATE public.redemption_codes SET used_count = used_count + 1 WHERE id = %s",
                (row["code_id"],),
            )
        conn.commit()
    resolved_slug = row["slug"]
    if data.suiteSlug and suites_redemption_compatible(resolved_slug, data.suiteSlug.strip()):
        resolved_slug = resolve_redemption_target_slug(
            code_suite_slug=resolved_slug,
            requested_slug=data.suiteSlug,
            product=data.product,
            gender=data.gender,
        )
    return {
        "ok": True,
        "suiteSlug": resolved_slug,
        "redemptionEventId": str(event["id"]),
        "redirect": f"/tests/{resolved_slug}/run",
    }



@app.get("/attempts")
def list_attempts(limit: int = 20, user_id: str = Depends(resolve_user_id)):
    safe_limit = max(1, min(limit, 50))
    with get_conn() as conn:
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
              ta.created_at,
              ta.completed_at,
              ts.slug AS suite_slug,
              ts.name AS suite_name,
              ts.gender::text AS suite_gender,
              ts.total_questions,
              ts.estimated_minutes
            FROM public.test_attempts ta
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE ta.user_id = %s
            ORDER BY COALESCE(ta.completed_at, ta.created_at) DESC
            LIMIT %s
            """,
            (user_id, safe_limit),
        ).fetchall()
    attempts = []
    for row in rows:
        item = dict(row)
        for key in ["id", "created_at", "completed_at"]:
            if item.get(key) is not None:
                item[key] = str(item[key])
        attempts.append(item)
    return {"attempts": attempts}


@app.get("/profile/portrait")
def get_profile_portrait(refresh: bool = False, user_id: str = Depends(resolve_user_id)):
    with get_conn() as conn:
        from app.profile_center import load_portrait_for_chat

        portrait = load_portrait_for_chat(conn, user_id, refresh=refresh)
        if refresh:
            conn.commit()
    return {"portrait": _jsonable(portrait)}


@app.post("/attempts")
def submit_attempt(data: AttemptIn, background_tasks: BackgroundTasks, user_id: str = Depends(resolve_user_id)):
    answer_by_external = {a.externalId: a.answerPayload for a in data.answers}
    with get_conn() as conn:
        suite = conn.execute("SELECT id, slug, gender::text AS gender FROM public.test_suites WHERE slug = %s AND is_active = true", (data.suiteSlug,)).fetchone()
        if not suite:
            raise HTTPException(status_code=404, detail="测试套件不存在")
        questions = conn.execute(
            """
            SELECT tq.id, tq.external_question_id, tq.dimension_code, tq.question_type, tq.question_payload, tq.scoring_payload, tq.weight, tq.direction
            FROM public.test_questions tq
            WHERE tq.suite_id = %s AND tq.is_active = true
            ORDER BY tq.display_order ASC
            """,
            (suite["id"],),
        ).fetchall()
        expected = {q["external_question_id"] for q in questions}
        missing = sorted(expected - set(answer_by_external))
        if missing:
            raise HTTPException(status_code=400, detail=f"缺少答案：{', '.join(missing[:5])}")
        if data.redemptionEventId:
            try:
                event_uuid = uuid.UUID(str(data.redemptionEventId))
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="兑换记录无效") from exc
            event_row = conn.execute(
                """
                SELECT re.id, re.suite_id
                FROM public.redemption_events re
                WHERE re.id = %s AND re.user_id = %s
                """,
                (event_uuid, user_id),
            ).fetchone()
            if not event_row:
                raise HTTPException(status_code=400, detail="兑换记录无效或无权使用")
            event_suite = conn.execute(
                "SELECT slug FROM public.test_suites WHERE id = %s",
                (event_row["suite_id"],),
            ).fetchone()
            event_slug = str((event_suite or {}).get("slug") or "")
            if not suites_redemption_compatible(event_slug, suite["slug"]):
                raise HTTPException(status_code=400, detail="兑换码与当前题库不匹配，请重新验证兑换码")
        scoring_model = conn.execute(
            """
            SELECT id, scoring_formula, type_rules, ros_config
            FROM public.scoring_models
            WHERE suite_id = %s AND is_active = true
            ORDER BY updated_at DESC
            LIMIT 1
            """,
            (suite["id"],),
        ).fetchone()
        ros_suite = is_ros_suite(suite["slug"])
        mate_suite = is_mate_suite(suite["slug"])
        partner_code = (data.partnerRelationCode or "").strip().upper() or None

        if ros_suite:
            if not data.redemptionEventId and not partner_code:
                raise HTTPException(status_code=400, detail="ROS 测评需要兑换码或伴侣关系码")
            scores = summarize_ros_scores(
                questions,
                answer_by_external,
                scoring_model,
                gender=suite["gender"],
            )
            archetype = None
        elif mate_suite:
            if not data.redemptionEventId and not partner_code:
                raise HTTPException(status_code=400, detail="MATE 测评需要兑换码或伴侣关系码")
            mate_profiles = load_mate_result_profiles(conn, suite["id"], suite["gender"])
            scores = summarize_mate_scores(
                questions,
                answer_by_external,
                scoring_model,
                gender=suite["gender"],
                result_profiles=mate_profiles,
                skip_enrich=True,
            )
            archetype = None
        else:
            if not data.redemptionEventId and not self_lite_is_free(suite["slug"]):
                raise HTTPException(status_code=400, detail="SELF 测评需要兑换码")
            scores = summarize_scores(questions, answer_by_external, scoring_model, suite["gender"])
            archetype = conn.execute(
                """
                SELECT archetype_code, gender::text AS gender, profile_payload
                FROM public.result_archetypes
                WHERE suite_id = %s AND archetype_code = %s AND is_active = true
                LIMIT 1
                """,
                (suite["id"], scores["archetype_code"]),
            ).fetchone()

        result_payload = dict(scores["result_payload"])
        if is_lite_suite(suite["slug"]):
            result_payload["suiteTier"] = "lite"
            result_payload["fullSuiteSlug"] = suite["slug"].replace("_lite", "")
            result_payload["accuracyNote"] = "快速版结果精度约 70–75%，完整版可提升至约 95%"
        if archetype:
            result_payload["archetype_profile"] = archetype["profile_payload"]

        attempt = conn.execute(
            """
            INSERT INTO public.test_attempts(
              user_id, suite_id, test_id, redemption_event_id, scoring_model_id, answers, raw_answers,
              scores, dimension_scores, archetype_code, archetype_gender, ros_index, rk_score, ai_report,
              result_payload, partner_relation_code, status, completed_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'in_progress', NULL)
            RETURNING id
            """,
            (
                user_id, suite["id"], suite["slug"], data.redemptionEventId, scoring_model["id"] if scoring_model else None,
                Jsonb([a.model_dump() for a in data.answers]), Jsonb([a.model_dump() for a in data.answers]),
                Jsonb(scores["dimension_scores"]), Jsonb(scores["dimension_scores"]), scores["archetype_code"],
                archetype["gender"] if archetype else suite["gender"],
                scores["ros_index"], scores.get("rk_score"), scores["ai_report"], Jsonb(result_payload),
                partner_code,
            ),
        ).fetchone()
        attempt_id = attempt["id"]
        if data.redemptionEventId:
            conn.execute("UPDATE public.redemption_events SET attempt_id = %s WHERE id = %s", (attempt_id, data.redemptionEventId))

        conn.commit()

    background_tasks.add_task(finalize_attempt_background, str(attempt_id), user_id)

    next_path = f"/result/{attempt_id}"
    product_set = "SELF"
    if ros_suite:
        next_path = (
            f"/result/ros/couple/{partner_code}"
            if partner_code
            else f"/result/ros/{attempt_id}"
        )
        product_set = "ROS"
    elif mate_suite:
        next_path = (
            f"/result/mate/couple/{partner_code}"
            if partner_code
            else f"/result/mate/{attempt_id}"
        )
        product_set = "MATE"
    response: dict[str, Any] = {
        "attemptId": str(attempt_id),
        "status": "in_progress",
        "next": next_path,
        "productSet": product_set,
    }
    if ros_suite or mate_suite:
        response["relationCode"] = scores.get("relation_code") or result_payload.get("relationCode")
    return response

@app.get("/attempts/{attempt_id}/result")
def get_attempt_result(
    attempt_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(resolve_user_id),
):
    try:
        uuid.UUID(attempt_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="attemptId 格式不正确")
    with get_conn() as conn:
        attempt = conn.execute(
            """
            SELECT id, test_id, status, scores, archetype_code, archetype_gender, ros_index, rk_score,
                   risk_alert, ai_report, dimension_scores, result_payload, created_at, completed_at
            FROM public.test_attempts
            WHERE id = %s AND user_id = %s
            """,
            (attempt_id, user_id),
        ).fetchone()
        if not attempt:
            raise HTTPException(status_code=404, detail="画像结果不存在")
        if attempt.get("status") == "in_progress":
            attempt = dict(attempt)
            attempt["result_payload"] = attempt.get("result_payload") or {}
            return {"attempt": {k: (str(v) if k == "id" else v) for k, v in attempt.items()}}
        result_payload = attempt.get("result_payload") or {}
        if not isinstance(result_payload, dict):
            result_payload = {}
        suite_slug = str(attempt.get("test_id") or "")
        if is_ros_suite(suite_slug):
            existing_ai = result_payload.get("ai_content")
            if not ros_ai_content_ready(existing_ai):
                result_payload = attach_ros_ai_content_to_payload(
                    conn,
                    attempt_id,
                    result_payload,
                    attempt.get("dimension_scores"),
                    use_ai=False,
                    gender=str(attempt.get("archetype_gender") or "female"),
                )
            if (result_payload.get("ai_content") or {}).get("mode") == "deterministic":
                background_tasks.add_task(enhance_ros_ai_background, attempt_id)
        elif is_mate_suite(suite_slug):
            result_payload = attach_mate_ai_content_to_payload(
                conn,
                attempt_id,
                result_payload,
                attempt.get("dimension_scores"),
                use_ai=False,
                gender=str(attempt.get("archetype_gender") or "female"),
            )
            # 读路径只合并 insights/缓存叙事，不回写 DB（finalize / background AI 负责持久化）
            attempt = dict(attempt)
            attempt["result_payload"] = sanitize_user_facing_payload(result_payload)
            return {"attempt": {k: (str(v) if k == "id" else v) for k, v in attempt.items()}}
        elif not is_mate_suite(suite_slug):
            if not result_payload.get("core_traits"):
                result_payload = attach_core_traits_to_payload(
                    conn,
                    attempt_id,
                    result_payload,
                    attempt.get("dimension_scores"),
                )
            result_payload = attach_self_ai_content_to_payload(
                conn,
                attempt_id,
                result_payload,
                attempt.get("dimension_scores"),
                use_ai=False,
                gender=str(attempt.get("archetype_gender") or "female"),
            )
            if (result_payload.get("ai_content") or {}).get("mode") == "deterministic":
                background_tasks.add_task(enhance_self_ai_background, attempt_id)
        attempt = dict(attempt)
        attempt["result_payload"] = sanitize_user_facing_payload(result_payload)
        if attempt.get("ai_report"):
            attempt["ai_report"] = guard_ai_output(str(attempt["ai_report"]))
    return {"attempt": {k: (str(v) if k == "id" else v) for k, v in attempt.items()}}


@app.post("/attempts/{attempt_id}/scene-feedback")
def record_scene_feedback(attempt_id: str, data: SceneFeedbackIn, user_id: str = Depends(resolve_user_id)):
    _safe_uuid(attempt_id)
    with get_conn() as conn:
        row = conn.execute(
            """
            SELECT id, result_payload
            FROM public.test_attempts
            WHERE id = %s AND user_id = %s
            """,
            (attempt_id, user_id),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="画像结果不存在")
        payload = dict(row.get("result_payload") or {})
        feedback = payload.get("scene_feedback")
        if not isinstance(feedback, list):
            feedback = []
        feedback.append(
            {
                "scene": data.scene.strip(),
                "resonated": data.resonated,
                "note": (data.note or "").strip() or None,
            }
        )
        payload["scene_feedback"] = feedback[-20:]
        conn.execute(
            "UPDATE public.test_attempts SET result_payload = %s WHERE id = %s",
            (Jsonb(payload), attempt_id),
        )
        conn.commit()
    return {"ok": True, "count": len(payload["scene_feedback"])}


@app.post("/attempts/{attempt_id}/report")
def generate_attempt_report(attempt_id: str, refresh: bool = False, user_id: str = Depends(resolve_user_id)):
    _safe_uuid(attempt_id)
    with get_conn() as conn:
        attempt = conn.execute(
            """
            SELECT
              ta.id,
              ta.user_id,
              ta.suite_id,
              ta.test_id,
              ta.status,
              ta.archetype_code,
              ta.archetype_gender,
              ta.ros_index,
              ta.ai_report,
              ta.dimension_scores,
              ta.result_payload,
              ta.completed_at,
              ts.slug AS suite_slug,
              ts.gender::text AS suite_gender,
              ts.name AS suite_name
            FROM public.test_attempts ta
            LEFT JOIN public.test_suites ts ON ts.id = ta.suite_id
            WHERE ta.id = %s AND ta.user_id = %s
            """,
            (attempt_id, user_id),
        ).fetchone()
        if not attempt:
            raise HTTPException(status_code=404, detail="画像结果不存在")
        if attempt["status"] != "completed":
            raise HTTPException(status_code=400, detail="测试尚未完成，暂不能生成报告")

        existing = conn.execute(
            """
            SELECT id, status::text AS status, summary, report_payload, generated_at, model_provider, model_name
            FROM public.ai_result_reports
            WHERE attempt_id = %s
            """,
            (attempt_id,),
        ).fetchone()
        if existing and existing["status"] == "succeeded" and not refresh and not looks_like_placeholder_report(attempt.get("ai_report")):
            content = guard_ai_output(
                str((existing.get("report_payload") or {}).get("content") or attempt.get("ai_report") or "")
            )
            return {
                "report": {
                    "attemptId": attempt_id,
                    "status": existing["status"],
                    "summary": existing["summary"],
                    "content": content,
                    "reportPayload": existing["report_payload"],
                    "generatedAt": _jsonable(existing["generated_at"]),
                    "modelProvider": existing["model_provider"],
                    "modelName": existing["model_name"],
                    "cached": True,
                }
            }

        prompt, prompt_payload, prompt_version = build_suite_report_prompt(dict(attempt))
        provider = os.getenv("AI_PROVIDER", "mock").strip().lower() or "mock"
        model_name = os.getenv("ZHIPU_MODEL", "mock") if provider == "zhipu" else "mock"
        generation_mode = "ai_adapter"
        error_message = None
        try:
            content = guard_ai_output(get_ai_adapter().generate(prompt).strip())
            if looks_like_placeholder_report(content):
                content, summary, fallback_payload = fallback_suite_report(dict(attempt))
                generation_mode = "deterministic_fallback"
            else:
                result_payload = attempt.get("result_payload") or {}
                product_set = (result_payload.get("productSet") if isinstance(result_payload, dict) else None) or "SELF"
                if product_set == "ROS":
                    rel = (result_payload.get("relationshipType") or {}) if isinstance(result_payload, dict) else {}
                    rel_name = rel.get("name") if isinstance(rel, dict) else attempt.get("archetype_code")
                    tier = ((result_payload.get("resonance") or {}).get("tier") if isinstance(result_payload, dict) else None) or "关系画像"
                    summary = f"{rel_name or '关系画像'} · {tier}：AI 深度报告已生成"
                elif product_set == "MATE":
                    pos = (result_payload.get("positionType") or {}) if isinstance(result_payload, dict) else {}
                    pos_name = pos.get("name") if isinstance(pos, dict) else attempt.get("archetype_code")
                    summary = f"{pos_name or '择偶定位'} · 市场坐标：AI 深度报告已生成"
                else:
                    profile = result_payload.get("archetype_profile") if isinstance(result_payload, dict) else {}
                    archetype = result_payload.get("archetype_code") if isinstance(result_payload, dict) else attempt.get("archetype_code")
                    attachment = result_payload.get("attachment_type") if isinstance(result_payload, dict) else None
                    tagline = profile.get("tagline") if isinstance(profile, dict) else None
                    summary = f"{archetype or attempt.get('archetype_code')} · {attachment or '关系画像'}：{tagline or 'AI 深度报告已生成'}"
                fallback_payload = {"generationMode": generation_mode}
        except Exception as exc:
            content, summary, fallback_payload = fallback_suite_report(dict(attempt))
            generation_mode = "deterministic_fallback"
            error_message = str(exc)[:500]

        report_payload = {
            **fallback_payload,
            "content": content,
            "promptVersion": prompt_version,
            "generationMode": generation_mode,
        }
        row = conn.execute(
            """
            INSERT INTO public.ai_result_reports(
              attempt_id, user_id, suite_id, model_provider, model_name, prompt_version, status,
              summary, report_payload, prompt_payload, error_message, generated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, 'succeeded', %s, %s, %s, %s, now())
            ON CONFLICT (attempt_id)
            DO UPDATE SET
              model_provider = EXCLUDED.model_provider,
              model_name = EXCLUDED.model_name,
              prompt_version = EXCLUDED.prompt_version,
              status = EXCLUDED.status,
              summary = EXCLUDED.summary,
              report_payload = EXCLUDED.report_payload,
              prompt_payload = EXCLUDED.prompt_payload,
              error_message = EXCLUDED.error_message,
              generated_at = EXCLUDED.generated_at
            RETURNING id, status::text AS status, summary, report_payload, generated_at, model_provider, model_name
            """,
            (
                attempt_id,
                attempt["user_id"],
                attempt["suite_id"],
                provider,
                model_name,
                prompt_version,
                summary,
                Jsonb(report_payload),
                Jsonb(prompt_payload),
                error_message,
            ),
        ).fetchone()
        conn.execute("UPDATE public.test_attempts SET ai_report = %s WHERE id = %s", (content, attempt_id))
        conn.commit()
    return {
        "report": {
            "attemptId": attempt_id,
            "status": row["status"],
            "summary": row["summary"],
            "content": content,
            "reportPayload": row["report_payload"],
            "generatedAt": _jsonable(row["generated_at"]),
            "modelProvider": row["model_provider"],
            "modelName": row["model_name"],
            "cached": False,
        }
    }

@app.get("/chat/context")
def chat_context(
    attemptId: str | None = None,
    analystId: str | None = None,
    user_id: str = Depends(resolve_user_id),
):
    """Return bound test result summary, cross-suite profile, and existing session history."""
    with get_conn() as conn:
        try:
            bundle = build_chat_profile_bundle(conn, user_id, attemptId, refresh=False)
        except Exception as exc:
            raise HTTPException(
                status_code=500,
                detail=f"画像加载失败：{str(exc)[:200]}",
            ) from exc
        session_id: str | None = None
        messages: list[dict[str, str]] = []
        try:
            session_id, messages = load_chat_session_messages(
                conn,
                user_id,
                analystId,
                attemptId,
                limit=40,
            )
        except Exception:
            session_id, messages = None, []
    return {
        "ok": True,
        "bound": bundle["bound"],
        "context": bundle["context"],
        "profile": bundle["profile"],
        "conversationId": session_id,
        "messages": messages,
    }


@app.post("/chat/sync-profile")
def chat_sync_profile(user_id: str = Depends(resolve_user_id)):
    """Rebuild portrait cache and return a user-visible sync acknowledgment for chat."""
    try:
        with get_conn() as conn:
            bundle = build_chat_profile_bundle(conn, user_id, refresh=True)
            acknowledgment = build_profile_sync_acknowledgment(bundle["portrait"])
            conn.commit()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"画像同步失败：{str(exc)[:240]}",
        ) from exc
    return {
        "ok": True,
        "bound": bundle["bound"],
        "context": bundle["context"],
        "profile": bundle["profile"],
        "acknowledgment": acknowledgment,
    }


@app.post("/chat/triage")
def chat_triage(data: TriageIn, user_id: str = Depends(resolve_user_id)):
    """Recommend a counselor from the user's message intent."""
    del user_id  # auth gate only
    result = triage_counselor(data.message)
    return {"ok": True, **result}


def _chat_sse_events(
    *,
    adapter: Any,
    messages: list[dict[str, str]],
    session_id: str | None,
    user_id: str,
    context_summary: dict[str, Any] | None,
    bound: bool,
    crisis_level: str,
    injection_meta: dict[str, Any] | None = None,
) -> Iterator[str]:
    meta = {
        "conversationId": session_id,
        "context": context_summary,
        "bound": bound,
        "crisis": crisis_level != "none",
        "injection": injection_meta or {},
    }
    yield f"data: {json.dumps({'meta': meta}, ensure_ascii=False)}\n\n"

    parts: list[str] = []
    try:
        for chunk in adapter.stream_messages(messages):
            parts.append(chunk)
            yield f"data: {json.dumps({'delta': chunk}, ensure_ascii=False)}\n\n"
        message = guard_chat_output(
            guard_ai_output("".join(parts)),
            injection=_injection_state_from_meta(injection_meta),
        )
    except RuntimeError as exc:
        yield f"data: {json.dumps({'error': str(exc)[:300]}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
        return

    if session_id:
        with get_conn() as conn:
            save_message(conn, session_id, user_id, "assistant", message)
            conn.commit()

    yield f"data: {json.dumps({'done': True, 'message': message}, ensure_ascii=False)}\n\n"
    yield "data: [DONE]\n\n"


@app.post("/chat/message")
def chat_message(data: ChatIn, user_id: str = Depends(resolve_user_id)):
    with get_conn() as conn:
        attempt = resolve_attempt_or_latest(conn, user_id, data.attemptId)
        analyst = resolve_analyst_row(conn, data.analystId)
        context_summary = summarize_context(attempt) if attempt else None
        session_id: str | None = None
        history: list[dict[str, str]] = []
        if analyst.get("id"):
            session_id = get_or_create_session(
                conn,
                user_id,
                str(attempt["id"]) if attempt else None,
                str(analyst["id"]),
                context_summary or {},
            )
            history = load_recent_messages(conn, session_id, limit=12)
            save_message(conn, session_id, user_id, "user", data.message)
            if data.stream:
                conn.commit()

        crisis_level = assess_crisis(data.message, history)
        if crisis_level == "high":
            message = build_crisis_response()
            if session_id:
                save_message(conn, session_id, user_id, "assistant", message)
                conn.commit()
            if data.stream:

                def crisis_stream() -> Iterator[str]:
                    yield f"data: {json.dumps({'meta': {'conversationId': session_id, 'context': context_summary, 'bound': bool(attempt), 'crisis': True}}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'delta': message}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'done': True, 'message': message}, ensure_ascii=False)}\n\n"
                    yield "data: [DONE]\n\n"

                return StreamingResponse(crisis_stream(), media_type="text/event-stream")

            return {
                "message": message,
                "conversationId": session_id,
                "context": context_summary,
                "bound": bool(attempt),
                "crisis": True,
            }

        chat_messages, injection = build_chat_messages(
            analyst,
            attempt,
            history,
            data.message,
            conn=conn,
            user_id=user_id,
            crisis_level=crisis_level,
        )
        injection_meta = injection.to_meta()
        adapter = get_ai_adapter()

        if data.stream:
            return StreamingResponse(
                _chat_sse_events(
                    adapter=adapter,
                    messages=chat_messages,
                    session_id=session_id,
                    user_id=user_id,
                    context_summary=context_summary,
                    bound=bool(attempt),
                    crisis_level=crisis_level,
                    injection_meta=injection_meta,
                ),
                media_type="text/event-stream",
            )

        try:
            raw = adapter.generate_messages(chat_messages)
            message = guard_chat_output(
                guard_ai_output(raw),
                injection=injection,
            )
        except RuntimeError as exc:
            raise HTTPException(status_code=502, detail=str(exc)[:300]) from exc
        if session_id:
            save_message(conn, session_id, user_id, "assistant", message)
            conn.commit()
    return {
        "message": message,
        "conversationId": session_id,
        "context": context_summary,
        "bound": bool(attempt),
        "crisis": crisis_level != "none",
        "injection": injection_meta,
    }
