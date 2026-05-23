from __future__ import annotations
import os
import uuid
from typing import Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from psycopg.types.json import Jsonb
from app.db import get_conn
from app.question_adapter import adapt_question
from app.scoring import summarize_scores
from app.ai_adapter import get_ai_adapter

app = FastAPI(title="LoveCompass API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:4173").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMO_USER_ID = os.getenv("LOVECOMPASS_DEMO_USER_ID", "00000000-0000-0000-0000-000000000001")

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
def health():
    return {"ok": True}

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
def verify_redemption(data: RedemptionIn):
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
            (DEMO_USER_ID, row["suite_id"], row["code_id"], Jsonb({"source": "api_v1"})),
        ).fetchone()
        conn.execute("UPDATE public.redemption_codes SET used_count = used_count + 1 WHERE id = %s", (row["code_id"],))
        conn.commit()
    return {"ok": True, "suiteSlug": row["slug"], "redemptionEventId": str(event["id"]), "redirect": f"/tests/{row['slug']}/run"}

@app.post("/attempts")
def submit_attempt(data: AttemptIn):
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
                DEMO_USER_ID, suite["id"], suite["slug"], data.redemptionEventId, scoring_model["id"] if scoring_model else None,
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
def get_attempt_result(attempt_id: str):
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
            WHERE id = %s
            """,
            (attempt_id,),
        ).fetchone()
        if not attempt:
            raise HTTPException(status_code=404, detail="画像结果不存在")
    return {"attempt": {k: (str(v) if k == "id" else v) for k, v in attempt.items()}}

@app.post("/chat/message")
def chat_message(data: ChatIn):
    context = "已绑定画像" if data.attemptId else "未绑定具体画像"
    prompt = f"""
你正在为 LoveCompass 用户进行婚恋画像解读。
当前上下文：{context}
attemptId：{data.attemptId or "未提供"}
分析师：{data.analystId or "mirror"}
用户问题：{data.message}

请用温柔、具体、克制的中文回答。若缺少画像详情，请明确说明当前只能做一般建议，不要编造测试结果。
""".strip()
    message = get_ai_adapter().generate(prompt)
    return {"message": message, "conversationId": None}
