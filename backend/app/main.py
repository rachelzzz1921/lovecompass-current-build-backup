from __future__ import annotations
import os
import uuid
from decimal import Decimal
from typing import Annotated, Any
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from psycopg.types.json import Jsonb
from app.auth import auth_version, probe_jwks, probe_jwt_token, resolve_user_id, _supabase_url
from app.db import get_conn
from app.question_adapter import adapt_question
from app.scoring import summarize_scores
from app.ai_adapter import get_ai_adapter
from app.chat_context import (
    build_chat_prompt,
    get_or_create_session,
    load_recent_messages,
    resolve_analyst_row,
    resolve_attempt,
    save_message,
    summarize_context,
)


def _cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:4173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def _cors_allow_vercel_previews() -> bool:
    return os.getenv("CORS_ALLOW_VERCEL_PREVIEWS", "true").strip().lower() not in {
        "0",
        "false",
        "no",
    }


app = FastAPI(title="LoveCompass API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=r"https://[\w.-]+\.vercel\.app" if _cors_allow_vercel_previews() else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REPORT_PROMPT_VERSION = "self_v1_red_chamber_20260523"
REPORT_PLACEHOLDER_MARKERS = ("正式 AI 深度报告可由后台任务继续生成", "【AI 占位回复】", "【智谱未配置】")


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
        dimension_lines.append(
            f"- {item.get('code')} {item.get('name')}：{item.get('core', '')}；内部参考分 {item.get('score')}；解释方向：{_score_tone(item.get('score'))}"
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


def _looks_like_placeholder(report: str | None) -> bool:
    if not report:
        return True
    return any(marker in report for marker in REPORT_PLACEHOLDER_MARKERS)

class AnswerIn(BaseModel):
    questionId: str
    externalId: str
    kind: str
    answerPayload: dict[str, Any]
    durationMs: int | None = None

class AttemptIn(BaseModel):
    suiteSlug: str
    redemptionEventId: str | None = None
    answers: list[AnswerIn]

class RedemptionIn(BaseModel):
    code: str = Field(min_length=1)
    product: str = Field(min_length=1)

class ChatIn(BaseModel):
    attemptId: str | None = None
    analystId: str | None = "mirror"
    message: str = Field(min_length=1)

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
            SELECT id, external_question_id, display_order, question_type, question_text,
                   question_payload, scoring_payload, dimension_code, weight, direction
            FROM public.test_questions
            WHERE suite_id = %s AND is_active = true
            ORDER BY display_order ASC
            """,
            (suite["id"],),
        ).fetchall()
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
        "questions": [adapt_question(q) for q in questions],
    }

@app.post("/redemption/verify")
def verify_redemption(data: RedemptionIn, user_id: str = Depends(resolve_user_id)):
    code = data.code.strip()
    with get_conn() as conn:
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
        event = conn.execute(
            """
            INSERT INTO public.redemption_events(user_id, suite_id, redemption_code_id, metadata)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (user_id, suite_id, redemption_code_id)
            DO UPDATE SET metadata = public.redemption_events.metadata || EXCLUDED.metadata
            RETURNING id
            """,
            (user_id, row["suite_id"], row["code_id"], Jsonb({"source": "api_v1"})),
        ).fetchone()
        conn.execute("UPDATE public.redemption_codes SET used_count = used_count + 1 WHERE id = %s", (row["code_id"],))
        conn.commit()
    return {"ok": True, "suiteSlug": row["slug"], "redemptionEventId": str(event["id"]), "redirect": f"/tests/{row['slug']}/run"}



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

@app.post("/attempts")
def submit_attempt(data: AttemptIn, user_id: str = Depends(resolve_user_id)):
    answer_by_external = {a.externalId: a.answerPayload for a in data.answers}
    with get_conn() as conn:
        suite = conn.execute("SELECT id, slug, gender::text AS gender FROM public.test_suites WHERE slug = %s AND is_active = true", (data.suiteSlug,)).fetchone()
        if not suite:
            raise HTTPException(status_code=404, detail="测试套件不存在")
        questions = conn.execute(
            """
            SELECT id, external_question_id, dimension_code, question_type, question_payload, scoring_payload, weight, direction
            FROM public.test_questions
            WHERE suite_id = %s AND is_active = true
            ORDER BY display_order ASC
            """,
            (suite["id"],),
        ).fetchall()
        expected = {q["external_question_id"] for q in questions}
        missing = sorted(expected - set(answer_by_external))
        if missing:
            raise HTTPException(status_code=400, detail=f"缺少答案：{', '.join(missing[:5])}")
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
        if archetype:
            result_payload["archetype_profile"] = archetype["profile_payload"]
        attempt = conn.execute(
            """
            INSERT INTO public.test_attempts(
              user_id, suite_id, test_id, redemption_event_id, scoring_model_id, answers, raw_answers,
              scores, dimension_scores, archetype_code, archetype_gender, ros_index, ai_report, result_payload, status, completed_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'completed', now())
            RETURNING id
            """,
            (
                user_id, suite["id"], suite["slug"], data.redemptionEventId, scoring_model["id"] if scoring_model else None,
                Jsonb([a.model_dump() for a in data.answers]), Jsonb([a.model_dump() for a in data.answers]),
                Jsonb(scores["dimension_scores"]), Jsonb(scores["dimension_scores"]), scores["archetype_code"], archetype["gender"] if archetype else None,
                scores["ros_index"], scores["ai_report"], Jsonb(result_payload),
            ),
        ).fetchone()
        attempt_id = attempt["id"]
        numeric_map = scores["numeric_by_external_id"]
        for q in questions:
            ext = q["external_question_id"]
            conn.execute(
                """
                INSERT INTO public.test_attempt_answers(attempt_id, question_id, external_question_id, answer_payload, numeric_score, dimension_code)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (attempt_id, q["id"], ext, Jsonb(answer_by_external[ext]), numeric_map.get(ext), q["dimension_code"]),
            )
        if data.redemptionEventId:
            conn.execute("UPDATE public.redemption_events SET attempt_id = %s WHERE id = %s", (attempt_id, data.redemptionEventId))
        conn.commit()
    return {"attemptId": str(attempt_id), "status": "completed", "next": f"/analyzing?attemptId={attempt_id}"}

@app.get("/attempts/{attempt_id}/result")
def get_attempt_result(attempt_id: str, user_id: str = Depends(resolve_user_id)):
    try:
        uuid.UUID(attempt_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="attemptId 格式不正确")
    with get_conn() as conn:
        attempt = conn.execute(
            """
            SELECT id, test_id, scores, archetype_code, archetype_gender, ros_index, rk_score,
                   risk_alert, ai_report, dimension_scores, result_payload, created_at, completed_at
            FROM public.test_attempts
            WHERE id = %s AND user_id = %s
            """,
            (attempt_id, user_id),
        ).fetchone()
        if not attempt:
            raise HTTPException(status_code=404, detail="画像结果不存在")
    return {"attempt": {k: (str(v) if k == "id" else v) for k, v in attempt.items()}}


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
        if existing and existing["status"] == "succeeded" and not refresh and not _looks_like_placeholder(attempt.get("ai_report")):
            content = (existing.get("report_payload") or {}).get("content") or attempt.get("ai_report")
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

        prompt, prompt_payload = _build_report_prompt(dict(attempt))
        provider = os.getenv("AI_PROVIDER", "mock").strip().lower() or "mock"
        model_name = os.getenv("ZHIPU_MODEL", "mock") if provider == "zhipu" else "mock"
        generation_mode = "ai_adapter"
        error_message = None
        try:
            content = get_ai_adapter().generate(prompt).strip()
            if _looks_like_placeholder(content):
                content, summary, fallback_payload = _fallback_report_from_attempt(dict(attempt))
                generation_mode = "deterministic_fallback"
            else:
                result_payload = attempt.get("result_payload") or {}
                profile = result_payload.get("archetype_profile") if isinstance(result_payload, dict) else {}
                archetype = result_payload.get("archetype_code") if isinstance(result_payload, dict) else attempt.get("archetype_code")
                attachment = result_payload.get("attachment_type") if isinstance(result_payload, dict) else None
                tagline = profile.get("tagline") if isinstance(profile, dict) else None
                summary = f"{archetype or attempt.get('archetype_code')} · {attachment or '关系画像'}：{tagline or 'AI 深度报告已生成'}"
                fallback_payload = {"generationMode": generation_mode}
        except Exception as exc:
            content, summary, fallback_payload = _fallback_report_from_attempt(dict(attempt))
            generation_mode = "deterministic_fallback"
            error_message = str(exc)[:500]

        report_payload = {
            **fallback_payload,
            "content": content,
            "promptVersion": REPORT_PROMPT_VERSION,
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
                REPORT_PROMPT_VERSION,
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
def chat_context(attemptId: str | None = None, user_id: str = Depends(resolve_user_id)):
    """Return bound test result summary for the chat sidebar."""
    with get_conn() as conn:
        attempt = resolve_attempt(conn, user_id, attemptId)
    if not attempt:
        return {"ok": True, "bound": False, "context": None}
    summary = summarize_context(attempt)
    return {"ok": True, "bound": True, "context": summary}


@app.post("/chat/message")
def chat_message(data: ChatIn, user_id: str = Depends(resolve_user_id)):
    with get_conn() as conn:
        attempt = resolve_attempt(conn, user_id, data.attemptId)
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
            history = load_recent_messages(conn, session_id)
            save_message(conn, session_id, user_id, "user", data.message)
        prompt = build_chat_prompt(analyst, attempt, history, data.message)
        try:
            message = get_ai_adapter().generate(prompt)
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
    }
